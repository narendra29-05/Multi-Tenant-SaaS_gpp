import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
        <div className="register-wrapper">
            <style>{`
                .register-wrapper {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 40px 20px;
                }
                .register-card {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.2);
                    width: 100%;
                    max-width: 900px;
                    display: flex;
                    overflow: hidden;
                    animation: fadeIn 0.6s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .info-side {
                    background: #764ba2;
                    background: linear-gradient(180deg, #764ba2 0%, #667eea 100%);
                    color: white;
                    padding: 50px;
                    width: 40%;
                    display: flex;
                    flex-column;
                    justify-content: center;
                }
                .form-side {
                    padding: 50px;
                    width: 60%;
                    background: white;
                }
                @media (max-width: 768px) {
                    .info-side { display: none; }
                    .form-side { width: 100%; padding: 30px; }
                    .register-card { max-width: 500px; }
                }
                .form-control {
                    border-radius: 10px;
                    padding: 12px;
                    border: 2px solid #edf2f7;
                    margin-bottom: 15px;
                }
                .form-control:focus {
                    border-color: #764ba2;
                    box-shadow: none;
                }
                .btn-register {
                    background: linear-gradient(to right, #667eea, #764ba2);
                    border: none;
                    border-radius: 10px;
                    padding: 14px;
                    font-weight: 600;
                    margin-top: 10px;
                }
                .subdomain-input-group {
                    position: relative;
                }
                .subdomain-suffix {
                    position: absolute;
                    right: 15px;
                    top: 12px;
                    color: #a0aec0;
                    font-weight: 600;
                }
            `}</style>

            <div className="register-card">
                <div className="info-side d-flex flex-column justify-content-center">
                    <h2 className="fw-bold mb-4">Start Your Journey</h2>
                    <p className="opacity-75">Create a dedicated workspace for your team. Scale your projects with built-in multi-tenancy and data isolation.</p>
                    <ul className="list-unstyled mt-4">
                        <li className="mb-2">✅ Isolated Database Access</li>
                        <li className="mb-2">✅ Custom Subdomains</li>
                        <li className="mb-2">✅ Role-based Management</li>
                    </ul>
                </div>

                <div className="form-side">
                    <h3 className="fw-bold mb-1 text-dark">Register Organization</h3>
                    <p className="text-muted mb-4">Setup your admin account and workspace</p>

                    {message && (
                        <div className={`alert border-0 small ${message.includes('Success') ? 'alert-success' : 'alert-danger'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6">
                                <label className="small fw-bold text-muted mb-1">Organization Name</label>
                                <input className="form-control" placeholder="Acme Corp" onChange={e => setFormData({...formData, tenantName: e.target.value})} required />
                            </div>
                            <div className="col-md-6">
                                <label className="small fw-bold text-muted mb-1">Workspace Subdomain</label>
                                <div className="subdomain-input-group">
                                    <input className="form-control" placeholder="acme" onChange={e => setFormData({...formData, subdomain: e.target.value})} required />
                                    <span className="subdomain-suffix">.saas.com</span>
                                </div>
                            </div>
                        </div>

                        <label className="small fw-bold text-muted mb-1">Full Name</label>
                        <input className="form-control" placeholder="John Doe" onChange={e => setFormData({...formData, adminFullName: e.target.value})} required />

                        <label className="small fw-bold text-muted mb-1">Admin Email</label>
                        <input className="form-control" type="email" placeholder="admin@company.com" onChange={e => setFormData({...formData, adminEmail: e.target.value})} required />

                        <div className="row">
                            <div className="col-md-6">
                                <label className="small fw-bold text-muted mb-1">Password</label>
                                <input className="form-control" type="password" placeholder="••••••••" onChange={e => setFormData({...formData, adminPassword: e.target.value})} required />
                            </div>
                            <div className="col-md-6">
                                <label className="small fw-bold text-muted mb-1">Confirm Password</label>
                                <input className="form-control" type="password" placeholder="••••••••" onChange={e => setFormData({...formData, confirmPassword: e.target.value})} required />
                            </div>
                        </div>

                        <button className="btn btn-primary btn-register w-100 shadow-sm" disabled={loading}>
                            {loading ? 'Creating Workspace...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <p className="small text-muted">
                            Already have an organization? <Link to="/login" className="text-primary fw-bold text-decoration-none">Log In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;