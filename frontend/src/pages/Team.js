import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const Team = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ full_name: '', email: '', password: '', role: 'member' });

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  const fetchTeam = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/users/team`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(res.data.data || []);
    } catch (err) { console.error("Fetch error", err); }
    finally { setLoading(false); }
  }, [apiUrl, token]);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/users/invite`, newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      fetchTeam();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const styles = {
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' },
    th: { textAlign: 'left', padding: '16px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '13px', fontWeight: '600' },
    td: { padding: '16px', borderBottom: '1px solid #f1f5f9', color: '#1e293b', fontSize: '14px' },
    modal: { backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
    input: { width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box' }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: '"Inter", sans-serif' }}>
      <Navbar />
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>Team Members</h2>
          <button onClick={() => setShowModal(true)} style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
            + Invite Member
          </button>
        </div>

        <table style={styles.table}>
          <thead>
            <tr><th style={styles.th}>NAME</th><th style={styles.th}>EMAIL</th><th style={styles.th}>ROLE</th></tr>
          </thead>
          <tbody>
            {members.map(u => (
              <tr key={u.id}>
                <td style={styles.td}>{u.full_name}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}><span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', fontSize: '12px', fontWeight: '700' }}>{u.role.toUpperCase()}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={styles.modal}>
            <h3 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '700' }}>Invite New User</h3>
            <form onSubmit={handleInvite}>
              <input type="text" placeholder="Full Name" required style={styles.input} onChange={e => setNewUser({...newUser, full_name: e.target.value})} />
              <input type="email" placeholder="Email" required style={styles.input} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              <input type="password" placeholder="Password" required style={styles.input} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={{ flex: 1, backgroundColor: '#2563eb', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: '600' }}>Invite</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#475569', padding: '12px', border: 'none', borderRadius: '8px' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;