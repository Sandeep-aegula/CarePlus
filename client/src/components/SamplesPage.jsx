import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { TestTubes, Clock, CheckCircle, AlertCircle, Search, ArrowRight, ChevronDown } from 'lucide-react';
import './LabDashboard.css';

const statusFlow = ['awaiting', 'collected', 'processing', 'completed'];

const statusConfig = {
    awaiting: { label: 'Awaiting', color: '#d97706', bg: '#fef3c7', icon: Clock, nextLabel: 'Mark Collected' },
    collected: { label: 'Collected', color: '#3b82f6', bg: '#dbeafe', icon: TestTubes, nextLabel: 'Start Processing' },
    processing: { label: 'Processing', color: '#8b5cf6', bg: '#ede9fe', icon: AlertCircle, nextLabel: 'Mark Completed' },
    completed: { label: 'Completed', color: '#16a34a', bg: '#dcfce7', icon: CheckCircle, nextLabel: null },
};

const priorityConfig = {
    critical: { label: 'CRITICAL', bg: '#fee2e2', color: '#dc2626' },
    urgent: { label: 'URGENT', bg: '#fef3c7', color: '#d97706' },
    standard: { label: 'STANDARD', bg: '#f1f5f9', color: '#64748b' },
};

const SamplesPage = () => {
    const [samples, setSamples] = useState([]);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [updatedId, setUpdatedId] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchSamples();
    }, []);

    const fetchSamples = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/appointments', {
                headers: { 'x-auth-token': token }
            });
            const mapped = res.data.map(appt => {
                let mappedStatus = appt.status.toLowerCase();
                if (mappedStatus === 'pending') mappedStatus = 'awaiting';
                // Fallback for unexpected statuses so it doesn't crash the flow
                if (!statusConfig[mappedStatus]) {
                    if (mappedStatus === 'confirmed') mappedStatus = 'awaiting';
                    else mappedStatus = 'completed';
                }

                return {
                    _id: appt._id,
                    id: appt._id.slice(-5).toUpperCase(),
                    name: appt.patientId?.name || 'Unknown Patient',
                    test: appt.tests && appt.tests.length > 0 ? appt.tests[0].name : appt.symptoms || 'General Test',
                    type: 'Blood', 
                    status: mappedStatus,
                    collectedAt: new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    priority: 'standard'
                };
            });
            setSamples(mapped);
        } catch (err) {
            console.error('Error fetching samples', err);
        }
        setLoading(false);
    };

    const handleUpdateStatus = async (sampleId, newStatus, optionalFile = null) => {
        const sample = samples.find(s => s.id === sampleId);
        if (!sample) return;
        
        if (newStatus === 'completed' && !optionalFile) {
            // Trigger file input instead of prompt
            if (fileInputRef.current) {
                fileInputRef.current.dataset.sampleid = sampleId;
                fileInputRef.current.click();
            }
            return;
        }

        // Map it back to backend schema standard
        let backendStatus = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        if (newStatus === 'awaiting') backendStatus = 'Pending';
        
        setUpdatedId(sampleId);
        
        try {
            const token = localStorage.getItem('token');

            if (optionalFile) {
                const formData = new FormData();
                formData.append('reportFile', optionalFile);
                await axios.post(`/appointments/${sample._id}/upload-report`, formData, {
                    headers: { 
                        'x-auth-token': token,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await axios.post(`/appointments/update/${sample._id}`, {
                    status: backendStatus
                }, {
                    headers: { 'x-auth-token': token }
                });
            }
            
            fetchSamples();
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update sample status");
        }
        setTimeout(() => setUpdatedId(null), 2000);
    };

    const handleFileChange = (e, sampleId) => {
         const file = e.target.files[0];
         if (!file) return;
         handleUpdateStatus(sampleId, 'completed', file);
    };

    const advanceStatus = (sampleId) => {
        const sample = samples.find(s => s.id === sampleId);
        if (!sample) return;
        
        const currentIndex = statusFlow.indexOf(sample.status);
        if (currentIndex < statusFlow.length - 1) {
            handleUpdateStatus(sampleId, statusFlow[currentIndex + 1]);
        }
    };

    const setStatus = (sampleId, newStatus) => {
        setOpenDropdown(null);
        handleUpdateStatus(sampleId, newStatus);
    };

    const filtered = samples
        .filter(s => filter === 'all' || s.status === filter)
        .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.test.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.includes(searchTerm));

    const counts = {
        all: samples.length,
        awaiting: samples.filter(s => s.status === 'awaiting').length,
        collected: samples.filter(s => s.status === 'collected').length,
        processing: samples.filter(s => s.status === 'processing').length,
        completed: samples.filter(s => s.status === 'completed').length,
    };

    return (
        <div className="lab-dashboard">
            <div className="lab-page-header">
                <h1>Sample Management</h1>
                <p>Track and manage all diagnostic samples in real-time. Update status as samples progress.</p>
            </div>

            {/* Status Flow Indicator */}
            <div className="status-flow-bar">
                <div className="flow-step">
                    <div className="flow-icon" style={{ background: '#fef3c7' }}><Clock size={16} color="#d97706" /></div>
                    <div className="flow-info">
                        <strong>{counts.awaiting}</strong>
                        <span>Awaiting</span>
                    </div>
                </div>
                <ArrowRight size={16} className="flow-arrow" />
                <div className="flow-step">
                    <div className="flow-icon" style={{ background: '#dbeafe' }}><TestTubes size={16} color="#3b82f6" /></div>
                    <div className="flow-info">
                        <strong>{counts.collected}</strong>
                        <span>Collected</span>
                    </div>
                </div>
                <ArrowRight size={16} className="flow-arrow" />
                <div className="flow-step">
                    <div className="flow-icon" style={{ background: '#ede9fe' }}><AlertCircle size={16} color="#8b5cf6" /></div>
                    <div className="flow-info">
                        <strong>{counts.processing}</strong>
                        <span>Processing</span>
                    </div>
                </div>
                <ArrowRight size={16} className="flow-arrow" />
                <div className="flow-step">
                    <div className="flow-icon" style={{ background: '#dcfce7' }}><CheckCircle size={16} color="#16a34a" /></div>
                    <div className="flow-info">
                        <strong>{counts.completed}</strong>
                        <span>Completed</span>
                    </div>
                </div>
            </div>

            {/* Search + Filters */}
            <div className="samples-toolbar">
                <div className="samples-search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search by name, test, or ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="samples-filters">
                    {Object.entries({ all: 'All', ...Object.fromEntries(Object.entries(statusConfig).map(([k, v]) => [k, v.label])) }).map(([key, label]) => (
                        <button
                            key={key}
                            className={`sample-filter-pill ${filter === key ? 'active' : ''}`}
                            onClick={() => setFilter(key)}
                        >
                            {label} <span className="pill-count">({counts[key]})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Sample Table */}
            <div className="samples-table-wrap">
                <table className="samples-table">
                    <thead>
                        <tr>
                            <th>Sample ID</th>
                            <th>Patient</th>
                            <th>Test</th>
                            <th>Type</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Time</th>
                            <th>Update Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && samples.length === 0 ? (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading samples...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No samples found</td></tr>
                        ) : (
                            filtered.map(sample => {
                                const sc = statusConfig[sample.status];
                                const pc = priorityConfig[sample.priority];
                                const StatusIcon = sc.icon;
                                const isUpdated = updatedId === sample.id;
                                return (
                                    <tr key={sample.id} className={isUpdated ? 'row-updated' : ''}>
                                        <td><strong>{sample.id}</strong></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div className="sample-avatar">
                                                    {sample.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                {sample.name}
                                            </div>
                                        </td>
                                        <td>{sample.test}</td>
                                        <td><span className="sample-type-badge">{sample.type}</span></td>
                                        <td>
                                            <span className="priority-badge" style={{ background: pc.bg, color: pc.color }}>
                                                {pc.label}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="status-badge" style={{ background: sc.bg, color: sc.color }}>
                                                <StatusIcon size={12} /> {sc.label}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '12px', color: '#64748b' }}>{sample.collectedAt}</td>
                                        <td>
                                            <div className="status-update-cell">
                                                {/* Quick advance button */}
                                                {sc.nextLabel ? (
                                                    <button
                                                        className="status-advance-btn"
                                                        onClick={() => advanceStatus(sample.id)}
                                                        disabled={isUpdated}
                                                        style={{
                                                            background: statusConfig[statusFlow[statusFlow.indexOf(sample.status) + 1]]?.bg,
                                                            color: statusConfig[statusFlow[statusFlow.indexOf(sample.status) + 1]]?.color,
                                                            borderColor: statusConfig[statusFlow[statusFlow.indexOf(sample.status) + 1]]?.color + '40',
                                                            opacity: isUpdated ? 0.5 : 1
                                                        }}
                                                    >
                                                        <ArrowRight size={12} />
                                                        {sc.nextLabel}
                                                    </button>
                                                ) : (
                                                    <span className="status-done-label">✓ Done</span>
                                                )}

                                                {/* Dropdown to set any status */}
                                                <div className="status-dropdown-wrap">
                                                    <button
                                                        className="status-dropdown-trigger"
                                                        onClick={() => setOpenDropdown(openDropdown === sample.id ? null : sample.id)}
                                                        disabled={isUpdated}
                                                    >
                                                        <ChevronDown size={14} />
                                                    </button>
                                                    {openDropdown === sample.id && (
                                                        <div className="status-dropdown-menu">
                                                            {statusFlow.map(st => (
                                                                <button
                                                                    key={st}
                                                                    className={`status-dropdown-item ${sample.status === st ? 'current' : ''}`}
                                                                    onClick={() => setStatus(sample.id, st)}
                                                                    disabled={sample.status === st}
                                                                >
                                                                    <span className="sdi-dot" style={{ background: statusConfig[st].color }}></span>
                                                                    {statusConfig[st].label}
                                                                    {sample.status === st && <span className="sdi-current">Current</span>}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Hidden File Input for Marking Completed */}
            <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept=".pdf,image/*" 
                onChange={(e) => {
                    handleFileChange(e, e.target.dataset.sampleid);
                    // clear value so same file can trigger change again if needed
                    e.target.value = null;
                }} 
            />
        </div>
    );
};

export default SamplesPage;
