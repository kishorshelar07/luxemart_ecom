import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { loginUser, fetchCart } from '../redux/slices/index';
import toast from 'react-hot-toast';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginUser(form)).unwrap();
      await dispatch(fetchCart());
      toast.success('Welcome back!');
      navigate(redirect);
    } catch (err) { toast.error(err || 'Login failed'); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link to="/" className={styles.logo}>LUXE<span>MART</span></Link>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to your account</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Email Address</label>
              <input className="input-field" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required autoFocus />
            </div>
            <div className={styles.formGroup}>
              <label>Password</label>
              <div className={styles.passwordWrap}>
                <input className="input-field" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Link to="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
            <button type="submit" className={`btn btn-primary btn-lg ${styles.submitBtn}`} disabled={loading}>
              {loading ? 'Signing in...' : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>

          <div className={styles.demoCreds}>
            <p>🧑 User: <strong>user@luxemart.com</strong> / <strong>User@123456</strong></p>
            <p>🔑 Admin: <strong>admin@luxemart.com</strong> / <strong>Admin@123456</strong></p>
          </div>
          <p className={styles.switchText}>Don't have an account? <Link to="/register">Create one</Link></p>
        </motion.div>
      </div>
    </div>
  );
}
