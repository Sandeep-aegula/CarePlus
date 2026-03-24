import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FlaskConical, TestTubes, FileText, BarChart3, Upload, Settings, HelpCircle, Edit3, Plus, Eye, Printer, Calendar } from 'lucide-react';
import './LabDashboard.css';

const LabDashboard = () => {
    const userName = localStorage.getItem('userName') || 'Lab Admin';
    const [homeCollection, setHomeCollection] = useState({ cbc: true, mri: false, lipid: true });
    
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/appointments', {
                headers: { 'x-auth-token': token }
            });
            setAppointments(res.data);
        } catch (err) {
            console.error('Error fetching lab appointments', err);
        }
        setIsLoading(false);
    };

    const handleCompleteTest = async (apptId) => {
        if (fileInputRef.current) {
            fileInputRef.current.dataset.apptid = apptId;
            fileInputRef.current.click();
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
            fetchAppointments();
        } catch (err) {
            console.error("Failed to update test result", err);
            alert("Failed to send report.");
        } finally {
            setUploadingId(null);
        }
    };

    const sampleQueue = appointments.map(appt => {
        const testName = appt.tests && appt.tests.length > 0 ? appt.tests[0].name : appt.symptoms || 'General Test';
        return {
            _id: appt._id,
            id: appt._id.slice(-5).toUpperCase(),
            name: appt.patientId?.name || 'Unknown Patient',
            test: testName,
            status: appt.status === 'Pending' ? 'REQUESTED' : appt.status.toUpperCase(),
            statusColor: appt.status === 'Pending' ? 'orange' : appt.status === 'Completed' ? 'green' : 'blue',
            detail: appt.status === 'Pending' ? 'Awaiting Arrival' : 'Processing',
            time: new Date(appt.date).toLocaleDateString(),
            isCompleted: appt.status === 'Completed'
        };
    });

    const volumeData = [
        { day: 'MON', primary: 55, secondary: 35 },
        { day: 'TUE', primary: 70, secondary: 45 },
        { day: 'WED', primary: 95, secondary: 60 },
        { day: 'THU', primary: 50, secondary: 40 },
        { day: 'FRI', primary: 75, secondary: 50 },
    ];
    const maxVolume = 100;

    return (
        <div className="lab-dashboard">
            {/* Stats Row */}
            <div className="lab-stats-row">
                <div className="lab-stat-card">
                    <div className="lab-stat-info">
                        <span className="lab-stat-label">Pending Samples</span>
                        <span className="lab-stat-value">42</span>
                        <span className="lab-stat-trend trend-down">↘ 12% from yesterday</span>
                    </div>
                    <div className="lab-stat-icon stat-icon-blue">
                        <TestTubes size={22} color="white" />
                    </div>
                </div>
                <div className="lab-stat-card">
                    <div className="lab-stat-info">
                        <span className="lab-stat-label">Tests Today</span>
                        <span className="lab-stat-value">128</span>
                        <span className="lab-stat-trend trend-up">↗ 8 new bookings</span>
                    </div>
                    <div className="lab-stat-icon stat-icon-green">
                        <FlaskConical size={22} color="white" />
                    </div>
                </div>
                <div className="lab-stat-card">
                    <div className="lab-stat-info">
                        <span className="lab-stat-label">Daily Revenue</span>
                        <span className="lab-stat-value">₹84,200</span>
                        <span className="lab-stat-trend trend-up">Target: ₹1L</span>
                    </div>
                    <div className="lab-stat-icon stat-icon-navy">
                        <BarChart3 size={22} color="white" />
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="lab-main-grid">
                {/* Left: Test Catalog + Volume */}
                <div className="lab-left-col">
                    {/* Test Catalog Manager */}
                    <div className="catalog-section">
                        <div className="catalog-header">
                            <h2>Test Catalog Manager</h2>
                            <button className="add-test-btn">
                                <Plus size={16} /> Add New Test
                            </button>
                        </div>

                        <div className="catalog-table">
                            <div className="table-header">
                                <span className="th-name">TEST NAME</span>
                                <span className="th-price">PRICE (₹)</span>
                                <span className="th-tat">TAT</span>
                                <span className="th-home">HOME COLL.</span>
                                <span className="th-action">ACTION</span>
                            </div>

                            <div className="table-row">
                                <div className="test-name-cell">
                                    <div className="test-dot dot-green"></div>
                                    <span>CBC (Complete Blood Count)</span>
                                </div>
                                <span className="test-price">450</span>
                                <span className="test-tat">12 hrs</span>
                                <div className="toggle-wrap">
                                    <label className="toggle">
                                        <input type="checkbox" checked={homeCollection.cbc} onChange={() => setHomeCollection(p => ({...p, cbc: !p.cbc}))} />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                <button className="edit-btn"><Edit3 size={16} /></button>
                            </div>

                            <div className="table-row">
                                <div className="test-name-cell">
                                    <div className="test-dot dot-blue"></div>
                                    <span>MRI Whole Brain</span>
                                </div>
                                <span className="test-price">7,500</span>
                                <span className="test-tat">24 hrs</span>
                                <div className="toggle-wrap">
                                    <label className="toggle">
                                        <input type="checkbox" checked={homeCollection.mri} onChange={() => setHomeCollection(p => ({...p, mri: !p.mri}))} />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                <button className="edit-btn"><Edit3 size={16} /></button>
                            </div>

                            <div className="table-row">
                                <div className="test-name-cell">
                                    <div className="test-dot dot-purple"></div>
                                    <span>Lipid Profile</span>
                                </div>
                                <span className="test-price">1,200</span>
                                <span className="test-tat">8 hrs</span>
                                <div className="toggle-wrap">
                                    <label className="toggle">
                                        <input type="checkbox" checked={homeCollection.lipid} onChange={() => setHomeCollection(p => ({...p, lipid: !p.lipid}))} />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                <button className="edit-btn"><Edit3 size={16} /></button>
                            </div>
                        </div>

                        <button className="view-catalog-btn">VIEW FULL CATALOG (142 ITEMS)</button>
                    </div>

                    {/* Volume Trends */}
                    <div className="volume-section">
                        <div className="volume-header">
                            <h2>Volume Trends</h2>
                            <div className="volume-legend">
                                <span className="legend-dot legend-primary"></span>
                                <span className="legend-dot legend-secondary"></span>
                            </div>
                        </div>
                        <div className="volume-chart">
                            {volumeData.map((d, i) => (
                                <div key={i} className="chart-bar-group">
                                    <div className="bars">
                                        <div className="bar bar-secondary" style={{ height: `${(d.secondary / maxVolume) * 140}px` }}></div>
                                        <div className="bar bar-primary" style={{ height: `${(d.primary / maxVolume) * 140}px` }}></div>
                                    </div>
                                    <span className="bar-label">{d.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lab-right-col">
                    {/* Sample Queue */}
                    <div className="queue-section">
                        <div className="queue-header">
                            <h2>Sample Queue</h2>
                            <span className="realtime-badge">REAL-TIME</span>
                        </div>

                        <div className="queue-items">
                            {isLoading ? (
                                <p style={{ padding: '20px', color: '#64748b' }}>Loading requests...</p>
                            ) : sampleQueue.length === 0 ? (
                                <p style={{ padding: '20px', color: '#64748b' }}>No test bookings yet.</p>
                            ) : sampleQueue.map((item, i) => (
                                <div key={i} className="queue-item">
                                    <div className={`queue-line-indicator qi-${item.statusColor || 'gray'}`}></div>
                                    <div className="queue-item-info">
                                        <div className="queue-item-top">
                                            <strong>{item.name}</strong>
                                            {item.status && (
                                                <span className={`queue-status-badge qs-${item.statusColor}`}>{item.status}</span>
                                            )}
                                        </div>
                                        <span className="queue-item-meta">ID: {item.id} • {item.test}</span>
                                        <div className="queue-item-bottom">
                                            <span className={`queue-detail qd-${item.statusColor || 'gray'}`}>
                                                <span className={`status-dot sd-${item.statusColor || 'gray'}`}></span>
                                                {item.detail}
                                            </span>
                                            {item.time && <span className="queue-time">{item.time}</span>}
                                            {item.isCompleted ? (
                                                <button className="queue-action-btn">
                                                    <Printer size={12} /> Print
                                                </button>
                                            ) : (
                                                <button className="queue-action-btn" onClick={() => handleCompleteTest(item._id)} disabled={uploadingId === item._id} style={{background: '#eff6ff', color: '#3b82f6', borderColor: '#3b82f6', opacity: uploadingId === item._id ? 0.6 : 1}}>
                                                    <Upload size={12} /> {uploadingId === item._id ? 'Uploading...' : 'Upload Report'}
                                                </button>
                                            )}
                                            {item.progress && (
                                                <div className="progress-bar-wrap">
                                                    <div className="progress-bar" style={{ width: `${item.progress}%` }}></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="queue-footer">
                            <button className="view-queue-btn">View All Queue</button>
                            <button className="queue-add-btn"><Plus size={20} /></button>
                        </div>
                    </div>

                    {/* ML Insight */}
                    <div className="ml-insight-card">
                        <h3>Machine Learning Insight</h3>
                        <p>Based on current trends, CBC and Thyroid panels are expected to surge 20% by weekend. Prepare reagents accordingly.</p>
                        
                        <div className="traffic-prediction">
                            <div className="traffic-prediction-title">
                                <BarChart3 size={12} /> Predicted Traffic (Next 24h)
                            </div>
                            <div className="traffic-stats">
                                <div className="traffic-stat-item">
                                    <span className="traffic-stat-value">~ {appointments.length > 0 ? (appointments.length * 1.5).toFixed(0) : '24'}</span>
                                    <span className="traffic-stat-label">Expected Walk-ins</span>
                                </div>
                                <div className="traffic-stat-item">
                                    <span className="traffic-stat-value">High</span>
                                    <span className="traffic-stat-label">Peak: 10AM - 1PM</span>
                                </div>
                            </div>
                        </div>
                        <div className="ml-footer">
                            <div className="ml-avatars">
                                <img src="https://i.pravatar.cc/150?img=32" alt="" />
                                <img src="https://i.pravatar.cc/150?img=44" alt="" />
                                <span className="ml-more">+4</span>
                            </div>
                            <button className="order-btn">Order Reagents</button>
                        </div>
                    </div>
                </div>
            </div>
            {/* Hidden File Input for marking complete directly from dashboard */}
            <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept=".pdf,image/*" 
                onChange={(e) => {
                    handleFileChange(e, e.target.dataset.apptid);
                    e.target.value = null; // reset
                }} 
            />
        </div>
    );
};

export default LabDashboard;
