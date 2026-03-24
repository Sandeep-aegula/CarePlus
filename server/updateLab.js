require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Provider = require('./models/Provider');

async function updateLab() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hospital');
  await Provider.updateOne(
    { name: 'Apex Central Labs' },
    { $set: { contactNumber: '+91-9876543210', address: 'Main Health Avenue, City Center, Hyderabad' } }
  );
  console.log('Lab updated');
  process.exit(0);
}
updateLab();
