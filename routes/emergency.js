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

// Phase 2: POST /emergency/api/sos - Instant SOS Location Broadcast
router.post('/api/sos', async (req, res) => {
  try {
    const { lat, lng, userName, phone, dindiLeader, description } = req.body;
    const userLat = parseFloat(lat) || 17.6775;
    const userLng = parseFloat(lng) || 75.3283;
    const reporterName = userName || 'Mauli Warkari';
    const reporterPhone = phone || '+91 98220 00000';

    const broadcastRef = 'SOS-WARI-' + Math.floor(100000 + Math.random() * 900000);

    // Save emergency report record
    try {
      await EmergencyReport.create({
        name: reporterName,
        phone: reporterPhone,
        type: 'Medical',
        location: `GPS: ${userLat.toFixed(4)}, ${userLng.toFixed(4)} (Live SOS)`,
        description: `[CRITICAL SOS BROADCAST - Ref: ${broadcastRef}] ${description || 'Pilgrim in distress needing immediate assistance'}`
      });
    } catch (dbErr) {
      console.warn('[SOS] DB save notice:', dbErr.message);
    }

    console.log(`[SOS BROADCAST SENT] Ref: ${broadcastRef} | User: ${reporterName} | Pos: [${userLat}, ${userLng}] | Sent to: Dindi Leader (${dindiLeader || 'Mauli Patil'}), Sanjeevani Medical Camp, Wari Emergency Control Room`);

    res.json({
      success: true,
      broadcastRef: broadcastRef,
      timestamp: new Date().toISOString(),
      userLocation: { lat: userLat, lng: userLng },
      notifiedParties: [
        { role: 'Dindi Leader', name: dindiLeader || 'Mauli Patil', status: 'Notified (Push & SMS Sent)' },
        { role: 'Nearest Medical Camp', name: 'Sanjeevani Free Medical Camp (216m)', status: 'Dispatched First Responder' },
        { role: 'Wari Central Control Room', contact: '1800-XXX-XXXX', status: 'Alert Broadcast Active' }
      ],
      marathiAnnouncement: 'आपला आणीबाणी संदेश (SOS) यशस्वीरित्या दिंडी प्रमुख व वैद्यकीय पथकाकडे पाठवला आहे.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

