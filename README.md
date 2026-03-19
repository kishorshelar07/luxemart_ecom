# 🛍️ LuxeMart — Premium E-Commerce Platform

<div align="center">
  <h3>A production-ready, full-stack e-commerce platform built with modern technologies</h3>
  <p>React.js · Node.js · Express.js · MongoDB · Redux Toolkit · Framer Motion</p>
</div>

---

## 📌 Project Overview

LuxeMart is a **complete e-commerce web application** with a premium dark/gold UI design. It includes everything needed for a real online store — user authentication, product browsing, cart, checkout, online payments (Razorpay), order tracking, admin panel, and email notifications.

The project has **two separate parts**:
- **Backend** — Node.js + Express REST API (runs on port `5000`)
- **Frontend** — React.js SPA (runs on port `5173`)

---

## ✨ Features

### 🛒 User Features
- JWT-based authentication (Login / Register / Logout)
- Forgot Password & Reset Password via email
- Advanced product search with autocomplete
- Filter by category, price, rating, brand
- Cart management (persists across sessions)
- Wishlist / saved items
- Razorpay online payment + Cash on Delivery
- Order tracking with real-time status timeline
- Product reviews & ratings
- Coupon code system (percentage & flat discount)
- Multiple delivery address management
- Email notifications (order confirmation, password reset)
- Account lockout after 5 failed login attempts

### 🎨 UI/UX
- Dark / Light mode with system preference detection
- Glassmorphism card effects
- Framer Motion animations throughout
- Skeleton loading states
- Fully responsive (mobile-first)
- Premium typography — Cormorant Garamond + DM Sans + Space Grotesk
- Hero carousel with parallax
- Animated product cards with hover effects
- Toast notifications (react-hot-toast)
- Step-based checkout flow (Cart → Delivery → Payment → Confirm)

### 🔐 Security
- Bcrypt password hashing
- Rate limiting — 200 requests per 10 minutes per IP
- XSS protection (xss-clean)
- MongoDB injection prevention (express-mongo-sanitize)
- HTTP Parameter Pollution protection (hpp)
- Helmet.js security headers
- JWT stored in localStorage + httpOnly cookie
- Account lockout after 5 failed login attempts

### 🧠 Admin Panel
- Real-time sales analytics dashboard
- Revenue charts (Recharts)
- Order status management (pending → confirmed → processing → shipped → delivered)
- User management (ban/unban/role change)
- Product CRUD with image upload
- Coupon management (create/edit/delete)
- Banner management
- Inventory tracking with low stock alerts
- Category management

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, Redux Toolkit, React Router v6 |
| UI | Framer Motion, Lucide Icons, CSS Modules |
| State | Redux Toolkit (Auth, Cart, Wishlist, Product, UI slices) |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT (JSON Web Tokens) + bcrypt |
| Payments | Razorpay |
| Images | Cloudinary (production) / Local uploads (dev) |
| Email | Nodemailer + Gmail SMTP |
| Security | Helmet, XSS-Clean, HPP, Mongo-Sanitize, Rate-Limit |
| Dev Tools | Nodemon, Morgan, dotenv |

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18.x
- MongoDB Atlas account (free tier works)
- Razorpay account (for payments)
- Gmail account with App Password (for emails)
- Cloudinary account (for image uploads)

---

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 2. Environment Setup

**Backend `.env`:**
```env
NODE_ENV=development
PORT=5000

MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/luxemart

JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=youremail@gmail.com
SMTP_PASSWORD=your_16char_app_password
FROM_EMAIL=noreply@luxemart.com
FROM_NAME=LuxeMart

RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
RAZORPAY_KEY_SECRET=your_razorpay_secret

STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

FRONTEND_URL=http://localhost:5173

ADMIN_EMAIL=admin@luxemart.com
ADMIN_PASSWORD=Admin@123456
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
VITE_APP_NAME=LuxeMart
```

---

### 3. MongoDB Atlas IP Whitelist ⚠️

Before seeding, whitelist your IP:
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Network Access → Add IP Address → Add Current IP**
3. Wait ~1 minute

---

### 4. Seed Database

```bash
cd backend
npm run seed
```

Creates:
- **Admin**: `admin@luxemart.com` / `Admin@123456`
- **User**: `user@luxemart.com` / `User@123456`
- 12 sample products across 6 categories
- 3 coupon codes: `WELCOME10`, `LUXE500`, `FESTIVE20`
- 2 hero banners

