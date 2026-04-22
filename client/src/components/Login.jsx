import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldPlus, Eye, EyeOff } from 'lucide-react';
import './Auth.css';

const Login = ({ setAuth }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    // Virtual roles for UI only, backend uses standard login mechanism
    const [activeRole, setActiveRole] = useState('patient');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('/auth/login', formData);
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
            setError(err.response?.data?.msg || 'Login failed');
        }
    };

    return (
        <div className="login-split-page">
            <div className="login-left-pane">
                <div className="left-pane-content">
                    <div className="login-logo">
                        <div className="logo-icon-wrapper">
                            <ShieldPlus size={20} color="white" />
                        </div>
                        CarePlus
                    </div>
                    <h1 className="login-headline">
                        Welcome back to<br />
                        your personalized<br />
                        health command<br />
                        center.
                    </h1>
                    <p className="login-subtext">
                        Access your medical records, connect with<br/>
                        practitioners, and manage your wellness journey<br/>
                        with ethereal precision.
                    </p>
                </div>
                <div className="left-pane-footer">
                    <div className="trusted-users">
                        <div className="avatars">
                            <img src="https://i.pravatar.cc/150?img=47" alt="User 1" />
                            <img src="https://i.pravatar.cc/150?img=11" alt="User 2" />
                            <img src="https://i.pravatar.cc/150?img=12" alt="User 3" />
                        </div>
                        <span>Trusted by 50,000+ users worldwide</span>
                    </div>
                    <div className="footer-copyright">
                        © 2026 CAREPLUS HEALTH. THE DIGITAL SANCTUARY.
                    </div>
                </div>
            </div>

            <div className="login-right-pane">
                <div className="login-form-container">
                    <div className="login-form-header">
                        <h2>Account Login</h2>
                        <p>Please select your role to continue</p>
                    </div>

                    <div className="role-selector">
                        <div 
                            className={`role-option ${activeRole === 'patient' ? 'active' : ''}`}
                            onClick={() => setActiveRole('patient')}
                        >
                            Patient
                        </div>
                        <div 
                            className={`role-option ${activeRole === 'provider' ? 'active' : ''}`}
                            onClick={() => setActiveRole('provider')}
                        >
                            Provider
                        </div>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <form className="login-form" onSubmit={onSubmit}>
                        <div className="form-group">
                            <label>EMAIL ADDRESS</label>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                placeholder="sarah.johnson@example.com"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <div className="password-header">
                                <label>PASSWORD</label>
                                <a href="#" className="forgot-link">Forgot?</a>
                            </div>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={password}
                                    onChange={onChange}
                                    placeholder="••••••••••••"
                                    required
                                />
                                <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="login-submit-btn">Sign In</button>
                    </form>

                    <div className="login-links">
                        <p>New to CarePlus? <Link to="/register">Create an account</Link></p>
                        <p><Link to="/register-doctor" className="secondary-link">Register as a New Doctor or Lab</Link></p>
                    </div>

                    <div className="right-pane-footer">
                        <a href="#">PRIVACY POLICY</a>
                        <a href="#">TERMS OF SERVICE</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
