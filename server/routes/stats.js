const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

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

// @route   GET /api/stats/provider
// @desc    Get detailed analytics for a specific provider (Doctor/Lab)
router.get('/provider', auth, async (req, res) => {
    try {
        const providerId = new mongoose.Types.ObjectId(req.user.id);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Fetch monthly patient volume and revenue
        const analytics = await Appointment.aggregate([
            {
                $match: {
                    doctorId: providerId,
                    date: { $gte: sixMonthsAgo },
                    status: { $nin: ['Cancelled'] }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    patients: { $sum: 1 },
                    revenue: { 
                        $sum: { 
                            $reduce: {
                                input: "$tests",
                                initialValue: 500, // Default consultation fee
                                in: { $add: ["$$value", "$$this.price"] }
                            }
                        }
                    }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Map to display format
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedData = analytics.map(item => ({
            month: `${monthNames[item._id.month - 1]}`,
            year: item._id.year,
            patients: item.patients,
            revenue: item.revenue
        }));

        res.json(formattedData);
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
