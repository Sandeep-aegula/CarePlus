require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital';

// --- Schemas (inline to avoid import issues) ---
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
    },
    {
        name: 'HealthScan Diagnostics',
        email: 'healthscan@careplus.com',
        provider: {
            clinicName: 'HealthScan Imaging & Labs',
            address: 'Secunderabad, Hyderabad',
            specialty: 'Imaging & Lab',
            isAvailable: true,
            isLive: true,
            location: { type: 'Point', coordinates: [78.4983, 17.4344] },
            availability: [
                { day: 'Monday', startTime: '06:00', endTime: '21:00' },
                { day: 'Tuesday', startTime: '06:00', endTime: '21:00' },
                { day: 'Wednesday', startTime: '06:00', endTime: '21:00' },
                { day: 'Thursday', startTime: '06:00', endTime: '21:00' },
                { day: 'Friday', startTime: '06:00', endTime: '21:00' },
                { day: 'Saturday', startTime: '06:00', endTime: '16:00' },
                { day: 'Sunday', startTime: '08:00', endTime: '13:00' },
            ],
            services: [
                { name: 'MRI Whole Brain', price: 7500, tat: '24 hrs', homeCollection: false },
                { name: 'CT Scan Chest', price: 5000, tat: '12 hrs', homeCollection: false },
                { name: 'X-Ray', price: 500, tat: '2 hrs', homeCollection: false },
                { name: 'Ultrasound Abdomen', price: 1500, tat: '4 hrs', homeCollection: false },
                { name: 'ECG', price: 300, tat: '1 hr', homeCollection: false },
            ],
            averageRating: 4.8,
            totalReviews: 312,
            reviews: [
                { rating: 5, comment: 'State of the art equipment.' },
                { rating: 5, comment: 'Very accurate imaging results.' },
                { rating: 4, comment: 'Open on Sundays which is very helpful.' },
            ]
        }
    },
    {
        name: 'QuickTest Labs',
        email: 'quicktest@careplus.com',
        provider: {
            clinicName: 'QuickTest Express Lab',
            address: 'Miyapur, Hyderabad',
            specialty: 'Express Lab',
            isAvailable: true,
            isLive: true,
            location: { type: 'Point', coordinates: [78.3568, 17.4969] },
            availability: [
                { day: 'Monday', startTime: '05:30', endTime: '22:00' },
                { day: 'Tuesday', startTime: '05:30', endTime: '22:00' },
                { day: 'Wednesday', startTime: '05:30', endTime: '22:00' },
                { day: 'Thursday', startTime: '05:30', endTime: '22:00' },
                { day: 'Friday', startTime: '05:30', endTime: '22:00' },
                { day: 'Saturday', startTime: '06:00', endTime: '18:00' },
                { day: 'Sunday', startTime: '06:00', endTime: '12:00' },
            ],
            services: [
                { name: 'Rapid COVID Antigen', price: 300, tat: '30 min', homeCollection: true },
                { name: 'Dengue NS1', price: 600, tat: '2 hrs', homeCollection: true },
                { name: 'Malaria Test', price: 350, tat: '1 hr', homeCollection: true },
                { name: 'Typhoid Test', price: 400, tat: '2 hrs', homeCollection: true },
                { name: 'Complete Blood Picture', price: 500, tat: '3 hrs', homeCollection: true },
            ],
            averageRating: 4.4,
            totalReviews: 156,
            reviews: [
                { rating: 5, comment: 'Super fast results!' },
                { rating: 4, comment: 'Home collection is very prompt.' },
            ]
        }
    },
    {
        name: 'GenomeX Lab',
        email: 'genomex@careplus.com',
        provider: {
            clinicName: 'GenomeX Advanced Diagnostics',
            address: 'HITEC City, Hyderabad',
            specialty: 'Genetic & Advanced Testing',
            isAvailable: true,
            isLive: false,
            location: { type: 'Point', coordinates: [78.3773, 17.4474] },
            availability: [
                { day: 'Monday', startTime: '08:00', endTime: '17:00' },
                { day: 'Tuesday', startTime: '08:00', endTime: '17:00' },
                { day: 'Wednesday', startTime: '08:00', endTime: '17:00' },
                { day: 'Thursday', startTime: '08:00', endTime: '17:00' },
                { day: 'Friday', startTime: '08:00', endTime: '17:00' },
            ],
            services: [
                { name: 'Whole Exome Sequencing', price: 25000, tat: '7 days', homeCollection: false },
                { name: 'Cancer Marker Panel', price: 3500, tat: '48 hrs', homeCollection: false },
                { name: 'Allergy Panel (50)', price: 4000, tat: '3 days', homeCollection: true },
                { name: 'Hormone Panel', price: 2000, tat: '24 hrs', homeCollection: true },
                { name: 'Autoimmune Panel', price: 3000, tat: '48 hrs', homeCollection: false },
            ],
            averageRating: 4.9,
            totalReviews: 87,
            reviews: [
                { rating: 5, comment: 'Cutting-edge testing, very accurate.' },
                { rating: 5, comment: 'The genetic counseling was incredibly helpful.' },
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

        // Also create a patient account
        console.log('\n--- Creating Patient Account ---');
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
            console.log('✅ Patient: testuser@gmail.com / 123456789');
        } else {
            console.log('⏩ Patient already exists: testuser@gmail.com');
        }

        // Seed Doctors
        console.log('\n--- Seeding 5 Doctors ---');
        for (const doc of doctors) {
            let user = await User.findOne({ email: doc.email });
            if (user) {
                console.log(`⏩ Doctor already exists: ${doc.email}`);
                // Update provider if exists
                await Provider.findOneAndUpdate(
                    { userId: user._id },
                    { ...doc.provider, userId: user._id, type: 'doctor', name: doc.name, licenseNumber: `DOC-${Math.floor(1000 + Math.random() * 9000)}` },
                    { upsert: true, new: true }
                );
                continue;
            }
            user = await User.create({
                name: doc.name,
                email: doc.email,
                password: hashedPassword,
                role: 'doctor',
                specialization: doc.specialization,
                experience: doc.experience,
            });
            await Provider.create({
                userId: user._id,
                type: 'doctor',
                name: doc.name,
                licenseNumber: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
                ...doc.provider,
            });
            console.log(`✅ Doctor: ${doc.name} — ${doc.email} / 123456789`);
        }

        // Seed Test Centers
        console.log('\n--- Seeding 5 Test Centers ---');
        for (const lab of testCenters) {
            let user = await User.findOne({ email: lab.email });
            if (user) {
                console.log(`⏩ Lab already exists: ${lab.email}`);
                await Provider.findOneAndUpdate(
                    { userId: user._id },
                    { ...lab.provider, userId: user._id, type: 'lab', name: lab.name, licenseNumber: `LAB-${Math.floor(1000 + Math.random() * 9000)}` },
                    { upsert: true, new: true }
                );
                continue;
            }
            user = await User.create({
                name: lab.name,
                email: lab.email,
                password: hashedPassword,
                role: 'lab',
            });
            await Provider.create({
                userId: user._id,
                type: 'lab',
                name: lab.name,
                licenseNumber: `LAB-${Math.floor(1000 + Math.random() * 9000)}`,
                ...lab.provider,
            });
            console.log(`✅ Lab: ${lab.name} — ${lab.email} / 123456789`);
        }

        console.log('\n========================================');
        console.log('         SEED COMPLETED SUCCESSFULLY    ');
        console.log('========================================');
        console.log('\nAll accounts use password: 123456789');
        console.log('\nDoctor Logins:');
        doctors.forEach(d => console.log(`  ${d.name}: ${d.email}`));
        console.log('\nTest Center Logins:');
        testCenters.forEach(l => console.log(`  ${l.name}: ${l.email}`));
        console.log('\nPatient Login: testuser@gmail.com');
        console.log('========================================\n');

    } catch (err) {
        console.error('Seed Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

seed();
