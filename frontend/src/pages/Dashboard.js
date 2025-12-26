import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({ projects: 0, team: 0 });
  const [username, setUsername] = useState('User');
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    // 1. Decode Username from Token
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsername(payload.full_name || "User");
      } catch (e) { console.error("JWT Error", e); }
    }

    // 2. Fetch Real Stats
    const fetchStats = async () => {
      try {
        const projRes = await axios.get(`${apiUrl}/projects`, { headers: { Authorization: `Bearer ${token}` } });
        const teamRes = await axios.get(`${apiUrl}/users/team`, { headers: { Authorization: `Bearer ${token}` } });
        setStats({
          projects: projRes.data.data.projects?.length || 0,
          team: teamRes.data.data?.length || 0
        });
      } catch (err) { console.error("Stats Error", err); }
    };
    fetchStats();
  }, [apiUrl, token]);

  const styles = {
    wrapper: { backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: '"Inter", sans-serif' },
    main: { padding: '40px', maxWidth: '1200px', margin: '0 auto' },
    welcomeSection: { marginBottom: '40px' },
    greet: { fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' },
    subtext: { color: '#64748b', fontSize: '16px' },
    cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' },
    statCard: { backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    quickActions: { marginTop: '40px', backgroundColor: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0' }
  };

  return (
    <div style={styles.wrapper}>
      <Navbar />
      <div style={styles.main}>
        <div style={styles.welcomeSection}>
          <h2 style={styles.greet}>Welcome back, {username}! 👋</h2>
          <p style={styles.subtext}>Here is what is happening with your organization today.</p>
        </div>

        <div style={styles.cardGrid}>
          <div style={styles.statCard}>
            <p style={{ color: '#64748b', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase' }}>Active Projects</p>
            <h3 style={{ fontSize: '36px', color: '#2563eb', margin: '10px 0' }}>{stats.projects}</h3>
            <span style={{ fontSize: '13px', color: '#10b981' }}>↑ 12% from last month</span>
          </div>
          <div style={styles.statCard}>
            <p style={{ color: '#64748b', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase' }}>Total Team</p>
            <h3 style={{ fontSize: '36px', color: '#1e293b', margin: '10px 0' }}>{stats.team} Members</h3>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Across {username}'s Org</span>
          </div>
        </div>

        <div style={styles.quickActions}>
          <h4 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Quick Actions</h4>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => window.location.href='/projects'} style={{ padding: '12px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Create New Project</button>
            <button onClick={() => window.location.href='/team'} style={{ padding: '12px 20px', backgroundColor: '#f1f5f9', color: '#1e293b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Manage Team</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;