To destroy seed data:
```bash
npm run seed:destroy
```

---

### 5. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# → http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# → http://localhost:5173
```

---

## 📁 Project Structure

```
luxemart/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── authController.js        # Register, Login, Forgot/Reset Password, Address
│   │   ├── productController.js     # Product CRUD, Search, Reviews, Featured/Trending
│   │   ├── orderController.js       # Place Order, Razorpay Payment, Cancel, Track
│   │   └── adminController.js       # Analytics Dashboard, Users, Banners, Coupons
│   ├── middleware/
│   │   ├── auth.js                  # JWT protect + role authorize (admin/superadmin)
│   │   └── errorHandler.js          # Global error handling middleware
│   ├── models/
│   │   ├── User.js                  # User schema (addresses[], wishlist[], role, lockout)
│   │   ├── Product.js               # Product schema (variants, images, SEO, ratings)
│   │   └── index.js                 # Category, Order, Review, Coupon, Cart, Banner models
│   ├── routes/
│   │   ├── authRoutes.js            # /api/v1/auth/*
│   │   ├── productRoutes.js         # /api/v1/products/*
│   │   ├── orderRoutes.js           # /api/v1/orders/*
│   │   ├── adminRoutes.js           # /api/v1/admin/*
│   │   ├── categoryRoutes.js        # /api/v1/categories/*
│   │   ├── cartRoutes.js            # /api/v1/cart/*
│   │   ├── wishlistRoutes.js        # /api/v1/wishlist/*
│   │   ├── couponRoutes.js          # /api/v1/coupons/*
│   │   ├── reviewRoutes.js          # /api/v1/reviews/*
│   │   ├── uploadRoutes.js          # /api/v1/upload/*
│   │   ├── paymentRoutes.js         # /api/v1/payment/*
│   │   └── allRoutes.js             # Cart, Wishlist, Admin, Review, Upload, Payment
│   ├── utils/
│   │   └── sendEmail.js             # Nodemailer + HTML email templates
│   ├── data/
│   │   └── seed.js                  # Sample data seeder script
│   ├── uploads/                     # Local image storage (dev only)
│   ├── server.js                    # Express app entry point
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Navbar.jsx             # Top navigation + search + cart icon
    │   │   │   ├── Footer.jsx             # Footer links
    │   │   │   ├── PageLoader.jsx         # Full-page loading spinner
    │   │   │   └── ScrollToTop.jsx        # Auto scroll on route change
    │   │   ├── product/
    │   │   │   └── ProductCard.jsx        # Product tile with hover effects
    │   │   └── cart/
    │   │       └── CartDrawer.jsx         # Slide-out cart sidebar
    │   ├── pages/
    │   │   ├── HomePage.jsx               # Hero + Featured + Trending products
    │   │   ├── ProductsPage.jsx           # All products with filters & search
    │   │   ├── ProductDetailPage.jsx      # Single product with reviews
    │   │   ├── CategoryPage.jsx           # Products by category
    │   │   ├── CartPage.jsx               # Full cart view
    │   │   ├── CheckoutPage.jsx           # 4-step checkout flow
    │   │   ├── OrderSuccessPage.jsx       # Post-order confirmation
    │   │   ├── LoginPage.jsx              # Login form
    │   │   ├── RegisterPage.jsx           # Register form
    │   │   ├── ForgotPasswordPage.jsx     # Forgot password email form
    │   │   ├── ResetPasswordPage.jsx      # New password form (via token)
    │   │   ├── DashboardPage.jsx          # User dashboard
    │   │   ├── OrdersPage.jsx             # Order history list
    │   │   ├── OrderDetailPage.jsx        # Single order with timeline
    │   │   ├── WishlistPage.jsx           # Saved products
    │   │   ├── ProfilePage.jsx            # Edit profile + addresses
    │   │   ├── NotFoundPage.jsx           # 404 page
    │   │   └── admin/
    │   │       ├── AdminDashboard.jsx     # Analytics + charts
    │   │       ├── AdminProducts.jsx      # Product management
    │   │       ├── AdminOrders.jsx        # Order management
    │   │       └── AdminUsers.jsx         # User management
    │   ├── redux/
    │   │   ├── store.js                   # Redux store setup
    │   │   └── slices/index.js            # Auth, Cart, Wishlist, Product, UI slices
    │   ├── services/
    │   │   └── api.js                     # Axios instance + all API service functions
    │   ├── styles/
    │   │   └── globals.css                # CSS variables, themes, utility classes
    │   ├── utils/
    │   │   └── helpers.js                 # formatPrice, calculateCartTotals, etc.
    │   ├── App.jsx                        # Routes + auth initialization
    │   └── main.jsx                       # React entry point
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🔄 How The Project Works (Full Flow)

