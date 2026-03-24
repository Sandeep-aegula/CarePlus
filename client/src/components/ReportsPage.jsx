import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FileText, Download, Eye, Printer, CheckCircle, Clock, Search, Send } from 'lucide-react';
import './LabDashboard.css';

const statusConfig = {
    pending_review: { label: 'Pending Review', color: '#d97706', bg: '#fef3c7', icon: Clock },
    verified: { label: 'Verified', color: '#16a34a', bg: '#dcfce7', icon: CheckCircle },
    dispatched: { label: 'Dispatched', color: '#3b82f6', bg: '#dbeafe', icon: Send },
};

const flagConfig = {
    normal: { label: 'Normal', bg: '#dcfce7', color: '#16a34a' },
    high: { label: 'High', bg: '#fee2e2', color: '#dc2626' },
    low: { label: 'Low', bg: '#fef3c7', color: '#d97706' },
};

const ReportsPage = () => {
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef(null);
    const [uploadingId, setUploadingId] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/appointments', {
                    headers: { 'x-auth-token': token }
                });
                
                // Keep only appointments that are far along enough to have a report
                const validAppts = res.data.filter(a => a.status === 'Processing' || a.status === 'Completed' || a.report);
                const mapped = validAppts.map(appt => {
                    const testName = appt.tests && appt.tests.length > 0 ? appt.tests[0].name : appt.symptoms || 'General Test';
                    return {
                        _id: appt._id,
                        id: 'RPT-' + appt._id.slice(-4).toUpperCase(),
                        sampleId: '#' + appt._id.slice(-5).toUpperCase(),
                        patient: appt.patientId?.name || 'Unknown',
                        test: testName,
                        result: appt.report || 'Pending Upload',
                        refRange: '-',
                        status: appt.status === 'Completed' ? 'dispatched' : 'pending_review',
                        date: new Date(appt.date).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }),
                        flag: 'normal',
                        reportUrl: appt.report
                    };
                });
                setReports(mapped);
            } catch (err) {
                console.error('Error fetching reports API', err);
            }
            setLoading(false);
        };
        fetchReports();
    }, []);

    const filtered = reports
        .filter(r => filter === 'all' || r.status === filter)
        .filter(r => r.patient.toLowerCase().includes(searchTerm.toLowerCase()) || r.test.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.includes(searchTerm));

    const counts = {
        all: reports.length,
        pending_review: reports.filter(r => r.status === 'pending_review').length,
        verified: reports.filter(r => r.status === 'verified').length,
        dispatched: reports.filter(r => r.status === 'dispatched').length,
    };

    const handleUploadReport = async (apptId) => {
        const url = window.prompt("Enter Report URL or PDF Link to upload:", "https://careplus-labs.s3.amazonaws.com/mock-report.pdf");
        if (!url) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(`/appointments/update/${apptId}`, {
                status: 'Completed', // Advancing status directly to completed when uploaded from here
                report: url
            }, {
                headers: { 'x-auth-token': token }
            });
            
            // Re-fetch
            const res = await axios.get('/appointments', { headers: { 'x-auth-token': token } });
            const validAppts = res.data.filter(a => a.status === 'Processing' || a.status === 'Completed' || a.report);
            const mapped = validAppts.map(appt => ({
                 _id: appt._id,
                 id: 'RPT-' + appt._id.slice(-4).toUpperCase(),
                 sampleId: '#' + appt._id.slice(-5).toUpperCase(),
                 patient: appt.patientId?.name || 'Unknown',
                 test: appt.tests && appt.tests.length > 0 ? appt.tests[0].name : appt.symptoms || 'General Test',
                 result: appt.report || 'Pending Upload',
                 refRange: '-',
                 status: appt.status === 'Completed' ? 'dispatched' : 'pending_review',
                 date: new Date(appt.date).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }),
                 flag: 'normal',
                 reportUrl: appt.report
            }));
            setReports(mapped);
        } catch (err) {
            console.error("Failed to upload report result", err);
            alert("Failed to upload report.");
        }
    };

    const handleFileChange = async (e, apptId) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploadingId(apptId);
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('reportFile', file);

            await axios.post(`/appointments/${apptId}/upload-report`, formData, {
                headers: { 
                    'x-auth-token': token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            // Re-fetch
            const res = await axios.get('/appointments', { headers: { 'x-auth-token': token } });
            const validAppts = res.data.filter(a => a.status === 'Processing' || a.status === 'Completed' || a.report);
            const mapped = validAppts.map(appt => ({
                 _id: appt._id,
                 id: 'RPT-' + appt._id.slice(-4).toUpperCase(),
                 sampleId: '#' + appt._id.slice(-5).toUpperCase(),
                 patient: appt.patientId?.name || 'Unknown',
                 test: appt.tests && appt.tests.length > 0 ? appt.tests[0].name : appt.symptoms || 'General Test',
                 result: appt.report || 'Pending Upload',
                 refRange: '-',
                 status: appt.status === 'Completed' ? 'dispatched' : 'pending_review',
                 date: new Date(appt.date).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }),
                 flag: 'normal',
                 reportUrl: appt.report
            }));
            setReports(mapped);
        } catch (err) {
            console.error("Failed to upload report file", err);
            alert("Failed to upload report file.");
        } finally {
            setUploadingId(null);
        }
    };

    const triggerFileInput = (apptId) => {
        // Set a custom attribute on the file input so we know which report is being uploaded
        if (fileInputRef.current) {
            fileInputRef.current.dataset.apptid = apptId;
            fileInputRef.current.click();
        }
    };

    return (
        <div className="lab-dashboard">
            <div className="lab-page-header">
                <h1>Reports</h1>
                <p>Review, verify, and dispatch diagnostic reports</p>
            </div>

            {/* Stats */}
            <div className="lab-stats-row">
                <div className="lab-stat-card">
                    <div className="lab-stat-info">
                        <span className="lab-stat-label">Total Reports</span>
                        <span className="lab-stat-value">{counts.all}</span>
                    </div>
                    <div className="lab-stat-icon stat-icon-navy">
                        <FileText size={22} color="white" />
                    </div>
                </div>
                <div className="lab-stat-card">
                    <div className="lab-stat-info">
                        <span className="lab-stat-label">Pending Review</span>
                        <span className="lab-stat-value">{counts.pending_review}</span>
                    </div>
                    <div className="lab-stat-icon stat-icon-amber">
                        <Clock size={22} color="white" />
                    </div>
                </div>
                <div className="lab-stat-card">
                    <div className="lab-stat-info">
                        <span className="lab-stat-label">Verified</span>
                        <span className="lab-stat-value">{counts.verified}</span>
                    </div>
                    <div className="lab-stat-icon stat-icon-green">
                        <CheckCircle size={22} color="white" />
                    </div>
                </div>
                <div className="lab-stat-card">
                    <div className="lab-stat-info">
                        <span className="lab-stat-label">Dispatched</span>
                        <span className="lab-stat-value">{counts.dispatched}</span>
                    </div>
                    <div className="lab-stat-icon stat-icon-blue">
                        <Send size={22} color="white" />
                    </div>
                </div>
            </div>

            {/* Search + Filters */}
            <div className="samples-toolbar">
                <div className="samples-search">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search by patient, test, or report ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="samples-filters">
                    {[['all', 'All'], ['pending_review', 'Pending Review'], ['verified', 'Verified'], ['dispatched', 'Dispatched']].map(([key, label]) => (
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

            {/* Reports Table */}
            <div className="samples-table-wrap">
                <table className="samples-table">
                    <thead>
                        <tr>
                            <th>Report ID</th>
                            <th>Patient</th>
                            <th>Test</th>
                            <th>Result</th>
                            <th>Ref. Range</th>
                            <th>Flag</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && reports.length === 0 ? (
                            <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading reports...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No reports found</td></tr>
                        ) : (
                            filtered.map(report => {
                                const sc = statusConfig[report.status];
                                const fc = flagConfig[report.flag];
                                const StatusIcon = sc.icon;
                                return (
                                    <tr key={report.id}>
                                        <td><strong>{report.id}</strong></td>
                                        <td>{report.patient}</td>
                                        <td>{report.test}</td>
                                        <td><strong>{report.result}</strong></td>
                                        <td style={{ fontSize: '12px', color: '#64748b' }}>{report.refRange}</td>
                                        <td>
                                            <span className="priority-badge" style={{ background: fc.bg, color: fc.color }}>
                                                {fc.label}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="status-badge" style={{ background: sc.bg, color: sc.color }}>
                                                <StatusIcon size={12} /> {sc.label}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '12px', color: '#64748b' }}>{report.date}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {report.reportUrl && report.reportUrl.startsWith('http') ? (
                                                    <button className="report-action-btn" title="View Report" onClick={() => window.open(report.reportUrl, '_blank')}><Eye size={14} /></button>
                                                ) : (
                                                    <button 
                                                        className="report-action-btn" 
                                                        title="Upload Report" 
                                                        onClick={() => triggerFileInput(report._id)} 
                                                        disabled={uploadingId === report._id}
                                                        style={{ color: '#3b82f6', borderColor: '#3b82f6', background: '#eff6ff', padding: '0 8px', fontSize: '11px', fontWeight: '500', width: 'auto', opacity: uploadingId === report._id ? 0.6 : 1 }}
                                                    >
                                                        {uploadingId === report._id ? 'Uploading...' : 'Upload PDF'}
                                                    </button>
                                                )}
                                                <button className="report-action-btn" title="Print"><Printer size={14} /></button>
                                                <button className="report-action-btn" title="Download"><Download size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Hidden File Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept=".pdf,image/*" 
                onChange={(e) => handleFileChange(e, e.target.dataset.apptid)} 
            />
        </div>
    );
};

export default ReportsPage;
