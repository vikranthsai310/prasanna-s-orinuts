# Multiple Product Images Feature

## Overview
This feature allows administrators to upload and manage multiple images for each product, providing customers with better product visualization through image galleries.

## Changes Made

### 1. Product Type Update (`src/types/product.ts`)
- Added optional `images?: string[]` field to the `Product` interface
- Maintains backward compatibility with the existing `image` field
- The `image` field remains as the primary/featured image

### 2. Admin Products Page (`src/pages/admin/Products.tsx`)

#### State Management
Changed from single image to multiple images:
```typescript
// Old
const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string | null>(null);

// New
const [imageFiles, setImageFiles] = useState<File[]>([]);
const [imagePreviews, setImagePreviews] = useState<string[]>([]);
const [existingImages, setExistingImages] = useState<string[]>([]);
```

#### Image Handling Functions
```typescript
// Handle multiple file selection
const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files.length > 0) {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    
    // Create previews for all files
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }
};

// Remove newly uploaded image (before save)
const removeImage = (index: number) => {
  setImageFiles(prev => prev.filter((_, i) => i !== index));
  setImagePreviews(prev => prev.filter((_, i) => i !== index));
};

// Remove existing image from product
const removeExistingImage = (index: number) => {
  setExistingImages(prev => prev.filter((_, i) => i !== index));
};
```

#### Updated UI
- Multi-select file input with `multiple` attribute
- Image preview grid displaying both existing and new images
- Delete buttons (X icon) on hover for each image
- Responsive grid layout (3 columns)

### 3. Product Service (`src/services/productService.ts`)

#### Updated `addProduct` Function
```typescript
export const addProduct = async (
  product: Omit<Product, 'id'>, 
  imageFiles?: File[]
): Promise<string> => {
  let imageUrls: string[] = [];
  let primaryImageUrl = product.image;
  
  // Upload multiple images if provided
  if (imageFiles && imageFiles.length > 0) {
    const uploadPromises = imageFiles.map(async (file) => {
      const storageRef = ref(storage, `products/${Date.now()}_${Math.random()}_${file.name}`);
      const uploadResult = await uploadBytes(storageRef, file);
      return await getDownloadURL(uploadResult.ref);
    });
    
    imageUrls = await Promise.all(uploadPromises);
    primaryImageUrl = imageUrls[0]; // First image is the primary image
  }
  
  const productWithImages = {
    ...product,
    image: primaryImageUrl,
    images: imageUrls.length > 0 ? imageUrls : [primaryImageUrl]
  };
  
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), productWithImages);
  return docRef.id;
};
```

#### Updated `updateProduct` Function
```typescript
export const updateProduct = async (
  id: string, 
  product: Partial<Omit<Product, 'id'>>,
  newImageFiles?: File[],
  existingImages?: string[]
): Promise<void> => {
  // ... implementation details ...
  
  // Features:
  // - Uploads new images to Firebase Storage
  // - Combines existing images with new uploads
  // - Sets first image as primary
  // - Deletes removed images from Storage
};
```

#### Updated `deleteProduct` Function
```typescript
// Now deletes all product images, not just the primary one
export const deleteProduct = async (id: string): Promise<void> => {
  const product = await getProductById(id);
  
  if (product) {
    // Delete all product images
    const imagesToDelete = product.images || [product.image];
    
    for (const imageUrl of imagesToDelete) {
      if (!imageUrl.includes('placeholder')) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.error('Error deleting product image:', error);
        }
      }
    }
  }
  
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(docRef);
};
```

## Features

### For Administrators
1. **Multiple Image Upload**: Select multiple images at once using the file picker
2. **Image Preview Grid**: See all images before saving
3. **Remove Images**: Delete unwanted images before submission
4. **Edit Images**: Add new images or remove existing ones when editing
5. **Automatic Cleanup**: Old images are automatically deleted from Firebase Storage

### Technical Benefits
1. **Parallel Uploads**: All images upload simultaneously for better performance
2. **Storage Management**: Automatic cleanup prevents orphaned files
3. **Backward Compatible**: Existing products with single images still work
4. **Primary Image**: First image is always the featured/primary image

## Data Structure

### Product Document in Firestore
```javascript
{
  id: "product-id",
  name: "Premium Almonds",
  description: "...",
  category: "nuts",
  image: "https://storage.../image1.jpg",  // Primary/Featured image
  images: [                                  // All product images
    "https://storage.../image1.jpg",
    "https://storage.../image2.jpg",
    "https://storage.../image3.jpg"
  ],
  prices: { ... },
  nutritionalInfo: { ... },
  stock: 100
}
```

## Usage Guide

### Adding a Product with Multiple Images
1. Go to Admin Dashboard → Products
2. Click "Add New Product"
3. Fill in product details
4. Click "Add Images" button
5. Select multiple image files from your device
6. Review images in the preview grid
7. Remove any unwanted images by clicking the X button
8. Click "Add Product"

### Editing Product Images
1. Click edit button on any product
2. Existing images appear in the preview grid
3. Remove unwanted existing images using X button
4. Click "Add Images" to upload additional images
5. Click "Update Product" to save changes

## Future Enhancements

### Potential Improvements
1. **Image Reordering**: Drag-and-drop to reorder images
2. **Image Gallery on Product Page**: Carousel/lightbox for customer-facing display
3. **Image Compression**: Automatic compression before upload
4. **Image Cropping**: Built-in cropping tool
5. **Bulk Upload**: Upload images for multiple products at once
6. **Image Optimization**: WebP format conversion for better performance

### Product Page Display
Update `src/pages/ProductDetail.tsx` to show image gallery:
```typescript
// Example implementation
{product.images && product.images.length > 1 ? (
  <ImageCarousel images={product.images} />
) : (
  <img src={product.image} alt={product.name} />
)}
```

## Migration Notes

### For Existing Products
- Products with only the `image` field will continue to work
- When editing, they'll be migrated to use the `images` array
- No database migration required - changes are automatic

### Backward Compatibility
- `image` field is always set (primary image)
- `images` array is optional
- Frontend components check both fields

## Testing Checklist

- [x] Upload single image for new product
- [x] Upload multiple images for new product
- [x] Edit product and add more images
- [x] Edit product and remove images
- [x] Delete product with multiple images
- [ ] Display image gallery on product detail page
- [ ] Test image loading performance
- [ ] Test on mobile devices

## Performance Considerations

1. **Parallel Uploads**: Uses `Promise.all()` for concurrent uploads
2. **Unique Filenames**: `Date.now() + Math.random()` prevents collisions
3. **Storage Cleanup**: Deletes unused images to save costs
4. **Preview Generation**: Uses FileReader API for instant previews

## Security

- File type validation: `accept="image/*"`
- Firebase Storage security rules should limit:
  - File size (e.g., 5MB per image)
  - File types (only images)
  - Admin-only uploads
  
### Recommended Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{imageId} {
      allow read: if true;
      allow write: if request.auth != null 
                   && request.auth.token.admin == true
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

## Support

For issues or questions about this feature:
1. Check TypeScript errors in the editor
2. Review browser console for upload errors
3. Check Firebase Storage rules
4. Verify Firebase Storage quota

## Status

✅ **Complete** - Feature fully implemented and tested
- Multiple image upload: Working
- Image preview grid: Working
- Remove images: Working
- Edit functionality: Working
- Storage cleanup: Working

⏳ **Pending** - Frontend gallery display
- Image carousel on product detail page
- Thumbnail navigation
- Lightbox/modal view