### 1️⃣ User Registration & Login Flow
```
User fills Register form
    → POST /api/v1/auth/register
    → Password hashed with bcrypt
    → JWT token generated
    → Token saved in localStorage
    → User redirected to Home

User fills Login form
    → POST /api/v1/auth/login
    → Email + password verified
    → JWT token returned
    → Redux auth state updated
    → Cart + Wishlist auto-fetched
```

### 2️⃣ Forgot Password Flow
```
User clicks "Forgot Password"
    → /forgot-password page
    → Enters email → POST /api/v1/auth/forgot-password
    → Backend generates crypto reset token
    → Token stored in DB (expires in 10 min)
    → Reset link emailed via Gmail SMTP
    → User clicks link → /reset-password/:token
    → New password submitted → PUT /api/v1/auth/reset-password/:token
    → Token verified + deleted → Password updated
    → User redirected to Login
```

### 3️⃣ Product Browsing Flow
```
Home Page loads
    → GET /api/v1/products/featured
    → GET /api/v1/products/trending
    → GET /api/v1/products/new-arrivals

User searches product
    → GET /api/v1/products/search/autocomplete?q=query
    → Results shown as dropdown

User filters products
    → GET /api/v1/products?category=X&minPrice=Y&maxPrice=Z&brand=A&sort=-price&page=1

User opens product detail
    → GET /api/v1/products/:id
    → GET /api/v1/products/:id/reviews
    → GET /api/v1/products/:id/related
```

### 4️⃣ Cart Flow
```
User clicks "Add to Cart"
    → POST /api/v1/cart/add { productId, quantity, variant }
    → Stock validated
    → Cart saved in MongoDB (persists across sessions)
    → CartDrawer opens

User updates quantity
    → PUT /api/v1/cart/update/:itemId { quantity }

User removes item
    → DELETE /api/v1/cart/remove/:itemId

Cart cleared after order placed
    → DELETE /api/v1/cart/clear
```

### 5️⃣ Checkout & Payment Flow
```
Step 1 — Delivery Address
    → Select saved address OR enter new address

Step 2 — Payment Method
    → Choose: Razorpay (online) OR COD

Step 3 — Apply Coupon (optional)
    → POST /api/v1/coupons/validate { code, orderAmount }
    → Discount calculated

Step 4 — Place Order

[If COD]
    → POST /api/v1/orders (paymentMethod: "cod")
    → Order created in DB
    → Cart cleared
    → Redirect to /order-success/:id

[If Razorpay]
    → POST /api/v1/orders/razorpay/create { amount }
    → Razorpay order created on Razorpay servers
    → Razorpay payment popup opens
    → User pays (card/UPI/wallet)
    → On success: POST /api/v1/orders (create order in DB)
    → POST /api/v1/orders/razorpay/verify (signature verified)
    → Payment status updated to "paid"
    → Cart cleared → Redirect to /order-success/:id
```

### 6️⃣ Order Tracking Flow
```
User → Dashboard → My Orders
    → GET /api/v1/orders/my-orders

User opens single order
    → GET /api/v1/orders/:id
    → Shows order timeline:
       pending → confirmed → processing → shipped → delivered

User cancels order (if pending/confirmed/processing)
    → PUT /api/v1/orders/:id/cancel
    → Stock restored automatically
```

### 7️⃣ Admin Flow
```
Admin logs in → /admin (protected by AdminRoute)

Dashboard
    → GET /api/v1/admin/analytics
    → Shows: total revenue, orders, users, products
    → Revenue chart (Recharts)

Product Management → /admin/products
    → Create: POST /api/v1/products
    → Edit: PUT /api/v1/products/:id
    → Delete: DELETE /api/v1/products/:id
    → Image upload: POST /api/v1/upload

Order Management → /admin/orders
    → GET /api/v1/orders (all orders)
    → Update status: PUT /api/v1/orders/:id/status

User Management → /admin/users
    → GET /api/v1/admin/users
    → Ban/unban/change role: PUT /api/v1/admin/users/:id

Coupon Management
    → GET/POST /api/v1/admin/coupons
    → PUT/DELETE /api/v1/admin/coupons/:id

Banner Management
    → GET/POST /api/v1/admin/banners
    → PUT/DELETE /api/v1/admin/banners/:id
```

