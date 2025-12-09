<div align="center">

# 🍊 Prasanna Premium Orchard

### Premium Fresh Fruits & Orchard Products E-Commerce Platform

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10.14.0-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

<img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=28&pause=1000&color=F75C03&center=true&vCenter=true&width=600&lines=Fresh+From+Our+Orchards;Premium+Quality+Fruits;Direct+to+Your+Doorstep" alt="Typing SVG" />

---

### ✨ Experience the Freshness of Nature ✨

</div>

## 📋 Table of Contents

- [🌟 Features](#-features)
- [🏗️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📁 Project Structure](#-project-structure)
- [⚙️ Configuration](#️-configuration)
- [🔐 Security](#-security)
- [📦 Deployment](#-deployment)
- [🛠️ API Endpoints](#️-api-endpoints)
- [🧪 Testing](#-testing)
- [📄 License](#-license)

---

## 🌟 Features

<div align="center">

| Feature | Description |
|---------|-------------|
| 🛒 **Smart Shopping Cart** | Dynamic cart with weight-based pricing and real-time updates |
| 🔐 **Multi-Auth System** | Phone OTP, Google Sign-In, and secure authentication |
| 💳 **Payment Gateway** | Integrated Razorpay for secure transactions |
| 📦 **Order Tracking** | Real-time order tracking via Shiprocket integration |
| 🤖 **AI Assistant** | Gemini AI-powered customer support |
| 📱 **Responsive Design** | Mobile-first design with seamless UX |
| 🎨 **Modern UI** | Beautiful animations with Anime.js and Framer Motion |
| 📧 **Email Notifications** | Automated order confirmations and updates |
| 👤 **User Profiles** | Complete profile management with address book |
| 🏪 **Admin Dashboard** | Comprehensive admin panel for order & product management |
| 🔒 **Super Admin** | Advanced controls for platform management |
| 🎯 **SEO Optimized** | Schema markup and meta tags for better discoverability |

</div>

---

## 🏗️ Tech Stack

### **Frontend**
```
⚡ Vite + React 18 + TypeScript
🎨 TailwindCSS + Shadcn/UI
🎭 Framer Motion + Anime.js
🔄 React Query (TanStack Query)
🧭 React Router DOM
📝 React Hook Form + Zod
```

### **Backend & Services**
```
🔥 Firebase (Auth, Firestore, Storage, Functions)
💰 Razorpay Payment Gateway
📦 Shiprocket Shipping API
🤖 Google Gemini AI
📧 Email Service Integration
```

### **Development Tools**
```
📦 Bun (Package Manager)
🔍 ESLint + TypeScript
🎯 Vite Build Tool
🚀 Vercel/Netlify Deployment
```

---

## 🚀 Getting Started

### **Prerequisites**

- Node.js (v18 or higher)
- Bun (recommended) or npm/yarn
- Firebase Account
- Razorpay Account
- Shiprocket Account

### **Installation**

```bash
# Clone the repository
git clone https://github.com/vikranthsai310/prasanna-premium-orchard.git
cd prasanna-premium-orchard

# Install dependencies
bun install
# or
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### **Environment Variables**

Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=your_razorpay_key

# Shiprocket Configuration
VITE_SHIPROCKET_EMAIL=your_shiprocket_email
VITE_SHIPROCKET_PASSWORD=your_shiprocket_password

# Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key

# App Configuration
VITE_APP_URL=http://localhost:5173
```

### **Running the Application**

```bash
# Development server
bun run dev
# or
npm run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

The application will be available at `http://localhost:5173`

---

## 📁 Project Structure

```
prasanna-premium-orchard/
├── 📂 public/                 # Static assets
│   ├── robots.txt
│   ├── sitemap.xml
│   └── _redirects
├── 📂 src/
│   ├── 📂 components/         # React components
│   │   ├── ui/               # Shadcn UI components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   └── ...
│   ├── 📂 pages/             # Page components
│   │   ├── Home.tsx
│   │   ├── Products.tsx
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   └── ...
│   ├── 📂 contexts/          # React contexts
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── 📂 services/          # API services
│   ├── 📂 hooks/             # Custom hooks
│   ├── 📂 utils/             # Utility functions
│   ├── 📂 types/             # TypeScript types
│   ├── 📂 config/            # Configuration files
│   │   ├── firebase.ts
│   │   ├── payment.ts
│   │   ├── shipping.ts
│   │   └── business.ts
│   └── 📂 styles/            # Global styles
├── 📂 api/                   # Serverless functions
│   ├── create-order.js
│   ├── verify-payment.js
│   ├── shiprocket-webhook.js
│   └── ...
├── 📂 security-testing/      # Security documentation
│   ├── ISO27001.md
│   ├── OWASP.md
│   └── ...
├── firebase.json             # Firebase configuration
├── firestore.rules           # Firestore security rules
├── storage.rules             # Storage security rules
├── tailwind.config.ts        # Tailwind configuration
├── vite.config.ts            # Vite configuration
└── package.json              # Dependencies
```

---

## ⚙️ Configuration

### **Firebase Setup**

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Phone, Google providers)
3. Create Firestore database
4. Set up Firebase Storage
5. Deploy Firestore rules and indexes:

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

### **Payment Gateway Setup**

1. Sign up at [Razorpay](https://razorpay.com/)
2. Get API keys from Dashboard
3. Configure webhook for payment verification
4. Add keys to `.env` file

### **Shipping Integration**

1. Create account at [Shiprocket](https://www.shiprocket.in/)
2. Generate API credentials
3. Configure webhook endpoint for tracking updates
4. See [SHIPROCKET_SETUP.md](./SHIPROCKET_SETUP.md) for details

---

## 🔐 Security

This project implements multiple security layers:

- ✅ **Firebase Security Rules** - Strict Firestore and Storage rules
- ✅ **Environment Variables** - Sensitive data in `.env` (never committed)
- ✅ **Input Validation** - Zod schemas for all forms
- ✅ **XSS Protection** - DOMPurify sanitization
- ✅ **CSRF Protection** - Token-based verification
- ✅ **Authentication** - Multi-factor authentication support
- ✅ **HTTPS Only** - Secure communication enforced
- ✅ **Rate Limiting** - API endpoint protection

### **Security Compliance**

Refer to our security documentation:
- [ISO 27001 Compliance](./security-testing/ISO27001.md)
- [ISO 27002 Controls](./security-testing/ISO27002.md)
- [OWASP Top 10 Protection](./security-testing/OWASP.md)

---

## 📦 Deployment

### **Vercel** (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### **Netlify**

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### **Build Configuration**

```json
{
  "build": {
    "command": "bun run build",
    "publish": "dist"
  }
}
```

---

## 🛠️ API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/create-order` | POST | Create Razorpay order |
| `/api/verify-payment` | POST | Verify payment signature |
| `/api/send-order-email` | POST | Send order confirmation |
| `/api/send-contact-email` | POST | Handle contact form |
| `/api/shiprocket-webhook` | POST | Handle shipping updates |
| `/api/track-shipment` | GET | Get shipment status |

---

## 🧪 Testing

```bash
# Run linting
bun run lint

# Type checking
tsc --noEmit

# Build test
bun run build
```

---

## 📊 Performance

- ⚡ **Lighthouse Score**: 95+ (Performance)
- 🎯 **First Contentful Paint**: < 1.5s
- 📦 **Bundle Size**: Optimized with code splitting
- 🖼️ **Image Optimization**: Lazy loading & WebP format
- 🔄 **Caching Strategy**: Service Worker ready

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 Scripts Reference

```bash
dev           # Start development server
build         # Production build
build:dev     # Development build
preview       # Preview production build
lint          # Run ESLint
```

---

## 🐛 Known Issues

- See [Issues](https://github.com/vikranthsai310/prasanna-premium-orchard/issues) for current known issues
- Report new issues with detailed description and steps to reproduce

---

## 📞 Support

For support and queries:
- 📧 Email: support@prasannaorchard.com
- 🌐 Website: [prasannaorchard.com](https://prasannaorchard.com)
- 💬 GitHub Issues: [Report Issue](https://github.com/vikranthsai310/prasanna-premium-orchard/issues)

---

## 📄 License

This project is proprietary software. All rights reserved.

---

<div align="center">

### 🌟 Made with ❤️ by Prasanna Premium Orchard Team

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%"/>

**[⬆ Back to Top](#-prasanna-premium-orchard)**

</div>
