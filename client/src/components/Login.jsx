import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Login = ({ setAuth }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/auth/login', formData);
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

            navigate(res.data.user.role === 'doctor' ? '/doctor-dashboard' : '/appointments');
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Welcome Back</h2>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <form className="auth-form" onSubmit={onSubmit}>
                    <div className="auth-field">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            placeholder="your@email.com"
                            required
                        />
                    </div>
                    <div className="auth-field">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            placeholder="Min 6 characters"
                            required
                        />
                    </div>
                    <button type="submit" className="auth-submit-btn">Login</button>
                </form>
                <p className="auth-switch">
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
