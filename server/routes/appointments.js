const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

// Get all appointments
router.get('/', (req, res) => {
  Appointment.find()
    .then(appts => res.json(appts))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Add appointment
router.post('/add', (req, res) => {
  const { patientName, doctorName, date } = req.body;
  const newAppointment = new Appointment({ patientName, doctorName, date });
  newAppointment.save()
    .then(saved => res.json(saved))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Update appointment
router.post('/update/:id', (req, res) => {
  Appointment.findById(req.params.id)
    .then(appt => {
      if (!appt) return res.status(404).json('Appointment not found');
      appt.patientName = req.body.patientName;
      appt.doctorName = req.body.doctorName;
      appt.date = req.body.date;
      appt.save()
        .then(() => res.json('Appointment updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

// Delete appointment
router.delete('/delete/:id', (req, res) => {
  Appointment.findByIdAndDelete(req.params.id)
    .then(() => res.json('Appointment deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
