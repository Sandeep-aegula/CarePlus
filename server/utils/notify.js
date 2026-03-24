const Notification = require('../models/Notification');

const createNotification = async (userId, title, message, type = 'system') => {
    try {
        const notif = new Notification({
            userId,
            title,
            message,
            type
        });
        await notif.save();
        return notif;
    } catch (err) {
        console.error('Notification creation failed:', err);
    }
};

module.exports = { createNotification };
