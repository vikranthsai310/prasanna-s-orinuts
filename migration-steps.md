# Step-by-Step Migration Process

## 1. Setup New Next.js Project
```bash
npx create-next-app@latest prasanna-orinut-nextjs
cd prasanna-orinut-nextjs
```

## 2. Install Dependencies
```bash
# Copy package.json dependencies from above
npm install
```

## 3. Migration Checklist

### ✅ Routing Changes
- [ ] Replace `BrowserRouter` with Next.js file-based routing
- [ ] Convert `<Route>` components to page files
- [ ] Update `Link` components from react-router to next/link
- [ ] Replace `useNavigate` with `useRouter` from next/router
- [ ] Update `useLocation` with `useRouter`

### ✅ Component Updates
- [ ] Move components to `/components` folder
- [ ] Update import paths to use relative imports
- [ ] Replace `img` tags with `next/image`
- [ ] Update Head tags to use `next/head`

### ✅ Data Fetching
- [ ] Convert useEffect + Firebase calls to getStaticProps/getServerSideProps
- [ ] Implement getStaticPaths for dynamic routes
- [ ] Add ISR (Incremental Static Regeneration) where needed

### ✅ API Routes
- [ ] Create API routes in `/pages/api/`
- [ ] Move Firebase Functions logic to API routes
- [ ] Update client-side API calls to use new endpoints

### ✅ Authentication
- [ ] Update Firebase Auth context for SSR compatibility
- [ ] Implement middleware for route protection
- [ ] Handle auth state on server-side when needed

### ✅ SEO Optimization
- [ ] Add meta tags to all pages
- [ ] Implement structured data for products
- [ ] Add sitemap.xml generation
- [ ] Optimize images with next/image

## 4. Key Pattern Changes

### React Router → Next.js
```javascript
// OLD (React Router)
import { useNavigate, useLocation } from 'react-router-dom';
const navigate = useNavigate();
const location = useLocation();

// NEW (Next.js)
import { useRouter } from 'next/router';
const router = useRouter();
```

### Links
```javascript
// OLD
import { Link } from 'react-router-dom';
<Link to="/products">Products</Link>

// NEW
import Link from 'next/link';
<Link href="/products">Products</Link>
```

### Images
```javascript
// OLD
<img src="/image.jpg" alt="Product" />

// NEW
import Image from 'next/image';
<Image src="/image.jpg" alt="Product" width={500} height={300} />
```

### Data Fetching
```javascript
// OLD (useEffect)
useEffect(() => {
  fetchProducts().then(setProducts);
}, []);

// NEW (getStaticProps)
export async function getStaticProps() {
  const products = await fetchProducts();
  return { props: { products } };
}
```

## 5. Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## 6. Deployment
```bash
# Build for production
npm run build

# Start production server
npm start

# Or deploy to Vercel
npx vercel
```

## 7. Testing Checklist
- [ ] All pages load correctly
- [ ] Navigation works properly
- [ ] Authentication flow works
- [ ] Cart functionality works
- [ ] Checkout process works
- [ ] API routes respond correctly
- [ ] SEO meta tags are present
- [ ] Images load optimally
- [ ] Performance is improved