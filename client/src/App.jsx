import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Appointments from './components/Appointments';
import DoctorDashboard from './components/DoctorDashboard';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import Chatbot from './components/Chatbot';
import DashboardLayout from './components/DashboardLayout';
import PatientDiscovery from './components/PatientDiscovery';
import HealthVault from './components/HealthVault';
import ProviderOnboarding from './components/ProviderOnboarding';
import LabDashboard from './components/LabDashboard';
import DoctorsPage from './components/DoctorsPage';
import LabTestsPage from './components/LabTestsPage';
import PharmaciesPage from './components/PharmaciesPage';
import PriceEditor from './components/PriceEditor';
import PatientQueuePage from './components/PatientQueuePage';
import ServiceManagerPage from './components/ServiceManagerPage';
import ReviewsPage from './components/ReviewsPage';
import AnalyticsPage from './components/AnalyticsPage';
import SamplesPage from './components/SamplesPage';
import ReportsPage from './components/ReportsPage';
import AvailabilityPage from './components/AvailabilityPage';
import './App.css';
import './components/Dashboard.css';

const PublicHeader = () => {
  const location = useLocation();
  if (location.pathname !== '/') return null;
  return (
    <header className="public-navbar">
      <Link to="/" className="nav-logo">CarePlus</Link>
      <nav className="nav-links">
        <Link to="/#marketplace">Marketplaces</Link>
        <Link to="/#features">Features</Link>
        <Link to="/#mission">Mission</Link>
      </nav>
      <div className="nav-actions">
        <Link to="/login" className="nav-login">Login</Link>
        <Link to="/register" className="nav-get-started">Get Started</Link>
      </div>
    </header>
  );
};

const App = () => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
    name: localStorage.getItem('userName'),
    id: localStorage.getItem('userId')
  });

  useEffect(() => {
    const syncOnlineStatus = async () => {
      if (auth.token) {
        try {
          await axios.post('http://localhost:5000/auth/login-status', {}, {
            headers: { 'x-auth-token': auth.token }
          });
        } catch (err) {
          console.error('Status sync error:', err);
        }
      }
    };
    syncOnlineStatus();
  }, [auth.token]);

  const logout = async () => {
    try {
      if (auth.token) {
        await axios.post('http://localhost:5000/auth/logout', {}, {
          headers: { 'x-auth-token': auth.token }
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.clear();
    setAuth({ token: null, role: null, name: null, id: null });
    window.location.href = '/';
  };

  const PrivateRoute = ({ children, role }) => {
    if (!auth.token) return <Navigate to="/login" />;
    if (role && auth.role !== role && role !== 'any') return <Navigate to="/dashboard" />;
    return children;
  };

  return (
    <Router>
      <div className="container" style={{ maxWidth: '100%', padding: 0 }}>
        {/* Simple Global Nav for Public pages */}
        {!auth.token && <PublicHeader />}

        <Routes>
          {/* Public Access: Only if NOT logged in */}
          <Route path="/" element={!auth.token ? <Dashboard /> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={!auth.token ? <Login setAuth={setAuth} /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!auth.token ? <Register setAuth={setAuth} /> : <Navigate to="/dashboard" />} />

          {/* New App Layout Routes */}
          <Route path="/dashboard" element={<PrivateRoute role="any"><DashboardLayout role={auth.role} /></PrivateRoute>}>
            <Route index element={
              auth.role === 'patient' ? <PatientDiscovery /> : auth.role === 'lab' ? <LabDashboard /> : <DoctorDashboard />
            } />
            <Route path="discovery" element={<PatientDiscovery />} />
            <Route path="doctors" element={<DoctorsPage />} />
            <Route path="lab-tests" element={<LabTestsPage />} />
            <Route path="pharmacies" element={<PharmaciesPage />} />
            <Route path="vault" element={<HealthVault />} />
            <Route path="onboarding" element={<ProviderOnboarding />} />
            <Route path="price-editor" element={<PriceEditor />} />
            <Route path="queue" element={<PatientQueuePage />} />
            <Route path="services" element={<ServiceManagerPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="availability" element={<AvailabilityPage />} />
            <Route path="samples" element={<SamplesPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          {/* Legacy Fallback Paths (re-routing into new layout) */}
          <Route path="/appointments" element={<Navigate to="/dashboard/discovery" />} />
          <Route path="/doctor-dashboard" element={<Navigate to="/dashboard" />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        
        {auth.token && <Chatbot />}
      </div>
    </Router>
  );
};

export default App;