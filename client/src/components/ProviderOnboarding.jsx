import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as LucideIcons from 'lucide-react';
import './ProviderOnboarding.css';

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

// Helper component for map clicks
const LocationPicker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
};

const STEPS = ['Identity', 'Services', 'Availability', 'Review'];

const ProviderOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [providerType, setProviderType] = useState('doctor'); // 'doctor' or 'lab'

  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    licenseFile: null,
    address: '',
    location: [17.3850, 78.4867], // Default to Central City
    specialty: '',
    consultationFee: '',
    services: [],
    isEmergencyAvailable: false,
    schedule: {
      monday: false, tuesday: false, wednesday: false, thursday: false, friday: false, saturday: false, sunday: false
    }
  });

  const [newService, setNewService] = useState({ name: '', price: '' });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, licenseFile: e.target.files[0].name });
    }
  };

  const setLocation = (pos) => {
    setFormData({ ...formData, location: pos });
  };

  const toggleDay = (day) => {
    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        [day]: !formData.schedule[day]
      }
    });
  };

  const addService = () => {
    if (newService.name && newService.price) {
      setFormData({
        ...formData,
        services: [...formData.services, { id: Date.now(), ...newService }]
      });
      setNewService({ name: '', price: '' });
    }
  };

  const removeService = (id) => {
    setFormData({
      ...formData,
      services: formData.services.filter(s => s.id !== id)
    });
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Publishing:', formData);
    alert('Profile Published to CarePlus Map!');
  };

  return (
    <div className="wizard-page">
      <div className="wizard-container">
        {/* Progress Bar Header */}
        <div className="wizard-header">
          <h2>Provider Onboarding</h2>
          <div className="progress-indicator">
            <span className="step-text">Step {currentStep} of 4</span>
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Steps Content */}
        <form className="wizard-form" onSubmit={handleSubmit}>
          
          {/* Step 1: Identity */}
          {currentStep === 1 && (
            <div className="step-content fade-in">
              <h3><LucideIcons.User size={24} className="step-icon text-blue-500" /> Identity & Location</h3>
              <p className="step-desc">Help patients find you easily.</p>

              <div className="type-selector">
                <button type="button" className={`type-btn ${providerType === 'doctor' ? 'active' : ''}`} onClick={() => setProviderType('doctor')}>
                  <LucideIcons.Stethoscope size={20} /> Doctor
                </button>
                <button type="button" className={`type-btn ${providerType === 'lab' ? 'active' : ''}`} onClick={() => setProviderType('lab')}>
                  <LucideIcons.FlaskConical size={20} /> Diagnostic Center
                </button>
              </div>

              <div className="form-group">
                <label>{providerType === 'doctor' ? 'Full Name' : 'Clinic / Lab Name'}</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder={providerType === 'doctor' ? "Dr. John Doe" : "City Lab"} required />
              </div>

              <div className="form-group row">
                <div className="col">
                  <label>Medical License / Reg Number</label>
                  <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} placeholder="Lic-12345" required />
                </div>
                <div className="col upload-col">
                  <label>Verify License</label>
                  <label className="file-upload-btn">
                    <LucideIcons.Upload size={16} /> {formData.licenseFile || 'Upload Document'}
                    <input type="file" onChange={handleFileChange} accept=".pdf,.jpg,.png" hidden />
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Exact GPS Location (Click map to set)</label>
                <div className="map-picker">
                  <MapContainer center={formData.location} zoom={13} scrollWheelZoom={false} style={{ height: '300px', width: '100%', borderRadius: '12px' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationPicker position={formData.location} setPosition={setLocation} />
                  </MapContainer>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Services & Pricing */}
          {currentStep === 2 && (
            <div className="step-content fade-in">
              <h3><LucideIcons.Tag size={24} className="step-icon text-blue-500" /> Services & Pricing</h3>
              <p className="step-desc">List your exact prices so patients know what to expect.</p>

              {providerType === 'doctor' ? (
                <>
                  <div className="form-group">
                    <label>Primary Specialty</label>
                    <select name="specialty" value={formData.specialty} onChange={handleInputChange}>
                      <option value="">Select Specialty</option>
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="Dentist">Dentist</option>
                      <option value="General Physician">General Physician</option>
                      <option value="Pediatrician">Pediatrician</option>
                      <option value="Dermatologist">Dermatologist</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Standard Consultation Fee (₹)</label>
                    <input type="number" name="consultationFee" value={formData.consultationFee} onChange={handleInputChange} placeholder="500" />
                  </div>
                </>
              ) : (
                <>
                  <div className="dynamic-list-builder">
                    <div className="add-row">
                      <input type="text" placeholder="Test Name (e.g., CBC, MRI)" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} />
                      <input type="number" placeholder="Price (₹)" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} />
                      <button type="button" className="btn-add" onClick={addService}><LucideIcons.Plus size={18} /> Add</button>
                    </div>

                    <div className="services-table">
                      {formData.services.map(s => (
                        <div key={s.id} className="service-row">
                          <span className="s-name">{s.name}</span>
                          <span className="s-price">₹{s.price}</span>
                          <button type="button" onClick={() => removeService(s.id)}><LucideIcons.Trash2 size={16} className="text-red-500"/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Availability */}
          {currentStep === 3 && (
            <div className="step-content fade-in">
              <h3><LucideIcons.Clock size={24} className="step-icon text-blue-500" /> Live Availability</h3>
              <p className="step-desc">Set your working hours and emergency status.</p>

              <div className="emergency-toggle">
                <div className="toggle-info">
                  <h4><LucideIcons.AlertTriangle size={18} className="text-red-500"/> Emergency Service Available</h4>
                  <p>Turn on if you accept 24/7 emergency walk-ins.</p>
                </div>
                <label className="switch">
                  <input type="checkbox" name="isEmergencyAvailable" checked={formData.isEmergencyAvailable} onChange={handleInputChange} />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="schedule-builder">
                <label>Weekly Schedule (Select active days)</label>
                <div className="days-row">
                  {Object.keys(formData.schedule).map(day => (
                    <div 
                      key={day} 
                      className={`day-card ${formData.schedule[day] ? 'active' : ''}`}
                      onClick={() => toggleDay(day)}
                    >
                      {day.substring(0, 3).toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Publish */}
          {currentStep === 4 && (
            <div className="step-content fade-in">
              <h3><LucideIcons.CheckSquare size={24} className="step-icon text-green-500" /> Review & Go Live</h3>
              <p className="step-desc">Please verify your details before publishing.</p>

              <div className="review-summary">
                <div className="summary-block">
                  <strong>Organization</strong>
                  <p>{formData.name || 'Not provided'} ({providerType.toUpperCase()})</p>
                </div>
                <div className="summary-block">
                  <strong>License Verified</strong>
                  <p>{formData.licenseFile ? 'Yes, document uploaded' : 'Pending'}</p>
                </div>
                <div className="summary-block">
                  <strong>Pricing Model</strong>
                  <p>{providerType === 'doctor' ? `Consultation: ₹${formData.consultationFee}` : `${formData.services.length} tests listed`}</p>
                </div>
                <div className="summary-block">
                  <strong>Emergency Settings</strong>
                  <p>{formData.isEmergencyAvailable ? 'Enabled (24/7)' : 'Standard Hours Only'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="wizard-actions">
            <button 
              type="button" 
              className={`btn-back ${currentStep === 1 ? 'invisible' : ''}`} 
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <LucideIcons.ArrowLeft size={18} /> Back
            </button>

            {currentStep < 4 ? (
              <button type="button" className="btn-next" onClick={nextStep}>
                Continue <LucideIcons.ArrowRight size={18} />
              </button>
            ) : (
              <button type="submit" className="btn-publish">
                Publish to CarePlus Map <LucideIcons.Rocket size={18} />
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProviderOnboarding;
