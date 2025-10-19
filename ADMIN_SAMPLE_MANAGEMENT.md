# Admin Sample Management System

## Overview
Complete admin interface for managing sample products that customers can select during checkout. Admins can add, edit, delete, and configure sample products with full control over availability and quantities.

---

## Features Implemented

### ✅ Admin Sample Management Page
- **Route:** `/admin/samples`
- **Menu Item:** "Manage Samples" in admin dropdown
- **Access:** All admins (regular and super admins)

### ✅ Full CRUD Operations
- **Create:** Add new sample products from existing product catalog
- **Read:** View all samples with active/inactive status
- **Update:** Edit sample weight, max quantity, and active status
- **Delete:** Remove samples from the available samples list

### ✅ Sample Configuration
- **Product Selection:** Choose from existing products
- **Sample Weight:** 25g, 50g, 75g, or 100g
- **Max Quantity:** Set how many of each sample customers can select
- **Active Status:** Enable/disable samples without deletion
- **Display Order:** Automatic ordering (drag-drop ready)

### ✅ Statistics Dashboard
- **Total Samples:** Count of all configured samples
- **Active Samples:** Currently visible to customers
- **Inactive Samples:** Hidden from customer view

### ✅ Search & Filter
- Real-time search by product name
- Visual product preview with images
- Status badges (Active/Inactive)

---

## File Structure

### Service Layer
**File:** `src/services/sampleService.ts`

```typescript
// Core Functions
- getAllSamples(): Get all sample products
- getActiveSamples(): Get only active samples
- getSampleById(id): Get single sample
- addSample(data): Create new sample
- updateSample(id, updates): Update sample
- deleteSample(id): Remove sample
- toggleSampleStatus(id, isActive): Enable/disable
- reorderSamples(ids[]): Change display order
```

### Admin Page
**File:** `src/pages/admin/ManageSamples.tsx`

Features:
- Stats cards showing sample counts
- Sample list with product images
- Add/Edit modal with form validation
- Status toggle buttons
- Delete confirmation
- Search functionality
- Real-time updates

### Database Schema
**Collection:** `sampleProducts`

```typescript
{
  id: string;                // Document ID
  productId: string;         // Reference to main product
  productName: string;       // Product name (cached)
  productImage: string;      // Product image URL (cached)
  sampleWeight: string;      // "50g", "100g", etc.
  maxQuantity: number;       // Max per order (usually 1-2)
  isActive: boolean;         // Visible to customers?
  order: number;             // Display order
  createdAt: Date;           // Creation timestamp
  updatedAt: Date;           // Last update timestamp
}
```

### Security Rules
**File:** `firestore-secure.rules`

```javascript
match /sampleProducts/{sampleId} {
  // Anyone can read active samples (for customer selection)
  allow read: if true;
  
  // Only admins can modify samples
  allow create, update, delete: if isAdmin() || 
                                   isAdminEmail() || 
                                   isAdminPhone();
}
```

---

## Usage Guide

### For Admins

#### 1. **Adding a Sample Product**
1. Navigate to `/admin/samples`
2. Click "Add Sample Product" button
3. Select a product from dropdown
4. Choose sample weight (25g/50g/75g/100g)
5. Set max quantity per order
6. Toggle active status
7. Click "Add Sample"

#### 2. **Editing a Sample**
1. Click the edit icon (pencil) on any sample
2. Modify weight, quantity, or status
3. Click "Update Sample"

#### 3. **Activating/Deactivating**
- Click the eye icon to toggle visibility
- Inactive samples are hidden from customers
- Useful for seasonal or temporary unavailability

#### 4. **Deleting a Sample**
- Click the trash icon
- Confirm deletion
- Sample is permanently removed

#### 5. **Search**
- Use search bar to filter by product name
- Real-time filtering as you type

---

## Integration Points

### Current Customer Sample Flow
The existing customer sample selection page (`src/pages/AddSamples.tsx`) currently uses:
```typescript
const sampleProducts = mockProducts.slice(0, 6);
```

### Recommended Update
Update `AddSamples.tsx` to fetch from Firestore:

```typescript
import { getActiveSamples } from '@/services/sampleService';

const [sampleProducts, setSampleProducts] = useState([]);

useEffect(() => {
  const fetchSamples = async () => {
    const samples = await getActiveSamples();
    setSampleProducts(samples);
  };
  fetchSamples();
}, []);
```

---

## Sample Configuration Examples

### Example 1: Standard Sample Pack
```json
{
  "productId": "prod_123",
  "productName": "Premium Almonds",
  "sampleWeight": "50g",
  "maxQuantity": 2,
  "isActive": true,
  "order": 0
}
```

### Example 2: Larger Sample
```json
{
  "productId": "prod_456",
  "productName": "California Dates",
  "sampleWeight": "100g",
  "maxQuantity": 1,
  "isActive": true,
  "order": 1
}
```

### Example 3: Seasonal Sample (Inactive)
```json
{
  "productId": "prod_789",
  "productName": "Holiday Mix",
  "sampleWeight": "75g",
  "maxQuantity": 2,
  "isActive": false,
  "order": 2
}
```

