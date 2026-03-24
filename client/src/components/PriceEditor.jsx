import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Save, Trash2, Edit3, X, Check, FlaskConical } from 'lucide-react';
import './PriceEditor.css';

const PriceEditor = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editData, setEditData] = useState({});
    const [showAdd, setShowAdd] = useState(false);
    const [newService, setNewService] = useState({ name: '', price: '', tat: '', homeCollection: false });
    const [saveMsg, setSaveMsg] = useState('');

    const token = localStorage.getItem('token');
    const headers = { 'x-auth-token': token };

    useEffect(() => {
        fetchCatalog();
    }, []);

    const fetchCatalog = async () => {
        try {
            const res = await axios.get('/api/testcenter/catalog', { headers });
            setServices(res.data.services || []);
        } catch (err) {
            console.error('Failed to fetch catalog:', err);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (index) => {
        setEditingIndex(index);
        setEditData({ ...services[index] });
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setEditData({});
    };

    const saveEdit = async () => {
        try {
            await axios.patch('/api/testcenter/catalog', {
                serviceName: editData.name,
                price: Number(editData.price),
                tat: editData.tat,
                homeCollection: editData.homeCollection
            }, { headers });

            const updated = [...services];
            updated[editingIndex] = editData;
            setServices(updated);
            setEditingIndex(null);
            showMessage('Price updated!');
        } catch (err) {
            console.error('Update failed:', err);
        }
    };

    const addService = async () => {
        if (!newService.name || !newService.price) return;
        try {
            const res = await axios.patch('/api/testcenter/catalog', {
                serviceName: newService.name,
                price: Number(newService.price),
                tat: newService.tat,
                homeCollection: newService.homeCollection
            }, { headers });

            setServices(res.data.services);
            setNewService({ name: '', price: '', tat: '', homeCollection: false });
            setShowAdd(false);
            showMessage('Test added to catalog!');
        } catch (err) {
            console.error('Add failed:', err);
        }
    };

    const deleteService = async (serviceName) => {
        try {
            const res = await axios.delete(`/api/testcenter/catalog/${encodeURIComponent(serviceName)}`, { headers });
            setServices(res.data.services);
            showMessage('Test removed from catalog');
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const showMessage = (msg) => {
        setSaveMsg(msg);
        setTimeout(() => setSaveMsg(''), 3000);
    };

    if (loading) {
        return <div className="pe-loading">Loading catalog...</div>;
    }

    return (
        <div className="price-editor">
            <div className="pe-header">
                <div>
                    <h2>Test Catalog Manager</h2>
                    <p>{services.length} tests in your catalog</p>
                </div>
                <button className="pe-add-btn" onClick={() => setShowAdd(true)}>
                    <Plus size={16} /> Add New Test
                </button>
            </div>

            {saveMsg && <div className="pe-save-msg">{saveMsg}</div>}

            {/* Add New Test Form */}
            {showAdd && (
                <div className="pe-add-form">
                    <h3>Add New Test</h3>
                    <div className="pe-add-fields">
                        <input
                            type="text"
                            placeholder="Test Name (e.g., Vitamin D)"
                            value={newService.name}
                            onChange={e => setNewService({...newService, name: e.target.value})}
                        />
                        <input
                            type="number"
                            placeholder="Price (₹)"
                            value={newService.price}
                            onChange={e => setNewService({...newService, price: e.target.value})}
                        />
                        <input
                            type="text"
                            placeholder="TAT (e.g., 12 hrs)"
                            value={newService.tat}
                            onChange={e => setNewService({...newService, tat: e.target.value})}
                        />
                        <label className="pe-checkbox">
                            <input
                                type="checkbox"
                                checked={newService.homeCollection}
                                onChange={e => setNewService({...newService, homeCollection: e.target.checked})}
                            />
                            Home Collection
                        </label>
                    </div>
                    <div className="pe-add-actions">
                        <button className="pe-save" onClick={addService}><Check size={14} /> Add Test</button>
                        <button className="pe-cancel" onClick={() => setShowAdd(false)}><X size={14} /> Cancel</button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="pe-table">
                <div className="pe-table-header">
                    <span className="pe-col-name">TEST NAME</span>
                    <span className="pe-col-price">PRICE (₹)</span>
                    <span className="pe-col-tat">TAT</span>
                    <span className="pe-col-home">HOME COLL.</span>
                    <span className="pe-col-action">ACTIONS</span>
                </div>

                {services.length === 0 && (
                    <div className="pe-empty">
                        <FlaskConical size={32} color="#94a3b8" />
                        <p>No tests in your catalog yet. Add your first test!</p>
                    </div>
                )}

                {services.map((s, i) => (
                    <div key={i} className={`pe-table-row ${editingIndex === i ? 'editing' : ''}`}>
                        {editingIndex === i ? (
                            <>
                                <input
                                    className="pe-edit-input name"
                                    value={editData.name}
                                    onChange={e => setEditData({...editData, name: e.target.value})}
                                />
                                <input
                                    className="pe-edit-input price"
                                    type="number"
                                    value={editData.price}
                                    onChange={e => setEditData({...editData, price: e.target.value})}
                                />
                                <input
                                    className="pe-edit-input tat"
                                    value={editData.tat || ''}
                                    onChange={e => setEditData({...editData, tat: e.target.value})}
                                />
                                <label className="pe-toggle-wrap">
                                    <input
                                        type="checkbox"
                                        checked={editData.homeCollection || false}
                                        onChange={e => setEditData({...editData, homeCollection: e.target.checked})}
                                    />
                                </label>
                                <div className="pe-row-actions">
                                    <button className="pe-icon-btn save" onClick={saveEdit}><Check size={16} /></button>
                                    <button className="pe-icon-btn cancel" onClick={cancelEdit}><X size={16} /></button>
                                </div>
                            </>
                        ) : (
                            <>
                                <span className="pe-col-name">{s.name}</span>
                                <span className="pe-col-price pe-price-value">₹{s.price?.toLocaleString()}</span>
                                <span className="pe-col-tat">{s.tat || '—'}</span>
                                <span className="pe-col-home">{s.homeCollection ? '✅' : '—'}</span>
                                <div className="pe-row-actions">
                                    <button className="pe-icon-btn edit" onClick={() => startEdit(i)}>
                                        <Edit3 size={16} />
                                    </button>
                                    <button className="pe-icon-btn delete" onClick={() => deleteService(s.name)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PriceEditor;
