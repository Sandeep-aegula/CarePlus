import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, FlaskConical, Clock, Home, ArrowRight, X, Calendar, MapPin, CheckCircle, Video } from 'lucide-react';
import './TabPages.css';

const LabTestsPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    
    // Booking states
    const [bookingTest, setBookingTest] = useState(null);
    const [additionalTests, setAdditionalTests] = useState([]);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingStatus, setBookingStatus] = useState(null);
    const [bookingError, setBookingError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    // Labs comparison states
    const [availableLabs, setAvailableLabs] = useState([]);
    const [selectedLabId, setSelectedLabId] = useState('');
    const [loadingLabs, setLoadingLabs] = useState(false);
    const [collectionType, setCollectionType] = useState('center'); // home or center
    const [userLocation, setUserLocation] = useState(null);

    const categories = ['All', 'Blood Tests', 'Imaging', 'Thyroid', 'Diabetes', 'Cardiac', 'Vitamin'];

    const tests = [
        { id: 1, name: 'Complete Blood Count (CBC)', category: 'Blood Tests', labs: 8, priceRange: '₹300 - ₹600', cheapest: 'Apex Labs', cheapestPrice: 300, tat: '12 hrs', homeCollection: true, popular: true },
        { id: 2, name: 'Thyroid Profile (T3, T4, TSH)', category: 'Thyroid', labs: 6, priceRange: '₹500 - ₹1200', cheapest: 'MedScan Labs', cheapestPrice: 500, tat: '24 hrs', homeCollection: true, popular: true },
        { id: 3, name: 'HbA1c (Glycated Hemoglobin)', category: 'Diabetes', labs: 5, priceRange: '₹400 - ₹800', cheapest: 'City Diagnostics', cheapestPrice: 400, tat: '8 hrs', homeCollection: true, popular: false },
        { id: 4, name: 'Lipid Profile', category: 'Cardiac', labs: 7, priceRange: '₹350 - ₹900', cheapest: 'Apex Labs', cheapestPrice: 350, tat: '8 hrs', homeCollection: false, popular: true },
        { id: 5, name: 'Vitamin D (25-OH)', category: 'Vitamin', labs: 4, priceRange: '₹600 - ₹1500', cheapest: 'HealthFirst Lab', cheapestPrice: 600, tat: '24 hrs', homeCollection: true, popular: false },
        { id: 6, name: 'MRI Whole Brain', category: 'Imaging', labs: 3, priceRange: '₹5000 - ₹12000', cheapest: 'RadiScan Center', cheapestPrice: 5000, tat: '48 hrs', homeCollection: false, popular: false },
        { id: 7, name: 'Liver Function Test (LFT)', category: 'Blood Tests', labs: 6, priceRange: '₹400 - ₹800', cheapest: 'MedScan Labs', cheapestPrice: 400, tat: '12 hrs', homeCollection: true, popular: false },
        { id: 8, name: 'Troponin I', category: 'Cardiac', labs: 4, priceRange: '₹800 - ₹2000', cheapest: 'City Diagnostics', cheapestPrice: 800, tat: '6 hrs', homeCollection: false, popular: false },
    ];

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
                (err) => setUserLocation([17.3850, 78.4867]) // Fallback to Hyderabad
            );
        } else {
            setUserLocation([17.3850, 78.4867]);
        }
    }, []);

    const fetchLabsForTest = async (testName) => {
        setLoadingLabs(true);
        try {
            const [lat, lng] = userLocation || [17.3850, 78.4867];
            const queryName = testName.split('(')[0].trim(); // e.g. "Complete Blood Count"
            const res = await axios.get(`/api/search/price-compare?lat=${lat}&lng=${lng}&testName=${encodeURIComponent(queryName)}`);
            
            if (res.data && res.data.labs) {
                setAvailableLabs(res.data.labs);
                if (res.data.labs.length > 0) {
                    setSelectedLabId(res.data.labs[0].userId);
                } else {
                    // Fallback to our dummy setup Lab if no matching labs are physically near
                    setAvailableLabs([{ 
                        userId: '69c169f6ec282fb1cf86408c', 
                        clinicName: 'Apex Central Diagnostics', 
                        address: 'Main Health Avenue, City Center',
                        contactNumber: '+91-9876543210',
                        price: 350, 
                        distance: 2100,
                        isCheapest: true
                    }]);
                    setSelectedLabId('69c169f6ec282fb1cf86408c');
                }
            }
        } catch (err) {
            console.error('Error fetching labs:', err);
            // Fallback for demo
            setAvailableLabs([{ 
                userId: '69c169f6ec282fb1cf86408c', 
                clinicName: 'Apex Central Diagnostics', 
                address: 'Main Health Avenue, City Center',
                contactNumber: '+91-9876543210',
                price: 350, 
                distance: 2100,
                isCheapest: true
            }]);
            setSelectedLabId('69c169f6ec282fb1cf86408c');
        }
        setLoadingLabs(false);
    };

    const handleOpenBooking = (test) => {
        setBookingTest(test);
        setAdditionalTests([]);
        setBookingDate('');
        setBookingStatus(null);
        setBookingError('');
        fetchLabsForTest(test.name);
    };

    const handleSubmitBooking = async () => {
        if (!bookingDate) {
            setBookingError('Please select a preferred date');
            return;
        }
        if (!selectedLabId) {
            setBookingError('Please select a lab facility');
            return;
        }

        setSubmitting(true);
        setBookingError('');
        try {
            const token = localStorage.getItem('token');
            const selectedLab = availableLabs.find(l => l.userId === selectedLabId);
            const mainPrice = selectedLab ? selectedLab.price : bookingTest.cheapestPrice;
            
            const allTestsToBook = [
                { name: bookingTest.name, price: mainPrice },
                ...additionalTests.map(t => ({ name: t.name, price: t.cheapestPrice }))
            ];

            await axios.post('/appointments/add', {
                doctorId: selectedLabId, 
                date: bookingDate,
                symptoms: `Lab Test Booking`,
                timeSlot: '10:00 AM - 11:00 AM', 
                tests: allTestsToBook,
                collectionType // Send collection type
            }, {
                headers: { 'x-auth-token': token }
            });
            
            setBookingStatus('success');
        } catch (err) {
            console.error(err);
            setBookingError('Failed to request test booking. Try again later.');
        }
        setSubmitting(false);
    };

    const filtered = tests.filter(t =>
        (selectedCategory === 'All' || t.category === selectedCategory) &&
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="tab-page">
            <div className="tab-page-header">
                <h1>Lab Tests</h1>
                <p>Compare prices and book tests from trusted diagnostic centers</p>
            </div>

            {/* Search & Filters */}
            <div className="tab-filters">
                <div className="tab-search-bar">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search tests (CBC, Thyroid, MRI...)"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="tab-specialty-pills">
                    {categories.map(c => (
                        <button
                            key={c}
                            className={`specialty-pill ${selectedCategory === c ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(c)}
                        >{c}</button>
                    ))}
                </div>
            </div>

            {/* Test Cards */}
            <div className="test-list">
                {filtered.map(test => (
                    <div key={test.id} className="test-card">
                        <div className="test-card-left">
                            <div className="test-icon-wrap">
                                <FlaskConical size={20} color="#3b82f6" />
                            </div>
                            <div className="test-info">
                                <div className="test-name-row">
                                    <strong>{test.name}</strong>
                                    {test.popular && <span className="popular-tag">Popular</span>}
                                </div>
                                <span className="test-category">{test.category}</span>
                                <div className="test-meta-row">
                                    <span><Clock size={12} /> {test.tat}</span>
                                    {test.homeCollection && <span className="home-tag"><Home size={12} /> Home Collection</span>}
                                    <span>{test.labs} labs available</span>
                                </div>
                            </div>
                        </div>
                        <div className="test-card-right">
                            <div className="test-price-info">
                                <span className="price-range">{test.priceRange}</span>
                                <span className="cheapest-lab">Cheapest: {test.cheapest} <strong>₹{test.cheapestPrice}</strong></span>
                            </div>
                            <div className="test-actions">
                                <button className="btn-compare" onClick={() => handleOpenBooking(test)}>Compare <ArrowRight size={14} /></button>
                                <button className="btn-book" onClick={() => handleOpenBooking(test)}>Book Now</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Booking Modal */}
            {bookingTest && (
                <div className="booking-modal-overlay" onClick={() => setBookingTest(null)}>
                    <div className="booking-modal" onClick={e => e.stopPropagation()}>
                        <button className="booking-close" onClick={() => setBookingTest(null)}><X size={20} /></button>
                        
                        {bookingStatus === 'success' ? (
                            <div className="booking-success">
                                <CheckCircle size={48} color="#22c55e" />
                                <h3>Test Booked Successfully!</h3>
                                <p>The lab facility has received your request for <strong>{bookingTest.name}</strong>.</p>
                                <button onClick={() => setBookingTest(null)} className="btn-primary">Done</button>
                            </div>
                        ) : (
                            <>
                                <h3>Book Lab Test</h3>
                                <div className="booking-doc-info" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                                    <div className="booking-doc-details">
                                        <strong>{bookingTest.name}</strong>
                                        <span>{bookingTest.category} • Turnaround: {bookingTest.tat}</span>
                                    </div>
                                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>Add Additional Tests (Optional)</label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                            {additionalTests.map(at => (
                                                <span key={at.id} style={{ fontSize: '12px', background: '#eff6ff', color: '#2563eb', padding: '4px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {at.name}
                                                    <X size={12} style={{ cursor: 'pointer' }} onClick={() => setAdditionalTests(prev => prev.filter(t => t.id !== at.id))} />
                                                </span>
                                            ))}
                                        </div>
                                        <select 
                                            style={{ width: '100%', padding: '8px', fontSize: '13px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                            onChange={(e) => {
                                                const selected = tests.find(t => t.id === parseInt(e.target.value));
                                                if (selected) setAdditionalTests(prev => [...prev, selected]);
                                                e.target.value = '';
                                            }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>+ Select another test</option>
                                            {tests
                                                .filter(t => t.id !== bookingTest.id && !additionalTests.find(at => at.id === t.id))
                                                .map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                </div>

                                <div className="booking-field">
                                    <label>Sample Collection Mode</label>
                                    <div className="booking-mode-toggle" style={{ marginBottom: '16px' }}>
                                        <button 
                                            className={`mode-btn ${collectionType === 'center' ? 'active' : ''}`}
                                            onClick={() => setCollectionType('center')}
                                        >
                                            <MapPin size={16} /> Visit Lab
                                        </button>
                                        <button 
                                            className={`mode-btn ${collectionType === 'home' ? 'active' : ''}`}
                                            onClick={() => setCollectionType('home')}
                                            disabled={bookingTest.category === 'Imaging'}
                                            title={bookingTest.category === 'Imaging' ? 'Home collection not available for imaging' : ''}
                                        >
                                            <Home size={16} /> Home Collection
                                        </button>
                                    </div>
                                    {bookingTest.category === 'Imaging' && (
                                        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '-12px', marginBottom: '12px' }}>
                                            * MRI/Imaging requires visiting the diagnostic center.
                                        </p>
                                    )}
                                </div>

                                <div className="booking-form">
                                    <div className="booking-field">
                                        <label><MapPin size={14} /> Select Facility</label>
                                        {loadingLabs ? (
                                            <div style={{ padding: '10px', color: '#64748b' }}>Finding best prices near you...</div>
                                        ) : (
                                            <div className="lab-options-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                                                {availableLabs.map(lab => (
                                                    <label key={lab.userId} style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                                                        padding: '12px', border: `1px solid ${selectedLabId === lab.userId ? '#3b82f6' : '#e2e8f0'}`,
                                                        borderRadius: '8px', cursor: 'pointer',
                                                        background: selectedLabId === lab.userId ? '#eff6ff' : 'white'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <input 
                                                                type="radio" 
                                                                name="labSelect" 
                                                                value={lab.userId}
                                                                checked={selectedLabId === lab.userId}
                                                                onChange={() => setSelectedLabId(lab.userId)}
                                                                style={{ margin: 0 }}
                                                            />
                                                            <div>
                                                                <strong style={{ display: 'block', fontSize: '14px', color: '#1e293b' }}>{lab.clinicName}</strong>
                                                                <span style={{ display: 'block', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                                                    <MapPin size={10} style={{ display: 'inline', marginRight: '4px' }}/>{lab.address || 'Address unavailable'}
                                                                </span>
                                                                {lab.contactNumber && (
                                                                    <span style={{ display: 'block', fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                                                        📞 {lab.contactNumber}
                                                                    </span>
                                                                )}
                                                                <span style={{ display: 'block', fontSize: '11px', color: '#3b82f6', marginTop: '4px', fontWeight: '500' }}>{(lab.distance / 1000).toFixed(1)}km away</span>
                                                            </div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <strong style={{ display: 'block', fontSize: '15px', color: '#0f172a' }}>₹{lab.price}</strong>
                                                            {lab.isCheapest && <span style={{ fontSize: '10px', background: '#dcfce7', color: '#16a34a', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>BEST PRICE</span>}
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="booking-field" style={{ marginTop: '16px' }}>
                                        <label><Calendar size={14} /> Preferred Date</label>
                                        <input
                                            type="date"
                                            value={bookingDate}
                                            min={today}
                                            onChange={(e) => setBookingDate(e.target.value)}
                                        />
                                    </div>

                                    {bookingError && <div className="booking-error">{bookingError}</div>}

                                    <button 
                                        className="booking-submit-btn"
                                        onClick={handleSubmitBooking}
                                        disabled={submitting || loadingLabs || !selectedLabId}
                                    >
                                        {submitting ? 'Confirming...' : `Confirm Booking • ₹${availableLabs.find(l => l.userId === selectedLabId)?.price || bookingTest.cheapestPrice}`}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LabTestsPage;
