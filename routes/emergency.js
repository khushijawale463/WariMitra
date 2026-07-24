const express = require('express');
const router = express.Router();
const EmergencyReport = require('../models/EmergencyReport');

// Static emergency helpline numbers (can be moved to DB later)
const helplines = [
  { name: 'Police Control Room', number: '100' },
  { name: 'Ambulance', number: '108' },
  { name: 'Fire Brigade', number: '101' },
  { name: 'Pandharpur Wari Control Room', number: '1800-XXX-XXXX' },
  { name: 'Disaster Management Helpline', number: '1077' }
];

router.get('/', async (req, res) => {
  try {
    const reports = await EmergencyReport.find().sort({ createdAt: -1 }).limit(20);
    res.render('emergency', { title: 'Emergency Support', helplines, reports });
  } catch (err) {
    res.status(500).send('Error loading emergency page: ' + err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, phone, type, location, description } = req.body;
    await EmergencyReport.create({ name, phone, type, location, description });
    res.redirect('/emergency?submitted=1');
  } catch (err) {
    res.status(500).send('Error submitting report: ' + err.message);
  }
});

module.exports = router;
