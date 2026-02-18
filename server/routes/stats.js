const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// @route   GET /api/stats
// @desc    Get hospital-wide statistics
router.get('/', async (req, res) => {
    try {
        const doctorCount = await User.countDocuments({ role: 'doctor' });
        const patientCount = await User.countDocuments({ role: 'patient' });
        const onlineDoctorCount = await User.countDocuments({ role: 'doctor', isOnline: true });
        const onlinePatientCount = await User.countDocuments({ role: 'patient', isOnline: true });
        const appointmentCount = await Appointment.countDocuments();

        res.json({
            doctors: doctorCount,
            patients: patientCount,
            onlineDoctors: onlineDoctorCount,
            onlinePatients: onlinePatientCount,
            appointments: appointmentCount
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
