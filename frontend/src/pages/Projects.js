import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  const fetchProjects = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data.data.projects || []);
    } catch (err) {
      console.error("Error fetching projects", err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`${apiUrl}/projects`, newProject, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    }
  };

  // Modern UI Styles
  const styles = {
    container: { padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: '"Inter", sans-serif', color: '#334155' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
    title: { fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: 0 },
    btnPrimary: { padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' },
    card: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', transition: 'transform 0.2s ease-in-out' },
    cardTitle: { fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' },
    cardDesc: { fontSize: '14px', color: '#64748b', lineHeight: '1.5', marginBottom: '16px' },
    badge: { display: 'inline-block', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600', backgroundColor: '#f0fdf4', color: '#166534' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
    modalContent: { backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '450px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' },
    input: { width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #cbd5e1', borderRadius: '8px', boxSizing: 'border-box', fontSize: '16px' },
    label: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#475569' }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Project Dashboard</h2>
          <button 
            onClick={() => setShowModal(true)} 
            style={styles.btnPrimary}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            + New Project
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>
        ) : (
          <div style={styles.grid}>
            {projects.map(project => (
              <div key={project.id} style={styles.card}>
                <h3 style={styles.cardTitle}>{project.name}</h3>
                <p style={styles.cardDesc}>{project.description || 'No description provided.'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={styles.badge}>Active</span>
                  <small style={{ color: '#94a3b8' }}>Created by {project.creator_name || 'Admin'}</small>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', backgroundColor: '#fff', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                <p style={{ color: '#64748b' }}>No projects found. Start by creating your first one!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ ...styles.title, fontSize: '22px', marginBottom: '24px' }}>Create New Project</h3>
            {error && <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
            <form onSubmit={handleCreate}>
              <label style={styles.label}>Project Name</label>
              <input 
                type="text" required placeholder="e.g. Q4 Marketing Campaign"
                value={newProject.name} style={styles.input}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})} 
              />
              <label style={styles.label}>Description</label>
              <textarea 
                placeholder="What is this project about?"
                value={newProject.description} style={{ ...styles.input, height: '100px', resize: 'none' }}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})} 
              />
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" style={styles.btnPrimary}>Create Project</button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  style={{ ...styles.btnPrimary, backgroundColor: '#f1f5f9', color: '#475569' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;