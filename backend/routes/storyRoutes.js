const express = require('express');
const router = express.Router();
const eventBus = require('../utils/eventBus');

router.post('/create', async (req, res) => {
  const { theme = 'brand awareness', characters = 2 } = req.body;
  const story = {
    title: `Story about ${theme}`,
    outline: [
      'Hook',
      'Problem',
      'Insight',
      'Solution',
      'CTA'
    ]
  };
  eventBus.emit('story:created', story);
  res.json({ story });
});

router.post('/split', async (req, res) => {
  const { story } = req.body;
  const posts = (story?.outline || []).map((section, index) => ({ index, text: `${section}: ${story?.title || ''}` }));
  res.json({ posts });
});

module.exports = router;


