require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital';

// --- Schemas ---
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['patient', 'doctor', 'lab'], required: true },
    specialization: { type: String },
    experience: { type: Number },
    age: { type: Number },
    gender: { type: String },
    isOnline: { type: Boolean, default: false }
}, { timestamps: true });

const providerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['doctor', 'lab'], required: true },
    name: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    clinicName: { type: String, required: true },
    address: { type: String, required: true },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },
    specialty: { type: String },
    consultationFee: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: false },
    labTests: [{ type: String }],
    services: [{
        name: String,
        price: Number,
        tat: String,
        homeCollection: { type: Boolean, default: false }
    }],
    isLive: { type: Boolean, default: false },
    availability: [{
        day: { type: String },
        startTime: { type: String },
        endTime: { type: String }
    }],
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    reviews: [{
        rating: Number,
        comment: String,
        date: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

providerSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', userSchema);
const Provider = mongoose.model('Provider', providerSchema);
const Appointment = mongoose.model('Appointment', new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String },
    symptoms: { type: String },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'Collected', 'Processing', 'Awaiting'] },
    prescription: { type: String, default: '' },
    report: { type: String, default: '' },
    tests: [{ name: String, price: Number }],
    isReviewed: { type: Boolean, default: false }
}, { timestamps: true }));

// --- Seed Data ---
const PASSWORD = '123456789';

const doctors = [
    {
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@careplus.com',
        specialization: 'Cardiologist',
        experience: 12,
        provider: {
            clinicName: 'HeartCare Clinic',
            address: 'Banjara Hills, Hyderabad',
            specialty: 'Cardiology',
            consultationFee: 800,
            isAvailable: true,
            isLive: true,
            location: { type: 'Point', coordinates: [78.4410, 17.4156] },
            availability: [
                { day: 'Monday', startTime: '09:00', endTime: '13:00' },
                { day: 'Monday', startTime: '16:00', endTime: '19:00' },
                { day: 'Wednesday', startTime: '09:00', endTime: '13:00' },
                { day: 'Friday', startTime: '10:00', endTime: '14:00' },
                { day: 'Saturday', startTime: '09:00', endTime: '12:00' },
            ],
            averageRating: 4.8,
            totalReviews: 142,
            reviews: [
                { rating: 5, comment: 'Excellent cardiologist, very thorough examination.' },
                { rating: 5, comment: 'Dr. Priya saved my father\'s life. Highly recommended!' },
                { rating: 4, comment: 'Good doctor, wait time could be less.' },
            ]
        }
    },
    {
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@careplus.com',
        specialization: 'Orthopedic',
        experience: 15,
        provider: {
            clinicName: 'OrthoPlus Hospital',
            address: 'Jubilee Hills, Hyderabad',
            specialty: 'Orthopedics',
            consultationFee: 700,
            isAvailable: true,
            isLive: true,
            location: { type: 'Point', coordinates: [78.4094, 17.4319] },
            availability: [
                { day: 'Monday', startTime: '10:00', endTime: '14:00' },
                { day: 'Tuesday', startTime: '10:00', endTime: '14:00' },
                { day: 'Thursday', startTime: '10:00', endTime: '14:00' },
                { day: 'Friday', startTime: '10:00', endTime: '13:00' },
                { day: 'Saturday', startTime: '10:00', endTime: '13:00' },
            ],
            averageRating: 4.6,
            totalReviews: 98,
            reviews: [
                { rating: 5, comment: 'Fixed my knee issue completely.' },
                { rating: 4, comment: 'Very experienced, good bedside manner.' },
            ]
        }
    },
    {
        name: 'Dr. Aisha Khan',
        email: 'aisha.khan@careplus.com',
        specialization: 'Dermatologist',
        experience: 8,
        provider: {
            clinicName: 'SkinGlow Derma Center',
            address: 'Madhapur, Hyderabad',
            specialty: 'Dermatology',
            consultationFee: 600,
            isAvailable: true,
            isLive: true,
            location: { type: 'Point', coordinates: [78.3926, 17.4486] },
            availability: [
                { day: 'Monday', startTime: '11:00', endTime: '15:00' },
                { day: 'Tuesday', startTime: '11:00', endTime: '15:00' },
                { day: 'Wednesday', startTime: '11:00', endTime: '15:00' },
                { day: 'Thursday', startTime: '14:00', endTime: '18:00' },
                { day: 'Saturday', startTime: '09:00', endTime: '13:00' },
            ],
            averageRating: 4.9,
            totalReviews: 203,
            reviews: [
                { rating: 5, comment: 'Best dermatologist in Hyderabad!' },
                { rating: 5, comment: 'My skin improved dramatically after her treatment.' },
                { rating: 5, comment: 'Very gentle and knowledgeable.' },
            ]
        }
    },
    {
        name: 'Dr. Vikram Reddy',
        email: 'vikram.reddy@careplus.com',
        specialization: 'General Physician',
        experience: 20,
        provider: {
            clinicName: 'City Health Clinic',
            address: 'Kukatpally, Hyderabad',
            specialty: 'General',
            consultationFee: 400,
            isAvailable: true,
            isLive: true,
            location: { type: 'Point', coordinates: [78.3903, 17.4849] },
            availability: [
                { day: 'Monday', startTime: '08:00', endTime: '12:00' },
                { day: 'Monday', startTime: '17:00', endTime: '20:00' },
                { day: 'Tuesday', startTime: '08:00', endTime: '12:00' },
                { day: 'Wednesday', startTime: '08:00', endTime: '12:00' },
                { day: 'Thursday', startTime: '08:00', endTime: '12:00' },
                { day: 'Friday', startTime: '08:00', endTime: '12:00' },
                { day: 'Saturday', startTime: '08:00', endTime: '11:00' },
            ],
            averageRating: 4.7,
            totalReviews: 316,
            reviews: [
                { rating: 5, comment: 'Our family doctor for 10 years!' },
                { rating: 4, comment: 'Very patient and explains everything clearly.' },
                { rating: 5, comment: 'Affordable and reliable.' },
            ]
        }
    },
    {
        name: 'Dr. Meera Nair',
        email: 'meera.nair@careplus.com',
        specialization: 'Pediatrician',
        experience: 10,
        provider: {
            clinicName: 'Little Stars Children Hospital',
            address: 'Gachibowli, Hyderabad',
            specialty: 'Pediatrics',
            consultationFee: 500,
            isAvailable: true,
            isLive: false,
            location: { type: 'Point', coordinates: [78.3489, 17.4401] },
            availability: [
                { day: 'Monday', startTime: '09:00', endTime: '13:00' },
                { day: 'Tuesday', startTime: '09:00', endTime: '13:00' },
                { day: 'Wednesday', startTime: '14:00', endTime: '18:00' },
                { day: 'Thursday', startTime: '09:00', endTime: '13:00' },
                { day: 'Friday', startTime: '09:00', endTime: '13:00' },
            ],
            averageRating: 4.9,
            totalReviews: 178,
            reviews: [
                { rating: 5, comment: 'Amazing with kids, my daughter loves visiting her!' },
                { rating: 5, comment: 'Very caring and thorough.' },
                { rating: 5, comment: 'Best pediatrician we\'ve been to.' },
            ]
        }
    }
];

