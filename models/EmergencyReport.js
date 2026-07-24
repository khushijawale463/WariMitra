const mongoose = require('mongoose');

const emergencyReportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['Medical', 'Lost Person', 'Security', 'Fire', 'Other']
  },
  location: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmergencyReport', emergencyReportSchema);
