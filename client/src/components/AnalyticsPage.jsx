import React from 'react';
import { TrendingUp, Users, DollarSign, Calendar, BarChart3 } from 'lucide-react';
import './DoctorDashboard.css';

const MONTHLY_DATA = [
    { month: 'Jan', patients: 45, revenue: 5400 },
    { month: 'Feb', patients: 52, revenue: 6240 },
    { month: 'Mar', patients: 48, revenue: 5760 },
    { month: 'Apr', patients: 61, revenue: 7320 },
    { month: 'May', patients: 55, revenue: 6600 },
    { month: 'Jun', patients: 67, revenue: 8040 },
];

const maxPatients = Math.max(...MONTHLY_DATA.map(d => d.patients));
const maxRevenue = Math.max(...MONTHLY_DATA.map(d => d.revenue));

const AnalyticsPage = () => {
    const totalPatients = MONTHLY_DATA.reduce((a, d) => a + d.patients, 0);
    const totalRevenue = MONTHLY_DATA.reduce((a, d) => a + d.revenue, 0);
    const avgPatients = Math.round(totalPatients / MONTHLY_DATA.length);

    return (
        <div className="doc-dashboard">
            <div className="doc-greeting">
                <h1>Analytics</h1>
                <p>Track your practice performance and growth metrics</p>
            </div>

            {/* Stats */}
            <div className="doc-stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="doc-stat-card">
                    <div className="stat-icon-wrap stat-blue">
                        <Users size={22} color="white" />
                    </div>
                    <div className="stat-body">
                        <span className="stat-label">Total Patients (6mo)</span>
                        <span className="stat-value">{totalPatients}</span>
                    </div>
                    <span className="stat-badge stat-badge-blue">+18%</span>
                </div>
                <div className="doc-stat-card">
                    <div className="stat-icon-wrap stat-green">
                        <DollarSign size={22} color="white" />
                    </div>
                    <div className="stat-body">
                        <span className="stat-label">Total Revenue</span>
                        <span className="stat-value">₹{(totalRevenue / 1000).toFixed(1)}k</span>
                    </div>
                    <span className="stat-badge stat-badge-green">+22%</span>
                </div>
                <div className="doc-stat-card">
                    <div className="stat-icon-wrap stat-navy">
                        <Calendar size={22} color="white" />
                    </div>
                    <div className="stat-body">
                        <span className="stat-label">Avg Patients/Month</span>
                        <span className="stat-value">{avgPatients}</span>
                    </div>
                </div>
                <div className="doc-stat-card">
                    <div className="stat-icon-wrap stat-red">
                        <TrendingUp size={22} color="white" />
                    </div>
                    <div className="stat-body">
                        <span className="stat-label">Growth Rate</span>
                        <span className="stat-value" style={{ color: '#22c55e' }}>+22%</span>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="doc-content-grid">
                {/* Patients Chart */}
                <div className="doc-queue-section">
                    <div className="section-top">
                        <div>
                            <h2>Patient Volume</h2>
                            <p>Monthly patient visits over 6 months</p>
                        </div>
                    </div>
                    <div className="analytics-chart">
                        {MONTHLY_DATA.map((d, i) => (
                            <div key={i} className="chart-bar-group">
                                <div className="chart-bar-wrapper">
                                    <div
                                        className="chart-bar bar-blue"
                                        style={{ height: `${(d.patients / maxPatients) * 100}%` }}
                                    >
                                        <span className="bar-tooltip">{d.patients}</span>
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
                            <h2>Revenue</h2>
                            <p>Monthly revenue trends</p>
                        </div>
                    </div>
                    <div className="analytics-chart">
                        {MONTHLY_DATA.map((d, i) => (
                            <div key={i} className="chart-bar-group">
                                <div className="chart-bar-wrapper">
                                    <div
                                        className="chart-bar bar-green"
                                        style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
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
                        <h2>Monthly Breakdown</h2>
                        <p>Detailed performance data</p>
                    </div>
                </div>
                <table className="analytics-table">
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Patients</th>
                            <th>Revenue</th>
                            <th>Avg per Patient</th>
                            <th>Growth</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MONTHLY_DATA.map((d, i) => {
                            const prevRevenue = i > 0 ? MONTHLY_DATA[i - 1].revenue : d.revenue;
                            const growth = ((d.revenue - prevRevenue) / prevRevenue * 100).toFixed(1);
                            return (
                                <tr key={i}>
                                    <td><strong>{d.month} 2026</strong></td>
                                    <td>{d.patients}</td>
                                    <td>₹{d.revenue.toLocaleString()}</td>
                                    <td>₹{(d.revenue / d.patients).toFixed(0)}</td>
                                    <td>
                                        <span className={`growth-badge ${parseFloat(growth) >= 0 ? 'positive' : 'negative'}`}>
                                            {parseFloat(growth) >= 0 ? '+' : ''}{growth}%
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AnalyticsPage;
