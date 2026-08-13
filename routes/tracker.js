const express = require('express');
const router = express.Router();

// GET /tracker - Warkari Dindi & Friend Tracker
router.get('/', (req, res) => {
  res.render('tracker', { title: 'Dindi & Friend Tracker' });
});

module.exports = router;
