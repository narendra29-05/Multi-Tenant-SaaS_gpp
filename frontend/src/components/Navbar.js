import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  // Logic to extract username from JWT
  let username = "User";
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      username = payload.full_name || payload.username || "User";
    } catch (e) {
      console.error("Token decode error", e);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItemStyle = (path) => ({
    textDecoration: 'none',
    color: location.pathname === path ? '#2563eb' : '#64748b',
    fontWeight: location.pathname === path ? '600' : '500',
    padding: '8px 16px',
    borderRadius: '6px',
    backgroundColor: location.pathname === path ? '#eff6ff' : 'transparent',
    fontSize: '14px'
  });

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0 40px', height: '64px', backgroundColor: 'white',
      borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>
          SAAS<span style={{ color: '#2563eb' }}>FLUX</span>
        </h1>
        <div style={{ display: 'flex', gap: '4px' }}>
          <Link to="/dashboard" style={navItemStyle('/dashboard')}>Dashboard</Link>
          <Link to="/projects" style={navItemStyle('/projects')}>Projects</Link>
          <Link to="/team" style={navItemStyle('/team')}>Team</Link>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
          Welcome, <span style={{ color: '#1e293b', fontWeight: '700' }}>{username}</span>
        </span>
        <button 
          onClick={handleLogout}
          style={{
            padding: '8px 16px', backgroundColor: 'white', border: '1px solid #e2e8f0',
            borderRadius: '6px', cursor: 'pointer', color: '#dc2626', fontWeight: '600', fontSize: '13px'
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;