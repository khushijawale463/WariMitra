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
  mapUrl: { type: String },
  is24x7: { type: Boolean, default: true },
  capacityInfo: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  locationGeo: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [75.3283, 17.6775] } // [lng, lat]
  },
  status: { type: String, enum: ['Open', 'Busy', 'Closed'], default: 'Open' },
  createdAt: { type: Date, default: Date.now }
});

facilitySchema.index({ locationGeo: '2dsphere' });

module.exports = mongoose.model('Facility', facilitySchema);