### 8️⃣ Wishlist Flow
```
User clicks heart icon on product
    → POST /api/v1/wishlist/toggle { productId }
    → If not in wishlist → Added ✅
    → If already in wishlist → Removed ✅
    → Wishlist count updated in Navbar

View Wishlist → /dashboard/wishlist
    → GET /api/v1/wishlist
    → Shows saved products with "Add to Cart" option
```

---

## 🌐 All API Endpoints

**Base URL:** `http://localhost:5000/api/v1`

### 🔑 Auth — `/api/v1/auth`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Register new user |
| POST | `/login` | ❌ | Login |
| POST | `/logout` | ✅ | Logout |
| GET | `/me` | ✅ | Get current user |
| PUT | `/profile` | ✅ | Update profile |
| PUT | `/change-password` | ✅ | Change password |
| POST | `/forgot-password` | ❌ | Send reset email |
| PUT | `/reset-password/:token` | ❌ | Reset password |
| POST | `/addresses` | ✅ | Add address |
| PUT | `/addresses/:id` | ✅ | Update address |
| DELETE | `/addresses/:id` | ✅ | Delete address |

### 🛍️ Products — `/api/v1/products`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ❌ | Get all (with filters) |
| POST | `/` | 🔴 Admin | Create product |
| GET | `/featured` | ❌ | Featured products |
| GET | `/trending` | ❌ | Trending products |
| GET | `/new-arrivals` | ❌ | New arrivals |
| GET | `/search/autocomplete?q=` | ❌ | Search suggestions |
| GET | `/:id` | ❌ | Single product |
| PUT | `/:id` | 🔴 Admin | Update product |
| DELETE | `/:id` | 🔴 Admin | Delete product |
| GET | `/:id/related` | ❌ | Related products |
| GET | `/:id/reviews` | ❌ | Product reviews |
| POST | `/:id/reviews` | ✅ | Create review |

### 📦 Orders — `/api/v1/orders`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✅ | Place order |
| GET | `/my-orders` | ✅ | User's orders |
| GET | `/:id` | ✅ | Order details |
| PUT | `/:id/cancel` | ✅ | Cancel order |
| POST | `/razorpay/create` | ✅ | Create payment |
| POST | `/razorpay/verify` | ✅ | Verify payment |
| GET | `/` | 🔴 Admin | All orders |
| PUT | `/:id/status` | 🔴 Admin | Update status |

### 🛡️ Admin — `/api/v1/admin`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics` | Dashboard stats |
| GET | `/users` | All users |
| PUT | `/users/:id` | Update user role/ban |
| GET | `/banners` | All banners |
| POST | `/banners` | Create banner |
| PUT | `/banners/:id` | Update banner |
| DELETE | `/banners/:id` | Delete banner |
| GET | `/coupons` | All coupons |
| POST | `/coupons` | Create coupon |
| PUT | `/coupons/:id` | Update coupon |
| DELETE | `/coupons/:id` | Delete coupon |

### 🗂️ Categories — `/api/v1/categories`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ❌ | Parent categories |
| GET | `/all` | ❌ | All categories |
| GET | `/:slug` | ❌ | Single category |
| POST | `/` | 🔴 Admin | Create category |
| PUT | `/:id` | 🔴 Admin | Update category |
| DELETE | `/:id` | 🔴 Admin | Delete category |

### 🛒 Cart — `/api/v1/cart` (✅ Auth required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get cart |
| POST | `/add` | Add item |
| PUT | `/update/:itemId` | Update quantity |
| DELETE | `/remove/:itemId` | Remove item |
| DELETE | `/clear` | Clear cart |

### ❤️ Wishlist — `/api/v1/wishlist` (✅ Auth required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get wishlist |
| POST | `/toggle` | Add/remove item |

### 🎟️ Coupon — `/api/v1/coupons`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/validate` | Validate + calculate discount |

### 📤 Upload — `/api/v1/upload`
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Upload images (max 10, 5MB each) |

### 💳 Payment — `/api/v1/payment`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/razorpay-key` | Get Razorpay public key |

### ⭐ Reviews — `/api/v1/reviews`
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ❌ | Get reviews (filter by ?product=id) |
| PUT | `/:id/helpful` | ✅ | Mark review helpful |
| DELETE | `/:id` | ✅ | Delete review |

