import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Team from './pages/Team';
import Login from './pages/Login';
// import Register from './pages/Register';
import Register from './pages/Register'; // Must match Register.js exactly
function App() {
  // Simple check to see if user is logged in
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes - Redirect to login if no token found */}
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/projects" element={isAuthenticated ? <Projects /> : <Navigate to="/login" />} />
        <Route path="/team" element={isAuthenticated ? <Team /> : <Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        {/* Default Landing Page */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

// CRITICAL: This line fixes the "module has no exports" error
export default App;