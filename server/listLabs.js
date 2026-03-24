require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

async function listLabs() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hospital');
  const labs = await User.find({ role: 'lab' });
  console.log('LAB USERS:', labs.map(l => ({ id: l._id.toString(), email: l.email, name: l.name })));
  process.exit(0);
}
listLabs();
