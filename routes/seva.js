const express = require('express');
const router = express.Router();
const SevaRequest = require('../models/SevaRequest');

router.get('/', async (req, res) => {
  try {
    const sevas = await SevaRequest.find().sort({ createdAt: -1 }).limit(20);
    res.render('seva', { title: 'Digital Seva', sevas });
  } catch (err) {
    res.status(500).send('Error loading seva page: ' + err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, sevaType, message } = req.body;
    await SevaRequest.create({ name, email, phone, sevaType, message });
    res.redirect('/seva?submitted=1');
  } catch (err) {
    res.status(500).send('Error submitting seva request: ' + err.message);
  }
});

module.exports = router;
