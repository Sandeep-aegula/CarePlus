const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  symptoms: { type: String },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'] }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
