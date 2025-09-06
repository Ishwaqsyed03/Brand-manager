// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Temporary guest user helper for no-auth mode
const buildGuestUser = (overrides = {}) => ({
  _id: 'guest',
  username: 'guest',
  email: 'guest@local',
  profile: {
    name: 'Guest',
    bio: '',
    avatar: '',
    ...(overrides.profile || {})
  },
  socialConnections: {
    twitter: { connected: false },
    linkedin: { connected: false },
    instagram: { connected: false },
    facebook: { connected: false },
    ...(overrides.socialConnections || {})
  },
  ...overrides
});

// Register user
exports.register = async (req, res) => {
  try {
  const { username, email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email or username' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token
    const crypto = require('crypto');
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = Date.now() + 3600000; // 1 hour

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      profile: { name },
      role,
      emailVerificationToken,
      emailVerificationExpires
    });

    await user.save();

    // Send verification email
    const { sendVerificationEmail } = require('../services/emailService');
    const verifyLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${emailVerificationToken}`;
    await sendVerificationEmail(user.email, verifyLink);

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully. Please verify your email.',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        role: user.role,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Forgot Password: Request reset link
const crypto = require('crypto');
const { sendResetEmail } = require('../services/emailService');

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'No user found with that email' });
    }
    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    // Send email
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
    await sendResetEmail(user.email, resetLink);
    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reset Password: Set new password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        socialConnections: user.socialConnections
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    // No-auth fallback
    if (!req.user) {
      return res.json(buildGuestUser());
    }

    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;

    // No-auth fallback
    if (!req.user) {
      const guest = buildGuestUser({ profile: { name, bio, avatar } });
      return res.json(guest);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        'profile.name': name,
        'profile.bio': bio,
        'profile.avatar': avatar
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Connect social media platform
exports.connectPlatform = async (req, res) => {
  try {
    const { platform, accessToken, refreshToken, userId, username } = req.body;

    // No-auth fallback
    if (!req.user) {
      const guest = buildGuestUser();
      if (!guest.socialConnections[platform]) {
        return res.status(400).json({ error: 'Invalid platform' });
      }
      guest.socialConnections[platform] = {
        connected: true,
        accessToken,
        refreshToken,
        userId,
        username
      };
      return res.json({
        message: `${platform} connected successfully`,
        socialConnections: guest.socialConnections
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user.socialConnections[platform]) {
      return res.status(400).json({ error: 'Invalid platform' });
    }

    user.socialConnections[platform] = {
      connected: true,
      accessToken,
      refreshToken,
      userId,
      username
    };

    await user.save();

    res.json({ 
      message: `${platform} connected successfully`,
      socialConnections: user.socialConnections
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
