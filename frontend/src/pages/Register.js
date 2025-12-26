import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        tenantName: '',
        subdomain: '',
        adminFullName: '',
        adminEmail: '',
        adminPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Use the .env variable we created
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // 1. Basic Validation
        if (formData.adminPassword !== formData.confirmPassword) {
            return setError("Passwords do not match");
        }

        if (formData.adminPassword.length < 6) {
            return setError("Password must be at least 6 characters");
        }

        setLoading(true);

        try {
            // 2. API Call to Backend
            const response = await axios.post(`${API_URL}/auth/register-tenant`, {
                tenantName: formData.tenantName,
                subdomain: formData.subdomain.toLowerCase().trim(),
                adminFullName: formData.adminFullName,
                adminEmail: formData.adminEmail,
                adminPassword: formData.adminPassword
            });

            if (response.data.success) {
                alert("Registration Successful! Please login.");
                navigate('/login');
            }
        } catch (err) {
            // 3. Detailed Error Handling
            const message = err.response?.data?.message || "Connection error. Is the backend running?";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2 style={{ textAlign: 'center' }}>Register Your Organization</h2>
            
            {error && <div style={{ color: 'white', background: '#f44336', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Company Name</label>
                    <input type="text" name="tenantName" required style={{ width: '100%', padding: '8px' }} onChange={handleChange} />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                    <label>Subdomain (e.g., mycompany)</label>
                    <input type="text" name="subdomain" required style={{ width: '100%', padding: '8px' }} onChange={handleChange} />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Admin Full Name</label>
                    <input type="text" name="adminFullName" required style={{ width: '100%', padding: '8px' }} onChange={handleChange} />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Admin Email</label>
                    <input type="email" name="adminEmail" required style={{ width: '100%', padding: '8px' }} onChange={handleChange} />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label>Password</label>
                    <input type="password" name="adminPassword" required style={{ width: '100%', padding: '8px' }} onChange={handleChange} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label>Confirm Password</label>
                    <input type="password" name="confirmPassword" required style={{ width: '100%', padding: '8px' }} onChange={handleChange} />
                </div>

                <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {loading ? 'Registering...' : 'Register Organization'}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '15px' }}>
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
};

export default Register;