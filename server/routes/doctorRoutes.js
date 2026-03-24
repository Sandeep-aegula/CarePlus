const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider');
const { auth, isDoctor } = require('../middleware/auth');

// @route   PUT /api/doctor/profile
// @desc    Update doctor's consultationFee and isAvailable (Live status)
router.put('/profile', auth, isDoctor, async (req, res) => {
    try {
        const { consultationFee, isAvailable, specialty, clinicName, address, lat, lng } = req.body;

        let provider = await Provider.findOne({ userId: req.user.id, type: 'doctor' });

        if (!provider) {
            // Auto-create provider profile for the doctor if it doesn't exist
            provider = new Provider({
                userId: req.user.id,
                type: 'doctor',
                name: req.user.name || 'Doctor',
                licenseNumber: 'PENDING',
                clinicName: clinicName || 'My Clinic',
                address: address || 'Address not set',
                specialty: specialty || '',
                consultationFee: consultationFee || 0,
                isAvailable: isAvailable || false,
                location: {
                    type: 'Point',
                    coordinates: (lng && lat) ? [parseFloat(lng), parseFloat(lat)] : [0, 0]
                }
            });
            await provider.save();
            return res.json({ msg: 'Doctor profile created', provider });
        }

        // Update existing profile
        if (consultationFee !== undefined) provider.consultationFee = consultationFee;
        if (isAvailable !== undefined) provider.isAvailable = isAvailable;
        if (specialty) provider.specialty = specialty;
        if (clinicName) provider.clinicName = clinicName;
        if (address) provider.address = address;
        if (lat && lng) {
            provider.location = {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
            };
        }

        await provider.save();
        res.json({ msg: 'Profile updated', provider });
    } catch (error) {
        console.error('Doctor Profile Update Error:', error);
        res.status(500).json({ msg: 'Server error updating profile' });
    }
});

// @route   GET /api/doctor/profile
// @desc    Get current doctor's provider profile
router.get('/profile', auth, isDoctor, async (req, res) => {
    try {
        const provider = await Provider.findOne({ userId: req.user.id, type: 'doctor' });
        if (!provider) {
            return res.status(404).json({ msg: 'Provider profile not found. Update your profile to create one.' });
        }
        res.json(provider);
    } catch (error) {
        console.error('Doctor Profile Fetch Error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   PUT /api/doctor/toggle-status
// @desc    Quick toggle Live/Offline status
router.put('/toggle-status', auth, isDoctor, async (req, res) => {
    try {
        const provider = await Provider.findOne({ userId: req.user.id, type: 'doctor' });
        if (!provider) {
            return res.status(404).json({ msg: 'Provider profile not found' });
        }

        provider.isAvailable = !provider.isAvailable;
        provider.isLive = provider.isAvailable;
        await provider.save();

        res.json({ msg: `Status: ${provider.isAvailable ? 'Available' : 'Offline'}`, isAvailable: provider.isAvailable });
    } catch (error) {
        console.error('Toggle Status Error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   PUT /api/doctor/availability
// @desc    Update doctor's availability slots
router.put('/availability', auth, isDoctor, async (req, res) => {
    try {
        const { availability } = req.body; // Array of { day, startTime, endTime }

        let provider = await Provider.findOne({ userId: req.user.id, type: 'doctor' });
        if (!provider) {
            return res.status(404).json({ msg: 'Provider profile not found. Update your profile first.' });
        }

        provider.availability = availability;
        await provider.save();
        res.json({ msg: 'Availability updated', availability: provider.availability });
    } catch (error) {
        console.error('Availability Update Error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/doctor/list
// @desc    Public - Get all registered doctors with profiles
router.get('/list', async (req, res) => {
    try {
        const User = require('../models/User');
        // Get all users with role 'doctor'
        const doctors = await User.find({ role: 'doctor' }).select('-password');

        // Get provider profiles for these doctors
        const doctorIds = doctors.map(d => d._id);
        const providers = await Provider.find({ userId: { $in: doctorIds }, type: 'doctor' });

        // Merge user + provider data
        const result = doctors.map(doc => {
            const provider = providers.find(p => p.userId.toString() === doc._id.toString());
            return {
                _id: doc._id,
                name: doc.name,
                email: doc.email,
                specialization: doc.specialization || '',
                experience: doc.experience || 0,
                // Provider data
                clinicName: provider?.clinicName || '',
                address: provider?.address || '',
                specialty: provider?.specialty || doc.specialization || 'General',
                consultationFee: provider?.consultationFee || 0,
                isAvailable: provider?.isAvailable || false,
                availability: provider?.availability || [],
                averageRating: provider?.averageRating || 0,
                totalReviews: provider?.totalReviews || 0,
                location: provider?.location || null,
            };
        });

        res.json(result);
    } catch (error) {
        console.error('Doctor List Error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
