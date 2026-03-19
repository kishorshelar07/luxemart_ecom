import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';
import styles from './AuthPage.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link to="/" className={styles.logo}>LUXE<span>MART</span></Link>

          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
              <h1 className={styles.title}>Email Sent!</h1>
              <p className={styles.subtitle} style={{ marginBottom: 28 }}>
                We've sent a password reset link to <strong style={{ color: 'var(--accent-gold)' }}>{email}</strong>.
                Check your inbox (and spam folder).
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                Link expires in <strong>10 minutes</strong>.
              </p>
              <Link to="/login" className="btn btn-outline" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className={styles.title}>Forgot Password?</h1>
              <p className={styles.subtitle}>Enter your email and we'll send you a reset link.</p>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Email Address</label>
                  <input
                    className="input-field"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className={`btn btn-primary btn-lg ${styles.submitBtn}`}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : <><Send size={18} /> Send Reset Link</>}
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
