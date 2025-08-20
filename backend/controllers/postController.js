const Post = require('../models/Post');
const twitterService = require('../services/twitterService');
const linkedinService = require('../services/linkedinService');
const instagramService = require('../services/instagramService');
const facebookService = require('../services/facebookService');
const eventBus = require('../utils/eventBus');
const { queue, JOB_TYPES } = require('../services/queueService');

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { text, media, platforms, scheduledFor, tags } = req.body;

    // Use a default user ID when no authentication is present, or null if not available
    const userId = req.user ? req.user._id : null;

    const post = new Post({
      user: userId,
      content: {
        text,
        media: media || []
      },
      platforms: platforms.map(platform => ({ name: platform })),
      scheduledFor,
      tags,
      metadata: {
        characterCount: text.length,
        hasMedia: media && media.length > 0,
        platformCount: platforms.length
      }
    });

    await post.save();

    // Emit event for post creation
    eventBus.emit('post:created', { postId: post._id, post });

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all posts for user
exports.getPosts = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Use a default user ID when no authentication is present, or get all posts
    const userId = req.user ? req.user._id : null;
    const query = userId ? { user: userId } : {};
    if (status) query.status = status;

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'username profile.name');

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single post
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', 'username profile.name');
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Remove user authorization check for now
    // if (post.user._id.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ error: 'Not authorized' });
    // }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const { text, media, platforms, scheduledFor, tags } = req.body;

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Remove user authorization check for now
    // if (post.user.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ error: 'Not authorized' });
    // }

    // Only allow updates if post is not yet posted
    if (post.status === 'posted') {
      return res.status(400).json({ error: 'Cannot update already posted content' });
    }

    post.content.text = text || post.content.text;
    post.content.media = media || post.content.media;
    post.platforms = platforms ? platforms.map(platform => ({ name: platform })) : post.platforms;
    post.scheduledFor = scheduledFor || post.scheduledFor;
    post.tags = tags || post.tags;
    post.metadata = {
      characterCount: text ? text.length : post.content.text.length,
      hasMedia: (media ? media.length > 0 : post.content.media.length > 0),
      platformCount: platforms ? platforms.length : post.platforms.length
    };

    await post.save();

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Remove user authorization check for now
    // if (post.user.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ error: 'Not authorized' });
    // }

    await post.remove();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Handle manual posting
exports.handleManualPost = async (req, res) => {
  try {
    const { platforms, text, media } = req.body;

    // Use a default user ID when no authentication is present, or null if not available
    const userId = req.user ? req.user._id : null;
    const defaultUser = userId ? { _id: userId } : null; // Mock user object

    const results = {};
    const post = new Post({
      user: userId,
      content: { text, media: media || [] },
      platforms: platforms.map(platform => ({ name: platform })),
      metadata: {
        characterCount: text.length,
        hasMedia: media && media.length > 0,
        platformCount: platforms.length
      }
    });

    // Post to each platform
    for (const platform of platforms) {
      try {
        let result;
        switch (platform) {
          case 'twitter':
            result = await twitterService.postToTwitter({ text, media, user: defaultUser });
            break;
          case 'linkedin':
            result = await linkedinService.postToLinkedIn({ text, media, user: defaultUser });
            break;
          case 'instagram':
            result = await instagramService.postToInstagram({ text, media, user: defaultUser });
            break;
          case 'facebook':
            result = await facebookService.postToFacebook({ text, media, user: defaultUser });
            break;
          default:
            result = { success: false, error: 'Unsupported platform' };
        }

        results[platform] = result;
        
        // Update post status
        const platformStatus = post.platforms.find(p => p.name === platform);
        if (platformStatus) {
          platformStatus.status = result.success ? 'posted' : 'failed';
          platformStatus.postId = result.data?.id;
          platformStatus.postedAt = result.success ? new Date() : null;
          platformStatus.error = result.error;
        }
      } catch (error) {
        results[platform] = { success: false, error: error.message };
        
        const platformStatus = post.platforms.find(p => p.name === platform);
        if (platformStatus) {
          platformStatus.status = 'failed';
          platformStatus.error = error.message;
        }
      }
    }

    // Update overall post status
    const allPosted = post.platforms.every(p => p.status === 'posted');
    const anyFailed = post.platforms.some(p => p.status === 'failed');
    
    if (allPosted) {
      post.status = 'posted';
      post.postedAt = new Date();
    } else if (anyFailed) {
      post.status = 'failed';
    }

    await post.save();

    res.json({ 
      status: 'ok', 
      results,
      postId: post._id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Schedule post
exports.schedulePost = async (req, res) => {
  try {
    const { scheduledFor } = req.body;

    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Remove user authorization check for now
    // if (post.user.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ error: 'Not authorized' });
    // }

    post.scheduledFor = new Date(scheduledFor);
    post.status = 'scheduled';

    await post.save();

    // Enqueue scheduling job
    const delayMs = Math.max(0, new Date(scheduledFor).getTime() - Date.now());
    await queue.add(JOB_TYPES.SCHEDULE_PUBLISH, { postId: post._id }, { delay: delayMs });

    res.json({
      message: 'Post scheduled successfully',
      post
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
