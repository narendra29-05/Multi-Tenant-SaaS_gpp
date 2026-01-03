import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ projects: 0, tasks: 0, completed: 0, pending: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        api.get('/projects?limit=5'),
        api.get(`/projects/tasks?assignedTo=${user?.id}`)
      ]);

      const projects = projectsRes.data.data.projects || [];
      const tasks = tasksRes.data.data.tasks || [];

      setRecentProjects(projects);
      setMyTasks(tasks.filter(t => t.assignedTo === user?.id || t.assigned_to === user?.id));

      setStats({
        projects: projectsRes.data.data.total || projects.length,
        tasks: projects.reduce((sum, p) => sum + parseInt(p.task_count || 0), 0),
        completed: projects.reduce((sum, p) => sum + parseInt(p.completed_task_count || 0), 0),
        pending: tasks.filter(t => t.status !== 'completed').length
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{height: '80vh'}}>
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  return (
    <div className="dashboard-wrapper p-4">
      <style>{`
        .dashboard-wrapper { background: #f8f9fa; min-height: 100vh; }
        .stat-card {
          background: white;
          border-radius: 15px;
          padding: 25px;
          border: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transition: transform 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .stat-card:hover { transform: translateY(-5px); }
        .stat-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 4px; height: 100%;
        }
        .card-blue::after { background: #4e73df; }
        .card-green::after { background: #1cc88a; }
        .card-orange::after { background: #f6c23e; }
        .card-purple::after { background: #6f42c1; }
        
        .stat-value { font-size: 1.8rem; font-weight: 700; color: #333; }
        .stat-label { color: #858796; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }
        
        .section-title { font-weight: 700; color: #4e73df; margin-bottom: 1.5rem; }
        .content-card {
          border-radius: 15px;
          border: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          background: white;
        }
        .content-card .card-header {
          background: white;
          border-bottom: 1px solid #f1f1f1;
          padding: 15px 20px;
          font-weight: 700;
          border-radius: 15px 15px 0 0;
        }
        .badge-soft-success { background: #e1f7ec; color: #0e9f6e; }
        .badge-soft-primary { background: #e1effe; color: #3f83f8; }
        .badge-soft-warning { background: #fdf6b2; color: #723b13; }
      `}</style>

      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="section-title mb-0">Welcome back, {user?.fullName || 'User'}!</h2>
            <p className="text-muted">Here's what's happening with your projects today.</p>
          </div>
          <Link to="/projects" className="btn btn-primary px-4 shadow-sm" style={{borderRadius: '10px'}}>
            + New Project
          </Link>
        </div>
        
        {/* Stats Row */}
        <div className="row mb-5">
          <div className="col-md-3 mb-3">
            <div className="stat-card card-blue">
              <div className="stat-label">Total Projects</div>
              <div className="stat-value">{stats.projects}</div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="stat-card card-purple">
              <div className="stat-label">Total Tasks</div>
              <div className="stat-value">{stats.tasks}</div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="stat-card card-green">
              <div className="stat-label">Completed</div>
              <div className="stat-value">{stats.completed}</div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="stat-card card-orange">
              <div className="stat-label">Active Pending</div>
              <div className="stat-value">{stats.pending}</div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Recent Projects Column */}
          <div className="col-lg-6 mb-4">
            <div className="content-card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>Recent Projects</span>
                <Link to="/projects" className="small text-decoration-none">View All</Link>
              </div>
              <div className="card-body p-0">
                {recentProjects.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {recentProjects.map(p => (
                      <div key={p.id} className="list-group-item p-3 border-0 border-bottom">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-0 fw-bold">{p.name}</h6>
                            <small className="text-muted">{p.task_count || 0} tasks total</small>
                          </div>
                          <span className={`badge ${p.status === 'active' ? 'badge-soft-success' : 'badge-soft-primary'}`}>
                            {p.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted">No projects found.</div>
                )}
              </div>
            </div>
          </div>

          {/* My Tasks Column */}
          <div className="col-lg-6 mb-4">
            <div className="content-card">
              <div className="card-header">My Assigned Tasks</div>
              <div className="card-body p-0">
                {myTasks.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {myTasks.slice(0, 5).map(t => (
                      <div key={t.id} className="list-group-item p-3 border-0 border-bottom">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-0 fw-bold">{t.title}</h6>
                            <div className="d-flex gap-2">
                                <small className="text-muted">Priority: <span className="text-primary">{t.priority}</span></small>
                            </div>
                          </div>
                          <span className={`badge ${t.status === 'completed' ? 'badge-soft-success' : 'badge-soft-warning'}`}>
                            {t.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted">No tasks assigned to you.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;