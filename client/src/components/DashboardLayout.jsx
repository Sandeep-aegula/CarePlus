import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import './DashboardLayout.css';

const DashboardLayout = ({ role }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post('/auth/logout', {}, {
          headers: { 'x-auth-token': token }
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar */}
      <Sidebar
        role={role}
        isOpen={isSidebarOpen}
        onClose={toggleSidebar}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="main-area">
        {/* Top Header */}
        <TopHeader role={role} onMenuClick={toggleSidebar} onLogout={handleLogout} />

        {/* Dynamic Page Content */}
        <main className="content-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
