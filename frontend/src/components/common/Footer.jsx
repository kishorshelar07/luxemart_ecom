import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div>
          <Link to="/" className={styles.logo}>LUXE<span>MART</span></Link>
          <p className={styles.tagline}>Premium shopping redefined. Curated luxury for the discerning individual.</p>
        </div>
        <div>
          <p className={styles.colTitle}>Shop</p>
          {['Electronics','Fashion','Home & Living','Sports','Beauty'].map(l => (
            <Link key={l} to={`/category/${l.toLowerCase().replace(/\s+/g,'-')}`} className={styles.footerLink}>{l}</Link>
          ))}
        </div>
        <div>
          <p className={styles.colTitle}>Support</p>
          {[['FAQ','/faq'],['Returns','/returns'],['Shipping','/shipping'],['Contact','/contact']].map(([l,p]) => (
            <Link key={l} to={p} className={styles.footerLink}>{l}</Link>
          ))}
        </div>
        <div>
          <p className={styles.colTitle}>Company</p>
          {[['About','/about'],['Careers','/careers'],['Press','/press'],['Privacy','/privacy']].map(([l,p]) => (
            <Link key={l} to={p} className={styles.footerLink}>{l}</Link>
          ))}
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        <p>© {new Date().getFullYear()} LuxeMart. All rights reserved.</p>
        <p style={{color:'var(--accent-gold)'}}>Made with ❤️ in India</p>
      </div>
    </footer>
  );
}
