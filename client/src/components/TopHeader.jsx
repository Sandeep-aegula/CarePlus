import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, User, Menu, LogOut, ShieldCheck, Calendar, Clock, CheckCircle, Users, Star, TestTubes, FileText } from 'lucide-react';
import './TopHeader.css';

const TopHeader = ({ role, onMenuClick, onLogout }) => {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const isDoctor = role === 'doctor';
  const isLab = role === 'lab';
  const userName = localStorage.getItem('userName') || 'User';

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/auth/me', {
        headers: { 'x-auth-token': token }
      });
      setProfileData(res.data);
    } catch (err) {
      console.error('Error fetching profile', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/notifications', {
        headers: { 'x-auth-token': token }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    if (showProfile && !profileData) {
      fetchProfile();
    }
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, [showProfile, profileData]);

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/notifications/${id}/read`, {}, {
        headers: { 'x-auth-token': token }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadAll = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/notifications/read-all', {}, {
        headers: { 'x-auth-token': token }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const userEmail = profileData?.email || `${userName.toLowerCase().replace(/\s/g, '.')}@careplus.me`;
  const memberSince = profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Oct 2023';
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'appointment': return { icon: <Calendar size={16} />, class: 'blue' };
      case 'report': return { icon: <CheckCircle size={16} />, class: 'green' };
      case 'review': return { icon: <Star size={16} />, class: 'amber' };
      default: return { icon: <Bell size={16} />, class: 'blue' };
    }
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <button className="menu-btn" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        {isLab && (
          <div className="lab-status-indicator">
            <span className="lab-status-dot"></span>
            <span className="lab-status-text">LAB STATUS:<br /><strong>OPERATIONAL</strong></span>
          </div>
        )}
        {isLab && (
          <div className="daily-summary-label">
            <span>Daily</span>
            <strong>Summary</strong>
          </div>
        )}
      </div>

      <div className="header-right">
        {(isDoctor || isLab) && (
          <div className="live-status">
            <span className="live-dot"></span>
            Live Status: Online
          </div>
        )}
        
        <div className="notif-wrapper" style={{ position: 'relative' }}>
          <div className="notification-bell" onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}>
            <Bell size={24} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </div>

          {showNotif && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <h3>Notifications</h3>
                <span onClick={handleReadAll}>Mark all as read</span>
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <Bell size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                    <p>No new notifications</p>
                  </div>
                ) : (
                  notifications.map(n => {
                    const iconConfig = getNotifIcon(n.type);
                    return (
                      <div key={n._id} className={`notif-item ${!n.isRead ? 'unread' : ''}`} onClick={() => handleMarkAsRead(n._id)}>
                        <div className={`notif-icon-box ${iconConfig.class}`}>{iconConfig.icon}</div>
                        <div className="notif-content">
                          <p><strong>{n.title}</strong>: {n.message}</p>
                          <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="notif-footer">View All Notifications</div>
            </div>
          )}
        </div>

        {isDoctor && (
          <button className="checkins-btn">Check-ins (12)</button>
        )}
        
        <div className="profile-wrapper" style={{ position: 'relative' }}>
          <div className="user-profile" onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}>
            <div className="avatar-circle">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>

          {showProfile && (
            <div className="profile-popup-card">
              <div className="profile-top-avatar">
                <div className="main-avatar-ring">
                  <div className="main-avatar-content">
                    <User size={40} color="#fff" />
                  </div>
                  <div className="status-indicator-dot"></div>
                </div>
              </div>

              <div className="profile-user-details">
                <h2 className="profile-user-name">{isDoctor ? `Dr. ${userName}` : userName}</h2>
                <span className="profile-user-email">{userEmail}</span>
                <div className="profile-verify-badge">
                  <ShieldCheck size={14} />
                  <span>Verified {role === 'doctor' ? 'Provider' : role === 'lab' ? 'Facility' : 'Patient'}</span>
                </div>
              </div>

              <div className="profile-meta-stats">
                <div className="meta-stat-row">
                  <span className="meta-label">ID STATUS</span>
                  <span className="meta-value active">Active</span>
                </div>
                <div className="meta-stat-row">
                  <span className="meta-label">MEMBER SINCE</span>
                  <span className="meta-value">{memberSince}</span>
                </div>
              </div>

              <div className="profile-actions-bottom">
                <button className="logout-action-btn" onClick={onLogout}>
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