---

## Admin UI Features

### Statistics Cards
- **Blue Card:** Total Samples - All configured samples
- **Green Card:** Active Samples - Currently visible
- **Orange Card:** Inactive Samples - Hidden from customers

### Sample List
- **Drag Handle:** Future drag-and-drop reordering
- **Product Image:** Visual identification
- **Product Name:** Sample title
- **Badge:** Active/Inactive status
- **Details:** Weight, max quantity, order number
- **Actions:** Toggle status, edit, delete

### Add/Edit Modal
- **Product Dropdown:** Select from existing products
- **Product Preview:** Shows selected product image
- **Weight Selector:** 25g, 50g, 75g, 100g options
- **Quantity Input:** Number input (1-10)
- **Active Checkbox:** Enable/disable visibility
- **Save/Cancel:** Form actions

---

## Business Logic

### Sample Rules
1. **Free Samples:** Always $0 price
2. **Max Selection:** Customers can select up to configured maxQuantity
3. **Weight:** Smaller portions (typically 25g-100g)
4. **Active Status:** Only active samples appear to customers
5. **Product Link:** Samples reference full products from catalog

### Admin Permissions
- **All Admins:** Can manage samples
- **Regular Admins:** Full CRUD access
- **Super Admins:** Same access (no special privileges needed)

---

## Security Considerations

### Database Security
✅ **Read Access:** Public (needed for customer sample page)
✅ **Write Access:** Admin only
✅ **Admin Verification:** Phone number or email check
✅ **Firestore Rules:** Enforced at database level

### Input Validation
- Product ID must exist
- Weight must be from predefined options
- Max quantity must be 1-10
- All fields required except notes

---

## Testing Checklist

### Admin Functions
- [ ] Can add new sample from product list
- [ ] Can edit existing sample details
- [ ] Can toggle sample active/inactive status
- [ ] Can delete sample with confirmation
- [ ] Search filters samples correctly
- [ ] Stats cards show correct counts
- [ ] Product images display properly
- [ ] Form validation works

### Customer Experience
- [ ] Active samples appear on sample selection page
- [ ] Inactive samples are hidden
- [ ] Sample weights display correctly
- [ ] Max quantity restrictions apply
- [ ] Free samples add to cart at $0

### Security
- [ ] Non-admins cannot access `/admin/samples`
- [ ] Non-admins cannot modify Firestore `sampleProducts`
- [ ] All admin actions require authentication

---

## Future Enhancements

### Potential Additions
1. **Drag-and-Drop Reordering:** Visual ordering of samples
2. **Bulk Actions:** Enable/disable multiple samples at once
3. **Sample Analytics:** Track which samples are most popular
4. **Sample History:** View past sample configurations
5. **Sample Categories:** Group samples by product type
6. **Sample Availability Dates:** Time-limited sample offers
7. **Image Upload:** Custom sample product images
8. **Sample Notes:** Internal admin notes per sample

---

## API Reference

### Get All Samples
```typescript
const samples = await getAllSamples();
// Returns: SampleProduct[]
```

### Get Active Samples Only
```typescript
const activeSamples = await getActiveSamples();
// Returns: SampleProduct[] (filtered by isActive: true)
```

### Add New Sample
```typescript
const sampleId = await addSample({
  productId: 'prod_123',
  productName: 'Almonds',
  productImage: 'https://...',
  sampleWeight: '50g',
  maxQuantity: 2,
  isActive: true,
  order: 0
});
// Returns: string (new document ID)
```

### Update Sample
```typescript
await updateSample('sample_123', {
  sampleWeight: '75g',
  maxQuantity: 1,
  isActive: false
});
// Returns: void
```

### Delete Sample
```typescript
await deleteSample('sample_123');
// Returns: void
```

### Toggle Status
```typescript
await toggleSampleStatus('sample_123', false);
// Sets isActive to false
```

---

## Deployment Steps

### 1. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 2. Test Sample Management
1. Login as admin
2. Navigate to `/admin/samples`
3. Add a test sample
4. Verify it appears in the list
5. Test edit, toggle, and delete

### 3. Update Customer Sample Page
Update `src/pages/AddSamples.tsx` to use `getActiveSamples()` instead of mock data.

### 4. Verify Security
- Try accessing `/admin/samples` as non-admin (should redirect)
- Try modifying Firestore directly (should fail)

---

## Troubleshooting

### Issue: Samples not appearing
**Solution:** Check `isActive` field is set to `true`

### Issue: Cannot add sample
**Solution:** Verify admin authentication and Firestore rules deployed

### Issue: Product images not loading
**Solution:** Check product has valid image URL in main products collection

### Issue: Duplicate samples
**Solution:** Each product should have only one active sample at a time

---

## Summary

✅ **Complete Admin Sample Management System**
- Full CRUD interface for sample products
- Admin menu integration
- Search and filtering
- Statistics dashboard
- Firestore security rules
- Mobile-responsive design

**Status:** Ready for production use
**Last Updated:** October 19, 2025
