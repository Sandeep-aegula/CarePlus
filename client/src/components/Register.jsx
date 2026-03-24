import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldPlus, User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import './Register.css';

const Register = ({ setAuth }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'patient',
        specialization: '',
        experience: '',
        age: '',
        gender: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { name, email, password, role, specialization, experience, age, gender } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const selectRole = (r) => setFormData({ ...formData, role: r });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('/auth/register', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('role', res.data.user.role);
            localStorage.setItem('userName', res.data.user.name);
            localStorage.setItem('userId', res.data.user.id);

            setAuth({
                token: res.data.token,
                role: res.data.user.role,
                name: res.data.user.name,
                id: res.data.user.id
            });

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed');
        }
    };

    const roleLabel = role === 'patient' ? 'Patient' : role === 'doctor' ? 'Doctor' : 'Test Center';

    return (
        <div className="register-page">
            {/* Top Navbar */}
            <header className="register-nav">
                <div className="register-nav-logo">
                    <ShieldPlus size={20} color="#2563eb" />
                    <span>CarePlus</span>
                </div>
                <div className="register-nav-actions">
                    <Link to="/login" className="reg-nav-login">Login</Link>
                    <Link to="/register" className="reg-nav-get-started">Get Started</Link>
                </div>
            </header>

            {/* Main Content */}
            <div className="register-content">
                {/* Left Pane */}
                <div className="register-left">
                    <div className="reg-left-inner">
                        <div className="reg-brand">
                            <ShieldPlus size={18} color="white" />
                            <span>CarePlus</span>
                        </div>

                        <h1 className="reg-headline">
                            One platform.<br />
                            Total care.<br />
                            Join the network.
                        </h1>

                        <p className="reg-subtext">
                            The digital sanctuary for modern healthcare professionals and patients.
                        </p>

                        {/* Decorative Circle */}
                        <div className="reg-circle-graphic">
                            <div className="reg-circle-outer">
                                <div className="reg-circle-inner">
                                    <ShieldPlus size={24} color="#93c5fd" />
                                </div>
                                <div className="reg-orbit-dot dot-1">
                                    <User size={14} color="#93c5fd" />
                                </div>
                                <div className="reg-orbit-dot dot-2">
                                    <ShieldPlus size={14} color="#f87171" />
                                </div>
                            </div>
                        </div>

                        {/* User Count */}
                        <div className="reg-user-count">
                            <div className="reg-avatars">
                                <img src="https://i.pravatar.cc/150?img=32" alt="" />
                                <img src="https://i.pravatar.cc/150?img=44" alt="" />
                            </div>
                            <span>Joined by 10k+ users this month</span>
                        </div>
                    </div>
                </div>

                {/* Right Pane */}
                <div className="register-right">
                    <div className="reg-form-container">
                        <h2>Create Account</h2>
                        <p className="reg-form-subtitle">Fill in your details to get started with our network.</p>

                        {error && <div className="reg-error">{error}</div>}

                        {/* Role Selector */}
                        <div className="reg-role-selector">
                            <button
                                type="button"
                                className={`reg-role-btn ${role === 'patient' ? 'active' : ''}`}
                                onClick={() => selectRole('patient')}
                            >Patient</button>
                            <button
                                type="button"
                                className={`reg-role-btn ${role === 'doctor' ? 'active' : ''}`}
                                onClick={() => selectRole('doctor')}
                            >Doctor</button>
                            <button
                                type="button"
                                className={`reg-role-btn ${role === 'lab' ? 'active' : ''}`}
                                onClick={() => selectRole('lab')}
                            >Test Center</button>
                        </div>

                        <form onSubmit={onSubmit} className="reg-form">
                            {/* Full Name */}
                            <div className="reg-field">
                                <label>FULL NAME</label>
                                <div className="reg-input-wrap">
                                    <User size={16} className="reg-input-icon" />
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Johnathan Doe"
                                        value={name}
                                        onChange={onChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="reg-field">
                                <label>EMAIL ADDRESS</label>
                                <div className="reg-input-wrap">
                                    <Mail size={16} className="reg-input-icon" />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="john@careplus.com"
                                        value={email}
                                        onChange={onChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Conditional Fields */}
                            {role === 'patient' && (
                                <div className="reg-row">
                                    <div className="reg-field">
                                        <label>AGE</label>
                                        <div className="reg-input-wrap">
                                            <input
                                                type="number"
                                                name="age"
                                                placeholder="24"
                                                value={age}
                                                onChange={onChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="reg-field">
                                        <label>GENDER</label>
                                        <div className="reg-input-wrap reg-select-wrap">
                                            <select name="gender" value={gender} onChange={onChange}>
                                                <option value="">Select</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {role === 'doctor' && (
                                <div className="reg-row">
                                    <div className="reg-field">
                                        <label>SPECIALIZATION</label>
                                        <div className="reg-input-wrap">
                                            <input
                                                type="text"
                                                name="specialization"
                                                placeholder="Cardiology"
                                                value={specialization}
                                                onChange={onChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="reg-field">
                                        <label>EXPERIENCE (YRS)</label>
                                        <div className="reg-input-wrap">
                                            <input
                                                type="number"
                                                name="experience"
                                                placeholder="5"
                                                value={experience}
                                                onChange={onChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {role === 'lab' && (
                                <div className="reg-row">
                                    <div className="reg-field" style={{ flex: 1 }}>
                                        <label>LAB / CENTER NAME</label>
                                        <div className="reg-input-wrap">
                                            <input
                                                type="text"
                                                name="specialization"
                                                placeholder="Apex Diagnostics"
                                                value={specialization}
                                                onChange={onChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Password */}
                            <div className="reg-field">
                                <label>PASSWORD</label>
                                <div className="reg-input-wrap">
                                    <Lock size={16} className="reg-input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={onChange}
                                        minLength="6"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="reg-eye-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="reg-submit-btn">
                                Register as {roleLabel} <ArrowRight size={18} />
                            </button>
                        </form>

                        <p className="reg-login-link">
                            Already have an account? <Link to="/login">Login here</Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="register-footer">
                <div className="reg-footer-left">
                    <strong>CarePlus</strong>
                    <span>© 2024 CarePlus Health. All rights reserved.</span>
                </div>
                <div className="reg-footer-right">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Help Center</a>
                </div>
            </footer>
        </div>
    );
};

export default Register;