const testCenters = [
    {
        name: 'MedLab Diagnostics',
        email: 'medlab@careplus.com',
        provider: {
            clinicName: 'MedLab Diagnostics Center',
            address: 'Ameerpet, Hyderabad',
            specialty: 'Full-Service Lab',
            isAvailable: true,
            isLive: true,
            location: { type: 'Point', coordinates: [78.4483, 17.4375] },
            availability: [
                { day: 'Monday', startTime: '06:00', endTime: '20:00' },
                { day: 'Tuesday', startTime: '06:00', endTime: '20:00' },
                { day: 'Wednesday', startTime: '06:00', endTime: '20:00' },
                { day: 'Thursday', startTime: '06:00', endTime: '20:00' },
                { day: 'Friday', startTime: '06:00', endTime: '20:00' },
                { day: 'Saturday', startTime: '07:00', endTime: '14:00' },
            ],
            services: [
                { name: 'CBC', price: 450, tat: '12 hrs', homeCollection: true },
                { name: 'Thyroid Panel', price: 800, tat: '24 hrs', homeCollection: true },
                { name: 'Lipid Profile', price: 600, tat: '8 hrs', homeCollection: true },
                { name: 'Liver Function Test', price: 900, tat: '12 hrs', homeCollection: false },
                { name: 'Kidney Function Test', price: 850, tat: '12 hrs', homeCollection: true },
            ],
            averageRating: 4.7,
            totalReviews: 234,
            reviews: [
                { rating: 5, comment: 'Fast results and accurate reports.' },
                { rating: 4, comment: 'Home collection service is very convenient.' },
            ]
        }
    },
    {
        name: 'PathCare Labs',
        email: 'pathcare@careplus.com',
        provider: {
            clinicName: 'PathCare Laboratories',
            address: 'Begumpet, Hyderabad',
            specialty: 'Pathology Lab',
            isAvailable: true,
            isLive: true,
            location: { type: 'Point', coordinates: [78.4674, 17.4439] },
            availability: [
                { day: 'Monday', startTime: '07:00', endTime: '19:00' },
                { day: 'Tuesday', startTime: '07:00', endTime: '19:00' },
                { day: 'Wednesday', startTime: '07:00', endTime: '19:00' },
                { day: 'Thursday', startTime: '07:00', endTime: '19:00' },
                { day: 'Friday', startTime: '07:00', endTime: '19:00' },
                { day: 'Saturday', startTime: '08:00', endTime: '13:00' },
            ],
            services: [
                { name: 'Blood Sugar Fasting', price: 150, tat: '4 hrs', homeCollection: true },
                { name: 'HbA1c', price: 500, tat: '6 hrs', homeCollection: true },
                { name: 'Vitamin D', price: 1200, tat: '24 hrs', homeCollection: false },
                { name: 'Vitamin B12', price: 900, tat: '24 hrs', homeCollection: false },
                { name: 'Urine Routine', price: 200, tat: '4 hrs', homeCollection: false },
            ],
            averageRating: 4.5,
            totalReviews: 189,
            reviews: [
                { rating: 5, comment: 'Very professional staff.' },
                { rating: 4, comment: 'Good quality reports.' },
            ]
        }
    }
];

