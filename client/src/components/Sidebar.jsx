import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home, FileText, X, LayoutDashboard, Users,
  DollarSign, Star, BarChart3, Stethoscope, FlaskConical, Building2,
  TestTubes, ClipboardList, CalendarClock
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ role, isOpen, onClose, onLogout }) => {
  const userName = localStorage.getItem('userName');
  const isDoctor = role === 'doctor';
  const isLab = role === 'lab';
  const portalLabel = isDoctor ? 'PROVIDER PORTAL' : isLab ? 'Diagnostic Center' : 'PATIENT PORTAL';

  const patientLinks = [
    { to: '/dashboard', icon: <Home size={20} />, label: 'Home', end: true },
    { to: '/dashboard/doctors', icon: <Stethoscope size={20} />, label: 'Doctors' },
    { to: '/dashboard/lab-tests', icon: <FlaskConical size={20} />, label: 'Lab Tests' },
    { to: '/dashboard/pharmacies', icon: <Building2 size={20} />, label: 'Pharmacies' },
    { to: '/dashboard/vault', icon: <FileText size={20} />, label: 'Records' },
  ];

  const doctorLinks = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview', end: true },
    { to: '/dashboard/availability', icon: <CalendarClock size={20} />, label: 'Availability' },
    { to: '/dashboard/queue', icon: <Users size={20} />, label: 'Patient Queue' },
    { to: '/dashboard/services', icon: <DollarSign size={20} />, label: 'Service/Price Manager' },
    { to: '/dashboard/reviews', icon: <Star size={20} />, label: 'Reviews' },
    { to: '/dashboard/analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
  ];

  const labLinks = [
    { to: '/dashboard', icon: <ClipboardList size={20} />, label: 'Catalog', end: true },
    { to: '/dashboard/samples', icon: <TestTubes size={20} />, label: 'Samples' },
    { to: '/dashboard/reports', icon: <FileText size={20} />, label: 'Reports' },
    { to: '/dashboard/analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
  ];

  const navLinks = isDoctor ? doctorLinks : isLab ? labLinks : patientLinks;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div>
          <h2 className="logo">CarePlus</h2>
          <span className="portal-badge">{portalLabel}</span>
        </div>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navLinks.map((link) => (
            <li key={link.to + link.label}>
              <NavLink
                to={link.to}
                end={link.end || false}
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sidebar Footer Removed since it's now in the header profile popup */}
    </aside>
  );
};

export default Sidebar;
