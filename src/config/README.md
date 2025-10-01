# Configuration System

This directory contains the centralized configuration system for the Prasanna Premium Orchard application. All configuration options are organized into separate modules by concern, making them easy to maintain and import.

## Structure

```
src/config/
├── index.ts          # Main export point for all configurations
├── app.ts            # Application-wide settings
├── auth.ts           # Authentication configurations
├── business.ts       # Business logic and rules
├── firebase.ts       # Firebase service configurations
├── payment.ts        # Payment service configurations
├── shipping.ts       # Shipping and logistics configurations
└── ui.ts            # User interface configurations
```

## Usage

### Import Specific Configurations

```typescript
// Import specific config modules
import { firebaseConfig } from '@/config/firebase';
import { paymentConfig } from '@/config/payment';
import { shippingConfig } from '@/config/shipping';

// Use in your components/services
const app = initializeApp(firebaseConfig);
```

### Import from Main Index

```typescript
// Import everything from the main index
import { 
  firebaseConfig, 
  paymentConfig, 
  ADMIN_EMAILS,
  ADDRESS_TYPES 
} from '@/config';

// Or import with namespace
import * as Config from '@/config';
```

### Common Patterns

```typescript
// For constants that are used frequently
import { ADMIN_EMAILS, ADDRESS_TYPES, WEIGHT_OPTIONS } from '@/config';

// For environment-specific configurations
import { getEnvironmentConfig, validateConfig } from '@/config';

// Validate configuration on app startup
if (!validateConfig()) {
  console.error('Configuration validation failed');
}
```

## Configuration Files

### `app.ts`
- Application metadata
- SEO configurations
- API endpoints
- Feature flags
- Environment settings

### `auth.ts`
- Admin email addresses
- Authentication providers
- Session management
- Password requirements

### `business.ts`
- Address types and options
- Order management rules
- Product categories
- Pricing configurations
- Company information

### `firebase.ts`
- Firebase service configuration
- Storage URLs
- Emulator settings
- Local image fallbacks

### `payment.ts`
- Razorpay configuration
- Payment methods
- Theme settings
- Test credentials

### `shipping.ts`
- Shiprocket API configuration
- Default shipping options
- Product dimensions
- HSN codes

### `ui.ts`
- Theme colors
- Animation settings
- Layout options
- Component defaults

## Environment Variables

The configuration system uses environment variables with fallback defaults:

```env
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id

# Razorpay
VITE_RAZORPAY_KEY_ID=your_razorpay_key

# Shiprocket
VITE_SHIPROCKET_USERNAME=your_username
VITE_SHIPROCKET_PASSWORD=your_password
```

## Adding New Configurations

1. **Create or update the appropriate config file**
2. **Export the configuration object**
3. **Add the export to `index.ts`**
4. **Update this README with the new configuration**

Example:
```typescript
// In src/config/notifications.ts
export const notificationConfig = {
  providers: {
    email: true,
    sms: false,
    push: true
  },
  templates: {
    orderConfirmation: 'order_confirmed',
    shipmentUpdate: 'shipment_update'
  }
};

// In src/config/index.ts
export { notificationConfig } from './notifications';
```

## Best Practices

1. **Separate by Concern**: Keep related configurations together
2. **Use TypeScript**: Define interfaces for complex configurations
3. **Environment Variables**: Use env vars for sensitive/environment-specific data
4. **Fallback Values**: Always provide sensible defaults
5. **Validation**: Add validation for critical configurations
6. **Documentation**: Document each configuration option

## Migration from Hardcoded Values

When migrating existing hardcoded values:

1. **Identify** scattered configuration values
2. **Group** them by logical concern
3. **Move** to appropriate config file
4. **Import** in original location
5. **Test** to ensure functionality remains the same

Example migration:
```typescript
// Before
const ADMIN_EMAILS = ['admin@example.com'];

// After
import { ADMIN_EMAILS } from '@/config';
```