import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Star, MapPin, Calendar, Clock, X, CheckCircle, Navigation } from 'lucide-react';
import './TabPages.css';

const DoctorsPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    // Booking modal state
    const [bookingDoctor, setBookingDoctor] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [bookingSymptoms, setBookingSymptoms] = useState('');
    const [bookingStatus, setBookingStatus] = useState(null);
    const [bookingError, setBookingError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    
    // User location state for directions
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        fetchDoctors();
        // Fetch user location affirmatively for Directions feature
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setUserLocation(`${pos.coords.latitude},${pos.coords.longitude}`);
            }, () => {
                console.warn('Geolocation blocked or failed. Using default routing.');
            });
        }
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/doctor/list');
            const sorted = res.data.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
            setDoctors(sorted);
        } catch (err) {
            console.error('Error fetching doctors:', err);
        }
        setLoading(false);
    };

    const specialties = ['All', ...new Set(doctors.map(d => d.specialty).filter(Boolean))];

    const filtered = doctors.filter(d =>
        (selectedSpecialty === 'All' || d.specialty === selectedSpecialty) &&
        (d.name.toLowerCase().includes(searchQuery.toLowerCase()) || (d.specialty || '').toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Generate time slots from availability for a given day
    const getTimeSlotsForDay = (doctor, dateStr) => {
        if (!dateStr || !doctor.availability || doctor.availability.length === 0) return [];
        const date = new Date(dateStr);
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
        const daySlots = doctor.availability.filter(a => a.day === dayName);

        const slots = [];
        daySlots.forEach(slot => {
            const [startH, startM] = slot.startTime.split(':').map(Number);
            const [endH, endM] = slot.endTime.split(':').map(Number);
            let h = startH, m = startM;
            while (h < endH || (h === endH && m < endM)) {
                const fromH = h, fromM = m;
                m += 30;
                if (m >= 60) { h++; m = 0; }
                if (h < endH || (h === endH && m <= endM)) {
                    const from = `${String(fromH).padStart(2, '0')}:${String(fromM).padStart(2, '0')}`;
                    const to = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                    slots.push(`${formatTime(from)} - ${formatTime(to)}`);
                }
            }
        });
        return slots;
    };

    const formatTime = (t) => {
        const [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
    };

    const getAvailableDays = (doctor) => {
        if (!doctor.availability || doctor.availability.length === 0) return [];
        return [...new Set(doctor.availability.map(a => a.day))];
    };

    // Fetch booked slots when date changes
    const handleDateChange = async (dateStr) => {
        setBookingDate(dateStr);
        setBookingTime('');
        setBookedSlots([]);
        setBookingError('');

        if (!dateStr || !bookingDoctor) return;

        setLoadingSlots(true);
        try {
            const res = await axios.get(`http://localhost:5000/appointments/booked-slots/${bookingDoctor._id}/${dateStr}`);
            setBookedSlots(res.data);
        } catch (err) {
            console.error('Error fetching booked slots:', err);
        }
        setLoadingSlots(false);
    };

    const handleBook = async () => {
        if (!bookingDate || !bookingTime) return;
        setSubmitting(true);
        setBookingError('');
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/appointments/add', {
                doctorId: bookingDoctor._id,
                date: bookingDate,
                timeSlot: bookingTime,
                symptoms: bookingSymptoms,
            }, { headers: { 'x-auth-token': token } });
            setBookingStatus('success');
            setTimeout(() => {
                setBookingDoctor(null);
                setBookingDate('');
                setBookingTime('');
                setBookingSymptoms('');
                setBookingStatus(null);
                setBookedSlots([]);
            }, 2500);
        } catch (err) {
            console.error('Booking error:', err);
            if (err.response?.status === 409) {
                setBookingError(err.response.data.msg || 'Slot already booked');
                // Refresh booked slots
                handleDateChange(bookingDate);
            } else {
                setBookingError('Failed to book. Please try again.');
            }
        }
        setSubmitting(false);
    };

    const allSlots = bookingDoctor ? getTimeSlotsForDay(bookingDoctor, bookingDate) : [];

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="tab-page">
            <div className="tab-page-header">
                <h1>Find Doctors</h1>
                <p>Discover trusted healthcare professionals and book appointments</p>
            </div>

            {/* Search & Filters */}
            <div className="tab-filters">
                <div className="tab-search-bar">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, specialty..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="tab-specialty-pills">
                    {specialties.map(s => (
                        <button
                            key={s}
                            className={`specialty-pill ${selectedSpecialty === s ? 'active' : ''}`}
                            onClick={() => setSelectedSpecialty(s)}
                        >{s}</button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading doctors...</div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>No doctors found</div>
            ) : (
                <div className="tab-results-grid">
                    {filtered.map(doc => {
                        const availDays = getAvailableDays(doc);
                        return (
                            <div key={doc._id} className="doctor-card">
                                <div className="doctor-card-top">
                                    <div className="doctor-avatar-circle">
                                        {doc.name.split(' ').filter(n => n).map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="doctor-info">
                                        <div className="doctor-name-row">
                                            <strong>{doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`}</strong>
                                            {doc.isAvailable && <span className="avail-badge">Available</span>}
                                        </div>
                                        <span className="doctor-specialty">{doc.specialty || 'General'}</span>
                                        {doc.clinicName && (
                                            <span className="doctor-location-info">
                                                <MapPin size={12} /> {doc.clinicName}
                                            </span>
                                        )}
                                        {doc.address && (
                                            <span className="doctor-address-text">{doc.address}</span>
                                        )}
                                    </div>
                                    {doc.averageRating > 0 && (
                                        <div className="doctor-rating-badge">
                                            <Star size={12} fill="#facc15" color="#facc15" />
                                            <span>{doc.averageRating.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Availability Info */}
                                {availDays.length > 0 && (
                                    <div className="doctor-avail-section">
                                        <div className="doctor-avail-label"><Calendar size={12} /> Available Days</div>
                                        <div className="doctor-avail-days">
                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => {
                                                const fullDay = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' }[d];
                                                const isAvail = availDays.includes(fullDay);
                                                return (
                                                    <span key={d} className={`avail-day-dot ${isAvail ? 'active' : ''}`}>{d}</span>
                                                );
                                            })}
                                        </div>
                                        <div className="doctor-avail-times">
                                            <Clock size={11} />
                                            {doc.availability.slice(0, 2).map((a, i) => (
                                                <span key={i}>{a.day.substring(0, 3)}: {formatTime(a.startTime)}-{formatTime(a.endTime)}</span>
                                            ))}
                                            {doc.availability.length > 2 && <span>+{doc.availability.length - 2} more</span>}
                                        </div>
                                    </div>
                                )}

                                <div className="doctor-card-bottom">
                                    <div className="doctor-meta">
                                        {doc.totalReviews > 0 && <span className="meta-reviews">{doc.totalReviews} reviews</span>}
                                        <span className="meta-fee">₹{doc.consultationFee || 'N/A'} </span>
                                    </div>
                                    <div className="doctor-actions">
                                        <button className="btn-book" onClick={() => { setBookingDoctor(doc); setBookingStatus(null); setBookingError(''); setBookedSlots([]); setBookingDate(''); setBookingTime(''); }}>Book Now</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Booking Modal */}
            {bookingDoctor && (
                <div className="booking-overlay" onClick={() => { setBookingDoctor(null); setBookingStatus(null); }}>
                    <div className="booking-modal" onClick={e => e.stopPropagation()}>
                        {bookingStatus === 'success' ? (
                            <div className="booking-success">
                                <CheckCircle size={48} color="#16a34a" />
                                <h3>Appointment Requested!</h3>
                                <p>Your appointment with {bookingDoctor.name.startsWith('Dr.') ? bookingDoctor.name : `Dr. ${bookingDoctor.name}`} is pending confirmation.</p>
                                <span className="booking-success-note">The doctor will review and accept your appointment.</span>
                            </div>
                        ) : (
                            <>
                                <div className="booking-header">
                                    <h3>Book Appointment</h3>
                                    <button className="booking-close" onClick={() => setBookingDoctor(null)}><X size={20} /></button>
                                </div>

                                {/* Doctor Info with Location */}
                                <div className="booking-doctor-info">
                                    <div className="doctor-avatar-circle small">
                                        {bookingDoctor.name.split(' ').filter(n => n).map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="booking-doc-details">
                                        <strong>{bookingDoctor.name.startsWith('Dr.') ? bookingDoctor.name : `Dr. ${bookingDoctor.name}`}</strong>
                                        <span>{bookingDoctor.specialty || 'General'} • ₹{bookingDoctor.consultationFee || 'N/A'}</span>
                                    </div>
                                </div>

                                {/* Clinic Location */}
                                {(bookingDoctor.clinicName || bookingDoctor.address) && (
                                    <div className="booking-location-box">
                                        <MapPin size={16} color="#3b82f6" />
                                        <div>
                                            {bookingDoctor.clinicName && <strong>{bookingDoctor.clinicName}</strong>}
                                            {bookingDoctor.address && <span>{bookingDoctor.address}</span>}
                                        </div>
                                        <button
                                            className="booking-directions-btn"
                                            onClick={() => {
                                                const originParam = userLocation ? `&origin=${userLocation}` : '';
                                                if (bookingDoctor.location && bookingDoctor.location.coordinates && bookingDoctor.location.coordinates.length === 2 && bookingDoctor.location.coordinates[0] !== 0) {
                                                    const lng = bookingDoctor.location.coordinates[0];
                                                    const lat = bookingDoctor.location.coordinates[1];
                                                    window.open(`https://www.google.com/maps/dir/?api=1${originParam}&destination=${lat},${lng}`, '_blank');
                                                } else {
                                                    const query = `${bookingDoctor.clinicName || ''} ${bookingDoctor.address || ''}`.trim();
                                                    window.open(`https://www.google.com/maps/dir/?api=1${originParam}&destination=${encodeURIComponent(query)}`, '_blank');
                                                }
                                            }}
                                        >
                                            <Navigation size={12} /> Directions
                                        </button>
                                    </div>
                                )}

                                <div className="booking-form">
                                    <div className="booking-field">
                                        <label><Calendar size={14} /> Select Date</label>
                                        <input
                                            type="date"
                                            value={bookingDate}
                                            min={today}
                                            onChange={e => handleDateChange(e.target.value)}
                                        />
                                    </div>

                                    {bookingDate && (
                                        <div className="booking-field">
                                            <label><Clock size={14} /> Select Time Slot</label>
                                            {loadingSlots ? (
                                                <p className="loading-slots-msg">Checking available slots...</p>
                                            ) : allSlots.length > 0 ? (
                                                <div className="booking-time-grid">
                                                    {allSlots.map(slot => {
                                                        const isBooked = bookedSlots.includes(slot);
                                                        return (
                                                            <button
                                                                key={slot}
                                                                className={`time-slot-btn ${bookingTime === slot ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                                                                onClick={() => !isBooked && setBookingTime(slot)}
                                                                disabled={isBooked}
                                                                title={isBooked ? 'Already booked' : 'Select this slot'}
                                                            >
                                                                {slot}
                                                                {isBooked && <span className="booked-label">Booked</span>}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="no-slots-msg">No available slots on this day. Try a different date.</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="booking-field">
                                        <label>Symptoms (optional)</label>
                                        <textarea
                                            placeholder="Briefly describe your symptoms..."
                                            value={bookingSymptoms}
                                            onChange={e => setBookingSymptoms(e.target.value)}
                                            rows={3}
                                        />
                                    </div>

                                    <button
                                        className="booking-submit-btn"
                                        onClick={handleBook}
                                        disabled={!bookingDate || !bookingTime || submitting}
                                    >
                                        {submitting ? 'Booking...' : `Request Appointment • ₹${bookingDoctor.consultationFee || 0}`}
                                    </button>

                                    {bookingError && (
                                        <p className="booking-error">{bookingError}</p>
                                    )}

                                    <p className="booking-note">Your appointment will be confirmed once the doctor accepts it.</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorsPage;
