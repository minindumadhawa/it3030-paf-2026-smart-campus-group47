import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logo from '../../images/SLIIT.png';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { showNotification } = useNotification();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem('user', JSON.stringify(userData));
        showNotification('Login successful! Welcome back.', 'success');
        if (userData.role === 'ADMIN') {
          navigate('/admin-dashboard');
        } else if (userData.role === 'TECHNICIAN') {
          navigate('/technician-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        const data = await response.json();
        showNotification(data.error || 'Login failed. Please check your credentials.', 'error');
      }
    } catch(err) {
      showNotification('Network error. Please try again later.', 'error');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      
      const response = await fetch('http://localhost:8080/api/users/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           email: decoded.email, 
           fullName: decoded.name 
        })
      });

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem('user', JSON.stringify(userData));
        showNotification('Google Login successful! Welcome back.', 'success');
        if (userData.role === 'ADMIN') {
          navigate('/admin-dashboard');
        } else if (userData.role === 'TECHNICIAN') {
          navigate('/technician-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        const data = await response.json();
        showNotification(data.error || 'Google Login failed.', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Error processing Google authentication.', 'error');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="SLIIT Logo" className="login-logo" />
          <h1 className="login-title">Campus Login</h1>
          <p className="login-subtitle">Smart Campus Operations Hub</p>
        </div>

        <div className="login-body">
          <form className="login-form" onSubmit={handleEmailLogin}>
            <div className="input-group">
              <div className="input-icon">
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="Student or Staff Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <div className="input-icon">
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-actions">
              <a href="#forgot" className="forgot-password">Forgot Password?</a>
            </div>

            <button type="submit" className="primary-login-btn">
              <LogIn size={18} />
              <span>Sign In</span>
            </button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="google-login-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <GoogleOAuthProvider clientId="1234567890-mockclientid.apps.googleusercontent.com">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  showNotification('Google Login initialization failed or was closed.', 'error');
                }}
              />
            </GoogleOAuthProvider>
            {/* Note for developers: Replace clientId above with your real Google Cloud Console Client ID */}
          </div>
        </div>

        <div className="login-footer">
          <p className="footer-note">
            Please use your SLIIT staff email to proceed
          </p>
          <p className="footer-note" style={{ marginTop: '10px' }}>
            Don't have an account? <span style={{ color: '#f97316', fontWeight: '600', cursor: 'pointer', textDecoration: 'none' }} onClick={() => navigate('/register')} onMouseOver={(e) => e.target.style.textDecoration = 'underline'} onMouseOut={(e) => e.target.style.textDecoration = 'none'}>Register here</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