async function seed() {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(PASSWORD, salt);

        // Clear only history, keep users/providers or recreate
        console.log('Cleaning Appointment collection...');
        await Appointment.deleteMany({});

        // Create Patient
        let patient = await User.findOne({ email: 'testuser@gmail.com' });
        if (!patient) {
            patient = await User.create({
                name: 'Sandeep Aegula',
                email: 'testuser@gmail.com',
                password: hashedPassword,
                role: 'patient',
                age: 25,
                gender: 'Male'
            });
        }

        // Create Providers and History
        for (const doc of doctors) {
            let user = await User.findOne({ email: doc.email });
            if (!user) {
                user = await User.create({
                    name: doc.name,
                    email: doc.email,
                    password: hashedPassword,
                    role: 'doctor',
                    specialization: doc.specialization,
                    experience: doc.experience
                });
            }
            await Provider.findOneAndUpdate(
                { userId: user._id },
                { ...doc.provider, userId: user._id, type: 'doctor', name: doc.name, licenseNumber: 'SEED-DOC' },
                { upsert: true }
            );

            // Mock History
            for (let m = 0; m < 6; m++) {
                const monthDate = new Date();
                monthDate.setMonth(monthDate.getMonth() - m);
                const count = Math.floor(12 + Math.random() * 8);
                for (let i = 0; i < count; i++) {
                    const apptDate = new Date(monthDate);
                    apptDate.setDate(Math.floor(1 + Math.random() * 28));
                    await Appointment.create({
                        patientId: patient._id,
                        doctorId: user._id,
                        date: apptDate,
                        status: 'Completed'
                    });
                }
            }
        }

        for (const lab of testCenters) {
            let user = await User.findOne({ email: lab.email });
            if (!user) {
                user = await User.create({
                    name: lab.name,
                    email: lab.email,
                    password: hashedPassword,
                    role: 'lab'
                });
            }
            await Provider.findOneAndUpdate(
                { userId: user._id },
                { ...lab.provider, userId: user._id, type: 'lab', name: lab.name, licenseNumber: 'SEED-LAB' },
                { upsert: true }
            );

            // Mock History
            for (let m = 0; m < 6; m++) {
                const monthDate = new Date();
                monthDate.setMonth(monthDate.getMonth() - m);
                const count = Math.floor(15 + Math.random() * 10);
                for (let i = 0; i < count; i++) {
                    const apptDate = new Date(monthDate);
                    apptDate.setDate(Math.floor(1 + Math.random() * 28));
                    await Appointment.create({
                        patientId: patient._id,
                        doctorId: user._id,
                        date: apptDate,
                        status: 'Completed',
                        tests: [{ name: 'CBC', price: 400 }]
                    });
                }
            }
        }

        console.log('Seed successful!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
