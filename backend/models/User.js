const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profile: {
    name: String,
    avatar: String,
    bio: String
  },
  socialConnections: {
    twitter: {
      connected: { type: Boolean, default: false },
      accessToken: String,
      refreshToken: String,
      userId: String,
      username: String
    },
    linkedin: {
      connected: { type: Boolean, default: false },
      accessToken: String,
      refreshToken: String,
      userId: String,
      username: String
    },
    instagram: {
      connected: { type: Boolean, default: false },
      accessToken: String,
      refreshToken: String,
      userId: String,
      username: String
    },
    facebook: {
      connected: { type: Boolean, default: false },
      accessToken: String,
      refreshToken: String,
      userId: String,
      username: String
    }
  },
  settings: {
    defaultPlatforms: [String],
    autoSchedule: { type: Boolean, default: false },
    timezone: { type: String, default: 'UTC' }
  }
  ,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
