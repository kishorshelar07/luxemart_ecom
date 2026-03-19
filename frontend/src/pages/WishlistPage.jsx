import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart } from 'lucide-react';
import { fetchWishlist } from '../redux/slices/index';
import ProductCard from '../components/product/ProductCard';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { items: wishlist } = useSelector(s => s.wishlist);

  useEffect(() => { dispatch(fetchWishlist()); }, [dispatch]);

  return (
    <div style={{ padding: '40px 0 80px' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: 40 }}>
          My Wishlist
          {wishlist.length > 0 && <span style={{ fontFamily: 'var(--font-ui)', fontSize: '1rem', color: 'var(--text-muted)', marginLeft: 12 }}>({wishlist.length} items)</span>}
        </h1>
        {wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <Heart size={56} strokeWidth={1} style={{ margin: '0 auto 20px', display: 'block' }} />
            <h3 style={{ fontSize: 20, marginBottom: 12, color: 'var(--text-secondary)' }}>Your wishlist is empty</h3>
            <p style={{ marginBottom: 24 }}>Save items you love by clicking the heart icon</p>
            <Link to="/products" className="btn btn-primary">Discover Products</Link>
          </div>
        ) : (
          <div className="grid-products">
            {wishlist.map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
