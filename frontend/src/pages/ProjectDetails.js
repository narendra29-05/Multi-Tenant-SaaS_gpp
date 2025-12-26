import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
const ProjectDetails = () => {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium' });

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/tasks/projects/${projectId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data.data.tasks || []);
    } catch (err) {
      console.error("Error fetching tasks", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, apiUrl, token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/tasks/projects/${projectId}/tasks`, newTask, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowTaskModal(false);
      setNewTask({ title: '', priority: 'medium' });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating task");
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ padding: '30px' }}>
        <button onClick={() => window.history.back()}>← Back to Projects</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <h2>Project Tasks</h2>
          <button onClick={() => setShowTaskModal(true)} style={{ backgroundColor: '#007bff', color: 'white', padding: '10px' }}>+ New Task</button>
        </div>

        {loading ? <p>Loading tasks...</p> : (
          <div style={{ marginTop: '20px' }}>
            {tasks.map(task => (
              <div key={task.id} style={{ border: '1px solid #eee', padding: '15px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', borderRadius: '5px' }}>
                <div>
                  <strong>{task.title}</strong>
                  <div style={{ fontSize: '12px', color: '#666' }}>Priority: {task.priority}</div>
                </div>
                <div>
                  <span style={{ padding: '5px', borderRadius: '3px', backgroundColor: task.status === 'completed' ? '#d4edda' : '#fff3cd' }}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
            {tasks.length === 0 && <p>No tasks yet.</p>}
          </div>
        )}
      </div>

      {showTaskModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px' }}>
            <h3>Add Task</h3>
            <form onSubmit={handleCreateTask}>
              <input type="text" placeholder="Task Title" required style={{ width: '100%', marginBottom: '10px' }} 
                onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
              <select onChange={(e) => setNewTask({...newTask, priority: e.target.value})} style={{ width: '100%', marginBottom: '10px' }}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button type="submit">Create Task</button>
              <button type="button" onClick={() => setShowTaskModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;