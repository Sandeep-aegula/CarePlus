import React from 'react';
import { Pill, FlaskConical, Syringe, Receipt, Download, FileText, CheckCircle2, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import './HealthVault.css';

const HealthVault = () => {
  const userId = localStorage.getItem('userId') || 'GUEST-ID-123';
  const name = localStorage.getItem('userName') || 'CarePlus Patient';
  const role = localStorage.getItem('role') || 'patient';

  const qrData = `CarePlus Health Vault\n---------------------\nName: ${name}\nRole: ${role.charAt(0).toUpperCase() + role.slice(1)}\nHealth ID: ${userId}`;

  const folders = [
    { title: 'Prescriptions', icon: Pill, color: 'green', count: 12 },
    { title: 'Lab Reports', icon: FlaskConical, color: 'purple', count: 8 },
    { title: 'Vaccination Records', icon: Syringe, color: 'blue', count: 5 },
    { title: 'Medical Bills', icon: Receipt, color: 'orange', count: 3 },
  ];

  const recentActivity = [
    { id: 1, type: 'prescription', title: 'Post-Op Medication', date: '12 March 2026', provider: 'Dr. Sarah Smith', status: 'verified' },
    { id: 2, type: 'report', title: 'Complete Blood Count', date: '10 March 2026', provider: 'Apex Diagnostic Lab', status: 'verified' },
    { id: 3, type: 'bill', title: 'Consultation Fee', date: '10 March 2026', provider: 'City General Hospital', status: 'pending' },
    { id: 4, type: 'vaccine', title: 'Flu Shot', date: '01 January 2026', provider: 'Wellness Clinic', status: 'verified' },
    { id: 5, type: 'prescription', title: 'Antibiotics Course', date: '15 December 2025', provider: 'Dr. Emily Chen', status: 'verified' },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'prescription': return <Pill size={18} />;
      case 'report': return <FlaskConical size={18} />;
      case 'bill': return <Receipt size={18} />;
      case 'vaccine': return <Syringe size={18} />;
      default: return <FileText size={18} />;
    }
  };

  return (
    <div className="vault-page">
      <div className="vault-header-block">
        <div>
          <h1 className="vault-title">Health Vault</h1>
          <p className="vault-subtitle">Your organized medical history.</p>
        </div>
      </div>

      <div className="vault-layout">
        {/* Left/Main Column */}
        <div className="vault-main">
          {/* 1. Folder Grid */}
          <div className="folders-grid">
            {folders.map((folder, idx) => {
              const Icon = folder.icon;
              return (
                <div key={idx} className={`folder-card border-${folder.color}`}>
                  <div className={`folder-icon-wrapper bg-${folder.color}`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="folder-name">{folder.title}</h3>
                  <p className="folder-count">{folder.count} files</p>
                </div>
              );
            })}
          </div>

          {/* 2. Recent Activity Table */}
          <div className="recent-activity-section shadow-card">
            <h2 className="section-title">Recent Activity</h2>
            <div className="activity-table-wrapper">
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>Date & Document</th>
                    <th>Provider</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div className="table-doc-cell">
                          <div className={`cell-icon ${item.type}`}>
                            {getIcon(item.type)}
                          </div>
                          <div className="cell-text">
                            <strong>{item.title}</strong>
                            <span>{item.date}</span>
                          </div>
                        </div>
                      </td>
                      <td className="provider-cell">{item.provider}</td>
                      <td>
                        {item.status === 'verified' ? (
                          <span className="badge verified"><CheckCircle2 size={14} /> Verified</span>
                        ) : (
                          <span className="badge pending"><Clock size={14} /> Pending</span>
                        )}
                      </td>
                      <td>
                        <button className="btn-table-download">
                          <Download size={16} /> Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: QR Code */}
        <div className="vault-sidebar">
          <div className="qr-card shadow-card">
            <h3 className="qr-title">My Health ID</h3>
            <p className="qr-desc">Show this QR code to any associated CarePlus provider to grand temporary access to your vault.</p>
            
            <div className="qr-code-box" style={{ background: '#fff', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.05)' }}>
              <QRCodeSVG value={qrData} size={140} level="M" includeMargin={true} />
            </div>

            <div className="qr-status">
              <div className="pulse-dot"></div>
              <span>Active & Secure</span>
            </div>

            <button className="btn-share-link">Generate Share Link</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthVault;
