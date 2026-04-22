const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String },  // e.g. "10:00 AM - 10:30 AM"
  symptoms: { type: String },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'Collected', 'Processing', 'Awaiting'] },
  prescription: { type: String, default: '' },
  report: { type: String, default: '' }, // For Lab Test results
  tests: [{ name: String, price: Number }],
  isReviewed: { type: Boolean, default: false },
  appointmentType: { type: String, enum: ['online', 'offline'], default: 'offline' },
  collectionType: { type: String, enum: ['home', 'center'], default: 'center' },
  meetingLink: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
