const express = require('express');
const router = express.Router();
const Facility = require('../models/Facility');

// List facilities (with optional category filter)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    const facilities = await Facility.find(filter).sort({ createdAt: -1 });
    res.render('facilities', {
      title: 'Nearby Facilities',
      facilities,
      selectedCategory: req.query.category || ''
    });
  } catch (err) {
    res.status(500).send('Error loading facilities: ' + err.message);
  }
});

// Add new facility
router.post('/', async (req, res) => {
  try {
    const { name, category, location, landmark, contact, description } = req.body;
    await Facility.create({ name, category, location, landmark, contact, description });
    res.redirect('/facilities');
  } catch (err) {
    res.status(500).send('Error adding facility: ' + err.message);
  }
});

// Delete facility
router.post('/:id/delete', async (req, res) => {
  try {
    await Facility.findByIdAndDelete(req.params.id);
    res.redirect('/facilities');
  } catch (err) {
    res.status(500).send('Error deleting facility: ' + err.message);
  }
});

module.exports = router;
