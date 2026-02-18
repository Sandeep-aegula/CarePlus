import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

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
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { name, email, password, role, specialization, experience, age, gender } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/auth/register', formData);
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
            setError(err.response?.data?.msg || 'Registration failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Join CarePlus</h2>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <form className="auth-form" onSubmit={onSubmit}>
                    <div className="auth-field">
                        <label>Full Name</label>
                        <input type="text" name="name" value={name} onChange={onChange} required />
                    </div>
                    <div className="auth-field">
                        <label>Email Address</label>
                        <input type="email" name="email" value={email} onChange={onChange} required />
                    </div>
                    <div className="auth-field">
                        <label>Password</label>
                        <input type="password" name="password" value={password} onChange={onChange} minLength="6" required />
                    </div>
                    <div className="auth-field">
                        <label>Register As</label>
                        <select name="role" value={role} onChange={onChange}>
                            <option value="patient">Patient</option>
                            <option value="doctor">Doctor</option>
                        </select>
                    </div>

                    {role === 'doctor' ? (
                        <div className="doctor-extras">
                            <div className="auth-field">
                                <label>Specialization</label>
                                <input type="text" name="specialization" value={specialization} onChange={onChange} required />
                            </div>
                            <div className="auth-field">
                                <label>Experience (Years)</label>
                                <input type="number" name="experience" value={experience} onChange={onChange} required />
                            </div>
                        </div>
                    ) : (
                        <div className="patient-extras doctor-extras">
                            <div className="auth-field">
                                <label>Age</label>
                                <input type="number" name="age" value={age} onChange={onChange} />
                            </div>
                            <div className="auth-field">
                                <label>Gender</label>
                                <select name="gender" value={gender} onChange={onChange}>
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="auth-submit-btn">Register</button>
                </form>
                <p className="auth-switch">
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
