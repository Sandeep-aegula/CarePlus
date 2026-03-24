import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    HelpCircle, 
    Search, 
    CheckCircle, 
    HeartPulse, 
    ShieldCheck, 
    Stethoscope, 
    AlertCircle,
    Activity,
    LineChart,
    FileText,
    TrendingUp,
    List
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            {/* HERO SECTION */}
            <section className="hero-section" id="mission">
                <div className="mission-badge">OUR MISSION</div>
                <h1 className="hero-title">
                    Healthcare shouldn't be a <br/>
                    <span className="hero-highlight">guessing game.</span>
                </h1>
                
                <div className="hero-steps">
                    <div className="step-item">
                        <div className="step-icon step-icon-gray">
                            <HelpCircle size={20} />
                        </div>
                        <span className="step-text">Confusing Symptoms</span>
                    </div>
                    <div className="step-line"></div>
                    <div className="step-item">
                        <div className="step-icon step-icon-gray">
                            <Search size={20} />
                        </div>
                        <span className="step-text">Endless Searching</span>
                    </div>
                    <div className="step-line"></div>
                    <div className="step-item">
                        <div className="step-icon step-icon-green">
                            <CheckCircle size={20} color="white" />
                        </div>
                        <span className="step-text">Precision Care</span>
                    </div>
                </div>
            </section>

            {/* AI FEATURE SECTION */}
            <section className="ai-feature-section" id="features">
                <div className="ai-feature-container">
                    <div className="ai-feature-left">
                        <div className="badge badge-blue">
                            <Activity size={14} className="badge-icon" /> VIDYA AI ENGINE
                        </div>
                        <h2 className="ai-title">Instant diagnostics,<br/>meet instant action.</h2>
                        <p className="ai-desc">
                            Vidya doesn't just chat. When you report a critical symptom like "My chest hurts," she instantly cross-references your medical history, verifies your location, and highlights the nearest high-trust specialist.
                        </p>
                        <div className="ai-card">
                            <div className="ai-card-icon">
                                <ShieldCheck size={20} color="white" />
                            </div>
                            <div className="ai-card-text">
                                <strong>Verified Cardiologist Found</strong>
                                <span>Dr. Aria Thorne • 0.8 miles away • Live Queue: 12 min</span>
                            </div>
                        </div>
                    </div>
                    <div className="ai-feature-right">
                        <div className="ai-mockup">
                            <div className="doctor-graphic">
                                <Stethoscope size={64} className="doctor-svg" />
                                <div className="pin pin-1"></div>
                                <div className="pin pin-2"></div>
                                <div className="pin pin-3"></div>
                            </div>
                            <div className="ai-popup">
                                <div className="ai-popup-header">
                                    <div className="ai-avatar"><Activity size={12} color="white" /></div> VIDYA AI
                                </div>
                                <p>"I've analyzed your symptoms. Highlighting Dr. Thorne (Cardiology) at Central Health. The emergency route is clear."</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* PATIENTS SECTION */}
            <section className="patients-section" id="marketplace">
                <div className="section-header">
                    <h2>For Patients</h2>
                    <p>Precision tools for the modern patient, designed for care and clarity.</p>
                </div>
                
                <div className="cards-grid patients-grid">
                    <div className="feature-card">
                        <div className="card-icon-wrapper bg-red">
                            <HeartPulse size={20} className="icon-red" />
                        </div>
                        <h3>Find Emergency Care</h3>
                        <p>Direct real-route navigation to facilities with active trauma teams and lowest wait times.</p>
                    </div>
                    <div className="feature-card">
                        <div className="card-icon-wrapper bg-blue">
                            <Search size={20} className="icon-blue" />
                        </div>
                        <h3>Diagnostic Marketplace</h3>
                        <p>Compare prices for MRIs, blood work, and screenings across local providers instantly.</p>
                    </div>
                    <div className="feature-card">
                        <div className="card-icon-wrapper bg-green">
                            <ShieldCheck size={20} className="icon-green" />
                        </div>
                        <h3>Health Vault</h3>
                        <p>Encrypted storage for your prescriptions and imaging records, accessible only by you.</p>
                    </div>
                    <div className="feature-card">
                        <div className="card-icon-wrapper bg-gray">
                            <AlertCircle size={20} className="icon-gray-dark" />
                        </div>
                        <h3>Verified SOS</h3>
                        <p>One-tap emergency broadcast to your pre-verified medical contacts and primary doctor.</p>
                    </div>
                </div>
            </section>

            {/* PROVIDERS SECTION */}
            <section className="providers-section">
                <div className="providers-container">
                    <div className="section-header left-align light-text">
                        <h2>For Providers</h2>
                        <p>Operational excellence and trust-building for medical practices.</p>
                    </div>
                    
                    <div className="cards-grid providers-grid">
                        <div className="dark-card">
                            <div className="card-icon-wrapper bg-blue">
                                <Activity size={20} color="white" />
                            </div>
                            <h3>Live Queue Management</h3>
                            <p>Reduce waiting room friction with real-time patient flow analytics and automated scheduling.</p>
                        </div>
                        <div className="dark-card">
                            <div className="card-icon-wrapper bg-green">
                                <TrendingUp size={20} color="white" />
                            </div>
                            <h3>Trust-Rank Dashboard</h3>
                            <p>Monitor your practice's performance scores, patient feedback, and verification status in one view.</p>
                        </div>
                        <div className="dark-card">
                            <div className="card-icon-wrapper bg-gray-dark">
                                <List size={20} color="white" />
                            </div>
                            <h3>Price List Manager</h3>
                            <p>Update service costs and insurance compatibility across the CarePlus network instantly.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="cta-section">
                <h2>Join the new standard<br/>of digital health.</h2>
                <p>Whether you're seeking care or providing it, CarePlus is your sanctuary for reliable, tech-enabled medicine.</p>
                <div className="cta-buttons">
                    <button className="btn-primary" onClick={() => navigate('/login')}>Start Finding Care</button>
                    <button className="btn-secondary" onClick={() => navigate('/register')}>List Your Practice</button>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="footer">
                <div className="footer-content">
                    <span className="footer-logo">CarePlus</span>
                    <div className="footer-links">
                        <a href="#">PRIVACY POLICY</a>
                        <a href="#">TERMS OF SERVICE</a>
                        <a href="#">CONTACT SUPPORT</a>
                        <a href="#">ACCESSIBILITY</a>
                    </div>
                    <span className="footer-copyright">© 2024 CAREPLUS HEALTH. THE DIGITAL SANCTUARY.</span>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;
