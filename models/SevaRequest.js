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
  amount: { type: Number, default: 0 },
  message: { type: String },
  status: { type: String, enum: ['Pending', 'Acknowledged', 'Completed'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SevaRequest', sevaRequestSchema);
