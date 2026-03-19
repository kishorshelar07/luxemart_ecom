import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 16px' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(6rem, 15vw, 12rem)', fontWeight: 300, color: 'var(--accent-gold)', lineHeight: 1, marginBottom: 8 }}
        >404</motion.h1>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', marginBottom: 12 }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 40, maxWidth: 400 }}>
          The page you're looking for doesn't exist or has been moved to a different location.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={() => window.history.back()}>
            <ArrowLeft size={18} /> Go Back
          </button>
          <Link to="/" className="btn btn-primary">
            <Home size={18} /> Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
