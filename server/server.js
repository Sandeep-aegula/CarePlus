require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Route imports
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const appointmentsRouter = require('./routes/appointments');
const statsRouter = require('./routes/stats');
const chatbotRouter = require('./routes/chatbot');
const providersRouter = require('./routes/providerRoutes');
const searchRouter = require('./routes/search');
const doctorRouter = require('./routes/doctorRoutes');
const testcenterRouter = require('./routes/testcenterRoutes');
const visitRouter = require('./routes/visitRoutes');
const healthVaultRouter = require('./routes/healthVaultRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital';
mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

// Mount routes
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/appointments', appointmentsRouter);
app.use('/stats', statsRouter);
app.use('/chatbot', chatbotRouter);
app.use('/providers', providersRouter);
app.use('/api/search', searchRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/testcenter', testcenterRouter);
app.use('/api/visits', visitRouter);
app.use('/api/health-vault', healthVaultRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
