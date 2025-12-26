import React from 'react';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const stats = [
    { label: 'Active Projects', value: '08', color: '#2563eb', bg: '#eff6ff' },
    { label: 'Team Members', value: '04', color: '#10b981', bg: '#ecfdf5' },
    { label: 'Resource Usage', value: '72%', color: '#f59e0b', bg: '#fffbeb' }
  ];

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '"Inter", sans-serif' }}>
      <Navbar />
      <div style={{ padding: '48px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0' }}>Organization Overview</h2>
          <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>Monitor your tenant's real-time performance and metrics.</p>
        </header>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ 
              backgroundColor: 'white', padding: '32px', borderRadius: '16px', 
              border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '12px' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '36px', fontWeight: '800', color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;