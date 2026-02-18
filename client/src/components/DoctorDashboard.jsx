import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const userName = localStorage.getItem('userName');

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/appointments', {
                    headers: { 'x-auth-token': token }
                });
                setAppointments(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching appointments', err);
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/appointments/update/${id}`, { status }, {
                headers: { 'x-auth-token': token }
            });
            setAppointments(appointments.map(appt =>
                appt._id === id ? { ...appt, status } : appt
            ));
        } catch (err) {
            console.error('Error updating status', err);
        }
    };

    if (loading) return <div className="loader-container"><div className="loader"></div></div>;

    const todayAppts = appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length;
    const pendingAppts = appointments.filter(a => a.status === 'Pending').length;

    return (
        <div className="doctor-portal">
            <header className="portal-header">
                <div className="profile-info">
                    <div className="avatar">Dr</div>
                    <div>
                        <p className="greeting">GOOD MORNING</p>
                        <h2 className="doctor-name">Dr. {userName}</h2>
                    </div>
                </div>
                
            </header>

            <div className="quick-stats">
                <div className="stat-box primary-grad">
                    <span className="stat-icon">📅</span>
                    <div className="stat-content">
                        <p>Today's Appts</p>
                        <h3>{todayAppts}</h3>
                    </div>
                    <span className="stat-trend">+20%</span>
                </div>
                <div className="stat-box secondary-grad">
                    <span className="stat-icon">👥</span>
                    <div className="stat-content">
                        <p>Pending Review</p>
                        <h3>{pendingAppts}</h3>
                    </div>
                    <span className="stat-trend">+10%</span>
                </div>
            </div>

            

            <section className="dashboard-section">
                <div className="section-header">
                    <h3>Recent Appointments</h3>
                    <button className="see-all">See All</button>
                </div>
                <div className="appts-list">
                    {appointments.length === 0 ? (
                        <div className="empty-state">No appointments found</div>
                    ) : (
                        appointments.map(appt => (
                            <div key={appt._id} className="appt-card-modern">
                                <div className="appt-user">
                                    <div className="user-icon">{appt.patientId?.name?.[0]}</div>
                                    <div className="user-details">
                                        <h4>{appt.patientId?.name}</h4>
                                        <p>🕒 {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {appt.symptoms || 'General Checkup'}</p>
                                    </div>
                                </div>
                                <div className="appt-meta">
                                    <span className={`status-pill ${appt.status.toLowerCase()}`}>{appt.status}</span>
                                    <div className="card-actions">
                                        {appt.status === 'Pending' ? (
                                            <>
                                                <button className="btn-confirm" onClick={() => updateStatus(appt._id, 'Confirmed')}>Confirm</button>
                                                <button className="btn-cancel" onClick={() => updateStatus(appt._id, 'Cancelled')}>Cancel</button>
                                            </>
                                        ) : appt.status === 'Confirmed' ? (
                                            <button className="btn-chat" onClick={() => updateStatus(appt._id, 'Completed')}>Finish</button>
                                        ) : (
                                            <button className="btn-view">Profile</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default DoctorDashboard;
