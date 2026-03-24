import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import './DoctorDashboard.css';

const PatientQueuePage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/appointments', {
                    headers: { 'x-auth-token': token }
                });
                setAppointments(res.data);
            } catch (err) {
                console.error('Error fetching appointments', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/appointments/update/${id}`, { status }, {
                headers: { 'x-auth-token': token }
            });
            setAppointments(appointments.map(appt =>
                appt._id === id ? { ...appt, status } : appt
            ));
        } catch (err) {
            console.error('Error updating status', err);
        }
    };

    const filtered = filter === 'all'
        ? appointments
        : appointments.filter(a => a.status === filter);

    const counts = {
        all: appointments.length,
        Pending: appointments.filter(a => a.status === 'Pending').length,
        Confirmed: appointments.filter(a => a.status === 'Confirmed').length,
        Cancelled: appointments.filter(a => a.status === 'Cancelled').length,
    };

    if (loading) return <div className="doc-loader"><div className="doc-spinner"></div></div>;

    return (
        <div className="doc-dashboard">
            <div className="doc-greeting">
                <h1>Patient Queue</h1>
                <p>Manage your appointments and patient flow in real-time</p>
            </div>

            {/* Filter Pills */}
            <div className="queue-filters">
                {['all', 'Pending', 'Confirmed', 'Cancelled'].map(f => (
                    <button
                        key={f}
                        className={`queue-filter-pill ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'all' ? 'All' : f}
                        <span className="pill-count">({counts[f]})</span>
                    </button>
                ))}
            </div>

            {/* Queue List */}
            <div className="queue-full-list">
                {filtered.length === 0 ? (
                    <div className="empty-queue">
                        <Users size={32} color="#94a3b8" />
                        <p>No patients in queue</p>
                    </div>
                ) : (
                    filtered.map((appt, i) => (
                        <div key={appt._id} className="queue-card">
                            <div className="queue-indicator-wrap">
                                <div className={`queue-indicator ${appt.status === 'Pending' ? 'qi-active' : appt.status === 'Confirmed' ? 'qi-confirmed' : 'qi-cancelled'}`}></div>
                            </div>
                            <div className="queue-avatar">
                                {appt.patientId?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                            </div>
                            <div className="queue-patient-info">
                                <strong>{appt.patientId?.name || 'Unknown'}</strong>
                                <span>{appt.symptoms || 'General Consultation'} • Reg: #{1029 + i}</span>
                            </div>
                            <div className="queue-status-badge">
                                <span className={`status-pill status-${appt.status?.toLowerCase()}`}>
                                    {appt.status === 'Pending' && <AlertCircle size={12} />}
                                    {appt.status === 'Confirmed' && <CheckCircle size={12} />}
                                    {appt.status === 'Cancelled' && <XCircle size={12} />}
                                    {appt.status}
                                </span>
                            </div>
                            <div className="queue-eta">
                                <span className="eta-label">ETA</span>
                                <strong>{5 + i * 7}</strong>
                                <span className="eta-unit">Mins</span>
                            </div>
                            <div className="queue-actions">
                                {appt.status === 'Pending' && (
                                    <>
                                        <button className="q-btn q-start" onClick={() => updateStatus(appt._id, 'Confirmed')}>Start Session</button>
                                        <button className="q-btn q-noshow" onClick={() => updateStatus(appt._id, 'Cancelled')}>No Show</button>
                                    </>
                                )}
                                {appt.status === 'Confirmed' && (
                                    <button className="q-btn q-noshow" onClick={() => updateStatus(appt._id, 'Cancelled')}>End Session</button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PatientQueuePage;
