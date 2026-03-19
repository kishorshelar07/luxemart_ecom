import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star, Eye, Zap } from 'lucide-react';
import { addToCart } from '../../redux/slices/index';
import { toggleWishlistItem } from '../../redux/slices/index';
import { formatPrice, isInWishlist, getDiscountPercent } from '../../utils/helpers';
import toast from 'react-hot-toast';
import styles from './ProductCard.module.css';

export default function ProductCard({ product, layout = 'grid', index = 0 }) {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const { items: wishlist } = useSelector(s => s.wishlist);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!product) return null;

  const mainImage = product.images?.[0]?.url || product.images?.[0] || '';
  const hoverImage = product.images?.[1]?.url || product.images?.[1] || mainImage;
  const discountPercent = getDiscountPercent(product.comparePrice, product.price) || product.discount?.percentage || 0;
  const inWishlist = isInWishlist(wishlist, product._id);
  const effectivePrice = product.effectivePrice || product.price;
  const originalPrice = product.comparePrice || (discountPercent > 0 ? Math.round(effectivePrice / (1 - discountPercent / 100)) : null);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please login to add items to cart'); return; }
    setIsAddingToCart(true);
    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please login to save items'); return; }
    try {
      const result = await dispatch(toggleWishlistItem(product._id)).unwrap();
      toast.success(result.added ? 'Saved to wishlist' : 'Removed from wishlist');
    } catch { toast.error('Failed to update wishlist'); }
  };

  return (
    <motion.div
      className={`${styles.card} ${layout === 'list' ? styles.cardList : ''}`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/products/${product.slug || product._id}`} className={styles.cardLink}>
        {/* Image Container */}
        <div className={styles.imageWrap}>
          {!imgLoaded && <div className={`skeleton ${styles.imgSkeleton}`} />}
          <img
            src={mainImage}
            alt={product.name}
            className={`${styles.mainImg} ${imgLoaded ? styles.imgLoaded : ''}`}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />
          {hoverImage !== mainImage && (
            <img src={hoverImage} alt={product.name} className={styles.hoverImg} loading="lazy" />
          )}

          {/* Badges */}
          <div className={styles.badges}>
            {discountPercent > 0 && (
              <span className={`badge badge-gold ${styles.badge}`}>{discountPercent}% OFF</span>
            )}
            {product.isNewArrival && (
              <span className={`badge badge-info ${styles.badge}`}>New</span>
            )}
            {product.isBestSeller && (
              <span className={`badge badge-success ${styles.badge}`}>Best Seller</span>
            )}
            {product.stock === 0 && (
              <span className={`badge badge-error ${styles.badge}`}>Sold Out</span>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <span className={`badge badge-warning ${styles.badge}`}>Only {product.stock} left</span>
            )}
          </div>

          {/* Hover Actions */}
          <div className={styles.actions}>
            <motion.button
              className={`${styles.actionBtn} ${inWishlist ? styles.wishlisted : ''}`}
              onClick={handleWishlist}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
            </motion.button>
            <motion.button
              className={styles.actionBtn}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Quick view"
              onClick={(e) => e.preventDefault()}
            >
              <Eye size={18} />
            </motion.button>
          </div>

          {/* Quick Add to Cart */}
          {product.stock > 0 && (
            <motion.button
              className={styles.quickAdd}
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              initial={{ y: 10, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
            >
              {isAddingToCart ? (
                <span className={styles.spinner} />
              ) : (
                <><ShoppingBag size={16} /> Add to Cart</>
              )}
            </motion.button>
          )}
        </div>

        {/* Product Info */}
        <div className={styles.info}>
          {product.brand && (
            <p className={styles.brand}>{product.brand}</p>
          )}
          <h3 className={styles.name}>{product.name}</h3>

          {/* Rating */}
          {product.ratings?.count > 0 && (
            <div className={styles.rating}>
              <div className={styles.stars}>
                {[1,2,3,4,5].map(s => (
                  <Star
                    key={s}
                    size={13}
                    fill={s <= Math.round(product.ratings.average) ? 'var(--accent-gold)' : 'none'}
                    stroke={s <= Math.round(product.ratings.average) ? 'var(--accent-gold)' : 'var(--text-muted)'}
                  />
                ))}
              </div>
              <span className={styles.ratingCount}>({product.ratings.count.toLocaleString()})</span>
            </div>
          )}

          {/* Price */}
          <div className={styles.pricing}>
            <span className={styles.price}>{formatPrice(effectivePrice)}</span>
            {originalPrice && originalPrice > effectivePrice && (
              <span className={styles.originalPrice}>{formatPrice(originalPrice)}</span>
            )}
          </div>

          {/* Free shipping badge */}
          {effectivePrice >= 999 && (
            <p className={styles.freeShipping}>
              <Zap size={12} /> Free Delivery
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
