import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logo from '../../images/SLIIT.png';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

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

  const handleGoogleLogin = () => {
    // Placeholder function for OAuth 2.0 integration with Spring Boot Backend
    console.log('Initiating Google OAuth 2.0 Login Flow...');
    // Example: window.location.href = 'http://localhost:8080/oauth2/authorization/google';
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

          <button className="google-login-btn" type="button" onClick={handleGoogleLogin}>
            {/* Standard Google "G" Logo SVG */}
            <svg className="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            <span>Login with Google</span>
          </button>
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
