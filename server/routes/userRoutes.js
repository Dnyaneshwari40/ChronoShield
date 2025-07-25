const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// ✅ GET profile
router.get('/profile', protect, (req, res) => {
  res.json({
    message: 'Welcome to your profile!',
    user: req.user
  });
});

// ✅ GET blocklist
router.get('/blocklist', protect, async (req, res) => {
  res.json({ blocklist: req.user.blocklist });
});

// ✅ POST add domain to blocklist
router.post('/blocklist', protect, async (req, res) => {
  const { domain } = req.body;
  if (!domain) return res.status(400).json({ message: 'Domain is required' });

  if (!req.user.blocklist.includes(domain)) {
    req.user.blocklist.push(domain);
    await req.user.save();
  }

  res.json({ message: 'Domain added', blocklist: req.user.blocklist });
});

// ✅ DELETE domain from blocklist
router.delete('/blocklist', protect, async (req, res) => {
  const { domain } = req.body;
  if (!domain) return res.status(400).json({ message: 'Domain is required' });

  req.user.blocklist = req.user.blocklist.filter((d) => d !== domain);
  await req.user.save();

  res.json({ message: 'Domain removed', blocklist: req.user.blocklist });
});

module.exports = router;
