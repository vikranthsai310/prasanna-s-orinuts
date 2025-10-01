# 🥜 Prasanna Premium Orchard - Dry Fruits E-commerce

[![Vercel Deploy](https://vercel.com/button)](https://prasanna-premium-orchard.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.x-orange)](https://firebase.google.com/)

## 📖 Project Overview

**Prasanna Premium Orchard** is a modern, full-stack e-commerce platform specializing in premium quality dry fruits and nuts. Built with cutting-edge technologies, it offers a seamless shopping experience with secure payments, real-time order tracking, and comprehensive admin management.

### ✨ Key Features

#### Customer Features
- 🛒 **Smart Shopping Cart** - Add, remove, and manage products with real-time updates
- 🔐 **Secure Authentication** - Email/password and Google Sign-In with Firebase Auth
- 💳 **Multiple Payment Methods** - Razorpay integration for cards, UPI, wallets, and COD
- 📦 **Real-time Order Tracking** - Track your orders from payment to delivery
- 🚚 **Live Shipping Rates** - Automatic calculation based on location and weight
- 📱 **Responsive Design** - Optimized for mobile, tablet, and desktop
- ⚡ **Performance Optimized** - Fast loading with lazy loading and code splitting
- 🔍 **Product Search** - Quick search and filtering capabilities

#### Admin Features
- 📊 **Analytics Dashboard** - Revenue, orders, and user metrics
- 📦 **Order Management** - View, update, and track all orders
- 🎯 **Product Management** - Add, edit, and manage product inventory
- 👥 **User Management** - View and manage customer accounts
- 📈 **Sales Reports** - Comprehensive sales and revenue analytics

#### Technical Features
- 🔒 **Enterprise Security** - JWT authentication, XSS protection, CORS, CSP headers
- 🚀 **Serverless Architecture** - Vercel Edge Functions for scalable API
- 📱 **Progressive Web App** - Install on mobile devices
- 🎨 **Modern UI/UX** - Smooth animations with Framer Motion
- 📊 **SEO Optimized** - Dynamic meta tags and structured data
- 🔄 **Real-time Updates** - Firebase Firestore for live data sync
- 🎯 **Type Safety** - Full TypeScript coverage
- ♿ **Accessible** - WCAG compliant components

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm or yarn package manager
- Firebase account ([create one](https://console.firebase.google.com/))
- Razorpay account ([create one](https://dashboard.razorpay.com/signup))
- Shiprocket account ([create one](https://app.shiprocket.in/register))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/vikranthsai310/prasanna-premium-orchard.git
cd prasanna-premium-orchard
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Firebase Configuration (Frontend)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Admin SDK (Backend - Vercel Environment)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Shiprocket Configuration (Backend)
SHIPROCKET_EMAIL=your@email.com
SHIPROCKET_PASSWORD=your_password
```

> **Note**: Never commit the `.env` file to version control!

4. **Configure Firebase**

- Go to [Firebase Console](https://console.firebase.google.com/)
- Create a new project or use existing
- Enable Authentication (Email/Password & Google Sign-In)
- Create a Firestore Database
- Enable Cloud Storage
- Download service account key (Settings → Service Accounts)
- Copy Firebase config to your `.env` file

5. **Configure Razorpay**

- Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
- Get API keys from Settings → API Keys
- Add keys to `.env` file
- For testing, use Test Mode keys

6. **Configure Shiprocket**

- Sign up at [Shiprocket](https://app.shiprocket.in/)
- Add your email and password to `.env`
- Set up pickup locations in Shiprocket dashboard

7. **Deploy Firebase Security Rules**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules
firebase deploy --only firestore:rules,storage:rules
```

8. **Start development server**

```bash
npm run dev
```

Visit `http://localhost:5173` to see your app!

### 📋 Environment Variables Reference

For detailed information about all environment variables, see [`ENVIRONMENT_SETUP.md`](./ENVIRONMENT_SETUP.md)

For payment gateway setup, see [`RAZORPAY_SETUP.md`](./RAZORPAY_SETUP.md)

For shipping integration, see [`SHIPROCKET_SETUP.md`](./SHIPROCKET_SETUP.md)

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## 🏗️ **Architecture & Configuration System**

This project features a **centralized configuration system** for better maintainability and scalability:

### **Configuration Structure**
```
src/config/
├── index.ts          # Main configuration hub
├── firebase.ts       # Firebase & storage settings
├── payment.ts        # Razorpay payment configuration
├── shipping.ts       # Shiprocket logistics settings
├── auth.ts          # Authentication & admin settings
├── business.ts      # Business rules & pricing
├── ui.ts           # Theme & UI settings
└── app.ts          # App metadata & feature flags
```

### **Usage Examples**
```typescript
// Import specific configurations
import { firebaseConfig, paymentConfig } from '@/config';

// Import commonly used constants
import { ADMIN_EMAILS, ADDRESS_TYPES } from '@/config';

// Validate configuration
import { validateConfig } from '@/config';
if (!validateConfig()) {
  console.error('Configuration validation failed');
}
```

### **Benefits**
- ✅ **Single Source of Truth** - All settings in one place
- ✅ **Type Safety** - Full TypeScript support
- ✅ **Environment Support** - Automatic env variable handling
- ✅ **Easy Maintenance** - Change once, update everywhere
- ✅ **Better Organization** - Logical separation by concern

For detailed configuration documentation, see: `src/config/README.md`

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React 18.3](https://react.dev/) - Modern UI library
- **Build Tool**: [Vite 5.4](https://vitejs.dev/) - Lightning-fast development
- **Language**: [TypeScript 5.4](https://www.typescriptlang.org/) - Type-safe development
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) - Utility-first CSS
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) - Beautiful, accessible components
- **Animations**: [Framer Motion](https://www.framer.com/motion/) - Smooth animations
- **State Management**: React Context API + Custom Hooks
- **Routing**: [React Router 6](https://reactrouter.com/) - Client-side routing

### Backend & Services
- **Authentication**: [Firebase Auth](https://firebase.google.com/products/auth) - Secure user management
- **Database**: [Cloud Firestore](https://firebase.google.com/products/firestore) - NoSQL database
- **Storage**: [Cloud Storage](https://firebase.google.com/products/storage) - File storage
- **Serverless API**: [Vercel Functions](https://vercel.com/docs/functions) - Edge functions
- **Admin SDK**: [Firebase Admin](https://firebase.google.com/docs/admin/setup) - Server-side operations

### Payment & Shipping
- **Payment Gateway**: [Razorpay](https://razorpay.com/) - Complete payment solution
- **Logistics**: [Shiprocket](https://www.shiprocket.in/) - Multi-courier shipping
- **Payment Methods**: Cards, UPI, Wallets, Net Banking, COD

### DevOps & Tools
- **Deployment**: [Vercel](https://vercel.com/) - Serverless deployment platform
- **Version Control**: Git & GitHub
- **Package Manager**: npm
- **Code Quality**: ESLint + TypeScript
- **Security**: Firebase Security Rules, CORS, CSP Headers

### Key Libraries
- **Form Handling**: React Hook Form
- **Data Sanitization**: DOMPurify - XSS protection
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push code to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**
- Go to [Vercel Dashboard](https://vercel.com/dashboard)
- Click "New Project"
- Import your GitHub repository
- Vercel will auto-detect Vite configuration

3. **Configure Environment Variables**
- In Vercel project settings, go to "Environment Variables"
- Add all variables from your `.env` file
- Important: Set `FIREBASE_SERVICE_ACCOUNT_KEY` as a single-line minified JSON

4. **Deploy**
- Click "Deploy"
- Vercel will build and deploy your app
- Both frontend and API functions will be deployed automatically

5. **Custom Domain (Optional)**
- Go to Project Settings → Domains
- Add your custom domain
- Update DNS records as instructed

### Deploy to Other Platforms

#### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Build the project
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

#### Netlify
```bash
# Build the project
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Post-Deployment Checklist

- ✅ Test authentication (Email & Google Sign-In)
- ✅ Verify payment gateway (Razorpay test mode)
- ✅ Test order creation and tracking
- ✅ Check shipping rate calculation
- ✅ Verify admin panel access
- ✅ Test responsive design on mobile
- ✅ Check Firebase Security Rules
- ✅ Monitor error logs in Vercel/Firebase

## 📁 Project Structure

```
prasanna-premium-orchard/
├── api/                          # Vercel Serverless Functions
│   ├── _middleware/              # API middleware
│   │   ├── auth.js              # JWT authentication
│   │   └── cors.js              # CORS configuration
│   ├── create-order.js          # Create Razorpay order
│   ├── verify-payment.js        # Verify payment signature
│   ├── calculate-shipping.js    # Get shipping rates
│   ├── create-shipment.js       # Create shipment
│   └── track-shipment.js        # Track shipment status
├── public/                       # Static assets
│   ├── Logo.png                 # Brand logo
│   ├── *.png                    # Product images
│   ├── robots.txt               # SEO robots file
│   └── sitemap.xml              # SEO sitemap
├── src/
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── SEO.tsx              # SEO meta tags
│   │   ├── Header.tsx           # Navigation header
│   │   ├── Footer.tsx           # Site footer
│   │   ├── ProductCard.tsx      # Product display
│   │   └── ...                  # Other components
│   ├── config/                  # Configuration system
│   │   ├── index.ts             # Main config hub
│   │   ├── firebase.ts          # Firebase config
│   │   ├── payment.ts           # Payment config
│   │   ├── shipping.ts          # Shipping config
│   │   └── ...                  # Other configs
│   ├── constants/               # App constants
│   │   └── api.ts               # API endpoints & errors
│   ├── contexts/                # React contexts
│   │   ├── AuthContext.tsx      # Authentication state
│   │   └── CartContext.tsx      # Shopping cart state
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts           # Auth hook
│   │   └── useCart.ts           # Cart hook
│   ├── lib/                     # Core libraries
│   │   ├── firebase.ts          # Firebase initialization
│   │   └── utils.ts             # Utility functions
│   ├── pages/                   # Route pages
│   │   ├── Home.tsx             # Landing page
│   │   ├── Products.tsx         # Product listing
│   │   ├── ProductDetail.tsx    # Product details
│   │   ├── Cart.tsx             # Shopping cart
│   │   ├── Checkout.tsx         # Checkout page
│   │   ├── Orders.tsx           # Order history
│   │   └── Admin/               # Admin pages
│   ├── services/                # Business logic
│   │   ├── apiService.ts        # HTTP client
│   │   ├── razorpayService.ts   # Payment service
│   │   ├── orderService.ts      # Order management
│   │   ├── analyticsService.ts  # Admin analytics
│   │   └── userAnalyticsService.ts # User tracking
│   ├── types/                   # TypeScript types
│   │   ├── api.ts               # API types
│   │   └── product.ts           # Product types
│   ├── utils/                   # Utility functions
│   │   ├── authToken.ts         # Token management
│   │   ├── logger.ts            # Logging utility
│   │   └── validation.ts        # Input validation
│   ├── App.tsx                  # Root component
│   └── main.tsx                 # App entry point
├── .env                         # Environment variables (local)
├── .gitignore                   # Git ignore rules
├── firebase.json                # Firebase configuration
├── firestore.rules              # Firestore security rules
├── storage.rules                # Storage security rules
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite config
├── vercel.json                  # Vercel deployment config
└── README.md                    # This file
```

## 🔒 Security Features

### Authentication & Authorization
- ✅ JWT-based authentication with Firebase ID tokens
- ✅ Protected API routes with middleware
- ✅ Role-based access control (Admin/User)
- ✅ Secure session management

### Data Protection
- ✅ Input validation and sanitization (DOMPurify)
- ✅ XSS protection with Content Security Policy
- ✅ CORS configuration for API security
- ✅ Firebase Security Rules for database
- ✅ Encrypted payment processing

### Headers & Best Practices
- ✅ `Strict-Transport-Security` (HSTS)
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`
- ✅ Environment variable protection
- ✅ No sensitive data in client code

## 📊 API Documentation

### Authentication
All API endpoints require Bearer token authentication:
```typescript
Authorization: Bearer <firebase-id-token>
```

### Endpoints

#### `POST /api/create-order`
Create a Razorpay payment order.

**Request:**
```json
{
  "amount": 10000,
  "currency": "INR",
  "receipt": "order_123",
  "notes": {}
}
```

**Response:**
```json
{
  "id": "order_xxx",
  "amount": 10000,
  "currency": "INR",
  "status": "created"
}
```

#### `POST /api/verify-payment`
Verify Razorpay payment signature.

**Request:**
```json
{
  "orderId": "order_xxx",
  "paymentId": "pay_xxx",
  "signature": "xxx"
}
```

**Response:**
```json
{
  "verified": true,
  "orderId": "firebase_order_id"
}
```

#### `POST /api/calculate-shipping`
Calculate shipping rates.

**Request:**
```json
{
  "pickup_postcode": "560001",
  "delivery_postcode": "110001",
  "weight": 0.5,
  "cod": false
}
```

**Response:**
```json
{
  "success": true,
  "rates": [
    {
      "courier_name": "Delhivery",
      "rate": 50,
      "etd": "2-3 days"
    }
  ]
}
```

For complete API documentation, see [`api/README.md`](./api/README.md)

## 🧪 Testing

### Test Accounts

**Admin Account:**
- Email: Add your email to `ADMIN_EMAILS` in `src/config/auth.ts`

**Test Payment Cards (Razorpay Test Mode):**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

**Test UPI:**
- UPI ID: success@razorpay

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Google Sign-In
- [ ] Browse products
- [ ] Add to cart
- [ ] Update cart quantities
- [ ] Calculate shipping
- [ ] Place order (COD)
- [ ] Place order (Razorpay)
- [ ] Track order
- [ ] View order history
- [ ] Admin dashboard access
- [ ] Admin order management

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Vikranth Sai**
- GitHub: [@vikranthsai310](https://github.com/vikranthsai310)

## 🙏 Acknowledgments

- [React](https://react.dev/) - UI framework
- [Firebase](https://firebase.google.com/) - Backend services
- [Razorpay](https://razorpay.com/) - Payment gateway
- [Shiprocket](https://www.shiprocket.in/) - Logistics partner
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Vercel](https://vercel.com/) - Deployment platform

## 📞 Support

For support, email [support@example.com](mailto:support@example.com) or open an issue on GitHub.

---

Made with ❤️ by Prasanna Premium Orchard Team
