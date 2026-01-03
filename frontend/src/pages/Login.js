import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tenantSubdomain: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.email) newErrors.email = 'Email required';
    if (!formData.password) newErrors.password = 'Password required';
    if (!formData.tenantSubdomain) newErrors.tenantSubdomain = 'Subdomain required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      const { token, user } = response.data.data;
      login(token, user);
      navigate('/dashboard');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      <style>{`
        .login-page-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }
        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          border: none;
          box-shadow: 0 15px 35px rgba(0,0,0,0.2);
          width: 100%;
          max-width: 450px;
          overflow: hidden;
        }
        .login-header {
          background: #f8f9fa;
          padding: 30px;
          text-align: center;
          border-bottom: 1px solid #eee;
        }
        .login-header h2 {
          font-weight: 700;
          color: #4a5568;
          margin: 0;
        }
        .login-body {
          padding: 40px;
        }
        .form-label {
          font-weight: 600;
          color: #4a5568;
          font-size: 0.9rem;
        }
        .form-control {
          border-radius: 10px;
          padding: 12px 15px;
          border: 2px solid #edf2f7;
          transition: all 0.3s ease;
        }
        .form-control:focus {
          border-color: #667eea;
          box-shadow: none;
        }
        .btn-login {
          background: linear-gradient(to right, #667eea, #764ba2);
          border: none;
          border-radius: 10px;
          padding: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
          transition: transform 0.2s ease;
        }
        .btn-login:hover {
          transform: translateY(-2px);
          opacity: 0.9;
        }
        .demo-badge {
          background: #ebf4ff;
          color: #5a67d8;
          padding: 10px;
          border-radius: 8px;
          font-size: 0.8rem;
          margin-top: 20px;
        }
      `}</style>

      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p className="text-muted mb-0">Please enter your details</p>
        </div>
        
        <div className="login-body">
          {message && (
            <div className="alert alert-danger border-0 rounded-3 mb-4" role="alert">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Subdomain</label>
              <input 
                type="text" 
                className={`form-control ${errors.tenantSubdomain ? 'is-invalid' : ''}`} 
                name="tenantSubdomain" 
                value={formData.tenantSubdomain} 
                onChange={handleChange} 
                placeholder="e.g. demo" 
              />
              {errors.tenantSubdomain && <div className="invalid-feedback">{errors.tenantSubdomain}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="name@company.com"
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="mb-4">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className={`form-control ${errors.password ? 'is-invalid' : ''}`} 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="••••••••"
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <button type="submit" className="btn btn-primary btn-login w-100" disabled={loading}>
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : null}
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="small text-muted mb-2">
              Don't have an account? <Link to="/register" className="text-decoration-none fw-bold">Register Tenant</Link>
            </p>
            
            <div className="demo-badge">
              <strong>Demo Access:</strong><br/>
              <code>subdomain=demo | admin@demo.com | Demo@123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;