import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Users, DollarSign, Calendar, BarChart3 } from 'lucide-react';
import './DoctorDashboard.css';

const AnalyticsPage = () => {
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/stats/provider', {
                    headers: { 'x-auth-token': token }
                });
                // If no data, provide fallback for new users
                if (res.data.length === 0) {
                    setMonthlyData([
                        { month: 'Jan', patients: 0, revenue: 0 },
                        { month: 'Feb', patients: 0, revenue: 0 },
                        { month: 'Mar', patients: 0, revenue: 0 }
                    ]);
                } else {
                    setMonthlyData(res.data);
                }
            } catch (err) {
                console.error('Analytics fetch error:', err);
            }
            setLoading(false);
        };
        fetchAnalytics();
    }, []);

    const totalPatients = monthlyData.reduce((a, d) => a + d.patients, 0);
    const totalRevenue = monthlyData.reduce((a, d) => a + d.revenue, 0);
    const avgPatients = monthlyData.length > 0 ? Math.round(totalPatients / monthlyData.length) : 0;

    // Calculate growth relative to previous month
    const latest = monthlyData[monthlyData.length - 1];
    const previous = monthlyData[monthlyData.length - 2];
    const patientGrowth = (latest && previous && previous.patients > 0)
        ? ((latest.patients - previous.patients) / previous.patients * 100).toFixed(1)
        : "0.0";

    const maxPatients = Math.max(...monthlyData.map(d => d.patients), 1);
    const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);

    if (loading) return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Loading Practice Analytics...</h2>
        </div>
    );

    return (
        <div className="doc-dashboard">
            <div className="doc-greeting">
                <h1>Analytics & Performance</h1>
                <p>Track your practice growth and financial metrics in real-time</p>
            </div>

            {/* Stats Row */}
            <div className="doc-stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="doc-stat-card">
                    <div className="stat-icon-wrap stat-blue">
                        <Users size={22} color="white" />
                    </div>
                    <div className="stat-body">
                        <span className="stat-label">Total Visits</span>
                        <span className="stat-value">{totalPatients}</span>
                    </div>
                    <span className="stat-badge stat-badge-blue">Total</span>
                </div>
                <div className="doc-stat-card">
                    <div className="stat-icon-wrap stat-green">
                        <DollarSign size={22} color="white" />
                    </div>
                    <div className="stat-body">
                        <span className="stat-label">Total Revenue</span>
                        <span className="stat-value">₹{(totalRevenue / 1000).toFixed(1)}k</span>
                    </div>
                    <span className="stat-badge stat-badge-green">6 Months</span>
                </div>
                <div className="doc-stat-card">
                    <div className="stat-icon-wrap stat-navy">
                        <Calendar size={22} color="white" />
                    </div>
                    <div className="stat-body">
                        <span className="stat-label">Avg Volume/Mo</span>
                        <span className="stat-value">{avgPatients}</span>
                    </div>
                </div>
                <div className="doc-stat-card">
                    <div className="stat-icon-wrap stat-red">
                        <TrendingUp size={22} color="white" />
                    </div>
                    <div className="stat-body">
                        <span className="stat-label">Patient Growth</span>
                        <span className="stat-value" style={{ color: parseFloat(patientGrowth) >= 0 ? '#22c55e' : '#ef4444' }}>
                            {parseFloat(patientGrowth) >= 0 ? '+' : ''}{patientGrowth}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="doc-content-grid">
                {/* Patients Chart */}
                <div className="doc-queue-section">
                    <div className="section-top">
                        <div>
                            <h2>Real-time Patient Volume</h2>
                            <p>Monthly visits tracked by appointment status</p>
                        </div>
                    </div>
                    <div className="analytics-chart">
                        {monthlyData.map((d, i) => (
                            <div key={i} className="chart-bar-group">
                                <div className="chart-bar-wrapper">
                                    <div
                                        className="chart-bar bar-blue"
                                        style={{ height: `${(d.patients / maxPatients) * 100 || 5}%` }}
                                    >
                                        <span className="bar-tooltip">{d.patients} pts</span>
                                    </div>
                                </div>
                                <span className="chart-label">{d.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="doc-queue-section">
                    <div className="section-top">
                        <div>
                            <h2>Revenue Insights</h2>
                            <p>Total revenue generated from tests & consultations</p>
                        </div>
                    </div>
                    <div className="analytics-chart">
                        {monthlyData.map((d, i) => (
                            <div key={i} className="chart-bar-group">
                                <div className="chart-bar-wrapper">
                                    <div
                                        className="chart-bar bar-green"
                                        style={{ height: `${(d.revenue / maxRevenue) * 100 || 5}%` }}
                                    >
                                        <span className="bar-tooltip">₹{(d.revenue / 1000).toFixed(1)}k</span>
                                    </div>
                                </div>
                                <span className="chart-label">{d.month}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Monthly Breakdown Table */}
            <div className="doc-queue-section" style={{ marginTop: '24px' }}>
                <div className="section-top">
                    <div>
                        <h2>Detailed Performance Metrics</h2>
                        <p>Aggregated monthly breakdown of visits and revenue</p>
                    </div>
                </div>
                <table className="analytics-table">
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Visits</th>
                            <th>Revenue</th>
                            <th>Avg / Visit</th>
                            <th>Growth</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthlyData.map((d, i) => {
                            const prev = i > 0 ? monthlyData[i - 1].revenue : d.revenue;
                            const growth = prev > 0 ? ((d.revenue - prev) / prev * 100).toFixed(1) : "0.0";
                            const avgPerPatient = d.patients > 0 ? (d.revenue / d.patients).toFixed(0) : "0";
                            return (
                                <tr key={i}>
                                    <td><strong>{d.month} {d.year || 2026}</strong></td>
                                    <td>{d.patients}</td>
                                    <td>₹{d.revenue.toLocaleString()}</td>
                                    <td>₹{avgPerPatient}</td>
                                    <td>
                                        <span className={`growth-badge ${parseFloat(growth) >= 0 ? 'positive' : 'negative'}`}>
                                            {parseFloat(growth) >= 0 ? '+' : ''}{growth}%
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                        {monthlyData.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No analytical data found yet</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AnalyticsPage;
