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
  const [expandedPrescriptions, setExpandedPrescriptions] = useState({});

  // Review Model State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAppt, setReviewAppt] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const togglePrescription = (id) => {
    setExpandedPrescriptions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const userName = localStorage.getItem('userName');
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };

        const [apptsRes, docsRes] = await Promise.all([
          axios.get('/appointments', config),
          axios.get('/users?role=doctor', config)
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
      await axios.post('/appointments/add', newAppointment, {
        headers: { 'x-auth-token': token }
      });

      const apptsRes = await axios.get('/appointments', {
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
      await axios.delete(`/appointments/delete/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setAppointments(appointments.filter(a => a._id !== id));
    } catch (err) {
      console.error('Error deleting appointment', err);
    }
  };

  const handleOpenReview = (appt) => {
    setReviewAppt(appt);
    setRating(5);
    setComment('');
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/appointments/${reviewAppt._id}/review`, { rating, comment }, {
        headers: { 'x-auth-token': token }
      });
      setAppointments(appointments.map(a => a._id === reviewAppt._id ? { ...a, isReviewed: true } : a));
      setShowReviewModal(false);
      alert('Review submitted successfully!');
    } catch (err) {
      console.error('Error submitting review', err);
      alert('Failed to submit review');
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
                    <span className="condition-icon">{appt.doctorId?.role === 'lab' ? '🔬' : '🩺'}</span>
                    <div>
                      {appt.doctorId?.role === 'lab' ? (
                        <>
                          <h4>{appt.tests && appt.tests.length > 0 ? appt.tests[0].name : 'Lab Test'}</h4>
                          <p>Facility: {appt.doctorId?.name} • {new Date(appt.date).toLocaleString([], { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </>
                      ) : (
                        <>
                          <h4>{appt.doctorId?.specialization || 'General Consultation'}</h4>
                          <p>Visited Dr. {appt.doctorId?.name} • {new Date(appt.date).toLocaleString([], { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <span className={`status-tag ${appt.status.toLowerCase()}`}>{appt.status}</span>
                </div>
                <p className="condition-desc">
                   {appt.doctorId?.role === 'lab' 
                      ? `Testing instructions: ${appt.symptoms || 'Please fast for 8 hours if required.'}`
                      : (appt.symptoms || 'Regular health checkup and monitoring.')
                   }
                </p>
                {appt.prescription && (
                  <div className="prescription-section" style={{ marginTop: '10px' }}>
                    <button
                      className="primary-inline"
                      onClick={() => togglePrescription(appt._id)}
                      style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '4px' }}
                    >
                      {expandedPrescriptions[appt._id] ? 'Hide Prescription' : 'View Prescription'}
                    </button>
                    {expandedPrescriptions[appt._id] && (
                      <div className="prescription-card" style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f9ff', borderLeft: '4px solid #0284c7', borderRadius: '4px' }}>
                        <h5 style={{ margin: '0 0 5px 0', color: '#0369a1' }}>Dr. {appt.doctorId?.name}'s Prescription</h5>
                        <p style={{ margin: '0', fontSize: '0.9rem', color: '#334155', whiteSpace: 'pre-wrap', marginBottom: appt.tests && appt.tests.length > 0 ? '10px' : '0' }}>{appt.prescription}</p>

                        {appt.tests && appt.tests.length > 0 && (
                          <>
                            <h5 style={{ margin: '10px 0 5px 0', borderTop: '1px solid #bae6fd', paddingTop: '10px', color: '#0369a1' }}>Requested Medical Tests</h5>
                            <ul style={{ margin: '0', paddingLeft: '20px', color: '#334155', fontSize: '0.9rem' }}>
                              {appt.tests.map((test, index) => (
                                <li key={index}>{test.name} {test.price ? `- Estimated Cost: Rs/- ${test.price}` : ''}</li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {appt.report && appt.doctorId?.role === 'lab' && (
                  <div className="prescription-section" style={{ marginTop: '10px' }}>
                    <button
                      className="primary-inline"
                      onClick={() => window.open(appt.report, '_blank')}
                      style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: '4px', backgroundColor: '#3b82f6', color: 'white' }}
                    >
                      📄 Download Test Report
                    </button>
                  </div>
                )}
                {appt.status === 'Completed' && !appt.isReviewed && (
                  <button className="primary-inline" onClick={() => handleOpenReview(appt)} style={{ marginTop: '10px' }}>Give Feedback</button>
                )}
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
                <input type="datetime-local" style={{ color: 'black', colorScheme: 'light' }} value={newAppointment.date} onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })} required />
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

      {showReviewModal && (
        <div className="booking-modal-overlay" onClick={() => setShowReviewModal(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="booking-modal" onClick={e => e.stopPropagation()}>
            <h3>Rate Your Experience</h3>
            <p style={{ marginBottom: '16px', color: '#64748b', fontSize: '14px' }}>
              How was your experience with {reviewAppt?.doctorId?.role === 'lab' ? reviewAppt?.doctorId?.name : `Dr. ${reviewAppt?.doctorId?.name}`}?
            </p>
            <div className="field">
              <label>Rating (1 to 5 Stars)</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                   <span 
                     key={star} 
                     onClick={() => setRating(star)}
                     style={{
                       fontSize: '24px', 
                       cursor: 'pointer',
                       color: star <= rating ? '#facc15' : '#cbd5e1'
                     }}
                   >
                     ★
                   </span>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Review Comment (optional)</label>
              <textarea 
                value={comment} 
                onChange={(e) => setComment(e.target.value)} 
                rows="3" 
                placeholder="Share your feedback..."
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div className="modal-footer" style={{ marginTop: '16px' }}>
              <button className="muted" onClick={() => setShowReviewModal(false)}>Cancel</button>
              <button className="primary" onClick={handleSubmitReview}>Submit Review</button>
            </div>
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
