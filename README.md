# Premium Orchard - Dry Fruits E-commerce

## Project info

Premium Orchard is an e-commerce platform specializing in high-quality dry fruits and nuts.

## Payment Gateway Integration

This project includes integration with Razorpay for payment processing. To set up the payment gateway:

1. See the `ENVIRONMENT_SETUP.md` file for detailed instructions on configuring environment variables
2. For more details on the Razorpay implementation, refer to `RAZORPAY_SETUP.md`

Key features of the payment integration:
- Secure checkout with Razorpay
- Payment verification
- Order tracking
- Comprehensive error handling

For testing, you can use Razorpay test cards as detailed in the setup documentation.

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

## What technologies are used for this project?

This project is built with:

- **Frontend**: Vite, TypeScript, React, shadcn-ui, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage), Vercel Serverless Functions
- **Payment**: Razorpay Payment Gateway
- **Shipping**: Shiprocket Logistics API
- **Architecture**: Centralized Configuration System

## How can I deploy this project?

This project can be deployed on Vercel with both frontend and serverless backend functions.

1. Push your code to a Git repository
2. Connect your Vercel account to your repository
3. Import the project in Vercel
4. Vercel will automatically detect your configuration and deploy both the frontend and backend
