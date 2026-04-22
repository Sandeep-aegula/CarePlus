import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Star, ShieldCheck, Stethoscope, FlaskConical, Building2, FileText, HelpCircle, AlertTriangle, MapPin, Loader2, Calendar, Clock, X, CheckCircle, Video, Home } from 'lucide-react';
import './PatientDiscovery.css';
import axios from 'axios';

import L from 'leaflet';
import iconBlue from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Default facility marker
let DefaultIcon = L.icon({
    iconUrl: iconBlue,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Custom "You are here" marker (blue pulsing dot via DivIcon)
const currentLocationIcon = L.divIcon({
    className: 'current-location-marker',
    html: `<div class="pulse-ring"></div><div class="location-dot"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

// Component to recenter the map when position changes
const RecenterMap = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.setView(position, 16, { animate: true });
        }
    }, [position, map]);
    return null;
};

// Helper: calculate distance in km between two [lat, lng] points
const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const formatDistance = (km) => {
    if (km < 1) return `${Math.round(km * 1000)}m away`;
    return `${km.toFixed(1)}km away`;
};

const PatientDiscovery = () => {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName') || 'User';
    const [activeTab, setActiveTab] = useState('all');
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [isLocating, setIsLocating] = useState(true);
    const [providers, setProviders] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [isLoadingProviders, setIsLoadingProviders] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [loadingAppts, setLoadingAppts] = useState(true);
    const [topDoctors, setTopDoctors] = useState([]);

    // Review Modal States
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewAppt, setReviewAppt] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    // Expanded Prescriptions State
    const [expandedPrescriptions, setExpandedPrescriptions] = useState({});
    
    const togglePrescription = (id) => {
        setExpandedPrescriptions(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Fetch patient appointments
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
            }
            setLoadingAppts(false);
        };
        fetchAppointments();
    }, []);

    const cancelAppointment = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/appointments/update/${id}`, { status: 'Cancelled' }, {
                headers: { 'x-auth-token': token }
            });
            setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'Cancelled' } : a));
        } catch (err) {
            console.error('Cancel error', err);
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
            setAppointments(prev => prev.map(a => a._id === reviewAppt._id ? { ...a, isReviewed: true } : a));
            setShowReviewModal(false);
            alert('Review submitted successfully!');
        } catch (err) {
            console.error('Error submitting review', err);
            alert('Failed to submit review');
        }
    };

    const formatApptDate = (dateStr) => {
        const d = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Confirmed': return { bg: '#dcfce7', color: '#16a34a' };
            case 'Pending': return { bg: '#fef3c7', color: '#d97706' };
            case 'Cancelled': return { bg: '#fee2e2', color: '#dc2626' };
            case 'Completed': return { bg: '#dbeafe', color: '#2563eb' };
            default: return { bg: '#f1f5f9', color: '#64748b' };
        }
    };

    // Upcoming appointments (not cancelled/completed, sorted by date)
    const upcomingAppts = appointments
        .filter(a => a.status !== 'Cancelled' && a.status !== 'Completed')
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Fallback location (Hyderabad, India)
    const fallbackLocation = [17.3850, 78.4867];

    // Get user's current geolocation
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser.');
            setUserLocation(fallbackLocation);
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation([latitude, longitude]);
                setIsLocating(false);
            },
            (error) => {
                console.warn('Geolocation error:', error.message);
                setLocationError('Unable to get your location. Showing default location.');
                setUserLocation(fallbackLocation);
                setIsLocating(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes cache
            }
        );
    }, []);

    // Fetch nearby providers once we have a location
    useEffect(() => {
        if (!userLocation) return;

        const fetchNearbyProviders = async () => {
            setIsLoadingProviders(true);
            try {
                const [lat, lng] = userLocation;
                const res = await axios.get(`/api/search`, {
                    params: { lat, lng, maxDistance: 10000 },
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });

                const apiResults = res.data.results || [];

                // Transform API results to map-friendly format
                const mapped = apiResults.map((p, i) => ({
                    id: p._id || `provider-${i}`,
                    name: p.name || p.clinicName || 'Unknown',
                    specialty: p.specialty || p.type || 'General',
                    rating: p.averageRating || 0,
                    reviews: p.totalReviews || 0,
                    location: p.location?.coordinates
                        ? [p.location.coordinates[1], p.location.coordinates[0]]
                        : [lat, lng],
                    isVerified: p.isVerified || false,
                    distance: p.distanceKm || (p.dist?.calculated ? p.dist.calculated / 1000 : null),
                    isLive: p.isLive || false,
                    trustScore: p.trustScore || 0
                }));

                setProviders(mapped);

                // Build recommendations from top-scored results
                const topRecs = mapped
                    .filter(p => p.rating > 0)
                    .sort((a, b) => (b.trustScore || b.rating) - (a.trustScore || a.rating))
                    .slice(0, 3)
                    .map((p) => ({
                        name: p.specialty || 'Consultation',
                        facility: p.name,
                        distance: p.distance ? formatDistance(p.distance) : 'Nearby',
                        rating: `${p.rating.toFixed(1)}/5`,
                        badge: p.isVerified ? 'VERIFIED' : 'COMMUNITY',
                        badgeColor: p.isVerified ? 'green' : 'blue',
                        action: 'Book Now',
                        actionColor: 'blue',
                        link: '/dashboard/doctors'
                    }));

                if (topRecs.length > 0) {
                    setRecommendations(topRecs);
                }
            } catch (err) {
                console.error('Failed to fetch nearby providers:', err);
            } finally {
                setIsLoadingProviders(false);
            }
        };

        const fetchTopDoctors = async () => {
            try {
                const res = await axios.get('/api/doctor/list');
                const sorted = res.data.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
                setTopDoctors(sorted.slice(0, 4));
            } catch (err) {
                console.error('Error fetching top doctors:', err);
            }
        };

        fetchNearbyProviders();
        fetchTopDoctors();
    }, [userLocation]);

    const displayRecommendations = recommendations.length > 0 ? recommendations : [
        { name: 'Comprehensive Blood Panel', facility: 'Apex Labs', distance: '0.5km away', rating: '4.9/5', badge: 'TRUSTSCORE BADGE', badgeColor: 'blue', action: 'Book Now', actionColor: 'blue', link: '/dashboard/lab-tests' },
        { name: 'Annual Flu Shot', facility: 'Central Pharmacy', distance: '1.2km away', rating: '4.8/5', badge: 'VERIFIED FACILITY', badgeColor: 'green', action: 'Claim', actionColor: 'blue', link: '/dashboard/pharmacies' },
        { name: 'ECG Screening', facility: 'St. Mary Clinic', distance: '2.1km away', rating: '5.0/5', badge: 'TOP RATED', badgeColor: 'red', action: 'View', actionColor: 'blue', link: '/dashboard/doctors' },
    ];

    const mapCenter = userLocation || fallbackLocation;

    return (
        <div className="patient-home">
            {/* Greeting */}
            <div className="patient-greeting">
                <h1>How are you feeling today, {userName}?</h1>
                <p>Access your healthcare ecosystem in one place. Your last check-up was 12 days ago.</p>
            </div>

            {/* Action Cards */}
            <div className="action-cards">
                <div className="action-card card-blue">
                    <div className="card-icon-circle"><Stethoscope size={22} color="white" /></div>
                    <h3>Find Doctors</h3>
                    <div className="card-tags">
                        <span className="tag">Cardiology</span>
                        <span className="tag">Dental</span>
                    </div>
                </div>
                <div className="action-card card-lightblue">
                    <div className="card-icon-circle"><FlaskConical size={22} color="white" /></div>
                    <h3>Lab Tests</h3>
                    <div className="card-tags">
                        <span className="tag">Vitamin D</span>
                        <span className="tag">Blood Sugar</span>
                    </div>
                </div>
                <div className="action-card card-green">
                    <div className="card-icon-circle"><Building2 size={22} color="white" /></div>
                    <h3>Pharmacies</h3>
                    <div className="card-tags">
                        <span className="tag-light">24/7 Medical Stores Available</span>
                    </div>
                </div>
                <div className="action-card card-orange">
                    <div className="card-icon-circle"><FileText size={22} color="white" /></div>
                    <h3>My Records</h3>
                    <div className="card-tags">
                        <span className="tag-light">Health Vault Secured Access</span>
                    </div>
                </div>
            </div>

            {/* My Appointments Section */}
            {!loadingAppts && appointments.length > 0 && (
                <div className="my-appointments-section">
                    <div className="my-appts-header">
                        <h2><Calendar size={20} /> My Appointments</h2>
                        <span className="appt-count">{upcomingAppts.length} upcoming</span>
                    </div>
                    <div className="my-appts-list">
                        {appointments.slice(0, 4).map(appt => {
                            const ss = getStatusStyle(appt.status);
                            return (
                                <div key={appt._id} className={`my-appt-card ${appt.status === 'Cancelled' ? 'cancelled' : ''}`}>
                                    <div className="appt-left">
                                        <div className="appt-date-badge">
                                            <Calendar size={14} />
                                            <span>{formatApptDate(appt.date)}</span>
                                        </div>
                                        {appt.timeSlot && (
                                            <div className="appt-time">
                                                <Clock size={12} />
                                                <span>{appt.timeSlot}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="appt-center">
                                        <strong>{appt.doctorId?.role === 'lab' ? (appt.doctorId.name) : (appt.doctorId?.name ? (appt.doctorId.name.startsWith('Dr.') ? appt.doctorId.name : `Dr. ${appt.doctorId.name}`) : 'Doctor')}</strong>
                                        <span className="appt-specialty">{appt.doctorId?.specialization || (appt.doctorId?.role === 'lab' ? 'Diagnostic Center' : 'General')}</span>
                                        {appt.symptoms && <span className="appt-symptoms">{appt.symptoms}</span>}
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                            {appt.appointmentType === 'online' ? (
                                                <span style={{ fontSize: '10px', background: '#eff6ff', color: '#3b82f6', padding: '2px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    <Video size={10} /> Video Consultation
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: '10px', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    <MapPin size={10} /> In-Person Visit
                                                </span>
                                            )}
                                            {appt.collectionType === 'home' && (
                                                <span style={{ fontSize: '10px', background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    <Home size={10} /> Home Collection
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="appt-right">
                                        <span className="appt-status-badge" style={{ background: ss.bg, color: ss.color }}>
                                            {appt.status}
                                        </span>
                                        {(appt.status === 'Pending' || appt.status === 'Confirmed') && (
                                            <button className="appt-cancel-btn" onClick={() => cancelAppointment(appt._id)} title="Cancel">
                                                <X size={14} />
                                            </button>
                                        )}
                                        {appt.status === 'Completed' && !appt.isReviewed && (
                                            <button 
                                                onClick={() => handleOpenReview(appt)} 
                                                style={{ padding: '6px 12px', fontSize: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '8px' }}
                                            >
                                                Give Feedback
                                            </button>
                                        )}
                                        {appt.report && (
                                            <button 
                                                onClick={() => window.open(appt.report, '_blank')}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '8px' }}
                                            >
                                                <FileText size={14} /> Download Report
                                            </button>
                                        )}
                                        {appt.appointmentType === 'online' && appt.status === 'Confirmed' && appt.meetingLink && (
                                            <button 
                                                onClick={() => window.open(appt.meetingLink, '_blank')}
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '8px' }}
                                            >
                                                <Video size={14} /> Join Video Call
                                            </button>
                                        )}
                                    </div>
                                    {/* Prescription Display inside the card */}
                                    {appt.prescription && (
                                        <div style={{ width: '100%', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                                            <button
                                                onClick={() => togglePrescription(appt._id)}
                                                style={{ fontSize: '12px', fontWeight: '500', color: '#3b82f6', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                                            >
                                                {expandedPrescriptions[appt._id] ? 'Hide Prescription' : 'View Prescription / Notes'}
                                            </button>
                                            {expandedPrescriptions[appt._id] && (
                                                <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '13px', color: '#475569', whiteSpace: 'pre-wrap' }}>
                                                    {appt.prescription}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Facilities + Recommendations Grid */}
            <div className="facilities-grid">
                {/* Left: Facilities Map */}
                <div className="facilities-section">
                    <div className="facilities-header">
                        <h2>Facilities Near You</h2>
                        <div className="facilities-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveTab('all')}
                            >All Facilities</button>
                            <button
                                className={`tab-btn ${activeTab === 'open' ? 'active' : ''}`}
                                onClick={() => setActiveTab('open')}
                            >Open Now</button>
                        </div>
                    </div>

                    {/* Location status bar */}
                    {isLocating && (
                        <div className="location-status locating">
                            <div className="location-status-spinner"></div>
                            <span>Detecting your location...</span>
                        </div>
                    )}
                    {locationError && !isLocating && (
                        <div className="location-status error">
                            <MapPin size={14} />
                            <span>{locationError}</span>
                        </div>
                    )}
                    {!isLocating && !locationError && (
                        <div className="location-status success">
                            <MapPin size={14} />
                            <span>Showing facilities near your current location</span>
                        </div>
                    )}

                    <div className="map-container">
                        {!isLocating && mapCenter && (
                            <MapContainer
                                center={mapCenter}
                                zoom={16}
                                scrollWheelZoom={true}
                                style={{ height: '100%', width: '100%', borderRadius: '16px' }}
                            >
                                <TileLayer
                                    attribution='&copy; OpenStreetMap'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <RecenterMap position={mapCenter} />

                                {/* Current location marker */}
                                <Marker position={mapCenter} icon={currentLocationIcon}>
                                    <Popup>
                                        <strong>📍 You are here</strong>
                                    </Popup>
                                </Marker>

                                {/* Facility markers */}
                                {providers
                                    .filter(p => activeTab === 'all' || (activeTab === 'open' && p.isLive))
                                    .map(p => (
                                        <Marker key={p.id} position={p.location} icon={DefaultIcon}>
                                            <Popup>
                                                <strong>{p.name}</strong><br />
                                                {p.specialty} • {p.isVerified ? '✅ Verified' : 'General'}
                                                {p.distance != null && (
                                                    <><br />{formatDistance(p.distance)}</>
                                                )}
                                                {p.rating > 0 && (
                                                    <><br />⭐ {p.rating.toFixed(1)} ({p.reviews} reviews)</>
                                                )}
                                            </Popup>
                                        </Marker>
                                    ))}
                            </MapContainer>
                        )}
                        {isLocating && (
                            <div className="map-loading-placeholder">
                                <div className="location-status-spinner large"></div>
                                <p>Getting your location...</p>
                            </div>
                        )}
                    </div>
                    {isLoadingProviders && providers.length === 0 && (
                        <div className="providers-loading">
                            <div className="location-status-spinner"></div>
                            <span>Finding nearby facilities...</span>
                        </div>
                    )}
                </div>

                {/* Right: Recommendations */}
                <div className="recommendations-section">
                    <div className="rec-header">
                        <h3>Recommended for You</h3>
                        <p>Based on your clinical history & proximity</p>
                    </div>
                    <div className="rec-list">
                        {displayRecommendations.map((rec, i) => (
                            <div key={i} className="rec-card">
                                <div className="rec-icon-wrap">
                                    <Stethoscope size={18} color="#3b82f6" />
                                </div>
                                <div className="rec-info">
                                    <strong>{rec.name}</strong>
                                    <span>{rec.facility} • {rec.distance}</span>
                                    <div className="rec-bottom">
                                        <span className={`rec-badge rec-badge-${rec.badgeColor}`}>{rec.badge}</span>
                                        <Link to={rec.link || '#'} className="rec-action">{rec.action}</Link>
                                    </div>
                                </div>
                                <div className="rec-rating">
                                    <span className="rec-rating-value">{rec.rating}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="see-all-rec-btn" onClick={() => navigate('/dashboard/doctors')}>See All Recommendations</button>
                </div>
            </div>

            {/* Highest Rated Providers */}
            <div className="top-providers-section">
                <h2>Highest Rated Providers</h2>
                <div className="top-providers-grid">
                    {topDoctors.map((doc, i) => (
                        <div key={doc._id || i} className="top-provider-card">
                            <div className="provider-avatar">
                                <img src={`https://i.pravatar.cc/150?img=${30 + i}`} alt={doc.name} />
                            </div>
                            <div className="provider-info">
                                <div className="provider-name-row">
                                    <strong>{doc.name?.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`}</strong>
                                    {doc.isAvailable && <span className="available-badge">Available Now</span>}
                                </div>
                                <span className="provider-meta">{doc.specialty || doc.specialization} {doc.distance ? `• ${doc.distance}` : ''}</span>
                                <div className="provider-stars">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} size={14} fill={j < Math.floor(doc.averageRating || 0) ? '#facc15' : '#e2e8f0'} color={j < Math.floor(doc.averageRating || 0) ? '#facc15' : '#e2e8f0'} />
                                    ))}
                                    <span>{(doc.averageRating || 0).toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="patient-footer">
                <div className="footer-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Contact Support</a>
                    <a href="#">Legal</a>
                </div>
                <p>© 2026 CarePlus Health. All rights reserved.</p>
            </div>


            {/* Review Modal */}
            {showReviewModal && (
                <div className="booking-modal-overlay" onClick={() => setShowReviewModal(false)} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
                    <div className="booking-modal" onClick={e => e.stopPropagation()} style={{ background: 'white', padding: '24px', borderRadius: '16px', maxWidth: '400px', width: '90%' }}>
                        <h3 style={{ margin: '0 0 12px 0' }}>Rate Your Experience</h3>
                        <p style={{ marginBottom: '16px', color: '#64748b', fontSize: '14px', margin: '0 0 16px 0' }}>
                            How was your appointment with {reviewAppt?.doctorId?.name?.startsWith('Dr.') ? reviewAppt.doctorId.name : `Dr. ${reviewAppt?.doctorId?.name}`}?
                        </p>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Rating (1 to 5 Stars)</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <span 
                                        key={star} 
                                        onClick={() => setRating(star)}
                                        style={{
                                            fontSize: '28px', 
                                            cursor: 'pointer',
                                            color: star <= rating ? '#facc15' : '#cbd5e1'
                                        }}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Review Comment (optional)</label>
                            <textarea 
                                value={comment} 
                                onChange={(e) => setComment(e.target.value)} 
                                rows="3" 
                                placeholder="Share your feedback..."
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setShowReviewModal(false)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#f1f5f9', cursor: 'pointer', fontWeight: '500', color: '#475569' }}>Cancel</button>
                            <button onClick={handleSubmitReview} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: '600' }}>Submit Review</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDiscovery;
