const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();

const User = require('../models/User');
const Product = require('../models/Product');
const { Category, Order, Coupon, Banner } = require('../models/index');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB Connected for seeding...');
};

// ========== SEED DATA ==========
const categories = [
  { name: 'Electronics', slug: 'electronics', description: 'Latest gadgets and tech', icon: '💻', image: { url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' } },
  { name: 'Fashion', slug: 'fashion', description: 'Trendy clothing & accessories', icon: '👗', image: { url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400' } },
  { name: 'Home & Living', slug: 'home-living', description: 'Beautiful home decor', icon: '🏠', image: { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400' } },
  { name: 'Sports', slug: 'sports', description: 'Sports & fitness equipment', icon: '⚽', image: { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400' } },
  { name: 'Beauty', slug: 'beauty', description: 'Skincare and cosmetics', icon: '💄', image: { url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400' } },
  { name: 'Books', slug: 'books', description: 'Knowledge at your fingertips', icon: '📚', image: { url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400' } },
];

const generateProducts = (categories) => [
  {
    name: 'Apple MacBook Pro 16" M3 Max',
    shortDescription: 'The most powerful MacBook ever built',
    description: 'Experience extraordinary performance with the M3 Max chip. Features a stunning Liquid Retina XDR display, up to 22 hours battery life, and an advanced camera system.',
    price: 249999, comparePrice: 279999, brand: 'Apple',
    category: categories[0]._id, stock: 15,
    images: [{ url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', isMain: true }],
    tags: ['laptop', 'apple', 'macbook', 'professional'],
    isFeatured: true, isTrending: true,
    discount: { percentage: 10, isActive: true },
    ratings: { average: 4.8, count: 247 },
    attributes: [{ key: 'Processor', value: 'Apple M3 Max' }, { key: 'RAM', value: '36GB' }, { key: 'Storage', value: '1TB SSD' }]
  },
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    shortDescription: 'Industry-leading noise cancellation',
    description: 'Industry-leading noise cancellation with Auto NC Optimizer. Up to 30-hour battery life, Multipoint connection, and crystal clear hands-free calling.',
    price: 29999, comparePrice: 34999, brand: 'Sony',
    category: categories[0]._id, stock: 42,
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', isMain: true }],
    tags: ['headphones', 'sony', 'wireless', 'noise-cancellation'],
    isFeatured: true, isBestSeller: true,
    discount: { percentage: 14, isActive: true },
    ratings: { average: 4.7, count: 1823 },
  },
  {
    name: 'iPhone 15 Pro Max 256GB',
    shortDescription: 'Titanium design. A17 Pro chip.',
    description: 'Forged in titanium with the A17 Pro chip, featuring the Action button, ProRes video, and the most advanced iPhone camera system ever.',
    price: 159900, comparePrice: 169900, brand: 'Apple',
    category: categories[0]._id, stock: 28,
    images: [{ url: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800', isMain: true }],
    tags: ['iphone', 'apple', 'smartphone'],
    isFeatured: true, isTrending: true, isBestSeller: true,
    discount: { percentage: 6, isActive: true },
    ratings: { average: 4.9, count: 3412 },
  },
  {
    name: 'Samsung 4K OLED Smart TV 65"',
    shortDescription: 'See the future of picture quality',
    description: 'Experience vibrant colors and deep blacks with Samsung Neo QLED 4K technology. Smart TV with Tizen OS and built-in voice assistants.',
    price: 189999, comparePrice: 229999, brand: 'Samsung',
    category: categories[0]._id, stock: 8,
    images: [{ url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=800', isMain: true }],
    tags: ['tv', 'samsung', 'oled', '4k', 'smart-tv'],
    isFeatured: true,
    discount: { percentage: 17, isActive: true },
    ratings: { average: 4.6, count: 534 },
  },
  {
    name: 'Nike Air Max 270 React',
    shortDescription: 'Lightweight, all-day comfort',
    description: "Nike's largest Air unit yet delivers exceptional heel cushioning. The React foam midsole provides ultimate responsiveness and durability.",
    price: 12995, comparePrice: 15995, brand: 'Nike',
    category: categories[1]._id, stock: 67,
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', isMain: true }],
    tags: ['nike', 'shoes', 'sneakers', 'running'],
    isFeatured: true, isBestSeller: true,
    discount: { percentage: 19, isActive: true },
    ratings: { average: 4.5, count: 2156 },
    variants: [{ name: 'Size', options: [
      { value: 'UK 7', stock: 12 }, { value: 'UK 8', stock: 18 },
      { value: 'UK 9', stock: 22 }, { value: 'UK 10', stock: 15 }
    ]},
    { name: 'Color', options: [
      { value: 'Black', stock: 30 }, { value: 'White', stock: 25 }, { value: 'Red', stock: 12 }
    ]}]
  },
  {
    name: 'Zara Premium Cashmere Coat',
    shortDescription: 'Timeless elegance in pure cashmere',
    description: 'A classic overcoat crafted from 100% pure cashmere. Features a straight-cut silhouette, notch lapels, and a double-breasted button fastening.',
    price: 18999, comparePrice: 24999, brand: 'Zara',
    category: categories[1]._id, stock: 23,
    images: [{ url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800', isMain: true }],
    tags: ['coat', 'zara', 'cashmere', 'winter', 'luxury'],
    isFeatured: true, isNewArrival: true,
    discount: { percentage: 24, isActive: true },
    ratings: { average: 4.4, count: 389 },
  },
  {
    name: 'Dyson V15 Detect Cordless Vacuum',
    shortDescription: 'Reveals the dust you cannot see',
    description: 'Laser Detect technology reveals microscopic dust. 60-minute run time, powerful digital motor, and HEPA filtration for the cleanest home.',
    price: 52900, comparePrice: 59900, brand: 'Dyson',
    category: categories[2]._id, stock: 19,
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', isMain: true }],
    tags: ['dyson', 'vacuum', 'cordless', 'home'],
    isFeatured: true,
    discount: { percentage: 12, isActive: true },
    ratings: { average: 4.7, count: 891 },
  },
  {
    name: 'Luxury Marble Coffee Table',
    shortDescription: 'Artisan crafted Italian marble',
    description: 'Hand-crafted from premium Italian Carrara marble. Each piece is unique with natural veining. Solid brass legs with a gold finish.',
    price: 45999, comparePrice: 55999, brand: 'ArteNova',
    category: categories[2]._id, stock: 7,
    images: [{ url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', isMain: true }],
    tags: ['furniture', 'marble', 'coffee-table', 'luxury'],
    isFeatured: true, isNewArrival: true,
    discount: { percentage: 18, isActive: true },
    ratings: { average: 4.6, count: 127 },
  },
  {
    name: 'Peloton Bike+ Smart Exercise Bike',
    shortDescription: 'The ultimate connected fitness experience',
    description: 'World-class cycling experience with a rotating 24" HD touchscreen. Access thousands of live and on-demand classes. Auto-Follow resistance adjusts to the instructor.',
    price: 139999, comparePrice: 159999, brand: 'Peloton',
    category: categories[3]._id, stock: 11,
    images: [{ url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', isMain: true }],
    tags: ['peloton', 'exercise-bike', 'fitness', 'smart'],
    isTrending: true,
    discount: { percentage: 12, isActive: true },
    ratings: { average: 4.5, count: 673 },
  },
  {
    name: 'La Mer The Moisturizing Soft Cream',
    shortDescription: 'The legendary healing moisturizer',
    description: 'Powered by the miracle broth, this legendary cream renews the look of skin. Rare sea kelp is harvested and transformed through a 3-to-4 month bio-fermentation process.',
    price: 18500, comparePrice: 19500, brand: 'La Mer',
    category: categories[4]._id, stock: 34,
    images: [{ url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800', isMain: true }],
    tags: ['lamer', 'skincare', 'moisturizer', 'luxury'],
    isFeatured: true, isBestSeller: true,
    ratings: { average: 4.8, count: 2341 },
  },
  {
    name: 'Atomic Habits - James Clear',
    shortDescription: 'An Easy & Proven Way to Build Good Habits',
    description: 'The #1 New York Times bestseller. Transform your life with tiny changes in behavior, starting now. Over 15 million copies sold worldwide.',
    price: 499, comparePrice: 699, brand: 'Penguin',
    category: categories[5]._id, stock: 200,
    images: [{ url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', isMain: true }],
    tags: ['books', 'self-help', 'habits', 'bestseller'],
    isBestSeller: true,
    discount: { percentage: 29, isActive: true },
    ratings: { average: 4.9, count: 8756 },
  },
  {
    name: 'DJI Mavic 3 Pro Drone',
    shortDescription: 'Triple camera pro-grade drone',
    description: 'Three Hasselblad cameras, up to 43-min flight time, 15km video transmission. Omnidirectional obstacle sensing for safer, smarter flight.',
    price: 189900, comparePrice: 209900, brand: 'DJI',
    category: categories[0]._id, stock: 9,
    images: [{ url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800', isMain: true }],
    tags: ['dji', 'drone', 'camera', 'photography'],
    isTrending: true, isNewArrival: true,
    discount: { percentage: 10, isActive: true },
    ratings: { average: 4.7, count: 312 },
  },
];

const coupons = [
  { code: 'WELCOME10', description: 'Welcome discount for new users', discountType: 'percentage', discountValue: 10, minimumOrderAmount: 999, endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
  { code: 'LUXE500', description: 'Flat ₹500 off on orders above ₹5000', discountType: 'fixed', discountValue: 500, minimumOrderAmount: 5000, endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  { code: 'FESTIVE20', description: 'Festive season 20% discount', discountType: 'percentage', discountValue: 20, minimumOrderAmount: 2000, maximumDiscount: 2000, endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
];

const banners = [
  { title: 'New Season. New Standards.', subtitle: 'Discover our premium collection', image: { url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920' }, link: '/products', buttonText: 'Shop Now', position: 'hero', sortOrder: 1 },
  { title: 'Tech Reimagined', subtitle: 'The latest in premium electronics', image: { url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1920' }, link: '/category/electronics', buttonText: 'Explore', position: 'hero', sortOrder: 2 },
];

// ========== DESTROY & IMPORT ==========
const importData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Coupon.deleteMany();
    await Banner.deleteMany();

    // Admin user
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123456', 12);
    const admin = await User.create({
      name: 'Admin User', email: process.env.ADMIN_EMAIL || 'admin@luxemart.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin', isVerified: true
    });

    // Sample user
    await User.create({
      name: 'John Doe', email: 'user@luxemart.com',
      password: 'User@123456', role: 'user', isVerified: true,
      phone: '+91-9876543210',
      addresses: [{
        label: 'Home', fullName: 'John Doe', phone: '+91-9876543210',
        street: '123 MG Road, Apartment 4B', city: 'Mumbai',
        state: 'Maharashtra', pincode: '400001', isDefault: true
      }]
    });

    const createdCategories = await Category.insertMany(categories);
    const products = generateProducts(createdCategories);
    await Product.insertMany(products.map((p, i) => ({
  ...p,
  slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + (Date.now() + i)
})));
    await Coupon.insertMany(coupons);
    await Banner.insertMany(banners);

    console.log('✅ Data seeded successfully!');
    console.log('📧 Admin: admin@luxemart.com | Password: Admin@123456');
    console.log('📧 User:  user@luxemart.com  | Password: User@123456');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Product.deleteMany();
    await Category.deleteMany();
    await Coupon.deleteMany();
    await Banner.deleteMany();
    console.log('✅ Data destroyed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '--destroy') destroyData();
else importData();
