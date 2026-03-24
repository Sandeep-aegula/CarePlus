const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Doctor or Lab who uploaded
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider' }, // Linked provider profile
    
    title: { type: String, required: true },           // e.g., "CBC Report", "MRI Scan"
    description: { type: String },
    category: { 
        type: String, 
        enum: ['lab-report', 'prescription', 'imaging', 'discharge-summary', 'other'],
        default: 'lab-report'
    },
    
    // File info
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },         // URL or server path
    fileSize: { type: Number },                          // in bytes
    mimeType: { type: String },
    
    // Visit linkage
    visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit' },
    
    // Access control
    isSharedWithPatient: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes for efficient queries
medicalRecordSchema.index({ patientId: 1, createdAt: -1 });
medicalRecordSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
