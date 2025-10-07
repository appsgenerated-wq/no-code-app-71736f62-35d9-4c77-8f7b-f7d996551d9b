import React, { useState, useEffect } from 'react';
import Manifest from '@mnfst/sdk';
import LandingPage from './screens/LandingPage';
import DashboardPage from './screens/DashboardPage';
import config from './constants.js';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [backendConnected, setBackendConnected] = useState(null);
  const manifest = new Manifest(config.BACKEND_URL);

  useEffect(() => {
    const checkConnectionAndSession = async () => {
      try {
        await fetch(`${config.BACKEND_URL}/api/health`);
        setBackendConnected(true);
        console.log('✅ [APP] Backend connection successful.');
        const sessionUser = await manifest.from('User').me();
        setUser(sessionUser);
        setCurrentScreen('dashboard');
        console.log('✅ [APP] User session restored.');
      } catch (err) {
        if (err.message.includes('Failed to fetch')) {
          setBackendConnected(false);
          console.error('❌ [APP] Backend connection failed.');
        } else {
          setBackendConnected(true); // API is up, but user not logged in
          setUser(null);
          console.log('... No active user session.');
        }
      }
    };
    checkConnectionAndSession();
  }, []);

  const login = async (email, password) => {
    try {
      await manifest.login(email, password);
      const loggedInUser = await manifest.from('User').me();
      setUser(loggedInUser);
      setCurrentScreen('dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  const signup = async (name, email, password, role) => {
    try {
        await manifest.from('User').signup({ name, email, password, role });
        await login(email, password);
    } catch(error) {
        console.error('Signup failed:', error);
        alert('Signup failed. The email might already be in use.');
    }
  }

  const logout = async () => {
    await manifest.logout();
    setUser(null);
    setCurrentScreen('landing');
  };

  const renderContent = () => {
    if (backendConnected === null) {
      return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className='text-gray-600'>Connecting to backend...</p></div>;
    }
    if (backendConnected === false) {
      return <div className="min-h-screen flex items-center justify-center bg-red-50"><p className='text-red-700 font-bold text-xl'>❌ Backend connection failed. Please ensure the backend is running.</p></div>;
    }
    
    if (user) {
      return <DashboardPage user={user} onLogout={logout} manifest={manifest} />;
    } else {
      return <LandingPage onLogin={login} onSignup={signup} />;
    }
  }

  return (
    <div>
      <div className="fixed top-4 right-4 z-50 flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${backendConnected === true ? 'bg-green-500' : (backendConnected === false ? 'bg-red-500' : 'bg-yellow-500')}`}></div>
        <span className="text-xs text-gray-600">{backendConnected === true ? 'Connected' : (backendConnected === false ? 'Disconnected' : 'Connecting')}</span>
      </div>
      {renderContent()}
    </div>
  );
}

export default App;
