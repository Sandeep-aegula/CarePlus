import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PatientProfile.css';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [newAppointment, setNewAppointment] = useState({ doctorId: '', date: '', symptoms: '' });
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  const userName = localStorage.getItem('userName');
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };

        const [apptsRes, docsRes] = await Promise.all([
          axios.get('http://localhost:5000/appointments', config),
          axios.get('http://localhost:5000/users?role=doctor', config)
        ]);

        setAppointments(apptsRes.data);
        setDoctors(docsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data', err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const specialties = [...new Set(doctors.map(d => d.specialization).filter(s => s))];
  const filteredDoctors = selectedSpecialty ? doctors.filter(d => d.specialization === selectedSpecialty) : doctors;

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/appointments/add', newAppointment, {
        headers: { 'x-auth-token': token }
      });

      const apptsRes = await axios.get('http://localhost:5000/appointments', {
        headers: { 'x-auth-token': token }
      });
      setAppointments(apptsRes.data);
      setNewAppointment({ doctorId: '', date: '', symptoms: '' });
      setSelectedSpecialty('');
      setShowBooking(false);
    } catch (err) {
      console.error('Error adding appointment', err);
    }
  };

  const handleDeleteAppointment = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/appointments/delete/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setAppointments(appointments.filter(a => a._id !== id));
    } catch (err) {
      console.error('Error deleting appointment', err);
    }
  };

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  return (
    <div className="patient-profile-wrapper">
      <header className="profile-top">
        <button className="back-btn">‹</button>
        <h3 className="page-title">Patient Profile</h3>
        <button className="edit-profile-btn">✎</button>
      </header>

      <section className="identity-card">
        <div className="profile-pill">
          <div className="avatar-large">{userName?.[0]}</div>
          <div className="online-indicator"></div>
        </div>
        <h2 className="patient-name-large">{userName}</h2>
       
      </section>

     

      <section className="medical-history">
        <div className="history-tabs">
          <button className="sub-tab active">Medical History</button>
          
        </div>

        <div className="history-list">
          {appointments.length === 0 ? (
            <div className="empty-history">
              <p>No medical history recorded yet.</p>
              <button className="primary-inline" onClick={() => setShowBooking(true)}>Book First Appointment</button>
            </div>
          ) : (
            appointments.map(appt => (
              <div key={appt._id} className="history-card">
                <div className="card-top">
                  <div className="condition-info">
                    <span className="condition-icon">🩺</span>
                    <div>
                      <h4>{appt.doctorId?.specialization || 'General Consultation'}</h4>
                      <p>Visited Dr. {appt.doctorId?.name} • {new Date(appt.date).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <span className={`status-tag ${appt.status.toLowerCase()}`}>{appt.status}</span>
                </div>
                <p className="condition-desc">{appt.symptoms || 'Regular health checkup and monitoring.'}</p>
                {appt.status === 'Pending' && (
                  <button className="cancel-text-btn" onClick={() => handleDeleteAppointment(appt._id)}>Cancel Appointment</button>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {showBooking && (
        <div className="booking-modal-overlay" onClick={() => setShowBooking(false)}>
          <div className="booking-modal" onClick={e => e.stopPropagation()}>
            <h3>Schedule Appointment</h3>
            <form onSubmit={handleAddAppointment} className="modal-form">
              <div className="field">
                <label>1. Select specialty</label>
                <select value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)} required>
                  <option value="">Select Specialty</option>
                  {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label>2. Select Doctor</label>
                <select value={newAppointment.doctorId} onChange={(e) => setNewAppointment({ ...newAppointment, doctorId: e.target.value })} required>
                  <option value="">{selectedSpecialty ? 'Select Doctor' : 'Select specialty first'}</option>
                  {filteredDoctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>3. Preferred Date & Time</label>
                <input type="datetime-local" style={{ color: 'black' }} value={newAppointment.date} onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })} required />
              </div>
              <div className="field">
                <label>4. Symptoms / Notes</label>
                <textarea value={newAppointment.symptoms} onChange={(e) => setNewAppointment({ ...newAppointment, symptoms: e.target.value })} rows="3" placeholder="Tell us about your issue..."></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="muted" onClick={() => setShowBooking(false)}>Cancel</button>
                <button type="submit" className="primary">Confirm Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="floating-actions">
        <button className="schedule-btn-large" onClick={() => setShowBooking(true)}>📅 Schedule</button>
      </div>
    </div>
  );
};

export default Appointments;
