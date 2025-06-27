# Next.js Migration Guide for Prasanna's Orinut

## 📁 Suggested Folder Structure

```
prasanna-orinut-nextjs/
├── pages/
│   ├── _app.js                 # App wrapper (replaces App.tsx)
│   ├── _document.js            # Custom document
│   ├── index.js                # Home page (/)
│   ├── products/
│   │   ├── index.js            # Product listing (/products)
│   │   └── [slug].js           # Product detail (/products/[slug])
│   ├── cart.js                 # Cart page
│   ├── checkout.js             # Checkout page
│   ├── orders/
│   │   ├── index.js            # Order history
│   │   └── [id]/
│   │       └── confirmation.js # Order confirmation
│   ├── track/
│   │   └── [id].js             # Order tracking
│   ├── auth.js                 # Login/signup
│   ├── profile.js              # User profile
│   ├── contact.js              # Contact page
│   ├── about.js                # About page
│   ├── terms.js                # Terms page
│   ├── privacy.js              # Privacy page
│   └── api/                    # API routes
│       ├── createOrder.js      # Razorpay order creation
│       ├── verifyPayment.js    # Payment verification
│       ├── sendMail.js         # Email sending
│       └── shiprocket/
│           └── [...slug].js    # Shiprocket API proxy
├── components/
│   ├── Layout/
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   └── Layout.js
│   ├── ProductCard.js
│   ├── CartItem.js
│   └── ui/                     # shadcn/ui components
├── contexts/
│   ├── AuthContext.js
│   └── CartContext.js
├── lib/
│   ├── firebase.js             # Firebase config
│   ├── razorpay.js             # Razorpay config
│   └── utils.js                # Utility functions
├── hooks/
│   ├── useAuth.js
│   └── useCart.js
├── styles/
│   └── globals.css             # Tailwind CSS
├── public/
│   ├── images/
│   └── favicon.ico
├── middleware.js               # Route protection
└── next.config.js              # Next.js config
```

## 📦 Package Changes

### Uninstall (React Router related)
```bash
npm uninstall react-router-dom
```

### Install (Next.js specific)
```bash
npm install next react react-dom
npm install @next/font  # For optimized fonts
```

### Keep existing packages
- Firebase SDK
- Tailwind CSS
- Razorpay
- React Hook Form
- All UI libraries (shadcn/ui, etc.)