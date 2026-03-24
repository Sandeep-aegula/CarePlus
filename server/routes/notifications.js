const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get user's notifications (last 10)
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.find({ userId: new mongoose.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
router.put('/:id/read', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ msg: 'Notification not found' });
        res.json(notification);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
router.put('/read-all', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        await Notification.updateMany({ userId, isRead: false }, { isRead: true });
        res.json({ msg: 'All marked read' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
