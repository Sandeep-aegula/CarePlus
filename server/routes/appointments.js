const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { auth } = require('../middleware/auth');

// @route   GET /api/appointments
// @desc    Get appointments for the logged-in user (role-based)
router.get('/', auth, async (req, res) => {
  try {
    let appointments;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'doctor') {
      appointments = await Appointment.find({ doctorId: new mongoose.Types.ObjectId(userId) })
        .populate('patientId', 'name email age gender')
        .populate('doctorId', 'name specialization')
        .sort({ date: 1 });
    } else {
      appointments = await Appointment.find({ patientId: new mongoose.Types.ObjectId(userId) })
        .populate('patientId', 'name email')
        .populate('doctorId', 'name specialization')
        .sort({ date: 1 });
    }
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/appointments/add
// @desc    Add appointment
router.post('/add', auth, async (req, res) => {
  const { doctorId, date, symptoms } = req.body;
  try {
    const newAppointment = new Appointment({
      patientId: req.user.id,
      doctorId,
      date,
      symptoms
    });

    const saved = await newAppointment.save();
    res.json(saved);
  } catch (err) {
    console.error('Error adding appointment:', err.message);
    res.status(400).json('Error: ' + err);
  }
});

// @route   POST /api/appointments/update/:id
// @desc    Update appointment status (e.g. for doctors)
router.post('/update/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json('Appointment not found');

    // Basic check: only involved parties can update
    if (appointment.patientId.toString() !== req.user.id && appointment.doctorId.toString() !== req.user.id) {
      return res.status(401).json('Unauthorized');
    }

    const { date, symptoms, status } = req.body;
    if (date) appointment.date = date;
    if (symptoms) appointment.symptoms = symptoms;
    if (status) appointment.status = status;

    await appointment.save();
    res.json('Appointment updated!');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// @route   DELETE /api/appointments/delete/:id
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json('Appointment not found');

    // Only patient can cancel their own appointment? Or doctor too?
    if (appointment.patientId.toString() !== req.user.id && appointment.doctorId.toString() !== req.user.id) {
      return res.status(401).json('Unauthorized');
    }

    await Appointment.findByIdAndDelete(req.params.id);
    res.json('Appointment deleted.');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

module.exports = router;