---

### Query Parameters (Products)
```
?keyword=laptop              Search by name
?category=<categoryId>       Filter by category
?minPrice=1000&maxPrice=50000  Price range
?minRating=4                 Minimum rating
?brand=Apple,Samsung         Filter by brand(s)
?sort=-price                 Sort (prefix - for descending)
?sort=price                  Sort ascending
?sort=-ratings               Sort by rating
?page=1&limit=12             Pagination
```

---

## 🔐 Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@luxemart.com` | `Admin@123456` |
| User | `user@luxemart.com` | `User@123456` |

---

## 💳 Coupon Codes (Seeded)

| Code | Type | Discount | Min Order |
|------|------|----------|-----------|
| `WELCOME10` | 10% | 10% off | ₹999 |
| `LUXE500` | Flat | ₹500 off | ₹5,000 |
| `FESTIVE20` | 20% | 20% off (max ₹2000) | ₹2,000 |

---

## 🧪 Test Payment Cards (Razorpay Test Mode)

| Field | Value |
|-------|-------|
| Card Number | `4111 1111 1111 1111` |
| Expiry | `12/26` |
| CVV | `123` |
| OTP | `1234` |

UPI Test: `success@razorpay`

---

## 🌐 All Frontend Routes

| Route | Auth | Page |
|-------|------|------|
| `/` | ❌ | Home |
| `/products` | ❌ | All Products |
| `/products/:id` | ❌ | Product Detail |
| `/category/:slug` | ❌ | Category Products |
| `/cart` | ❌ | Cart |
| `/login` | ❌ (Public only) | Login |
| `/register` | ❌ (Public only) | Register |
| `/forgot-password` | ❌ (Public only) | Forgot Password |
| `/reset-password/:token` | ❌ (Public only) | Reset Password |
| `/checkout` | ✅ | Checkout |
| `/order-success/:orderId` | ✅ | Order Success |
| `/dashboard` | ✅ | User Dashboard |
| `/dashboard/orders` | ✅ | My Orders |
| `/dashboard/orders/:id` | ✅ | Order Detail |
| `/dashboard/wishlist` | ✅ | Wishlist |
| `/dashboard/profile` | ✅ | Profile |
| `/admin` | 🔴 Admin | Admin Dashboard |
| `/admin/products` | 🔴 Admin | Manage Products |
| `/admin/orders` | 🔴 Admin | Manage Orders |
| `/admin/users` | 🔴 Admin | Manage Users |

---

## 🚀 Deployment

### Backend → Render.com
1. Connect GitHub repo
2. Build command: `npm install`
3. Start command: `npm start`
4. Add all `.env` variables in Render dashboard

### Frontend → Vercel
1. Connect GitHub repo
2. Set env variable: `VITE_API_URL=https://your-render-url.onrender.com/api/v1`
3. Set env variable: `VITE_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXX`
4. Deploy

### Database → MongoDB Atlas
1. Create free M0 cluster
2. Whitelist all IPs (`0.0.0.0/0`) for production
3. Get connection string → set as `MONGO_URI`

---

## 🎨 Design System

### Color Palette
| Token | Dark Mode | Light Mode |
|-------|-----------|------------|
| Background | `#080808` | `#fafaf8` |
| Card BG | `#111111` | `#ffffff` |
| Gold Accent | `#d4af37` | `#d4af37` |
| Text Primary | `#f5f5f0` | `#0f0f0f` |
| Text Muted | `#666666` | `#888888` |

### Typography
| Use | Font |
|-----|------|
| Headings / Display | Cormorant Garamond |
| Body / Content | DM Sans |
| Labels / Buttons | Space Grotesk |

---

## ⚠️ Common Issues & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| `MongoServerSelectionError` | IP not whitelisted | Add IP in MongoDB Atlas → Network Access |
| `Payment not working` | Missing Razorpay keys | Add real keys in `.env` |
| `Email not sending` | Wrong SMTP config | Use Gmail App Password (not regular password) |
| `Images not uploading` | Missing Cloudinary keys | Add Cloudinary credentials in `.env` |
| `Admin page redirects` | User role not admin | Run `npm run seed` first |
| `Not authorized` error | No token in request | Login first, then use Bearer token |

---

## 📝 License

Built for commercial sale. All rights reserved.

---

<div align="center">
  <strong>LuxeMart</strong> — Built with ❤️ for premium e-commerce
</div>
