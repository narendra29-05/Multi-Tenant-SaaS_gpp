import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        tenantName: '',
        subdomain: '',
        adminEmail: '',
        adminPassword: '',
        adminFullName: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.adminPassword !== formData.confirmPassword) {
            return setMessage('Passwords do not match');
        }

        setLoading(true);
        try {
            await api.post('/auth/register-tenant', {
                tenantName: formData.tenantName,
                subdomain: formData.subdomain,
                adminEmail: formData.adminEmail,
                adminPassword: formData.adminPassword,
                adminFullName: formData.adminFullName
            });
            setMessage('Success! Redirecting...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow p-4 mx-auto" style={{ maxWidth: '500px' }}>
                <h2 className="text-center mb-4">Register Organization</h2>
                {message && <div className={`alert ${message.includes('Success') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
                <form onSubmit={handleSubmit}>
                    <input className="form-control mb-3" placeholder="Org Name" onChange={e => setFormData({...formData, tenantName: e.target.value})} required />
                    <input className="form-control mb-3" placeholder="subdomain (e.g. myorg)" onChange={e => setFormData({...formData, subdomain: e.target.value})} required />
                    <input className="form-control mb-3" placeholder="Full Name" onChange={e => setFormData({...formData, adminFullName: e.target.value})} required />
                    <input className="form-control mb-3" type="email" placeholder="Email" onChange={e => setFormData({...formData, adminEmail: e.target.value})} required />
                    <input className="form-control mb-3" type="password" placeholder="Password (8+ chars)" onChange={e => setFormData({...formData, adminPassword: e.target.value})} required />
                    <input className="form-control mb-3" type="password" placeholder="Confirm Password" onChange={e => setFormData({...formData, confirmPassword: e.target.value})} required />
                    <button className="btn btn-primary w-100" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
                </form>
            </div>
        </div>
    );
};

export default Register;