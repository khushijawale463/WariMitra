const mongoose = require('mongoose');

const sevaRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  sevaType: {
    type: String,
    required: true,
    enum: ['Annadan (Food Seva)', 'Medical Seva', 'Donation', 'Volunteer Support', 'Other']
  },
  message: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SevaRequest', sevaRequestSchema);
