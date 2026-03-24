const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
    status: {
        type: String,
        enum: ['en-route', 'checked-in', 'in-progress', 'completed', 'cancelled', 'no-show'],
        default: 'en-route'
    },
    purpose: { type: String },        // e.g., "General Consultation", "Blood Test"
    estimatedArrival: { type: Number }, // ETA in minutes
    checkInTime: { type: Date },
    completedTime: { type: Date },
    
    // Rating (submitted post-visit)
    rating: { type: Number, min: 1, max: 5 },
    ratingComment: { type: String },
    ratingSubmitted: { type: Boolean, default: false },
    
    // Notifications
    providerNotified: { type: Boolean, default: false },
    ratingReminderSent: { type: Boolean, default: false }
}, { timestamps: true });

// Index for efficient queries
visitSchema.index({ patientId: 1, status: 1 });
visitSchema.index({ providerId: 1, status: 1 });
visitSchema.index({ completedTime: 1, ratingSubmitted: 1 });

module.exports = mongoose.model('Visit', visitSchema);
