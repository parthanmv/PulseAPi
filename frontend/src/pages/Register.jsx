import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import client from '../api/client';
import './Pages.css';

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const passwordErrors = useMemo(() => {
    const errors = [];
    if (password.length > 0 && password.length < 8) {
      errors.push('Password must be at least 8 characters long.');
    }
    if (password.length > 0 && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.push('Password must contain uppercase, lowercase, and a number.');
    }
    return errors;
  }, [password]);

  const confirmError = useMemo(() => {
    if (confirmPassword.length > 0 && password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    return '';
  }, [password, confirmPassword]);

  const isValid = useMemo(() => {
    return (
      name.trim().length > 0 &&
      email.length > 0 &&
      password.length >= 8 &&
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password) &&
      password === confirmPassword
    );
  }, [name, email, password, confirmPassword]);

  const startResendTimer = useCallback(() => {
    setResendCooldown(60);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || loading) return;

    setError('');
    setLoading(true);
    try {
      await client.post('/api/auth/register', { name, email, password });
      setStep('otp');
      startResendTimer();
      showToast('Verification code sent to your email.', 'success');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6 || verifying) return;

    setError('');
    setVerifying(true);
    try {
      const response = await client.post('/api/auth/verify-otp', { email, otp });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      setOtpSuccess(true);
      showToast('Email verified! Welcome to PulseAPI.', 'success');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid verification code.');
      setOtp('');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setError('');
    try {
      await client.post('/api/auth/resend-otp', { email });
      startResendTimer();
      showToast('New verification code sent.', 'success');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to resend code.');
    }
  };

  const handleBack = () => {
    setStep('form');
    setError('');
    setOtp('');
  };

  if (step === 'otp') {
    return (
      <div className="auth-wrapper fade-in">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="brand-logo">P</div>
            <h2>PulseAPI</h2>
          </div>

          {otpSuccess ? (
            <>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle size={56} style={{ color: '#22C55E', marginBottom: '16px' }} />
                <h1 className="auth-title">Email Verified!</h1>
                <p className="auth-subtitle" style={{ marginTop: '8px' }}>Redirecting to dashboard...</p>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={handleBack}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.875rem', padding: '0', marginBottom: '16px' }}
              >
                <ArrowLeft size={16} /> Back
              </button>

              <h1 className="auth-title">Verify your email</h1>
              <p className="auth-subtitle">
                Enter the 6-digit code sent to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
              </p>

              {error && (
                <div style={{ margin: '0 0 16px 0', padding: '10px 14px', borderRadius: '8px',
                  background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626',
                  fontSize: '0.875rem', textAlign: 'center' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOTP} className="auth-form">
                <div className="form-group">
                  <label htmlFor="otp">Verification Code</label>
                  <div className="otp-input-wrapper">
                    <input
                      type="text"
                      id="otp"
                      className="otp-input"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtp(val);
                      }}
                      autoFocus
                      autoComplete="one-time-code"
                      inputMode="numeric"
                    />
                  </div>
                  <span className="field-hint">Enter the 6-digit code sent to your email</span>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={verifying || otp.length !== 6}
                >
                  {verifying ? (
                    <><Loader2 size={18} className="spin" /> Verifying...</>
                  ) : (
                    'Verify Email'
                  )}
                </button>
              </form>

              <div className="auth-footer" style={{ marginTop: '16px' }}>
                <p>
                  Didn't receive the code?{' '}
                  {resendCooldown > 0 ? (
                    <span style={{ color: 'var(--text-muted)' }}>
                      Resend in {resendCooldown}s
                    </span>
                  ) : (
                    <button
                      onClick={handleResendOTP}
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', padding: 0 }}
                    >
                      Resend code
                    </button>
                  )}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper fade-in">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-logo">P</div>
          <h2>PulseAPI</h2>
        </div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Create an account to start API monitoring.</p>

        {error && (
          <div style={{ margin: '0 0 16px 0', padding: '10px 14px', borderRadius: '8px',
            background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626',
            fontSize: '0.875rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              className="input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="input"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="password-strength">
              <div className="strength-bar">
                <div
                  className={`strength-fill ${password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password) ? 'strong' : password.length >= 4 ? 'medium' : ''}`}
                  style={{ width: `${Math.min((password.length / 8) * 100, 100)}%` }}
                />
              </div>
              <div className="strength-checks">
                <span className={`check-item ${password.length >= 8 ? 'valid' : ''}`}>
                  <CheckCircle size={12} /> 8+ characters
                </span>
                <span className={`check-item ${/[A-Z]/.test(password) ? 'valid' : ''}`}>
                  <CheckCircle size={12} /> Uppercase
                </span>
                <span className={`check-item ${/[a-z]/.test(password) ? 'valid' : ''}`}>
                  <CheckCircle size={12} /> Lowercase
                </span>
                <span className={`check-item ${/\d/.test(password) ? 'valid' : ''}`}>
                  <CheckCircle size={12} /> Number
                </span>
              </div>
            </div>
            {passwordErrors.map((err, i) => (
              <span key={i} className="field-error">{err}</span>
            ))}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                className="input"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmError && (
              <span className="field-error">{confirmError}</span>
            )}
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading || !isValid}
          >
            {loading ? (
              <><Loader2 size={18} className="spin" /> Sending code...</>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
