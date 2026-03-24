const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST /api/auth/register
// @desc    Register a user
router.post('/register', async (req, res) => {
    const { name, email, password, role, specialization, experience, age, gender } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({
            name,
            email,
            password,
            role,
            specialization,
            experience,
            age,
            gender,
            isOnline: true
        });

        await user.save();

        const payload = {
            id: user._id,
            role: user.role,
            name: user.name
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: payload });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        user.isOnline = true;
        await user.save();

        const payload = {
            id: user._id,
            role: user.role,
            name: user.name
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: payload });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

const { auth } = require('../middleware/auth');

// @route   POST /api/auth/logout
// @desc    Logout user
router.post('/logout', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.isOnline = false;
            await user.save();
        }
        res.json({ msg: 'Logged out' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/auth/login-status
// @desc    Sync user online status
router.post('/login-status', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.isOnline = true;
            await user.save();
        }
        res.json({ msg: 'Status updated' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/auth/me
// @desc    Get user profile data for the UI
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
