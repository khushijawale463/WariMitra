const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['Medical', 'Food', 'Water', 'Toilet', 'Shelter', 'Parking', 'Other']
  },
  location: { type: String, required: true }, // e.g. "Near Chandrabhaga Ghat"
  landmark: { type: String },
  contact: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Facility', facilitySchema);
