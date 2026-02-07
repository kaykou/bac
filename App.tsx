import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import LiveLab from './pages/LiveLab';
import Resources from './pages/Resources';
import SujetsBac from './pages/SujetsBac';
import Forum from './pages/Forum';
import Videos from './pages/Videos';
import DailyScience from './pages/DailyScience';
import AdminDashboard from './pages/AdminDashboard';
import LoginModal from './components/LoginModal';
import AdminLoginModal from './components/AdminLoginModal';
import MusicPlayer from './components/MusicPlayer';
import { User } from './types';
import { api } from './services/api';
import { io } from 'socket.io-client';
import { Loader2 } from 'lucide-react';

export const globalSocket = io('/', { withCredentials: true, autoConnect: true });

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthLoading(true);
      const currentUser = await api.getMe();
      setUser(currentUser);
      setIsAuthLoading(false);
      
      if (currentUser && globalSocket.disconnected) {
        globalSocket.connect();
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    globalSocket.on('status-update', (status: boolean) => {
      setIsLiveActive(status);
    });
    
    return () => {
      globalSocket.off('status-update');
    };
  }, []);

  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    globalSocket.disconnect();
    globalSocket.connect(); 
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    globalSocket.disconnect();
  };

  const openLogin = () => {
    setIsLoginModalOpen(true);
  };

  const openAdminLogin = () => {
    setIsAdminModalOpen(true);
  };

  const setLiveStatus = (status: boolean) => {
    setIsLiveActive(status);
    globalSocket.emit('set-live-status', status);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50">
        <Loader2 className="w-10 h-10 text-bac-blue animate-spin" />
      </div>
    );
  }

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
            path="/sujets-bac" 
            element={<SujetsBac user={user} onRequireAuth={openLogin} />} 
          />
          <Route 
            path="/videos" 
            element={<Videos user={user} onRequireAuth={openLogin} />} 
          />
          <Route 
            path="/forum" 
            element={<Forum user={user} onRequireAuth={openLogin} />} 
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
             path="/daily-science" 
             element={<DailyScience />} 
          />
          <Route 
            path="/dashboard" 
            element={
               user?.role === 'TEACHER' 
                 ? <AdminDashboard user={user} onRequireAuth={openLogin} />
                 : <Navigate to="/" replace />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      
      {/* Global Music Player */}
      <MusicPlayer />
      
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