const axios = require('axios');
const mongoose = require('mongoose');

// require models
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const Provider = require('./models/Provider');
require('dotenv').config({ path: './.env' });

async function testSubmitReview() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hospital');
  
  // Find an appointment
  const appt = await Appointment.findOne({ status: 'Completed', isReviewed: false }).populate('patientId');
  if (!appt) {
    console.log('No completed, unreviewed appointment found.');
    return process.exit(0);
  }
  
  console.log('Found appointment:', appt._id);
  
  // Need to log in as patient
  const patient = await User.findById(appt.patientId._id);
  console.log('Patient:', patient.email);
  
  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { user: { id: patient._id, role: patient.role } },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
  );
  
  try {
    const res = await axios.post(`http://localhost:5000/appointments/${appt._id}/review`, {
      rating: 4,
      comment: "Great doctor!"
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

testSubmitReview();
