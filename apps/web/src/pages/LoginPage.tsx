import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import styles from './LoginPage.module.css';
import logoImg from '../../assets/logo.jpeg';

export default function LoginPage() {
  const [isLogin, setIsLogin]                       = useState(true);
  const [isForgotPassword, setIsForgotPassword]     = useState(false);
  const [username, setUsername]                     = useState('');
  const [email, setEmail]                           = useState('');
  const [password, setPassword]                     = useState('');
  const [confirmPassword, setConfirmPassword]       = useState('');
  const [showPassword, setShowPassword]             = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading]                       = useState(false);
  const [error, setError]                           = useState<string | null>(null);
  const [successMsg, setSuccessMsg]                 = useState<string | null>(null);
  const [isRegistering, setIsRegistering]           = useState(false);

  const navigate  = useNavigate();
  const { user }  = useAuth();

  // Redirect to dashboard if already logged in (but not during registration flow)
  useEffect(() => {
    if (user && !isRegistering) navigate('/', { replace: true });
  }, [user, navigate, isRegistering]);

  // ── Login / Sign-up ──────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        setIsRegistering(true);
        const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
        if (username) {
          await updateProfile(newUser, { displayName: username });
        }
        await auth.signOut(); // Firebase auto-logs in on register; log them out immediately
        setSuccessMsg('Registration successful! You may now sign in.');
        setIsLogin(true);
      }
    } catch (err: any) {
      // Map Firebase error codes to user-friendly messages
      const code = err?.code ?? '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in.');
      } else if (code === 'auth/weak-password') {
        setError('Password must be at least 6 characters.');
      } else if (code === 'auth/operation-not-allowed') {
        setError('Email/password sign-in is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method.');
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
      setIsRegistering(false);
    }
  };

  // ── Forgot password ──────────────────────────────────────────────────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg('Password reset email sent! Check your inbox.');
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'An error occurred during password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Visual Left Section */}
      <div className={styles.imageSection}>
        <h1>Smart Drain System</h1>
        <p>Real-time IoT telemetry platform monitoring urban drainage infrastructure safely and reliably.</p>
      </div>

      {/* Authentication Form Section */}
      <div className={styles.formSection}>
        {/* Mobile Brand Name */}
        <div className={styles.brandMobile}>
          <span>💧</span>
          <span>SmartDrain</span>
        </div>

        {/* Logo Image */}
        <div className={styles.logoContainer}>
          <img src={logoImg} alt="Smart Drain Logo" className={styles.logo} />
        </div>

        <h2 className={styles.title}>
          {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>
        <p className={styles.subtitle}>
          {isForgotPassword
            ? 'Enter your email to receive a password reset link.'
            : isLogin
            ? 'Please enter your credentials to access the dashboard.'
            : 'Sign up to monitor telemetry data.'}
        </p>

        {error      && <div className={styles.errorMessage}>{error}</div>}
        {successMsg && <div className={styles.successMessage}>{successMsg}</div>}

        {isForgotPassword ? (
          // ── Forgot Password Form ───────────────────────────────────────────
          <form onSubmit={handleForgotPassword}>
            <div className={styles.formGroup}>
              <label htmlFor="resetEmail" className={styles.label}>Email Address</label>
              <input
                id="resetEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="admin@smartdrain.com"
                required
              />
            </div>

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          // ── Login / Sign Up Form ───────────────────────────────────────────
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className={styles.formGroup}>
                <label htmlFor="username" className={styles.label}>Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={styles.input}
                  placeholder="johndoe"
                  required={!isLogin}
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="admin@smartdrain.com"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <div className={styles.passwordContainer}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${styles.input} ${styles.passwordInput}`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
                <div className={styles.passwordContainer}>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`${styles.input} ${styles.passwordInput}`}
                    placeholder="••••••••"
                    required={!isLogin}
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" y1="2" x2="22" y2="22" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className={styles.forgotPasswordLink}>
              {isLogin && !isForgotPassword && (
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className={styles.forgotButton}
                >
                  Forgot Password?
                </button>
              )}
            </div>

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
        )}

        <div className={styles.toggleMode}>
          {isForgotPassword ? (
            <>
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className={styles.toggleButton}
              >
                Back to Login
              </button>
            </>
          ) : isLogin ? (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className={styles.toggleButton}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className={styles.toggleButton}
              >
                Log In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
