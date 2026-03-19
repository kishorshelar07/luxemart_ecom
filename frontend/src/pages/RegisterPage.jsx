import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { registerUser, fetchCart } from '../redux/slices/index';
import toast from 'react-hot-toast';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    try {
      await dispatch(registerUser(form)).unwrap();
      await dispatch(fetchCart());
      toast.success('Account created successfully! Welcome to LuxeMart 🎉');
      navigate('/');
    } catch (err) { toast.error(err || 'Registration failed'); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link to="/" className={styles.logo}>LUXE<span>MART</span></Link>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join thousands of happy customers</p>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Full Name</label>
              <input className="input-field" placeholder="John Doe" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className={styles.formGroup}>
              <label>Email Address</label>
              <input className="input-field" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div className={styles.formGroup}>
              <label>Phone (optional)</label>
              <input className="input-field" type="tel" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className={styles.formGroup}>
              <label>Password</label>
              <div className={styles.passwordWrap}>
                <input className="input-field" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={8} />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className={`btn btn-primary btn-lg ${styles.submitBtn}`} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <p className={styles.switchText}>Already have an account? <Link to="/login">Sign in</Link></p>
        </motion.div>
      </div>
    </div>
  );
}
