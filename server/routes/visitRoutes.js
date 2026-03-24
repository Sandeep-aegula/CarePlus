const express = require('express');
const router = express.Router();
const Visit = require('../models/Visit');
const Provider = require('../models/Provider');
const { auth, isPatient, isProvider } = require('../middleware/auth');

// @route   POST /api/visits/checkin
// @desc    Patient initiates a visit ("Visit Now" — creates en-route record)
router.post('/checkin', auth, isPatient, async (req, res) => {
    try {
        const { providerId, purpose, estimatedArrival } = req.body;

        if (!providerId) {
            return res.status(400).json({ msg: 'providerId is required' });
        }

        // Check provider exists
        const provider = await Provider.findById(providerId);
        if (!provider) {
            return res.status(404).json({ msg: 'Provider not found' });
        }

        // Check for existing active visit to same provider
        const existingVisit = await Visit.findOne({
            patientId: req.user.id,
            providerId,
            status: { $in: ['en-route', 'checked-in', 'in-progress'] }
        });
        if (existingVisit) {
            return res.status(400).json({ msg: 'You already have an active visit to this provider', visit: existingVisit });
        }

        const visit = new Visit({
            patientId: req.user.id,
            providerId,
            status: 'en-route',
            purpose: purpose || 'General Visit',
            estimatedArrival: estimatedArrival || 15,
            providerNotified: true // notification flag
        });

        await visit.save();

        res.status(201).json({ msg: 'Visit started — you are en-route!', visit });
    } catch (error) {
        console.error('Check-in Error:', error);
        res.status(500).json({ msg: 'Server error during check-in' });
    }
});

// @route   PATCH /api/visits/:visitId/status
// @desc    Update visit status (provider or patient can update)
router.patch('/:visitId/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['en-route', 'checked-in', 'in-progress', 'completed', 'cancelled', 'no-show'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ msg: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const visit = await Visit.findById(req.params.visitId);
        if (!visit) {
            return res.status(404).json({ msg: 'Visit not found' });
        }

        // Authorization: only patient or provider can update
        const isPatientOwner = visit.patientId.toString() === req.user.id;
        const isProviderOwner = req.user.role === 'doctor' || req.user.role === 'lab';

        if (!isPatientOwner && !isProviderOwner) {
            return res.status(403).json({ msg: 'Not authorized to update this visit' });
        }

        visit.status = status;
        if (status === 'checked-in') visit.checkInTime = new Date();
        if (status === 'completed') visit.completedTime = new Date();

        await visit.save();

        res.json({ msg: `Visit status updated to: ${status}`, visit });
    } catch (error) {
        console.error('Visit Status Error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/visits/provider/notifications
// @desc    Polling endpoint — Provider checks for new incoming visits
router.get('/provider/notifications', auth, isProvider, async (req, res) => {
    try {
        // Find the provider profile linked to this user
        const provider = await Provider.findOne({ userId: req.user.id });
        if (!provider) {
            return res.json({ newVisits: [], activeVisits: [] });
        }

        // New visits (en-route, not yet acknowledged)
        const newVisits = await Visit.find({
            providerId: provider._id,
            status: 'en-route',
            providerNotified: true
        }).populate('patientId', 'name email').sort({ createdAt: -1 });

        // All active visits
        const activeVisits = await Visit.find({
            providerId: provider._id,
            status: { $in: ['en-route', 'checked-in', 'in-progress'] }
        }).populate('patientId', 'name email').sort({ createdAt: -1 });

        res.json({ newVisits, activeVisits });
    } catch (error) {
        console.error('Notification Polling Error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/visits/patient/active
// @desc    Get patient's active visits
router.get('/patient/active', auth, isPatient, async (req, res) => {
    try {
        const visits = await Visit.find({
            patientId: req.user.id,
            status: { $in: ['en-route', 'checked-in', 'in-progress'] }
        }).populate('providerId').sort({ createdAt: -1 });

        res.json(visits);
    } catch (error) {
        console.error('Patient Active Visits Error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/visits/patient/pending-ratings
// @desc    Check if patient has visits completed 24+ hrs ago that need rating
router.get('/patient/pending-ratings', auth, isPatient, async (req, res) => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const unratedVisits = await Visit.find({
            patientId: req.user.id,
            status: 'completed',
            ratingSubmitted: false,
            completedTime: { $lte: twentyFourHoursAgo }
        }).populate('providerId').sort({ completedTime: -1 });

        res.json(unratedVisits);
    } catch (error) {
        console.error('Pending Ratings Error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   POST /api/visits/:visitId/rate
// @desc    Submit post-visit rating (updates Provider averageRating)
router.post('/:visitId/rate', auth, isPatient, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ msg: 'Rating must be between 1 and 5' });
        }

        const visit = await Visit.findById(req.params.visitId);
        if (!visit) return res.status(404).json({ msg: 'Visit not found' });
        if (visit.patientId.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }
        if (visit.ratingSubmitted) {
            return res.status(400).json({ msg: 'Rating already submitted for this visit' });
        }

        // Save rating to Visit
        visit.rating = rating;
        visit.ratingComment = comment || '';
        visit.ratingSubmitted = true;
        await visit.save();

        // Update Provider's averageRating
        const provider = await Provider.findById(visit.providerId);
        if (provider) {
            provider.reviews.push({ rating, comment: comment || '', date: new Date() });
            provider.totalReviews += 1;
            const totalScore = provider.reviews.reduce((acc, rev) => acc + rev.rating, 0);
            provider.averageRating = totalScore / provider.totalReviews;
            await provider.save();
        }

        res.json({
            msg: 'Thank you for your rating!',
            averageRating: provider ? provider.averageRating : null
        });
    } catch (error) {
        console.error('Rating Error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/visits/patient/history
// @desc    Get all past visits for the patient
router.get('/patient/history', auth, isPatient, async (req, res) => {
    try {
        const visits = await Visit.find({ patientId: req.user.id })
            .populate('providerId')
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(visits);
    } catch (error) {
        console.error('Visit History Error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
