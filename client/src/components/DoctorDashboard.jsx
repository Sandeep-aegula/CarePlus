import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, ShieldCheck, DollarSign, FileText, Edit3, Plus, Star, Calendar, Video } from 'lucide-react';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const userName = localStorage.getItem('userName');
    
    // Prescription Modal State
    const [showPreModal, setShowPreModal] = useState(false);
    const [currentAppt, setCurrentAppt] = useState(null);
    const [prescription, setPrescription] = useState('');
    const [reviews, setReviews] = useState([]);
    const [trustRank, setTrustRank] = useState(0);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/appointments', {
                    headers: { 'x-auth-token': token }
                });
                setAppointments(res.data);
                
                try {
                    const profileRes = await axios.get('/api/doctor/profile', {
                        headers: { 'x-auth-token': token }
                    });
                    if (profileRes.data) {
                        setTrustRank(profileRes.data.averageRating || 0);
                        if (profileRes.data.reviews) {
                            const sortedRevs = profileRes.data.reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
                            setReviews(sortedRevs);
                        }
                    }
                } catch (profErr) {
                    console.error('Error fetching doctor profile for reviews', profErr);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching appointments', err);
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const updateStatus = async (id, status, extraData = {}) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/appointments/update/${id}`, { status, ...extraData }, {
                headers: { 'x-auth-token': token }
            });
            setAppointments(appointments.map(appt =>
                appt._id === id ? { ...appt, status, ...extraData } : appt
            ));
        } catch (err) {
            console.error('Error updating status', err);
        }
    };

    const handleOpenCompleteModal = (appt) => {
        setCurrentAppt(appt);
        setPrescription('');
        setShowPreModal(true);
    };

    const handleCompleteWithPrescription = () => {
        if (currentAppt) {
            updateStatus(currentAppt._id, 'Completed', { prescription });
            setShowPreModal(false);
        }
    };

    if (loading) return <div className="doc-loader"><div className="doc-spinner"></div></div>;

    const todayAppts = appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length;
    const pendingAppts = appointments.filter(a => a.status === 'Pending').length;

    // Sample queue data (merged with real appointments where possible)
    const queuePatients = appointments.filter(a => a.status === 'Pending' || a.status === 'Confirmed').slice(0, 5);

    return (
        <div className="doc-dashboard">
            {/* Greeting */}
            <div className="doc-greeting">
                <h1>How is the clinic today, Dr. {userName}?</h1>
                <p>You have {queuePatients.length} patients in queue and {pendingAppts} reports pending verification.</p>
            </div>

            {/* Stats Row */}
            <div className="doc-stats-row">
                <div className="doc-stat-card">
                    <div className="stat-icon-wrap stat-blue">
                        <Users size={22} color="white" />
                    </div>
                    <div className="stat-body">
                        <span className="stat-label">Today's Patients</span>
                        <span className="stat-value">{todayAppts}</span>
                    </div>
                    <span className="stat-badge stat-badge-blue">+12%</span>
                </div>

                <div className="doc-stat-card">
                    <div className="stat-icon-wrap stat-green">
                        <ShieldCheck size={22} color="white" />
                    </div>
                    <div className="stat-body">
                        <span className="stat-label">Trust-Rank</span>
                        <span className="stat-value">{trustRank > 0 ? trustRank.toFixed(1) : 'New'} <small>/ 5.0</small></span>
                    </div>
                    {trustRank >= 4.5 && <span className="stat-badge stat-badge-green">TOP RATED</span>}
                </div>

                <div className="doc-stat-card">
                    <div className="stat-icon-wrap stat-navy">
                        <DollarSign size={22} color="white" />
                    </div>
                    <div className="stat-body">
                        <span className="stat-label">Revenue</span>
                        <span className="stat-value">₹14.2k</span>
                    </div>
                </div>

                <div className="doc-stat-card">
                    <div className="stat-icon-wrap stat-red">
                        <FileText size={22} color="white" />
                    </div>
                    <div className="stat-body">
                        <span className="stat-label">Pending Reports</span>
                        <span className="stat-value stat-value-accent">{String(pendingAppts).padStart(2, '0')}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="doc-content-grid">
                {/* Left: Patient Queue with Accept/Reject */}
                <div className="doc-queue-section">
                    <div className="section-top">
                        <div>
                            <h2>Appointment Requests</h2>
                            <p>{pendingAppts} pending • {queuePatients.filter(a => a.status === 'Confirmed').length} confirmed</p>
                        </div>
                        <a href="#" className="view-all-link">View All →</a>
                    </div>

                    <div className="queue-list">
                        {queuePatients.length === 0 ? (
                            <div className="empty-queue">No pending or active appointments</div>
                        ) : (
                            queuePatients.map((appt, i) => (
                                <div key={appt._id} className={`queue-card ${appt.status === 'Pending' ? 'queue-pending' : ''}`}>
                                    <div className="queue-indicator-wrap">
                                        <div className={`queue-indicator ${appt.status === 'Pending' ? 'qi-pending' : appt.status === 'Confirmed' ? 'qi-active' : ''}`}></div>
                                    </div>
                                    <div className="queue-avatar">
                                        {appt.patientId?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                                    </div>
                                    <div className="queue-patient-info">
                                        <strong>{appt.patientId?.name || 'Unknown'}</strong>
                                        <span>{appt.symptoms || 'General Consultation'}</span>
                                        {appt.timeSlot && <span className="queue-slot-tag">🕐 {appt.timeSlot}</span>}
                                    </div>
                                    <div className="queue-status-tag" style={{
                                        background: appt.status === 'Pending' ? '#fef3c7' : '#dcfce7',
                                        color: appt.status === 'Pending' ? '#d97706' : '#16a34a'
                                    }}>
                                        {appt.status}
                                    </div>
                                    <div className="queue-actions">
                                        {appt.status === 'Pending' ? (
                                            <>
                                                <button className="q-btn q-accept" onClick={() => updateStatus(appt._id, 'Confirmed')}>Accept</button>
                                                <button className="q-btn q-reject" onClick={() => updateStatus(appt._id, 'Cancelled')}>Reject</button>
                                            </>
                                        ) : (
                                            <>
                                                {appt.appointmentType === 'online' && appt.meetingLink && (
                                                    <button 
                                                        className="q-btn q-accept" 
                                                        onClick={() => window.open(appt.meetingLink, '_blank')}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#3b82f6', color: 'white', border: 'none' }}
                                                    >
                                                        <Video size={14} /> Video
                                                    </button>
                                                )}
                                                <button className="q-btn q-start" onClick={() => handleOpenCompleteModal(appt)}>Complete</button>
                                                <button className="q-btn q-noshow" onClick={() => updateStatus(appt._id, 'Cancelled')}>No Show</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="doc-right-col">
                    {/* Service & Pricing */}
                    <div className="doc-panel service-panel">
                        <div className="panel-top">
                            <h3>Service & Pricing</h3>
                            <button className="panel-gear">⚙</button>
                        </div>
                        <div className="service-item">
                            <span className="service-label">GENERAL CONSULT</span>
                            <div className="service-price-row">
                                <span className="service-price">₹120.00</span>
                                <button className="edit-icon-btn"><Edit3 size={14} /></button>
                            </div>
                        </div>
                        <div className="service-item">
                            <span className="service-label">FOLLOW-UP VISIT</span>
                            <div className="service-price-row">
                                <span className="service-price">₹60.00</span>
                                <button className="edit-icon-btn"><Edit3 size={14} /></button>
                            </div>
                        </div>
                        <button className="add-service-btn">
                            <Plus size={14} /> Add New Service
                        </button>
                    </div>

                    {/* Upcoming Schedule - Real Data */}
                    <div className="doc-panel schedule-panel">
                        <div className="panel-top">
                            <h3>Today's Schedule</h3>
                            <button className="panel-gear"><Calendar size={16} /></button>
                        </div>
                        {(() => {
                            const todaySchedule = appointments
                                .filter(a => {
                                    const d = new Date(a.date);
                                    const today = new Date();
                                    return d.toDateString() === today.toDateString() && a.status !== 'Cancelled';
                                })
                                .sort((a, b) => {
                                    // Sort by time slot or date
                                    const timeA = a.timeSlot ? a.timeSlot.split(' - ')[0] : '';
                                    const timeB = b.timeSlot ? b.timeSlot.split(' - ')[0] : '';
                                    return timeA.localeCompare(timeB);
                                });

                            if (todaySchedule.length === 0) {
                                return <div className="empty-queue" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No appointments scheduled for today</div>;
                            }

                            const now = new Date();
                            const currentHour = now.getHours();
                            const currentMin = now.getMinutes();

                            return todaySchedule.map(appt => {
                                // Check if arriving within the hour
                                let isArrivingSoon = false;
                                if (appt.timeSlot) {
                                    const startTimeStr = appt.timeSlot.split(' - ')[0];
                                    const match = startTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
                                    if (match) {
                                        let h = parseInt(match[1]);
                                        const m = parseInt(match[2]);
                                        const ampm = match[3].toUpperCase();
                                        if (ampm === 'PM' && h !== 12) h += 12;
                                        if (ampm === 'AM' && h === 12) h = 0;
                                        const minsUntil = (h * 60 + m) - (currentHour * 60 + currentMin);
                                        isArrivingSoon = minsUntil > 0 && minsUntil <= 60;
                                    }
                                }

                                return (
                                    <div key={appt._id} className={`schedule-item ${isArrivingSoon ? 'arriving-soon' : ''}`}>
                                        {isArrivingSoon && (
                                            <div className="arrival-alert">
                                                🔔 Arriving soon
                                            </div>
                                        )}
                                        <div className="schedule-time">{appt.timeSlot ? appt.timeSlot.split(' - ')[0] : 'N/A'}</div>
                                        <div className="schedule-details">
                                            <strong>{appt.patientId?.name || 'Patient'}</strong>
                                            <span>{appt.symptoms || 'General Consultation'} • {appt.status}</span>
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>

                    {/* Patient Feedback */}
                    <div className="doc-panel feedback-panel">
                        <h3>Patient Feedback</h3>
                        {reviews.length === 0 ? (
                            <p style={{ color: '#64748b', fontSize: '14px' }}>No feedback yet.</p>
                        ) : (
                            reviews.slice(0, 2).map((review, i) => {
                                const hoursAgo = Math.floor((new Date() - new Date(review.date)) / (1000 * 60 * 60));
                                const timeFormat = hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`;

                                return (
                                    <div key={review._id || i} className="feedback-card">
                                        <div className="feedback-top">
                                            <div className="feedback-stars">
                                                {[...Array(5)].map((_, j) => (
                                                    <Star 
                                                        key={j} 
                                                        size={14} 
                                                        fill={j < review.rating ? "#facc15" : "transparent"} 
                                                        color={j < review.rating ? "#facc15" : "#e2e8f0"} 
                                                    />
                                                ))}
                                            </div>
                                            <span className="feedback-time">{timeFormat}</span>
                                        </div>
                                        <p className="feedback-text">{review.comment ? `"${review.comment}"` : "No comment"}</p>
                                        <span className="feedback-author">— {review.patientName || 'Anonymous'}</span>
                                    </div>
                                );
                            })
                        )}
                        {reviews.length > 2 && (
                            <a href="/dashboard/reviews" style={{ display: 'block', textAlign: 'center', marginTop: '12px', color: '#3b82f6', fontSize: '14px', textDecoration: 'none' }}>
                                View All Reviews ({reviews.length})
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Prescription Modal */}
            {showPreModal && (
                <div className="booking-modal-overlay" onClick={() => setShowPreModal(false)} style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="booking-modal" onClick={e => e.stopPropagation()} style={{
                        background: 'white', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '500px'
                    }}>
                        <h3 style={{ margin: '0 0 16px 0' }}>Complete Appointment</h3>
                        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#64748b' }}>
                            Write a prescription or notes for <strong>{currentAppt?.patientId?.name}</strong>:
                        </p>
                        <textarea 
                            value={prescription}
                            onChange={e => setPrescription(e.target.value)}
                            rows="5"
                            placeholder="Enter prescription details, advice, or next steps here..."
                            style={{ 
                                width: '100%', padding: '12px', border: '1px solid #cbd5e1', 
                                borderRadius: '8px', marginBottom: '16px', resize: 'vertical'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setShowPreModal(false)} style={{
                                padding: '8px 16px', border: 'none', background: '#f1f5f9', color: '#334155', borderRadius: '8px', cursor: 'pointer'
                            }}>Cancel</button>
                            <button onClick={handleCompleteWithPrescription} style={{
                                padding: '8px 16px', border: 'none', background: '#16a34a', color: 'white', borderRadius: '8px', cursor: 'pointer'
                            }}>Complete & Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
