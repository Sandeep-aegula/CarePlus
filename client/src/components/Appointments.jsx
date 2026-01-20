//Appointments.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AppointmentCard from './AppointmentCard';
import './Appointment.css';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [newAppointment, setNewAppointment] = useState({ patientName: '', doctorName: '', date: '' });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/appointments')
      .then(response => setAppointments(response.data))
      .catch(error => console.error('Error fetching appointments:', error));
    // fetch doctors for dropdown
    axios.get('http://localhost:5000/doctors')
      .then(res => setDoctors(res.data))
      .catch(err => console.error('Error fetching doctors:', err));
  }, []);

  // helper: format various date inputs for <input type="date">
  const formatDateForInput = (d) => {
    if (!d) return '';
    const dateObj = new Date(d);
    if (isNaN(dateObj)) return '';
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const handleAddAppointment = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/appointments/add', newAppointment)
      .then(response => {
        setAppointments([...appointments, response.data]);
        setNewAppointment({ patientName: '', doctorName: '', date: '' });
      })
      .catch(error => console.error('Error adding appointment:', error));
  };

  const handleUpdateAppointment = (id, e) => {
    e.preventDefault();
    axios.post(`http://localhost:5000/appointments/update/${id}`, selectedAppointment)
      .then(() => {
        const updateApp = { ...selectedAppointment, _id: id };
        setAppointments(appointments.map(a => (a._id === id ? updateApp : a)));
        setSelectedAppointment(null);
        setIsEditMode(false);
      })
      .catch(error => console.error('Error updating appointment:', error));
  };

  const handleDeleteAppointment = (id) => {
    axios.delete(`http://localhost:5000/appointments/delete/${id}`)
      .then(() => setAppointments(appointments.filter(a => a._id !== id)))
      .catch(error => console.error('Error deleting appointment:', error));
  };

  const handleEditAppointment = (appointment) => {
    // ensure date is normalized for the date input
    setSelectedAppointment({ ...appointment, date: formatDateForInput(appointment.date) });
    setIsEditMode(true);
  };

  return (
    <div className="flex-row" style={{ width: '100%' }}>
      <div className="flex-column">
        <div className="add-form">
          <h4>{isEditMode ? 'Edit Appointment' : 'Add New Appointment'}</h4>
          <form className="appointment-form" onSubmit={isEditMode ? (e) => handleUpdateAppointment(selectedAppointment._id, e) : handleAddAppointment}>
            <div className="appointment-grid">
              <div className="field">
                <label>Patient Name</label>
                <input
                  type="text"
                  placeholder="Enter patient name"
                  value={isEditMode ? selectedAppointment?.patientName || '' : newAppointment.patientName}
                  onChange={(e) => isEditMode ? setSelectedAppointment({ ...selectedAppointment, patientName: e.target.value }) : setNewAppointment({ ...newAppointment, patientName: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label>Doctor</label>
                <select
                  value={isEditMode ? selectedAppointment?.doctorName || '' : newAppointment.doctorName}
                  onChange={(e) => isEditMode ? setSelectedAppointment({ ...selectedAppointment, doctorName: e.target.value }) : setNewAppointment({ ...newAppointment, doctorName: e.target.value })}
                  required
                >
                  <option value="">Select doctor</option>
                  {doctors.map(d => (
                    <option key={d._id} value={d.name}>{d.name} — {d.specialty}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Date</label>
                <input
                  type="date"
                  value={isEditMode ? selectedAppointment?.date ? selectedAppointment.date : '' : newAppointment.date}
                  onChange={(e) => isEditMode ? setSelectedAppointment({ ...selectedAppointment, date: e.target.value }) : setNewAppointment({ ...newAppointment, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary">{isEditMode ? 'Update Appointment' : 'Add Appointment'}</button>
              {isEditMode && <button type="button" className="muted" onClick={() => { setSelectedAppointment(null); setIsEditMode(false); }}>Cancel</button>}
            </div>
          </form>
        </div>
      </div>

      <div className="appointments">
        <h3>Appointments ({appointments.length})</h3>
        <div className="appointment-list">
          {appointments.map(appointment => (
            <AppointmentCard key={appointment._id} appointment={appointment} onEdit={handleEditAppointment} onDelete={handleDeleteAppointment} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Appointments;