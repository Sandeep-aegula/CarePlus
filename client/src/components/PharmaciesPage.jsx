import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, MapPin, Clock, Phone, Star, Navigation, Loader2, Building2, Stethoscope, FlaskConical, Pill, Hospital } from 'lucide-react';
import './TabPages.css';
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

// Custom "You are here" marker
const currentLocationIcon = L.divIcon({
    className: 'current-location-marker',
    html: `<div class="pulse-ring"></div><div class="location-dot"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

// Category-specific colored markers
const createCategoryIcon = (color) => L.divIcon({
    className: 'category-marker',
    html: `<div style="
        width: 28px; height: 28px; border-radius: 50% 50% 50% 0;
        background: ${color}; transform: rotate(-45deg);
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3); border: 2px solid white;
    "><div style="
        width: 10px; height: 10px; background: white; border-radius: 50%; transform: rotate(45deg);
    "></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
});

const categoryIcons = {
    pharmacy: createCategoryIcon('#22c55e'),
    hospital: createCategoryIcon('#ef4444'),
    clinic: createCategoryIcon('#3b82f6'),
    doctors: createCategoryIcon('#8b5cf6'),
    testcenter: createCategoryIcon('#f59e0b'),
};

// Recenter the map when position changes
const RecenterMap = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.setView(position, 16, { animate: true });
        }
    }, [position, map]);
    return null;
};

