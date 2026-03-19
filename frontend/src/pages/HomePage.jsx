import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, Shield, Truck, RefreshCw, Headphones, ChevronRight } from 'lucide-react';
import { fetchFeaturedProducts, fetchTrendingProducts } from '../redux/slices/index';
import ProductCard from '../components/product/ProductCard';
import { productService, categoryService } from '../services/api';
import { useState } from 'react';
import styles from './HomePage.module.css';

const FEATURES = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹999' },
  { icon: Shield, title: 'Secure Payment', desc: '100% protected' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '30 days return policy' },
  { icon: Headphones, title: '24/7 Support', desc: 'Dedicated support' },
];

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
};

const stagger = { animate: { transition: { staggerChildren: 0.1 } } };

export default function HomePage() {
  const dispatch = useDispatch();
  const { featured, trending } = useSelector(s => s.products);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchTrendingProducts());
    categoryService.getMain().then(r => setCategories(r.data.categories || []));
  }, [dispatch]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setActiveBanner(p => (p + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const heroSlides = [
    {
      title: 'Redefine Your\nAesthetic',
      subtitle: 'Curated luxury for the discerning individual',
      cta: 'Explore Collection',
      link: '/products',
      bg: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&q=80',
      accent: '#d4af37'
    },
    {
      title: 'Tech That\nInspires',
      subtitle: 'Premium electronics for the modern professional',
      cta: 'Shop Electronics',
      link: '/category/electronics',
      bg: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1920&q=80',
      accent: '#4f46e5'
    },
    {
      title: 'Wear Your\nStory',
      subtitle: 'Fashion that speaks before you do',
      cta: 'View Fashion',
      link: '/category/fashion',
      bg: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80',
      accent: '#ec4899'
    }
  ];

  const [activeSlide, setActiveSlide] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setActiveSlide(p => (p + 1) % heroSlides.length), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.homepage}>
      {/* ========= HERO SECTION ========= */}
      <section className={styles.hero} ref={heroRef}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            className={styles.heroSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.div className={styles.heroBg} style={{ y: heroY }}>
              <img src={heroSlides[activeSlide].bg} alt="" className={styles.heroBgImg} />
              <div className={styles.heroBgOverlay} />
            </motion.div>

            <motion.div className={`container ${styles.heroContent}`} style={{ opacity: heroOpacity }}>
              <motion.div
                variants={stagger}
                initial="initial"
                animate="animate"
                className={styles.heroText}
              >
                <motion.div variants={fadeInUp} className={styles.heroEyebrow}>
                  <span className={styles.heroEyebrowDot} />
                  New Collection 2025
                </motion.div>
                <motion.h1 variants={fadeInUp} className={styles.heroTitle}>
                  {heroSlides[activeSlide].title.split('\n').map((line, i) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                </motion.h1>
                <motion.p variants={fadeInUp} className={styles.heroSub}>
                  {heroSlides[activeSlide].subtitle}
                </motion.p>
                <motion.div variants={fadeInUp} className={styles.heroCtas}>
                  <Link to={heroSlides[activeSlide].link} className={`btn btn-primary btn-lg ${styles.heroPrimary}`}>
                    {heroSlides[activeSlide].cta}
                    <ArrowRight size={20} />
                  </Link>
                  <Link to="/products" className={`btn btn-outline btn-lg ${styles.heroSecondary}`}>
                    View All
                  </Link>
                </motion.div>

                {/* Trust badges */}
                <motion.div variants={fadeInUp} className={styles.heroTrust}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="var(--accent-gold)" stroke="none" />)}
                  <span>4.9/5 from 50,000+ reviews</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
        <div className={styles.slideIndicators}>
          {heroSlides.map((_, i) => (
            <button
              key={i}
              className={`${styles.indicator} ${i === activeSlide ? styles.indicatorActive : ''}`}
              onClick={() => setActiveSlide(i)}
            />
          ))}
        </div>

        {/* Scroll indicator */}
        <motion.div
          className={styles.scrollIndicator}
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className={styles.scrollMouse}>
            <div className={styles.scrollDot} />
          </div>
        </motion.div>
      </section>

      {/* ========= FEATURES BAR ========= */}
      <section className={styles.featuresBar}>
        <div className="container">
          <div className={styles.featuresGrid}>
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                className={styles.featureItem}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className={styles.featureIcon}>
                  <Icon size={22} />
                </div>
                <div>
                  <p className={styles.featureTitle}>{title}</p>
                  <p className={styles.featureDesc}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========= CATEGORIES ========= */}
      <section className="section">
        <div className="container">
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className={styles.sectionEyebrow}>Browse By</p>
            <h2 className={styles.sectionTitle}>Shop Categories</h2>
          </motion.div>

          <div className={styles.categoriesGrid}>
            {(categories.length > 0 ? categories : [
              { name: 'Electronics', slug: 'electronics', image: { url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' } },
              { name: 'Fashion', slug: 'fashion', image: { url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400' } },
              { name: 'Home & Living', slug: 'home-living', image: { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400' } },
              { name: 'Sports', slug: 'sports', image: { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400' } },
              { name: 'Beauty', slug: 'beauty', image: { url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400' } },
              { name: 'Books', slug: 'books', image: { url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400' } },
            ]).map((cat, i) => (
              <motion.div
                key={cat._id || cat.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <Link to={`/category/${cat.slug}`} className={styles.categoryCard}>
                  <div className={styles.categoryImgWrap}>
                    <img src={cat.image?.url} alt={cat.name} className={styles.categoryImg} />
                    <div className={styles.categoryOverlay} />
                  </div>
                  <div className={styles.categoryInfo}>
                    <span className={styles.categoryName}>{cat.name}</span>
                    <ChevronRight size={16} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========= FEATURED PRODUCTS ========= */}
      <section className={`section ${styles.featuredSection}`}>
        <div className="container">
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className={styles.sectionEyebrow}>Handpicked for You</p>
            <h2 className={styles.sectionTitle}>Featured Products</h2>
            <Link to="/products?featured=true" className={styles.sectionLink}>
              View All <ArrowRight size={16} />
            </Link>
          </motion.div>

          <div className="grid-products">
            {(featured.length > 0 ? featured : Array(4).fill(null)).map((product, i) => (
              product
                ? <ProductCard key={product._id} product={product} index={i} />
                : <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ========= PROMO BANNER ========= */}
      <section className={styles.promoBanner}>
        <div className="container">
          <motion.div
            className={styles.promoCard}
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <img
              src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1400&q=80"
              alt="Special Offer"
              className={styles.promoBg}
            />
            <div className={styles.promoOverlay} />
            <div className={styles.promoContent}>
              <span className={`badge badge-gold ${styles.promoEyebrow}`}>Limited Time</span>
              <h2 className={styles.promoTitle}>Up to 40% Off<br />Premium Brands</h2>
              <p className={styles.promoSub}>Use code <strong>LUXE500</strong> for extra ₹500 off on orders above ₹5000</p>
              <Link to="/products?discount=true" className="btn btn-primary btn-lg">
                Shop the Sale <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========= TRENDING ========= */}
      <section className="section">
        <div className="container">
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className={styles.sectionEyebrow}>What's Hot</p>
            <h2 className={styles.sectionTitle}>Trending Now</h2>
            <Link to="/products?sort=-soldCount" className={styles.sectionLink}>
              View All <ArrowRight size={16} />
            </Link>
          </motion.div>

          <div className="grid-products">
            {(trending.length > 0 ? trending : Array(4).fill(null)).map((product, i) => (
              product
                ? <ProductCard key={product._id} product={product} index={i} />
                : <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ========= TESTIMONIALS ========= */}
      <section className={`section ${styles.testimonialsSection}`}>
        <div className="container">
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className={styles.sectionEyebrow}>What Customers Say</p>
            <h2 className={styles.sectionTitle}>Loved by Thousands</h2>
          </motion.div>

          <div className={styles.testimonialsGrid}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                className={styles.testimonialCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={styles.testimonialStars}>
                  {[...Array(5)].map((_, s) => <Star key={s} size={14} fill="var(--accent-gold)" stroke="none" />)}
                </div>
                <p className={styles.testimonialText}>"{t.text}"</p>
                <div className={styles.testimonialAuthor}>
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`} alt={t.name} className={styles.testimonialAvatar} />
                  <div>
                    <p className={styles.testimonialName}>{t.name}</p>
                    <p className={styles.testimonialRole}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========= NEWSLETTER ========= */}
      <section className={styles.newsletter}>
        <div className="container">
          <motion.div
            className={styles.newsletterBox}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className={styles.newsletterTitle}>Stay in the Loop</h2>
            <p className={styles.newsletterSub}>Get exclusive deals, new arrivals & style tips in your inbox.</p>
            <form className={styles.newsletterForm} onSubmit={(e) => { e.preventDefault(); }}>
              <input type="email" placeholder="Enter your email address" className={`input-field ${styles.newsletterInput}`} required />
              <button type="submit" className={`btn btn-primary ${styles.newsletterBtn}`}>Subscribe</button>
            </form>
            <p className={styles.newsletterDisclaimer}>No spam. Unsubscribe anytime.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// ===== Skeleton =====
function ProductCardSkeleton() {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="skeleton" style={{ aspectRatio: '3/4', borderRadius: 0 }} />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="skeleton" style={{ height: '12px', width: '60%' }} />
        <div className="skeleton" style={{ height: '16px', width: '90%' }} />
        <div className="skeleton" style={{ height: '16px', width: '40%' }} />
      </div>
    </div>
  );
}

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Fashion Designer, Mumbai', text: 'LuxeMart has completely transformed my shopping experience. The quality is unmatched and delivery is lightning fast.' },
  { name: 'Arjun Mehta', role: 'Tech Entrepreneur, Bangalore', text: 'Finally a platform that understands premium. Got my MacBook in perfect condition. The customer service is exceptional.' },
  { name: 'Ananya Singh', role: 'Interior Designer, Delhi', text: "The home decor collection is absolutely stunning. Every piece I've ordered has been exactly as described. Absolutely love it!" },
  { name: 'Rohan Kapoor', role: 'Fitness Coach, Pune', text: 'The sports equipment quality is premium. My Peloton arrived well-packaged and the setup support was excellent.' },
];
