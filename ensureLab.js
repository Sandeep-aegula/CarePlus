require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const User = require('./server/models/User');
const Provider = require('./server/models/Provider');

async function ensureLab() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hospital');
  
  let labUser = await User.findOne({ role: 'lab' });
  if (!labUser) {
      console.log('No lab user found. Creating one...');
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('password', 10);
      labUser = new User({
          name: 'Apex Central Labs',
          email: 'lab@careplus.com',
          password: hash,
          role: 'lab'
      });
      await labUser.save();
  }
  
  let provider = await Provider.findOne({ userId: labUser._id });
  if (!provider) {
      console.log('Creating Provider profile for lab...');
      provider = new Provider({
          userId: labUser._id,
          type: 'lab',
          name: 'Apex Central Labs',
          clinicName: 'Apex Central Diagnostics',
          address: 'Main Health Avenue, City Center',
          services: [
             { name: 'Complete Blood Count (CBC)', price: 350, tat: '12 hrs', homeCollection: true },
             { name: 'Thyroid Profile', price: 600, tat: '24 hrs', homeCollection: true },
             { name: 'Lipid Profile', price: 400, tat: '8 hrs', homeCollection: false }
          ],
          labTests: ['Complete Blood Count (CBC)', 'Thyroid Profile', 'Lipid Profile']
      });
      await provider.save();
  }
  console.log('Lab User ID:', labUser._id);
  console.log('Lab Provider ID:', provider._id);
  process.exit(0);
}

ensureLab();
