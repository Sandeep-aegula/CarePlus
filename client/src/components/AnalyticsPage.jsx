import React from 'react';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import './DoctorDashboard.css';

// Premium Sample Data for Analytics Presentation
const MONTHLY_DATA = [
    { month: 'Oct', year: 2025, patients: 124, revenue: 62000 },
    { month: 'Nov', year: 2025, patients: 142, revenue: 71000 },
    { month: 'Dec', year: 2025, patients: 138, revenue: 69000 },
    { month: 'Jan', year: 2026, patients: 156, revenue: 78000 },
    { month: 'Feb', year: 2026, patients: 182, revenue: 91000 },
    { month: 'Mar', year: 2026, patients: 214, revenue: 107000 },
];

const AnalyticsPage = () => {
    const totalPatients = MONTHLY_DATA.reduce((a, d) => a + d.patients, 0);
    const totalRevenue = MONTHLY_DATA.reduce((a, d) => a + d.revenue, 0);
    const avgPatients = Math.round(totalPatients / MONTHLY_DATA.length);
    
    // Performance Metrics
    const latest = MONTHLY_DATA[MONTHLY_DATA.length - 1];
    const previous = MONTHLY_DATA[MONTHLY_DATA.length - 2];
    const patientGrowth = latest && previous ? ((latest.patients - previous.patients) / previous.patients * 100).toFixed(1) : "0.0";

    const maxPatients = Math.max(...MONTHLY_DATA.map(d => d.patients));
    const maxRevenue = Math.max(...MONTHLY_DATA.map(d => d.revenue));

    return (
        <div className="doc-dashboard">
            <div className="doc-greeting">
                <h1>Analytics & Performance</h1>
                <p>Detailed visualization of your practice metrics and growth trends</p>
            </div>

            {/* Stats Row */}
            <div className="doc-stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="doc-stat-card">
                    <div className="stat-icon-wrap stat-blue">
                        <Users size={22} color="white" />
                    </div>
                    <div className="stat-body">
                        <span className="stat-label">Total Patient Visits</span>
                        <span className="stat-value">{totalPatients}</span>
                    </div>
                    <span className="stat-badge stat-badge-blue">6 Months</span>
                </div>
                <div className="doc-stat-card">
                    <div className="stat-icon-wrap stat-green">
                        <DollarSign size={22} color="white" />
                    </div>
                    <div className="stat-body">
                        <span className="stat-label">Projected Revenue</span>
                        <span className="stat-value">₹{(totalRevenue / 1000).toFixed(1)}k</span>
                    </div>
                    <span className="stat-badge stat-badge-green">+22%</span>
                </div>
                <div className="doc-stat-card">
                    <div className="stat-icon-wrap stat-navy">
                        <Calendar size={22} color="white" />
                    </div>
                    <div className="stat-body">
                        <span className="stat-label">Monthly Average</span>
                        <span className="stat-value">{avgPatients}</span>
                    </div>
                </div>
                <div className="doc-stat-card">
                    <div className="stat-icon-wrap stat-red">
                        <TrendingUp size={22} color="white" />
                    </div>
                    <div className="stat-body">
                        <span className="stat-label">Current Growth</span>
                        <span className="stat-value" style={{ color: '#22c55e' }}>+{patientGrowth}%</span>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="doc-content-grid">
                {/* Patient Volume Chart */}
                <div className="doc-queue-section">
                    <div className="section-top">
                        <div>
                            <h2>Patient Volume Trends</h2>
                            <p>Monthly distribution of patient visits (Last 6 Months)</p>
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
                                        <span className="bar-tooltip">{d.patients} patients</span>
                                    </div>
                                </div>
                                <span className="chart-label">{d.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue Evolution Chart */}
                <div className="doc-queue-section">
                    <div className="section-top">
                        <div>
                            <h2>Revenue Evolution</h2>
                            <p>Net revenue earned from consultations and tests</p>
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

            {/* Monthly Detailed Breakdown */}
            <div className="doc-queue-section" style={{ marginTop: '24px' }}>
                <div className="section-top">
                    <div>
                        <h2>Performance Breakdown</h2>
                        <p>Aggregated monthly data for auditing and reporting</p>
                    </div>
                </div>
                <table className="analytics-table">
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Total Patients</th>
                            <th>Revenue Generated</th>
                            <th>Avg Revenue / Patient</th>
                            <th>Change Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MONTHLY_DATA.map((d, i) => {
                            const prev = i > 0 ? MONTHLY_DATA[i - 1].revenue : d.revenue;
                            const growth = ((d.revenue - prev) / prev * 100).toFixed(1);
                            const avgPerPatient = (d.revenue / d.patients);
                            return (
                                <tr key={i}>
                                    <td><strong>{d.month} {d.year}</strong></td>
                                    <td>{d.patients} Visited</td>
                                    <td>₹{d.revenue.toLocaleString()}</td>
                                    <td>₹{avgPerPatient.toFixed(0)}</td>
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
