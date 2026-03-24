const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

const isDoctor = (req, res, next) => {
    if (req.user && req.user.role === 'doctor') {
        next();
    } else {
        res.status(403).json({ msg: 'Access denied: Doctors only' });
    }
};

const isPatient = (req, res, next) => {
    if (req.user && req.user.role === 'patient') {
        next();
    } else {
        res.status(403).json({ msg: 'Access denied: Patients only' });
    }
};

const isLab = (req, res, next) => {
    if (req.user && req.user.role === 'lab') {
        next();
    } else {
        res.status(403).json({ msg: 'Access denied: Labs only' });
    }
};

const isProvider = (req, res, next) => {
    if (req.user && (req.user.role === 'doctor' || req.user.role === 'lab')) {
        next();
    } else {
        res.status(403).json({ msg: 'Access denied: Providers only' });
    }
};

module.exports = { auth, isDoctor, isPatient, isLab, isProvider };
