import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Share2, Star, Truck, Shield, RefreshCw, ChevronRight, Plus, Minus, ZoomIn } from 'lucide-react';
import { fetchProduct, addToCart, toggleWishlistItem } from '../redux/slices/index';
import { productService } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import { formatPrice, isInWishlist, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';
import styles from './ProductDetailPage.module.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProduct: product, loading } = useSelector(s => s.products);
  const { user } = useSelector(s => s.auth);
  const { items: wishlist } = useSelector(s => s.wishlist);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    dispatch(fetchProduct(id));
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!product) return;
    productService.getRelated(product._id).then(r => setRelated(r.data.products));
    productService.getReviews(product._id).then(r => setReviews(r.data.reviews || []));
  }, [product?._id]);

  if (loading || !product) return <ProductDetailSkeleton />;

  const images = product.images || [];
  const effectivePrice = product.effectivePrice || product.price;
  const discountPercent = product.discountPercentage || 0;
  const inWishlist = isInWishlist(wishlist, product._id);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login to add items to cart'); return; }
    setAddingToCart(true);
    try {
      await dispatch(addToCart({ productId: product._id, quantity: qty, variant: selectedVariants })).unwrap();
      toast.success(`${qty} item${qty > 1 ? 's' : ''} added to cart!`);
    } catch (err) { toast.error(err || 'Failed to add to cart'); }
    finally { setAddingToCart(false); }
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login to save items'); return; }
    try {
      const r = await dispatch(toggleWishlistItem(product._id)).unwrap();
      toast.success(r.added ? 'Added to wishlist' : 'Removed from wishlist');
    } catch { toast.error('Failed to update wishlist'); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to submit a review'); return; }
    setSubmitting(true);
    try {
      const r = await productService.createReview(product._id, reviewForm);
      setReviews(prev => [r.data.review, ...prev]);
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast.success('Review submitted!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit review'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/">Home</Link>
          <ChevronRight size={14} />
          <Link to="/products">Products</Link>
          <ChevronRight size={14} />
          {product.category && <Link to={`/category/${product.category.slug}`}>{product.category.name}</Link>}
          {product.category && <ChevronRight size={14} />}
          <span>{product.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className={styles.productGrid}>
          {/* ===== IMAGE GALLERY ===== */}
          <div className={styles.gallery}>
            {/* Thumbnails */}
            <div className={styles.thumbnails}>
              {images.map((img, i) => (
                <motion.button
                  key={i}
                  className={`${styles.thumb} ${i === activeImg ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImg(i)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img src={img.url || img} alt={`View ${i + 1}`} />
                </motion.button>
              ))}
            </div>

            {/* Main Image */}
            <div className={styles.mainImgWrap}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  src={images[activeImg]?.url || images[activeImg]}
                  alt={product.name}
                  className={styles.mainImg}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                />
              </AnimatePresence>
              {/* Badges */}
              <div className={styles.imgBadges}>
                {discountPercent > 0 && <span className="badge badge-gold">{discountPercent}% OFF</span>}
                {product.isNewArrival && <span className="badge badge-info">New</span>}
              </div>
              <button className={styles.zoomBtn}><ZoomIn size={18} /></button>
            </div>
          </div>

          {/* ===== PRODUCT INFO ===== */}
          <div className={styles.info}>
            {product.brand && <p className={styles.brand}>{product.brand}</p>}
            <h1 className={styles.name}>{product.name}</h1>

            {/* Rating Summary */}
            <div className={styles.ratingSummary}>
              <div className={styles.stars}>
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={18} fill={s <= Math.round(product.ratings?.average || 0) ? 'var(--accent-gold)' : 'none'} stroke={s <= Math.round(product.ratings?.average || 0) ? 'var(--accent-gold)' : 'var(--text-muted)'} />
                ))}
              </div>
              <span className={styles.ratingVal}>{product.ratings?.average?.toFixed(1) || '0.0'}</span>
              <span className={styles.ratingCount}>({product.ratings?.count?.toLocaleString() || 0} reviews)</span>
              {product.soldCount > 0 && <span className={styles.soldCount}>{product.soldCount.toLocaleString()} sold</span>}
            </div>

            {/* Price */}
            <div className={styles.priceBlock}>
              <span className={styles.price}>{formatPrice(effectivePrice)}</span>
              {product.comparePrice > effectivePrice && (
                <span className={styles.comparePrice}>{formatPrice(product.comparePrice)}</span>
              )}
              {discountPercent > 0 && (
                <span className={styles.discountBadge}>You save {formatPrice(product.comparePrice - effectivePrice)}</span>
              )}
            </div>

            {product.shortDescription && (
              <p className={styles.shortDesc}>{product.shortDescription}</p>
            )}

            <div className="divider" />

            {/* Variants */}
            {product.variants?.map(variant => (
              <div key={variant.name} className={styles.variantGroup}>
                <p className={styles.variantLabel}>
                  {variant.name}: <span className={styles.variantSelected}>{selectedVariants[variant.name] || 'Select'}</span>
                </p>
                <div className={styles.variantOptions}>
                  {variant.options?.map(opt => (
                    <button
                      key={opt.value}
                      className={`${styles.variantBtn} ${selectedVariants[variant.name] === opt.value ? styles.variantBtnActive : ''} ${opt.stock === 0 ? styles.variantBtnOOS : ''}`}
                      onClick={() => setSelectedVariants(p => ({ ...p, [variant.name]: opt.value }))}
                      disabled={opt.stock === 0}
                    >
                      {opt.value}
                      {opt.stock === 0 && <span className={styles.oosLine} />}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div className={styles.qtyRow}>
              <p className={styles.qtyLabel}>Quantity</p>
              <div className={styles.qtyControl}>
                <button className={styles.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}><Minus size={16} /></button>
                <span className={styles.qtyVal}>{qty}</span>
                <button className={styles.qtyBtn} onClick={() => setQty(q => Math.min(product.stock, q + 1))}><Plus size={16} /></button>
              </div>
              <span className={styles.stockInfo}>
                {product.stock === 0 ? <span style={{ color: 'var(--status-error)' }}>Out of Stock</span>
                  : product.stock <= 5 ? <span style={{ color: 'var(--status-warning)' }}>Only {product.stock} left!</span>
                  : <span style={{ color: 'var(--status-success)' }}>In Stock</span>}
              </span>
            </div>

            {/* CTAs */}
            <div className={styles.ctas}>
              <motion.button
                className={`btn btn-primary btn-lg ${styles.addToCartBtn}`}
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock === 0}
                whileTap={{ scale: 0.97 }}
              >
                {addingToCart ? <span className={styles.spinner} /> : <ShoppingBag size={20} />}
                {product.stock === 0 ? 'Out of Stock' : addingToCart ? 'Adding...' : 'Add to Cart'}
              </motion.button>
              <motion.button
                className={`btn btn-outline btn-icon btn-lg ${inWishlist ? styles.wishlisted : ''}`}
                onClick={handleWishlist}
                whileTap={{ scale: 0.95 }}
                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={22} fill={inWishlist ? 'currentColor' : 'none'} />
              </motion.button>
              <motion.button className={`btn btn-outline btn-icon btn-lg`} whileTap={{ scale: 0.95 }}>
                <Share2 size={20} />
              </motion.button>
            </div>

            {/* Delivery Info */}
            <div className={styles.deliveryInfo}>
              <div className={styles.deliveryRow}>
                <Truck size={16} />
                <div>
                  <p className={styles.deliveryTitle}>Free Delivery</p>
                  <p className={styles.deliverySub}>On orders above ₹999 — Estimated {product.shippingInfo?.estimatedDays || '3-7 days'}</p>
                </div>
              </div>
              <div className={styles.deliveryRow}>
                <RefreshCw size={16} />
                <div>
                  <p className={styles.deliveryTitle}>Easy Returns</p>
                  <p className={styles.deliverySub}>{product.returnPolicy || '30 days return policy'}</p>
                </div>
              </div>
              <div className={styles.deliveryRow}>
                <Shield size={16} />
                <div>
                  <p className={styles.deliveryTitle}>Secure Payment</p>
                  <p className={styles.deliverySub}>100% secure transactions</p>
                </div>
              </div>
            </div>

            {/* Product attributes */}
            {product.attributes?.length > 0 && (
              <div className={styles.attributes}>
                {product.attributes.map(attr => (
                  <div key={attr.key} className={styles.attrRow}>
                    <span className={styles.attrKey}>{attr.key}</span>
                    <span className={styles.attrVal}>{attr.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== TABS ===== */}
        <div className={styles.tabs}>
          <div className={styles.tabBar}>
            {['description', 'specs', 'reviews'].map(tab => (
              <button
                key={tab}
                className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'description' && 'Description'}
                {tab === 'specs' && 'Specifications'}
                {tab === 'reviews' && `Reviews (${reviews.length})`}
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'description' && (
              <div className={styles.description}>{product.description}</div>
            )}
            {activeTab === 'specs' && (
              <div className={styles.specs}>
                {product.attributes?.map(attr => (
                  <div key={attr.key} className={styles.specRow}>
                    <span>{attr.key}</span><span>{attr.value}</span>
                  </div>
                ))}
                {product.weight && <div className={styles.specRow}><span>Weight</span><span>{product.weight}g</span></div>}
                {product.warranty && <div className={styles.specRow}><span>Warranty</span><span>{product.warranty}</span></div>}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className={styles.reviewsSection}>
                {/* Overall rating */}
                <div className={styles.ratingOverview}>
                  <div className={styles.ratingBig}>
                    <span className={styles.ratingBigNum}>{product.ratings?.average?.toFixed(1) || '0.0'}</span>
                    <div className={styles.ratingBigStars}>
                      {[1,2,3,4,5].map(s => <Star key={s} size={24} fill={s <= Math.round(product.ratings?.average || 0) ? 'var(--accent-gold)' : 'none'} stroke={s <= Math.round(product.ratings?.average || 0) ? 'var(--accent-gold)' : 'var(--text-muted)'} />)}
                    </div>
                    <p>{product.ratings?.count?.toLocaleString()} reviews</p>
                  </div>
                </div>

                {/* Write review */}
                {user && (
                  <form className={styles.reviewForm} onSubmit={handleReviewSubmit}>
                    <h3>Write a Review</h3>
                    <div className={styles.starPicker}>
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button" onClick={() => setReviewForm(p => ({ ...p, rating: s }))}>
                          <Star size={28} fill={s <= reviewForm.rating ? 'var(--accent-gold)' : 'none'} stroke={s <= reviewForm.rating ? 'var(--accent-gold)' : 'var(--text-muted)'} />
                        </button>
                      ))}
                    </div>
                    <input
                      className="input-field"
                      placeholder="Review title (optional)"
                      value={reviewForm.title}
                      onChange={e => setReviewForm(p => ({ ...p, title: e.target.value }))}
                    />
                    <textarea
                      className="input-field"
                      placeholder="Share your experience with this product..."
                      rows={4}
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                      required
                      style={{ resize: 'vertical' }}
                    />
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}

                {/* Reviews list */}
                <div className={styles.reviewsList}>
                  {reviews.map(review => (
                    <div key={review._id} className={styles.reviewCard}>
                      <div className={styles.reviewHeader}>
                        <img src={review.user?.avatar?.url || `https://api.dicebear.com/7.x/initials/svg?seed=${review.user?.name}`} alt={review.user?.name} className={styles.reviewAvatar} />
                        <div>
                          <p className={styles.reviewUser}>{review.user?.name}</p>
                          <p className={styles.reviewDate}>{formatDate(review.createdAt)}</p>
                        </div>
                        <div className={styles.reviewStars}>
                          {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= review.rating ? 'var(--accent-gold)' : 'none'} stroke={s <= review.rating ? 'var(--accent-gold)' : 'var(--text-muted)'} />)}
                        </div>
                      </div>
                      {review.title && <h4 className={styles.reviewTitle}>{review.title}</h4>}
                      <p className={styles.reviewComment}>{review.comment}</p>
                      {review.isVerifiedPurchase && <span className="badge badge-success" style={{ fontSize: 11 }}>Verified Purchase</span>}
                    </div>
                  ))}
                  {reviews.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px' }}>No reviews yet. Be the first to review!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section style={{ marginTop: 64 }}>
            <div className={styles.relatedHeader}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>You May Also Like</h2>
            </div>
            <div className="grid-products">
              {related.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="container" style={{ padding: '40px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
      <div className="skeleton" style={{ aspectRatio: '1', borderRadius: 16 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="skeleton" style={{ height: 16, width: '40%' }} />
        <div className="skeleton" style={{ height: 32, width: '80%' }} />
        <div className="skeleton" style={{ height: 24, width: '60%' }} />
        <div className="skeleton" style={{ height: 48, width: '50%' }} />
        <div className="skeleton" style={{ height: 52, borderRadius: 12 }} />
      </div>
    </div>
  );
}
