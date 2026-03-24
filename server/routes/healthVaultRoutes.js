const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const MedicalRecord = require('../models/MedicalRecord');
const { auth, isProvider, isPatient } = require('../middleware/auth');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// @route   POST /api/health-vault/upload
// @desc    Upload a medical document (Provider uploads for a patient)
router.post('/upload', auth, isProvider, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        const { patientId, title, description, category, visitId } = req.body;

        if (!patientId || !title) {
            // Clean up uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ msg: 'patientId and title are required' });
        }

        const record = new MedicalRecord({
            patientId,
            uploadedBy: req.user.id,
            title,
            description: description || '',
            category: category || 'lab-report',
            fileName: req.file.originalname,
            filePath: `/uploads/${req.file.filename}`,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            visitId: visitId || undefined
        });

        await record.save();

        res.status(201).json({ msg: 'Document uploaded successfully', record });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ msg: 'Server error during upload' });
    }
});

// @route   GET /api/health-vault/patient
// @desc    Patient views their own medical records
router.get('/patient', auth, isPatient, async (req, res) => {
    try {
        const records = await MedicalRecord.find({
            patientId: req.user.id,
            isSharedWithPatient: true
        })
        .populate('uploadedBy', 'name role')
        .sort({ createdAt: -1 });

        res.json(records);
    } catch (error) {
        console.error('Fetch Records Error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/health-vault/provider/:patientId
// @desc    Provider views records they uploaded for a specific patient
router.get('/provider/:patientId', auth, isProvider, async (req, res) => {
    try {
        const records = await MedicalRecord.find({
            patientId: req.params.patientId,
            uploadedBy: req.user.id  // Only records this provider uploaded
        }).sort({ createdAt: -1 });

        res.json(records);
    } catch (error) {
        console.error('Provider Records Error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/health-vault/file/:recordId
// @desc    Download/view a specific medical record (access controlled)
router.get('/file/:recordId', auth, async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.recordId);
        if (!record) {
            return res.status(404).json({ msg: 'Record not found' });
        }

        // Access control: only the patient owner OR the uploading provider
        const isPatientOwner = record.patientId.toString() === req.user.id;
        const isUploader = record.uploadedBy.toString() === req.user.id;

        if (!isPatientOwner && !isUploader) {
            return res.status(403).json({ msg: 'Access denied: You are not authorized to view this record' });
        }

        const filePath = path.join(__dirname, '..', record.filePath);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ msg: 'File not found on server' });
        }

        res.sendFile(filePath);
    } catch (error) {
        console.error('File Access Error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   DELETE /api/health-vault/:recordId
// @desc    Delete a medical record (uploading provider only)
router.delete('/:recordId', auth, isProvider, async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.recordId);
        if (!record) {
            return res.status(404).json({ msg: 'Record not found' });
        }

        if (record.uploadedBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Only the uploading provider can delete this record' });
        }

        // Delete file from disk
        const filePath = path.join(__dirname, '..', record.filePath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await MedicalRecord.findByIdAndDelete(req.params.recordId);
        res.json({ msg: 'Record deleted' });
    } catch (error) {
        console.error('Delete Record Error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
