import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', fullName: '', role: 'user' });
  const [error, setError] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.data);
    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`${apiUrl}/users`, newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setNewUser({ email: '', password: '', fullName: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add user");
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2>Team Members</h2>
          <button onClick={() => setShowModal(true)} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
            + Add Member
          </button>
        </div>

        {loading ? <p>Loading...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Email</th>
                <th style={{ padding: '12px' }}>Role</th>
                <th style={{ padding: '12px' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{u.full_name}</td>
                  <td style={{ padding: '12px' }}>{u.email}</td>
                  <td style={{ padding: '12px' }}><span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '12px', backgroundColor: '#e2e3e5' }}>{u.role}</span></td>
                  <td style={{ padding: '12px' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '400px' }}>
            <h3>Add New Team Member</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleAdd}>
              <input type="text" placeholder="Full Name" required onChange={(e) => setNewUser({...newUser, fullName: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              <input type="email" placeholder="Email" required onChange={(e) => setNewUser({...newUser, email: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              <input type="password" placeholder="Password" required onChange={(e) => setNewUser({...newUser, password: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              <select onChange={(e) => setNewUser({...newUser, role: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '20px' }}>
                <option value="user">User</option>
                <option value="tenant_admin">Tenant Admin</option>
              </select>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;