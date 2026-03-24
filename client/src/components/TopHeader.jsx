import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';
import './TopHeader.css';

const TopHeader = ({ role, onMenuClick }) => {
  const isDoctor = role === 'doctor';
  const isLab = role === 'lab';

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
        <div className="notification-bell">
          <Bell size={24} />
          <span className="notif-badge">3</span>
        </div>
        {isDoctor && (
          <button className="checkins-btn">Check-ins (12)</button>
        )}
        <div className="user-profile">
          <div className="avatar-circle">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
