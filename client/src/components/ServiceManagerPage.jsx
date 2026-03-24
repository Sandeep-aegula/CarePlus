import React, { useState } from 'react';
import { Edit3, Plus, Trash2, DollarSign, Save, X } from 'lucide-react';
import './DoctorDashboard.css';

const INITIAL_SERVICES = [
    { id: 1, name: 'General Consultation', price: 120, category: 'Consultation' },
    { id: 2, name: 'Follow-Up Visit', price: 60, category: 'Consultation' },
    { id: 3, name: 'Specialist Referral Consult', price: 150, category: 'Consultation' },
    { id: 4, name: 'Emergency Consultation', price: 250, category: 'Emergency' },
    { id: 5, name: 'Tele-Consultation', price: 80, category: 'Virtual' },
    { id: 6, name: 'Vaccination Administration', price: 40, category: 'Procedure' },
];

const ServiceManagerPage = () => {
    const [services, setServices] = useState(INITIAL_SERVICES);
    const [editingId, setEditingId] = useState(null);
    const [editPrice, setEditPrice] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [newService, setNewService] = useState({ name: '', price: '', category: 'Consultation' });

    const startEdit = (svc) => {
        setEditingId(svc.id);
        setEditPrice(svc.price.toString());
    };

    const saveEdit = (id) => {
        setServices(services.map(s => s.id === id ? { ...s, price: parseFloat(editPrice) } : s));
        setEditingId(null);
    };

    const deleteService = (id) => {
        setServices(services.filter(s => s.id !== id));
    };

    const addService = () => {
        if (!newService.name || !newService.price) return;
        setServices([...services, {
            id: Date.now(),
            name: newService.name,
            price: parseFloat(newService.price),
            category: newService.category
        }]);
        setNewService({ name: '', price: '', category: 'Consultation' });
        setShowAdd(false);
    };

    const categories = [...new Set(services.map(s => s.category))];

    return (
        <div className="doc-dashboard">
            <div className="doc-greeting">
                <h1>Service & Price Manager</h1>
                <p>Manage your consultation fees and service pricing</p>
            </div>

            {/* Summary Cards */}
            <div className="doc-stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="doc-stat-card">
                    <div className="stat-icon-wrap stat-blue">
                        <DollarSign size={22} color="white" />
                    </div>
                    <div className="stat-body">
                        <span className="stat-label">Total Services</span>
                        <span className="stat-value">{services.length}</span>
                    </div>
                </div>
                <div className="doc-stat-card">
                    <div className="stat-icon-wrap stat-green">
                        <DollarSign size={22} color="white" />
                    </div>
                    <div className="stat-body">
                        <span className="stat-label">Avg. Price</span>
                        <span className="stat-value">₹{(services.reduce((a, s) => a + s.price, 0) / services.length).toFixed(0)}</span>
                    </div>
                </div>
                <div className="doc-stat-card">
                    <div className="stat-icon-wrap stat-navy">
                        <DollarSign size={22} color="white" />
                    </div>
                    <div className="stat-body">
                        <span className="stat-label">Categories</span>
                        <span className="stat-value">{categories.length}</span>
                    </div>
                </div>
            </div>

            {/* Services List */}
            <div className="doc-queue-section">
                <div className="section-top">
                    <div>
                        <h2>All Services</h2>
                        <p>Click edit to modify pricing</p>
                    </div>
                    <button className="q-btn q-start" onClick={() => setShowAdd(true)}>
                        <Plus size={14} /> Add Service
                    </button>
                </div>

                {/* Add New Service Form */}
                {showAdd && (
                    <div className="add-service-form">
                        <input
                            type="text"
                            placeholder="Service name"
                            value={newService.name}
                            onChange={e => setNewService({ ...newService, name: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Price ($)"
                            value={newService.price}
                            onChange={e => setNewService({ ...newService, price: e.target.value })}
                        />
                        <select value={newService.category} onChange={e => setNewService({ ...newService, category: e.target.value })}>
                            <option>Consultation</option>
                            <option>Emergency</option>
                            <option>Virtual</option>
                            <option>Procedure</option>
                        </select>
                        <button className="q-btn q-start" onClick={addService}><Save size={14} /> Save</button>
                        <button className="q-btn q-noshow" onClick={() => setShowAdd(false)}><X size={14} /> Cancel</button>
                    </div>
                )}

                {/* Service Cards */}
                <div className="queue-full-list">
                    {services.map(svc => (
                        <div key={svc.id} className="queue-card">
                            <div className="queue-patient-info" style={{ flex: 1 }}>
                                <strong>{svc.name}</strong>
                                <span>{svc.category}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {editingId === svc.id ? (
                                    <>
                                        <input
                                            type="number"
                                            value={editPrice}
                                            onChange={e => setEditPrice(e.target.value)}
                                            className="price-edit-input"
                                            style={{ width: '80px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px', fontWeight: 700 }}
                                        />
                                        <button className="q-btn q-start" onClick={() => saveEdit(svc.id)}><Save size={14} /></button>
                                        <button className="q-btn q-noshow" onClick={() => setEditingId(null)}><X size={14} /></button>
                                    </>
                                ) : (
                                    <>
                                        <span className="service-price" style={{ fontSize: '20px', fontWeight: 700 }}>₹{svc.price.toFixed(2)}</span>
                                        <button className="edit-icon-btn" onClick={() => startEdit(svc)}><Edit3 size={14} /></button>
                                        <button className="edit-icon-btn" style={{ color: '#ef4444' }} onClick={() => deleteService(svc.id)}><Trash2 size={14} /></button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ServiceManagerPage;
