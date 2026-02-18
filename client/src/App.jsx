import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Appointments from './components/Appointments';
import DoctorDashboard from './components/DoctorDashboard';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

const App = () => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
    name: localStorage.getItem('userName'),
    id: localStorage.getItem('userId')
  });

  const logout = () => {
    localStorage.clear();
    setAuth({ token: null, role: null, name: null, id: null });
    window.location.href = '/';
  };

  const PrivateRoute = ({ children, role }) => {
    if (!auth.token) return <Navigate to="/login" />;
    if (role && auth.role !== role) return <Navigate to="/dashboard" />;
    return children;
  };

  return (
    <Router>
      <div className="container">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}><h1 style={{ color: '#00a7aa', margin: 0 }}>CarePlus Hospital</h1></Link>
          {auth.token ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontWeight: '600', color: '#555' }}>Hello, {auth.name} ({auth.role})</span>
              <button className="muted" style={{ padding: '6px 12px' }} onClick={logout}>Logout</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/login"><button className="muted" style={{ padding: '8px 16px' }}>Login</button></Link>
              <Link to="/register"><button className="primary" style={{ padding: '8px 16px', backgroundColor: '#00a7aa', border: 'none', color: 'white', borderRadius: '6px' }}>Register</button></Link>
            </div>
          )}
        </header>

        {auth.token && (
          <nav>
            <ul>
              <li>
                <Link to="/">Home Dashboard</Link>
              </li>
              {auth.role === 'patient' && (
                <li>
                  <Link to="/appointments">My Health Area</Link>
                </li>
              )}
              {auth.role === 'doctor' && (
                <li>
                  <Link to="/doctor-dashboard">Doctor Portal</Link>
                </li>
              )}
            </ul>
          </nav>
        )}

        <div style={{ marginTop: '30px' }}>
          <Routes>
            {/* Public Entry Point */}
            <Route path="/" element={<Dashboard />} />

            <Route path="/login" element={!auth.token ? <Login setAuth={setAuth} /> : <Navigate to={auth.role === 'doctor' ? '/doctor-dashboard' : '/appointments'} />} />
            <Route path="/register" element={!auth.token ? <Register setAuth={setAuth} /> : <Navigate to={auth.role === 'doctor' ? '/doctor-dashboard' : '/appointments'} />} />

            {/* Role-Specific Private Routes */}
            <Route path="/appointments" element={
              <PrivateRoute role="patient">
                <Appointments />
              </PrivateRoute>
            } />

            <Route path="/doctor-dashboard" element={
              <PrivateRoute role="doctor">
                <DoctorDashboard />
              </PrivateRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;