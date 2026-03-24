import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Filter, Stethoscope, FlaskConical, Pill, AlertTriangle, Star, MapPin, ChevronRight, Navigation, FileText } from 'lucide-react';
import './PatientDashboard.css';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const PatientDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const providers = [
    { id: 1, name: 'Dr. Sarah Smith', specialty: 'Cardiologist', rating: 4.8, reviews: 120, price: 'Consultation: ₹500', location: [17.3850, 78.4867], type: 'doctor' },
    { id: 2, name: 'City Central Lab', specialty: 'Pathology', rating: 4.5, reviews: 85, price: 'Blood Test: ₹300', location: [17.3950, 78.4967], type: 'lab' },
    { id: 3, name: 'Wellness Pharmacy', specialty: 'Pharmacy', rating: 4.9, reviews: 200, price: '10% Discount', location: [17.3750, 78.4767], type: 'pharmacy' },
  ];

  const mapCenter = [17.3850, 78.4867];

  return (
    <div className="patient-dashboard-v2">
      {/* Search & Filter Bar */}
      <div className="search-section">
        <div className="search-bar-container">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search for a symptom, doctor, or test (e.g., Blood Test, Fever)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="filter-btn">
            <Filter size={18} /> Filters
          </button>
        </div>
        
        {/* Quick Action Chips */}
        <div className="quick-action-chips">
          <button className="chip emergency-chip"><AlertTriangle size={16} /> Nearest ER</button>
          <button className="chip pharmacy-chip"><Pill size={16} /> Open Pharmacies</button>
          <button className="chip lab-chip"><FlaskConical size={16} /> Home Lab Collection</button>
          <button className="chip doctor-chip"><Star size={16} /> Top Rated Clinics</button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="main-grid">
        {/* Left Side: Map */}
        <div className="map-container card-shadow">
          <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%', borderRadius: '24px' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {providers.map(provider => (
              <Marker key={provider.id} position={provider.location}>
                <Popup>
                  <strong>{provider.name}</strong><br/>
                  {provider.specialty}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Right Side: Best Matches */}
        <div className="best-matches-container card-shadow">
          <h2 className="matches-title">Best Matches</h2>
          <div className="matches-list">
            {providers.map(provider => (
              <div key={provider.id} className="match-card">
                <div className="match-header">
                  <div>
                    <h3 className="provider-name">{provider.name}</h3>
                    <p className="provider-specialty">{provider.specialty}</p>
                  </div>
                  <div className="trust-badge">
                    <Star size={14} className="star-icon" fill="currentColor"/> {provider.rating} <span className="reviews">({provider.reviews})</span>
                  </div>
                </div>
                
                <div className="price-highlight">
                  <span className="price-label">{provider.price}</span>
                </div>

                <div className="match-actions">
                  <button className="btn-navigate"><Navigation size={16} /> Navigate</button>
                  <button className="btn-book">Book Appointment</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
