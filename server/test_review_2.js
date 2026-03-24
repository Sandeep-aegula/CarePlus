const axios = require('axios');
const mongoose = require('mongoose');

const User = require('./models/User');
const Appointment = require('./models/Appointment');
const Provider = require('./models/Provider');
require('dotenv').config({ path: './.env' });

async function createAndReview() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hospital');
  
  const patient = await User.findOne({ role: 'patient' });
  let doctor = await User.findOne({ role: 'doctor' });
  
  if (!patient || !doctor) {
     console.log('Ensure you have a patient and doctor in the DB.');
     return process.exit(1);
  }

  // Ensure provider profile
  await Provider.findOneAndUpdate(
    { userId: doctor._id, type: 'doctor' },
    { name: doctor.name, licenseNumber: '123', clinicName: 'Clinic', address: '123 Main' },
    { upsert: true }
  );
  
  const newAppt = new Appointment({
    patientId: patient._id,
    doctorId: doctor._id,
    date: new Date(),
    status: 'Completed',
    isReviewed: false
  });
  await newAppt.save();
  
  console.log('Created appt:', newAppt._id);
  
  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { user: { id: patient._id, role: patient.role } },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
  );
  
  try {
    const res = await axios.post(`http://localhost:5000/appointments/${newAppt._id}/review`, {
      rating: 4,
      comment: "Test review!"
    }, {
      headers: { 'x-auth-token': token }
    });
    console.log('Success:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('HTTP Error:', err.response.status, err.response.data);
    } else {
      console.error('Network/Internal Error:', err.message);
    }
  }
  process.exit(0);
}

createAndReview();
