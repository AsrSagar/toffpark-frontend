import React, { useState } from 'react';
import './AuthForm.css';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true); 
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', rememberMe: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const WP_BASE_URL = 'https://backend.orlass.com'; 

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isLogin) {
        const response = await fetch(`${WP_BASE_URL}/wp-json/jwt-auth/v1/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user_display_name', data.user_display_name);
          localStorage.setItem('user_email', data.user_email);
          
          setMessage({ type: 'success', text: `Welcome back, ${data.user_display_name}! Redirecting...` });

          setTimeout(() => {
            window.location.href = '/my-account';
          }, 1500);
        } else {
          setMessage({ type: 'error', text: data.message || 'Invalid Username or Password!' });
        }

      } else {
        const response = await fetch(`${WP_BASE_URL}/wp-json/wp/v2/users/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email || `${formData.username}@example.com`, 
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          setMessage({ type: 'success', text: 'Registration Successful! Please login now.' });
          setIsLogin(true); 
        } else {
          setMessage({ type: 'error', text: data.message || 'Registration failed. Try again!' });
        }
      }
    } catch (error) {
      console.error("Auth Error:", error);
      setMessage({ type: 'error', text: 'Something went wrong! Please check server connection.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="orl-auth-wrapper">
      <div className="orl-tab-bar">
        <button 
          type="button"
          className={`orl-tab-btn ${isLogin ? 'orl-active' : 'orl-inactive'}`}
          onClick={() => { setIsLogin(true); setMessage({type:'', text:''}); }}
        >
          Login
        </button>
        <span className="orl-tab-circle">OR</span>
        <button 
          type="button"
          className={`orl-tab-btn ${!isLogin ? 'orl-active' : 'orl-inactive'}`}
          onClick={() => { setIsLogin(false); setMessage({type:'', text:''}); }}
        >
          Register
        </button>
      </div>

      <div className="orl-auth-card">
        {message.text && (
          <div className={`orl-auth-alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="orl-auth-form">
          <div className="orl-form-group">
            <label className="orl-form-label">
              Username or email address <span className="orl-required">*</span>
            </label>
            <input 
              type="text" 
              name="username"
              className="orl-form-input"
              value={formData.username}
              onChange={handleChange}
              required 
            />
          </div>
          {!isLogin && (
            <div className="orl-form-group">
              <label className="orl-form-label">Email address</label>
              <input 
                type="email" 
                name="email"
                className="orl-form-input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          )}
          <div className="orl-form-group">
            <label className="orl-form-label">
              Password <span className="orl-required">*</span>
            </label>
            <div className="orl-password-field-container">
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="password"
                className="orl-form-input orl-password-input"
                value={formData.password}
                onChange={handleChange}
                required 
              />
              <button 
                type="button" 
                className="orl-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                  {!showPassword && <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" />}
                </svg>
              </button>
            </div>
          </div>
          <div className="orl-captcha-box">
            <div className="orl-captcha-left">
              <input type="checkbox" id="orl-recaptcha-chk" required />
              <label htmlFor="orl-recaptcha-chk">I'm not a robot</label>
            </div>
            <div className="orl-captcha-right">
              <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="recaptcha" />
              <span>reCAPTCHA</span>
            </div>
          </div>
          <div className="orl-form-footer">
            <div className="orl-footer-left">
              <div className="orl-remember-me">
                <input 
                  type="checkbox" 
                  id="orlRememberMe" 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="orlRememberMe">Remember me</label>
              </div>
              
              <button type="submit" className="orl-submit-btn" disabled={loading}>
                {loading ? 'PROCESSING...' : (isLogin ? 'LOG IN' : 'REGISTER')}
              </button>
            </div>

            {isLogin && (
              <div className="orl-footer-right">
                <a href="/lost-password" className="orl-lost-password">
                  Lost your password?
                </a>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;