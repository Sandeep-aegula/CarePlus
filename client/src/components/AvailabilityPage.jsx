import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CalendarClock, Plus, Trash2, Save, Clock, CheckCircle } from 'lucide-react';
import './DoctorDashboard.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AvailabilityPage = () => {
    const [availability, setAvailability] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [profileExists, setProfileExists] = useState(false);

    // Profile fields for first-time setup
    const [specialty, setSpecialty] = useState('');
    const [consultationFee, setConsultationFee] = useState('');
    const [clinicName, setClinicName] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/doctor/profile', {
                headers: { 'x-auth-token': token }
            });
            setAvailability(res.data.availability || []);
            setSpecialty(res.data.specialty || '');
            setConsultationFee(res.data.consultationFee || '');
            setClinicName(res.data.clinicName || '');
            setAddress(res.data.address || '');
            setProfileExists(true);
        } catch (err) {
            // Profile doesn't exist yet
            setProfileExists(false);
        }
        setLoading(false);
    };

    const createProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/doctor/profile', {
                specialty,
                consultationFee: Number(consultationFee),
                clinicName,
                address,
                isAvailable: true,
            }, { headers: { 'x-auth-token': token } });
            setProfileExists(true);
        } catch (err) {
            console.error('Error creating profile', err);
        }
    };

    const addSlot = () => {
        setAvailability([...availability, { day: 'Monday', startTime: '09:00', endTime: '17:00' }]);
    };

    const updateSlot = (index, field, value) => {
        const updated = [...availability];
        updated[index] = { ...updated[index], [field]: value };
        setAvailability(updated);
    };

    const removeSlot = (index) => {
        setAvailability(availability.filter((_, i) => i !== index));
    };

    const saveAvailability = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/doctor/availability', { availability }, {
                headers: { 'x-auth-token': token }
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Error saving availability', err);
            alert('Failed to save availability. Make sure your profile is set up.');
        }
        setSaving(false);
    };

    if (loading) return <div className="doc-loader"><div className="doc-spinner"></div></div>;

    // Show profile setup if no provider profile exists
    if (!profileExists) {
        return (
            <div className="doc-dashboard">
                <div className="lab-page-header">
                    <h1>Set Up Your Profile</h1>
                    <p>Complete your profile before setting availability</p>
                </div>
                <div className="doc-panel" style={{ maxWidth: 600 }}>
                    <div className="avail-form-group">
                        <label>Specialty</label>
                        <input type="text" placeholder="e.g. Cardiologist" value={specialty} onChange={e => setSpecialty(e.target.value)} className="avail-input" />
                    </div>
                    <div className="avail-form-group">
                        <label>Consultation Fee (₹)</label>
                        <input type="number" placeholder="e.g. 500" value={consultationFee} onChange={e => setConsultationFee(e.target.value)} className="avail-input" />
                    </div>
                    <div className="avail-form-group">
                        <label>Clinic Name</label>
                        <input type="text" placeholder="e.g. City Health Clinic" value={clinicName} onChange={e => setClinicName(e.target.value)} className="avail-input" />
                    </div>
                    <div className="avail-form-group">
                        <label>Address</label>
                        <input type="text" placeholder="e.g. 123 Main St, Mumbai" value={address} onChange={e => setAddress(e.target.value)} className="avail-input" />
                    </div>
                    <button className="avail-save-btn" onClick={createProfile}>
                        <Save size={16} /> Create Profile
                    </button>
                </div>
            </div>
        );
    }

    // Group availability by day for summary
    const dayMap = {};
    availability.forEach(slot => {
        if (!dayMap[slot.day]) dayMap[slot.day] = [];
        dayMap[slot.day].push(`${slot.startTime} - ${slot.endTime}`);
    });

    return (
        <div className="doc-dashboard">
            <div className="lab-page-header">
                <h1>Manage Availability</h1>
                <p>Set your available days and time slots for patient bookings</p>
            </div>

            {/* Weekly Overview */}
            <div className="avail-week-overview">
                {DAYS.map(day => {
                    const slots = dayMap[day];
                    return (
                        <div key={day} className={`avail-day-card ${slots ? 'has-slots' : ''}`}>
                            <span className="avail-day-name">{day.substring(0, 3)}</span>
                            {slots ? (
                                <div className="avail-day-slots">
                                    {slots.map((s, i) => <span key={i} className="avail-day-time">{s}</span>)}
                                </div>
                            ) : (
                                <span className="avail-day-off">Off</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Slot Editor */}
            <div className="doc-panel">
                <div className="panel-top">
                    <h3><CalendarClock size={18} /> Availability Slots</h3>
                    <button className="avail-add-btn" onClick={addSlot}>
                        <Plus size={14} /> Add Slot
                    </button>
                </div>

                {availability.length === 0 ? (
                    <div className="avail-empty">
                        <Clock size={40} color="#cbd5e1" />
                        <p>No availability set. Add slots to let patients book appointments.</p>
                        <button className="avail-add-btn" onClick={addSlot}>
                            <Plus size={14} /> Add Your First Slot
                        </button>
                    </div>
                ) : (
                    <div className="avail-slots-list">
                        {availability.map((slot, index) => (
                            <div key={index} className="avail-slot-row">
                                <select
                                    value={slot.day}
                                    onChange={e => updateSlot(index, 'day', e.target.value)}
                                    className="avail-select"
                                >
                                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <div className="avail-time-group">
                                    <label>From</label>
                                    <input
                                        type="time"
                                        value={slot.startTime}
                                        onChange={e => updateSlot(index, 'startTime', e.target.value)}
                                        className="avail-time-input"
                                    />
                                </div>
                                <div className="avail-time-group">
                                    <label>To</label>
                                    <input
                                        type="time"
                                        value={slot.endTime}
                                        onChange={e => updateSlot(index, 'endTime', e.target.value)}
                                        className="avail-time-input"
                                    />
                                </div>
                                <button className="avail-remove-btn" onClick={() => removeSlot(index)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="avail-save-row">
                    <button className="avail-save-btn" onClick={saveAvailability} disabled={saving}>
                        {saving ? 'Saving...' : saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Availability</>}
                    </button>
                    {saved && <span className="avail-saved-msg">✓ Availability updated successfully</span>}
                </div>
            </div>
        </div>
    );
};

export default AvailabilityPage;
