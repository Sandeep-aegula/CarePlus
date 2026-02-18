require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import routes
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const appointmentsRouter = require('./routes/appointments');
const statsRouter = require('./routes/stats');
// Keep legacy ones for transitional compatibility if needed
const patientsRouter = require('./routes/patients');
const doctorsRouter = require('./routes/doctors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital';
mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

// App Routes
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/appointments', appointmentsRouter);
app.use('/stats', statsRouter);

// Transitional Routes
app.use('/patients', patientsRouter);
app.use('/doctors', doctorsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
