const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Made optional temporarily
  },
  content: {
    text: {
      type: String,
      required: true,
      maxlength: 280
    },
    media: [{
      url: String,
      type: {
        type: String,
        enum: ['image', 'video'],
        required: true
      },
      filename: String
    }]
  },
  platforms: [{
    name: {
      type: String,
      enum: ['twitter', 'linkedin', 'instagram', 'facebook'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'posted', 'failed'],
      default: 'pending'
    },
    postId: String,
    postedAt: Date,
    error: String
  }],
  scheduledFor: Date,
  postedAt: Date,
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'posted', 'failed'],
    default: 'draft'
  },
  tags: [String],
  metadata: {
    characterCount: Number,
    hasMedia: Boolean,
    platformCount: Number
  }
}, {
  timestamps: true
});

// Index for efficient queries
postSchema.index({ user: 1, status: 1 });
postSchema.index({ scheduledFor: 1, status: 1 });

module.exports = mongoose.model('Post', postSchema);
