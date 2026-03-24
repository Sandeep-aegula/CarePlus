require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');

async function listAppts() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hospital');
  try {
      const appts = await Appointment.find({ doctorId: new mongoose.Types.ObjectId('69c169f6ec282fb1cf86408c') });
      console.log('Appts count:', appts.length);
  } catch (err) {
      console.error(err);
  }
  process.exit(0);
}
listAppts();
