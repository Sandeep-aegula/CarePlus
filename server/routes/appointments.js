const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { auth } = require('../middleware/auth');
const { createNotification } = require('../utils/notify');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `report-${uniqueSuffix}-${file.originalname}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// @route   GET /api/appointments
// @desc    Get appointments for the logged-in user (role-based)
router.get('/', auth, async (req, res) => {
  try {
    let appointments;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'doctor' || userRole === 'lab') {
      appointments = await Appointment.find({ doctorId: new mongoose.Types.ObjectId(userId) })
        .populate('patientId', 'name email age gender')
        .populate('doctorId', 'name specialization')
        .sort({ date: -1 });
    } else {
      appointments = await Appointment.find({ patientId: new mongoose.Types.ObjectId(userId) })
        .populate('patientId', 'name email')
        .populate('doctorId', 'name specialization role')
        .sort({ date: -1 });
    }
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/appointments/booked-slots/:doctorId/:date
// @desc    Get already booked time slots for a doctor on a specific date
router.get('/booked-slots/:doctorId/:date', async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const bookings = await Appointment.find({
      doctorId: new mongoose.Types.ObjectId(doctorId),
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $nin: ['Cancelled'] }
    }).select('timeSlot');

    const bookedSlots = bookings.map(b => b.timeSlot).filter(Boolean);
    res.json(bookedSlots);
  } catch (err) {
    console.error('Error fetching booked slots:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/appointments/add
// @desc    Add appointment (with double-booking prevention)
router.post('/add', auth, async (req, res) => {
  const { doctorId, date, symptoms, timeSlot, tests } = req.body;
  try {
    // Check for existing booking on the same slot
    if (timeSlot) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const conflict = await Appointment.findOne({
        doctorId: new mongoose.Types.ObjectId(doctorId),
        date: { $gte: dayStart, $lte: dayEnd },
        timeSlot,
        status: { $nin: ['Cancelled'] }
      });

      if (conflict) {
        return res.status(409).json({ msg: 'This time slot is already booked. Please choose another.' });
      }
    }

    const newAppointment = new Appointment({
      patientId: req.user.id,
      doctorId,
      date,
      symptoms,
      timeSlot,
      tests: tests || [],
      status: 'Pending'
    });

    const saved = await newAppointment.save();

    // Notify the provider (Doctor or Lab)
    await createNotification(
      doctorId,
      'New Appointment Request',
      `You have a new appointment for ${symptoms || 'General Checkup'} on ${new Date(date).toLocaleDateString()}.`,
      'appointment'
    );

    res.json(saved);
  } catch (err) {
    console.error('Error adding appointment:', err.message);
    res.status(400).json({ msg: 'Error: ' + err.message });
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

    const { date, symptoms, status, prescription, tests, report } = req.body;
    if (date) appointment.date = date;
    if (symptoms) appointment.symptoms = symptoms;
    if (status) appointment.status = status;
    if (prescription !== undefined) appointment.prescription = prescription;
    if (report !== undefined) appointment.report = report;
    if (tests !== undefined) appointment.tests = tests;

    await appointment.save();
    res.json('Appointment updated!');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// @route   POST /api/appointments/:id/upload-report
// @desc    Upload an actual PDF report file
router.post('/:id/upload-report', auth, upload.single('reportFile'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });

    const reportUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    appointment.report = reportUrl;
    appointment.status = 'Completed';
    await appointment.save();

    // Notify the patient
    await createNotification(
      appointment.patientId,
      'Test Report Ready',
      `Your report for appointment on ${appointment.date} is now available.`,
      'report'
    );

    res.json({ msg: 'Report uploaded', reportUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error during upload' });
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

// @route   POST /api/appointments/:id/review
// @desc    Add review to appointment and update doctor's ratings
router.post('/:id/review', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json('Appointment not found');

    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(401).json('Unauthorized');
    }
    if (appointment.status !== 'Completed') {
      return res.status(400).json('Cannot review an incomplete appointment');
    }
    if (appointment.isReviewed) {
      return res.status(400).json('Appointment already reviewed');
    }

    // Mark as reviewed
    appointment.isReviewed = true;
    await appointment.save();

    // Add review to provider profile (doctor or lab)
    const Provider = require('../models/Provider');
    const doctorProfile = await Provider.findOne({ userId: appointment.doctorId });

    if (doctorProfile) {
      const User = require('../models/User');
      const patient = await User.findById(req.user.id);

      doctorProfile.reviews.push({
        rating: Number(rating),
        comment: comment || '',
        date: new Date(),
        patientName: patient ? patient.name : 'Unknown Patient'
      });

      doctorProfile.totalReviews = doctorProfile.reviews.length;
      const sum = doctorProfile.reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
      doctorProfile.averageRating = doctorProfile.totalReviews > 0 ? (sum / doctorProfile.totalReviews) : 0;
      await doctorProfile.save();
    }

    res.json('Review submitted successfully!');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

module.exports = router;
