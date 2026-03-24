import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import './DoctorDashboard.css';

const ReviewsPage = () => {
    const userName = localStorage.getItem('userName');
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ avgRating: 0, total: 0, fiveStar: 0 });

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/doctor/profile', {
                    headers: { 'x-auth-token': token }
                });
                if (res.data && res.data.reviews) {
                    const revs = res.data.reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setReviews(revs);
                    const avg = res.data.averageRating || 0;
                    const tot = res.data.totalReviews || 0;
                    const five = revs.filter(r => r.rating === 5).length;
                    setStats({ avgRating: avg.toFixed(1), total: tot, fiveStar: five });
                }
            } catch (err) {
                console.error('Error fetching reviews:', err);
            }
        };
        fetchReviews();
    }, []);

    return (
        <div className="doc-dashboard">
            <div className="doc-greeting">
                <h1>Patient Reviews</h1>
                <p>See what your patients are saying about your care</p>
            </div>

            {/* Stats */}
            <div className="doc-stats-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="doc-stat-card">
                    <div className="stat-icon-wrap stat-green">
                        <Star size={22} color="white" />
                    </div>
                    <div className="stat-body">
                        <span className="stat-label">Average Rating</span>
                        <span className="stat-value">{stats.avgRating}<small> / 5.0</small></span>
                    </div>
                    <span className="stat-badge stat-badge-green">TOP RATED</span>
                </div>
                <div className="doc-stat-card">
                    <div className="stat-icon-wrap stat-blue">
                        <MessageSquare size={22} color="white" />
                    </div>
                    <div className="stat-body">
                        <span className="stat-label">Total Reviews</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                </div>
                <div className="doc-stat-card">
                    <div className="stat-icon-wrap stat-navy">
                        <Star size={22} color="white" />
                    </div>
                    <div className="stat-body">
                        <span className="stat-label">5-Star Reviews</span>
                        <span className="stat-value">{stats.fiveStar}</span>
                    </div>
                </div>
                <div className="doc-stat-card">
                    <div className="stat-icon-wrap stat-red">
                        <ThumbsUp size={22} color="white" />
                    </div>
                    <div className="stat-body">
                        <span className="stat-label">Helpful Votes</span>
                        <span className="stat-value">0</span>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="doc-queue-section">
                <div className="section-top">
                    <div>
                        <h2>All Reviews</h2>
                        <p>Patient feedback for Dr. {userName}</p>
                    </div>
                </div>

                <div className="queue-full-list">
                    {reviews.length === 0 ? (
                        <div style={{ padding: '20px', color: '#64748b' }}>No reviews yet.</div>
                    ) : (
                        reviews.map((review, i) => (
                            <div key={review._id || i} className="queue-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className="queue-avatar">
                                            {(review.patientName || 'Anonymous').trim().charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <strong style={{ fontSize: '14px', color: '#0f172a' }}>{review.patientName || 'Anonymous Patient'}</strong>
                                            <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                                                {[...Array(5)].map((_, j) => (
                                                    <Star key={j} size={14} fill={j < review.rating ? '#facc15' : '#e2e8f0'} color={j < review.rating ? '#facc15' : '#e2e8f0'} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(review.date).toLocaleDateString()}</span>
                                </div>
                                {review.comment && (
                                    <p style={{ fontSize: '14px', color: '#334155', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
                                        "{review.comment}"
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewsPage;