// Haversine distance in km
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
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)}km`;
};

const CATEGORIES = [
    { key: 'all', label: 'All', icon: null },
    { key: 'pharmacy', label: 'Medical Stores', icon: <Pill size={14} /> },
    { key: 'hospital', label: 'Hospitals', icon: <Hospital size={14} /> },
    { key: 'clinic', label: 'Clinics', icon: <Building2 size={14} /> },
    { key: 'doctors', label: 'Doctors', icon: <Stethoscope size={14} /> },
    { key: 'testcenter', label: 'Test Centers', icon: <FlaskConical size={14} /> },
];

const PharmaciesPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [isLocating, setIsLocating] = useState(true);
    const [facilities, setFacilities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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
                setLocationError('Unable to get your location. Showing default area.');
                setUserLocation(fallbackLocation);
                setIsLocating(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        );
    }, []);

    // Fetch nearby facilities from Overpass API once we have location
    useEffect(() => {
        if (!userLocation) return;

        const fetchFacilities = async () => {
            setIsLoading(true);
            const [lat, lng] = userLocation;
            const radius = 5000; // 5km radius

            const overpassQuery = `
                [out:json][timeout:15];
                (
                    node(around:${radius},${lat},${lng})["amenity"="pharmacy"];
                    node(around:${radius},${lat},${lng})["amenity"="hospital"];
                    node(around:${radius},${lat},${lng})["amenity"="clinic"];
                    node(around:${radius},${lat},${lng})["amenity"="doctors"];
                    node(around:${radius},${lat},${lng})["healthcare"="laboratory"];
                    node(around:${radius},${lat},${lng})["amenity"="dentist"];
                    way(around:${radius},${lat},${lng})["amenity"="hospital"];
                    way(around:${radius},${lat},${lng})["amenity"="pharmacy"];
                    way(around:${radius},${lat},${lng})["amenity"="clinic"];
                );
                out center 80;
            `;

            try {
                const res = await axios.get('https://overpass-api.de/api/interpreter', {
                    params: { data: overpassQuery },
                    timeout: 12000
                });

                if (res.data && res.data.elements) {
                    const results = res.data.elements
                        .filter(el => (el.tags && el.tags.name))
                        .map(el => {
                            const elLat = el.lat || el.center?.lat;
                            const elLng = el.lon || el.center?.lon;
                            if (!elLat || !elLng) return null;

                            const dist = haversineDistance(lat, lng, elLat, elLng);

                            // Determine category
                            let category = 'clinic';
                            const amenity = el.tags.amenity || '';
                            const healthcare = el.tags.healthcare || '';

                            if (amenity === 'pharmacy') category = 'pharmacy';
                            else if (amenity === 'hospital') category = 'hospital';
                            else if (amenity === 'clinic' || amenity === 'dentist') category = 'clinic';
                            else if (amenity === 'doctors') category = 'doctors';
                            else if (healthcare === 'laboratory') category = 'testcenter';

                            // Determine open status from opening_hours if available
                            const hasHours = !!el.tags.opening_hours;
                            const hours = el.tags.opening_hours || 'Hours not available';

                            return {
                                id: el.id,
                                name: el.tags.name,
                                address: el.tags['addr:full'] || el.tags['addr:street']
                                    ? `${el.tags['addr:street'] || ''} ${el.tags['addr:city'] || ''}`.trim()
                                    : 'Address not listed',
                                distance: dist,
                                distanceLabel: formatDistance(dist),
                                location: [elLat, elLng],
                                category,
                                categoryLabel: CATEGORIES.find(c => c.key === category)?.label || category,
                                hours: hours === '24/7' ? '24/7' : hours,
                                phone: el.tags.phone || el.tags['contact:phone'] || null,
                                website: el.tags.website || null,
                                open: hours === '24/7' ? true : hasHours, // Simple check
                            };
                        })
                        .filter(Boolean)
                        .sort((a, b) => a.distance - b.distance);

                    setFacilities(results);
                }
            } catch (err) {
                console.error('Failed to fetch facilities from Overpass:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFacilities();
    }, [userLocation]);

    // Filter facilities
    const filtered = facilities
        .filter(f => activeCategory === 'all' || f.category === activeCategory)
        .filter(f =>
            f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const mapCenter = userLocation || fallbackLocation;

    // Category counts
    const getCategoryCount = (key) => {
        if (key === 'all') return facilities.length;
        return facilities.filter(f => f.category === key).length;
    };

    return (
        <div className="tab-page">
            <div className="tab-page-header">
                <h1>Nearby Healthcare Facilities</h1>
                <p>Find medical stores, hospitals, clinics, test centers & doctors near you</p>
            </div>

            {/* Search */}
            <div className="tab-filters">
                <div className="tab-search-bar">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, address, or type..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="tab-specialty-pills">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.key}
                            className={`specialty-pill ${activeCategory === cat.key ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.key)}
                        >
                            {cat.icon} {cat.label}
                            <span className="pill-count">({getCategoryCount(cat.key)})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Location Status */}
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
                    <span>Showing {filtered.length} facilities near your current location (5km radius)</span>
                </div>
            )}

            {/* Map + List layout */}
            <div className="pharmacy-layout">
                <div className="pharmacy-map">
                    {!isLocating && mapCenter ? (
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
                            {filtered.map(f => (
                                <Marker
                                    key={f.id}
                                    position={f.location}
                                    icon={categoryIcons[f.category] || DefaultIcon}
                                >
                                    <Popup>
                                        <strong>{f.name}</strong><br />
                                        <span style={{ color: '#64748b', fontSize: '12px' }}>{f.categoryLabel}</span><br />
                                        <span style={{ fontSize: '12px' }}>📍 {f.distanceLabel} away</span>
                                        {f.phone && <><br /><span style={{ fontSize: '12px' }}>📞 {f.phone}</span></>}
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    ) : (
                        <div className="map-loading-placeholder">
                            <div className="location-status-spinner large"></div>
                            <p>Getting your location...</p>
                        </div>
                    )}
                </div>

                <div className="pharmacy-list">
                    {isLoading && (
                        <div className="facilities-loading-card">
                            <div className="location-status-spinner"></div>
                            <span>Searching nearby facilities...</span>
                        </div>
                    )}
                    {!isLoading && filtered.length === 0 && (
                        <div className="facilities-loading-card">
                            <MapPin size={20} />
                            <span>No facilities found{activeCategory !== 'all' ? ` in "${CATEGORIES.find(c => c.key === activeCategory)?.label}"` : ''}. Try a different filter.</span>
                        </div>
                    )}
                    {filtered.map(f => (
                        <div key={f.id} className="pharmacy-card">
                            <div className="pharmacy-card-top">
                                <div>
                                    <div className="pharmacy-name-row">
                                        <strong>{f.name}</strong>
                                        <span className={`category-badge category-${f.category}`}>
                                            {f.categoryLabel}
                                        </span>
                                    </div>
                                    <span className="pharmacy-address"><MapPin size={12} /> {f.address}</span>
                                    <div className="pharmacy-meta">
                                        <span><MapPin size={12} /> {f.distanceLabel}</span>
                                        {f.hours && <span><Clock size={12} /> {f.hours.length > 30 ? f.hours.slice(0, 30) + '…' : f.hours}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="pharmacy-actions">
                                <button
                                    className="btn-directions"
                                    onClick={() => {
                                        const originParam = userLocation ? `&origin=${userLocation[0]},${userLocation[1]}` : '';
                                        window.open(`https://www.google.com/maps/dir/?api=1${originParam}&destination=${f.location[0]},${f.location[1]}`, '_blank');
                                    }}
                                >
                                    <Navigation size={14} /> Directions
                                </button>
                                {f.phone && (
                                    <button className="btn-call" onClick={() => window.open(`tel:${f.phone}`)}>
                                        <Phone size={14} /> Call
                                    </button>
                                )}
                                {f.website && (
                                    <a
                                        href={f.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-call"
                                        style={{ textDecoration: 'none' }}
                                    >
                                        Website
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Map Legend */}
            <div className="map-legend">
                <span className="legend-title">Legend:</span>
                <div className="legend-items">
                    <div className="legend-item"><span className="legend-dot" style={{ background: '#3b82f6' }}></span> You</div>
                    <div className="legend-item"><span className="legend-dot" style={{ background: '#22c55e' }}></span> Medical Stores</div>
                    <div className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }}></span> Hospitals</div>
                    <div className="legend-item"><span className="legend-dot" style={{ background: '#3b82f6' }}></span> Clinics</div>
                    <div className="legend-item"><span className="legend-dot" style={{ background: '#8b5cf6' }}></span> Doctors</div>
                    <div className="legend-item"><span className="legend-dot" style={{ background: '#f59e0b' }}></span> Test Centers</div>
                </div>
            </div>
        </div>
    );
};

export default PharmaciesPage;
