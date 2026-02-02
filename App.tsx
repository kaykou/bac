import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import LiveLab from './pages/LiveLab';
import Resources from './pages/Resources';
import AdminDashboard from './pages/AdminDashboard';
import LoginModal from './components/LoginModal';
import AdminLoginModal from './components/AdminLoginModal';
import { User } from './types';
import { api } from './services/api';
import { io } from 'socket.io-client';

// Create a single socket instance for global app state (Presence/Status)
export const globalSocket = io('/', { withCredentials: true, autoConnect: true });

const App: React.FC = () => {
  // Initialize User from API Service
  const [user, setUser] = useState<User | null>(() => api.getCurrentSession());

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  
  // State to track if a live is happening globally (Synced via Server)
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);

  // Setup Global Socket Listeners
  useEffect(() => {
    // 1. Listen for Live Status changes from Server
    globalSocket.on('status-update', (status: boolean) => {
      console.log("Global Live Status Updated:", status);
      setIsLiveActive(status);
    });

    // 2. If user is logged in, announce presence to server
    if (user) {
      globalSocket.emit('user-login', { 
        id: user.id, 
        name: user.name, 
        role: user.role 
      });
    }

    return () => {
      globalSocket.off('status-update');
    };
  }, [user]); // Re-run if user logs in/out

  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    // Announce login immediately
    globalSocket.emit('user-login', { 
      id: authenticatedUser.id, 
      name: authenticatedUser.name, 
      role: authenticatedUser.role 
    });
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    globalSocket.disconnect();
    globalSocket.connect(); // Reconnect as anonymous/clean state
  };

  const openLogin = () => {
    setIsLoginModalOpen(true);
  };

  const openAdminLogin = () => {
    setIsAdminModalOpen(true);
  };

  // This function is now passed to LiveLab to tell Server "I am live"
  const setLiveStatus = (status: boolean) => {
    setIsLiveActive(status);
    globalSocket.emit('set-live-status', status);
  };

  return (
    <Router>
      <Layout 
        user={user} 
        onLogout={handleLogout} 
        onLoginRequest={openLogin}
        onAdminRequest={openAdminLogin}
        isLiveActive={isLiveActive}
      >
        <Routes>
          <Route 
            path="/" 
            element={<Dashboard user={user} onRequireAuth={openLogin} />} 
          />
          <Route 
            path="/courses" 
            element={<Courses user={user} onRequireAuth={openLogin} />} 
          />
          <Route 
            path="/resources" 
            element={<Resources user={user} onRequireAuth={openLogin} />} 
          />
          <Route 
            path="/live" 
            element={
              <LiveLab 
                user={user} 
                onRequireAuth={openLogin} 
                setLiveStatus={setLiveStatus} 
              />
            } 
          />
          <Route 
            path="/dashboard" 
            element={<AdminDashboard user={user} onRequireAuth={openLogin} />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLogin={handleLogin} 
      />

      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLogin={handleLogin}
      />
    </Router>
  );
};

export default App;