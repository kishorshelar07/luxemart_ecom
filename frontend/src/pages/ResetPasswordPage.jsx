import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';
import styles from './AuthPage.module.css';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, form.password);
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link to="/" className={styles.logo}>LUXE<span>MART</span></Link>

          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <CheckCircle size={52} style={{ color: 'var(--accent-gold)', marginBottom: 16 }} />
              <h1 className={styles.title}>Password Reset!</h1>
              <p className={styles.subtitle}>Your password has been changed successfully.</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                Redirecting to login...
              </p>
              <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className={styles.title}>Reset Password</h1>
              <p className={styles.subtitle}>Enter your new password below.</p>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>New Password</label>
                  <div className={styles.passwordWrap}>
                    <input
                      className="input-field"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      required
                      autoFocus
                    />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Confirm Password</label>
                  <div className={styles.passwordWrap}>
                    <input
                      className="input-field"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat new password"
                      value={form.confirmPassword}
                      onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                      required
                    />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Password match indicator */}
                {form.confirmPassword && (
                  <p style={{ fontSize: 12, color: form.password === form.confirmPassword ? '#4caf50' : '#f44336', marginTop: -8 }}>
                    {form.password === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}

                <button
                  type="submit"
                  className={`btn btn-primary btn-lg ${styles.submitBtn}`}
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : <><Lock size={18} /> Reset Password</>}
                </button>
              </form>

              <p className={styles.switchText}>
                <Link to="/login" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--accent-gold)' }}>
                  <ArrowLeft size={14} /> Back to Login
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
