import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';
import logo from '../../images/SLIIT.png';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedRole, setSelectedRole] = useState('USER');
  const [specialization, setSpecialization] = useState('IT_SUPPORT');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTechnician, setIsTechnician] = useState(false);

  const categories = [
    { value: 'IT_SUPPORT', label: 'IT Support' },
    { value: 'MAINTENANCE', label: 'General Maintenance' },
    { value: 'ELECTRICAL', label: 'Electrical' },
    { value: 'PLUMBING', label: 'Plumbing' },
    { value: 'CLEANING', label: 'Cleaning' },
    { value: 'FACILITY', label: 'Facility Management' },
    { value: 'FURNITURE', label: 'Furniture' }
  ];

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg("Passwords don't match!");
      return;
    }

    try {
      let registerUrl = 'http://localhost:8080/api/users/register';
      let payload = { fullName, email, password };

      if (isAdmin) {
        registerUrl = 'http://localhost:8080/api/admins/register';
      } else if (isTechnician) {
        registerUrl = 'http://localhost:8080/api/technicians/register';
        payload.specialization = specialization;
      }

      const response = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMsg(errorData.error || 'Registration failed');
      } else {
        setSuccessMsg('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setErrorMsg('Network error. Please try again later.');
    }
  };

  const handleGoogleRegister = () => {
    console.log('Initiating Google OAuth 2.0 Registration Flow...');
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <img src={logo} alt="SLIIT Logo" className="register-logo" />
          <h1 className="register-title">Create Account</h1>
          <p className="register-subtitle">Smart Campus Operations Hub</p>
        </div>
        
        <div className="register-body">
          {errorMsg && <div className="error-message">{errorMsg}</div>}
          {successMsg && <div className="success-message">{successMsg}</div>}
          <form className="register-form" onSubmit={handleRegister}>
            <div className="input-group">
              <div className="input-icon">👤</div>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <div className="input-icon">✉️</div>
              <input 
                type="email" 
                placeholder="SLIIT Staff Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <div className="input-icon">🔒</div>
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <div className="input-icon">🔒</div>
              <input 
                type="password" 
                placeholder="Confirm Password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="checkbox-group" style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <input 
                  type="checkbox" 
                  id="isAdminCheckbox" 
                  checked={isAdmin} 
                  onChange={(e) => {
                    setIsAdmin(e.target.checked);
                    if (e.target.checked) setIsTechnician(false);
                  }} 
                  style={{ marginRight: '8px' }}
                />
                <label htmlFor="isAdminCheckbox" style={{ fontSize: '14px', color: '#475569', cursor: 'pointer' }}>Register as Administrator</label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <input 
                  type="checkbox" 
                  id="isTechCheckbox" 
                  checked={isTechnician} 
                  onChange={(e) => {
                    setIsTechnician(e.target.checked);
                    if (e.target.checked) setIsAdmin(false);
                  }} 
                  style={{ marginRight: '8px' }}
                />
                <label htmlFor="isTechCheckbox" style={{ fontSize: '14px', color: '#475569', cursor: 'pointer' }}>Register as Technician</label>
              </div>
            </div>

            {isTechnician && (
              <div className="input-group" style={{ marginBottom: '20px' }}>
                <div className="input-icon">🛠️</div>
                <select 
                  value={specialization} 
                  onChange={(e) => setSpecialization(e.target.value)}
                  style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            )}

            <button type="submit" className="primary-register-btn">
              <span>Register</span>
            </button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <button className="google-register-btn" type="button" onClick={handleGoogleRegister}>
            <svg className="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            <span>Sign up with Google</span>
          </button>
        </div>

        <div className="register-footer">
          <p className="footer-note">
            Already have an account? <span className="login-link" onClick={() => navigate('/login')}>Sign in here</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
