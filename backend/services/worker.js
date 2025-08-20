const eventBus = require('../utils/eventBus');
const { JOB_TYPES } = require('./queueService');
const Post = require('../models/Post');

// Basic worker to process queue jobs
eventBus.on('queue:job', async (job) => {
  try {
    if (job.type === JOB_TYPES.SCHEDULE_PUBLISH) {
      const post = await Post.findById(job.payload.postId);
      if (!post) return;

      // Simulate successful publishing for all platforms
      (post.platforms || []).forEach((p) => {
        p.status = 'posted';
        p.postedAt = new Date();
      });
      post.status = 'posted';
      post.postedAt = new Date();
      await post.save();

      eventBus.emit('post:published', { postId: post._id, post });
    }
  } catch (err) {
    // In real system, push to DLQ / retry
    console.error('Worker error:', err.message);
  }
});


