const express = require('express');
const router = express.Router();

router.get('/metrics', async (_req, res) => {
  // Mock aggregated metrics
  res.json({
    engagementRate: 0.152,
    totalPosts: 42,
    growth: 0.037,
    byPlatform: {
      twitter: { posts: 20, engagement: 0.18 },
      linkedin: { posts: 12, engagement: 0.12 },
      instagram: { posts: 10, engagement: 0.22 }
    }
  });
});

router.get('/export', async (_req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="metrics.csv"');
  res.send('platform,posts,engagement\ntwitter,20,0.18\nlinkedin,12,0.12\ninstagram,10,0.22');
});

module.exports = router;


