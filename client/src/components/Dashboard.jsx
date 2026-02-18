import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        doctors: 0,
        patients: 0,
        appointments: 0,
        onlineDoctors: 0,
        onlinePatients: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:5000/stats')
            .then(res => setStats(res.data))
            .catch(err => console.error('Error fetching stats:', err));
    }, []);

    return (
        <div className="dashboard-wrapper">
            <header className="dash-header">
                <h1>Welcome to CarePlus Hospital</h1>
                <p>System Status: <span className="status-online">● Online</span></p>
            </header>

            {/* ABOUT THE HOSPITAL SECTION */}
            <section className="hospital-info" style={{ marginBottom: '40px' }}>
                <h3>Leading Healthcare Excellence Since 2026</h3>
                <p>CarePlus is an integrated digital healthcare platform connecting patients with top-tier specialists.
                    Experience seamless booking, instant history access, and specialized treatment plans all in one place.
                    Our mission is to provide world-class medical facilities with just a few clicks.</p>
            </section>

            {/* STATS SECTION */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>
                        {stats.doctors}
                        {stats.onlineDoctors > 0 && (
                            <span className="online-badge"> ({stats.onlineDoctors} Online)</span>
                        )}
                    </h3>
                    <p>Verified Specialists</p>
                </div>
                <div className="stat-card">
                    <h3>
                        {stats.patients}
                        {stats.onlinePatients > 0 && (
                            <span className="online-badge"> ({stats.onlinePatients} Online)</span>
                        )}
                    </h3>
                    <p>Happy Patients</p>
                </div>
                <div className="stat-card">
                    <h3>{stats.appointments}</h3>
                    <p>Total Consultations</p>
                </div>
            </div>

            {/* GUEST ACTIONS SECTION */}
            <div className="action-section">
                <div className="guest-controls" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="stat-card" style={{ cursor: 'pointer', border: '2px solid #3b82f6' }} onClick={() => navigate('/login')}>
                        <h4 style={{ color: '#007bff', fontSize: '1.2rem', marginBottom: '10px' }}>Patient Access</h4>
                        <p>Book appointments, view your medical history, and manage your health journey.</p>
                        <button className="primary" style={{ marginTop: '20px', width: '100%' }}>Login / Register</button>
                    </div>
                    <div className="stat-card" style={{ cursor: 'pointer', border: '2px solid #14b8a6' }} onClick={() => navigate('/register')}>
                        <h4 style={{ color: '#0d9488', fontSize: '1.2rem', marginBottom: '10px' }}>Doctor Portal</h4>
                        <p>Manage your clinical practice, track patient schedules, and update status in real-time.</p>
                        <button className="muted" style={{ marginTop: '20px', width: '100%', backgroundColor: '#14b8a6', color: 'white', border: 'none' }}>Join as Doctor</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
