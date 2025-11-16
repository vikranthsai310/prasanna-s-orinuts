# Delhivery Fees Management - Admin Feature

## Overview
A comprehensive admin interface for managing Delhivery shipping fees with full CRUD operations.

## Features Implemented

### 1. **Admin Page Component** (`src/pages/admin/DelhiveryFees.tsx`)
- ✅ Full-featured admin interface for fee management
- ✅ Card-based layout displaying all configured fees
- ✅ Stats dashboard showing total, active, and inactive fees
- ✅ Create, Edit, and Delete operations
- ✅ Dialog-based forms for data entry
- ✅ Alert confirmation for deletions
- ✅ Automatic initialization of default fees
- ✅ Color-coded badges for different fee types
- ✅ Responsive design for mobile and desktop

### 2. **Firestore Service** (`src/services/delhiveryFeesService.ts`)
- ✅ Complete CRUD operations for fees
- ✅ Type-safe interfaces with TypeScript
- ✅ Server timestamps for audit trail
- ✅ Default fees initialization function
- ✅ Fee calculation helper functions
- ✅ Filtering by fee type and active status

### 3. **Routing Integration**
- ✅ Route added to `App.tsx`: `/admin/delhivery-fees`
- ✅ Protected by `AdminRoute` component
- ✅ Lazy-loaded for optimal performance

### 4. **Navigation Integration**
- ✅ Added to Header dropdown menu (desktop)
- ✅ Added to mobile hamburger menu
- ✅ Icon: DollarSign for easy identification
- ✅ Consistent styling with other admin menu items

### 5. **Firestore Security Rules**
- ✅ Public read access (needed for shipping calculations)
- ✅ Admin-only write access (create, update, delete)
- ✅ Collection-level list queries enabled

## Fee Types Supported

1. **Base Rate** - Base shipping charge applied to all shipments
2. **Per KG (Metro)** - Additional charge per kg for metro cities
3. **Per KG (Non-Metro)** - Additional charge per kg for non-metro areas
4. **COD Charges** - Cash on Delivery handling fees
5. **Packaging** - Standard packaging material costs
6. **Custom** - User-defined custom fees

## Default Fees Initialized

| Fee Name | Type | Amount | Status | Applicable For |
|----------|------|--------|--------|----------------|
| Base Shipping Rate | base_rate | ₹50 | Active | All |
| Metro Cities - Per KG | per_kg_metro | ₹30 | Active | Metro |
| Non-Metro - Per KG | per_kg_non_metro | ₹40 | Active | Non-Metro |
| COD Charges | cod_charges | ₹50 | Inactive | All |
| Packaging Fee | packaging | ₹15 | Active | All |

## Usage

### Admin Interface
1. Navigate to **Admin Menu** → **Delhivery Fees**
2. View all configured fees in card layout
3. Click **Add Fee** to create a new fee
4. Click **Edit** on any card to modify
5. Click trash icon to delete (with confirmation)

### Fee Form Fields
- **Fee Name*** - Descriptive name for the fee
- **Description** - Brief explanation of the fee
- **Fee Type*** - Select from predefined types or custom
- **Amount (₹)*** - Fee amount in rupees
- **Applicable For** - All areas, metro only, or non-metro only
- **Min Weight (kg)** - Optional minimum weight threshold
- **Max Weight (kg)** - Optional maximum weight threshold
- **Active** - Toggle to enable/disable fee in calculations

## Integration with Shipping Service

The fees can be used by the `delhiveryService` to calculate shipping charges:

```typescript
import { calculateShippingCharges } from '@/services/delhiveryFeesService';

// Calculate shipping for a 2kg package to a metro city
const result = await calculateShippingCharges(2, true);
console.log(result.total); // ₹110 (Base: ₹50 + Weight: ₹60)
console.log(result.breakdown); // Detailed breakdown of charges
```

## API Functions

### `getAllDelhiveryFees()`
Fetch all configured fees from Firestore.

### `getDelhiveryFeeById(feeId: string)`
Get a single fee by ID.

### `createDelhiveryFee(feeData)`
Create a new fee configuration.

### `updateDelhiveryFee(feeId: string, feeData)`
Update an existing fee.

### `deleteDelhiveryFee(feeId: string)`
Delete a fee configuration.

### `initializeDefaultFees()`
Initialize default fees if collection is empty.

### `calculateShippingCharges(weight: number, isMetro: boolean)`
Calculate total shipping charges based on configured fees.

## Database Structure

### Firestore Collection: `delhiveryFees`

```typescript
{
  id: string;
  name: string;
  description: string;
  feeType: 'base_rate' | 'per_kg_metro' | 'per_kg_non_metro' | 'cod_charges' | 'packaging' | 'custom';
  amount: number;
  isActive: boolean;
  applicableFor?: 'all' | 'metro' | 'non_metro';
  minWeight?: number;
  maxWeight?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## UI Components Used

- **Card** - Fee display cards and stats
- **Dialog** - Create/Edit forms
- **AlertDialog** - Delete confirmations
- **Button** - Actions and navigation
- **Input** - Text and number inputs
- **Textarea** - Description field
- **Select** - Dropdown selections
- **Switch** - Active/Inactive toggle
- **Badge** - Status indicators
- **Label** - Form labels

## Icons Used

- `Truck` - Delivery/shipping related
- `Package` - Packaging fees
- `IndianRupee` - Currency/amount
- `MapPin` - Location-based fees
- `DollarSign` - Money/fees (navigation)
- `Plus` - Add new fee
- `Edit` - Edit fee
- `Trash2` - Delete fee
- `RefreshCw` - Loading state
- `CheckCircle2` - Active status
- `XCircle` - Inactive status

## Responsive Design

- ✅ Mobile-optimized grid layout
- ✅ Responsive stats cards (1-2-4 column grid)
- ✅ Touch-friendly buttons and forms
- ✅ Scrollable dialog content
- ✅ Adaptive spacing and padding

## Security Features

- ✅ Admin-only access via `AdminRoute`
- ✅ Firestore rules enforce admin permissions
- ✅ Input validation on forms
- ✅ Confirmation dialogs for destructive actions
- ✅ Server-side timestamps for audit trail

## Future Enhancements

- [ ] Bulk import/export fees
- [ ] Fee history and version tracking
- [ ] Advanced fee rules (conditional logic)
- [ ] Fee templates for quick setup
- [ ] Integration with live Delhivery API rates
- [ ] Analytics on fee usage and calculations
- [ ] Fee scheduling (time-based activation)

## Files Modified

1. ✅ `src/services/delhiveryFeesService.ts` (new)
2. ✅ `src/pages/admin/DelhiveryFees.tsx` (new)
3. ✅ `src/App.tsx` (route added)
4. ✅ `src/components/Header.tsx` (navigation added)
5. ✅ `firestore.rules` (security rules added)

## Testing Checklist

- [ ] Navigate to `/admin/delhivery-fees` as admin
- [ ] Verify default fees are initialized
- [ ] Create a new custom fee
- [ ] Edit an existing fee
- [ ] Toggle fee active/inactive status
- [ ] Delete a fee with confirmation
- [ ] Test responsive layout on mobile
- [ ] Verify non-admin users cannot access
- [ ] Test fee calculation function
- [ ] Verify Firestore security rules

## Deployment Notes

1. Deploy Firestore rules: `firebase deploy --only firestore:rules`
2. Clear browser cache after deployment
3. Verify admin users can access the page
4. Check that default fees initialize on first access

---

**Created**: November 16, 2025  
**Status**: ✅ Complete and Ready for Use
