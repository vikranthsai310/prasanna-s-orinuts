
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Loader2, X, Save, Upload, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  getAllProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct,
  toggleBestSeller 
} from '@/services/productService';
import { Product } from '@/types/product';
import { useToast } from '@/hooks/use-toast';
import { getNutritionalInfo, getProductDescription } from '@/services/geminiService';

const AdminProducts = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'nuts',
    price250g: 0,
    price500g: 0,
    price1kg: 0,
    stock: 0,
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    image: '/placeholder.svg'
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const fetchedProducts = await getAllProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name.startsWith('price') || name === 'stock' || 
                                       name === 'calories' || name === 'protein' || 
                                       name === 'fat' || name === 'carbs' || 
                                       name === 'fiber' ? Number(value) : value }));
    
    // Auto-fill with AI when product name changes and AI is enabled
    if (name === 'name' && value.trim().length >= 3 && isAIEnabled && !isAILoading) {
      setIsAILoading(true);
      try {
        // Get nutritional info
        const nutritionData = await getNutritionalInfo(value);
        if (nutritionData) {
          setFormData(prev => ({
            ...prev,
            name: value,
            calories: nutritionData.calories,
            protein: nutritionData.protein,
            fat: nutritionData.fat,
            carbs: nutritionData.carbs,
            fiber: nutritionData.fiber
          }));
        }

        // Get product description
        const description = await getProductDescription(value);
        if (description) {
          setFormData(prev => ({
            ...prev,
            description: description
          }));
        }

        toast({
          title: 'AI Auto-fill Complete!',
          description: 'Nutritional data and description have been filled automatically.',
        });
      } catch (error) {
        console.error('AI auto-fill error:', error);
        toast({
          title: 'AI Auto-fill Failed',
          description: 'Could not fetch data automatically. Please fill manually.',
          variant: 'destructive',
        });
      } finally {
        setIsAILoading(false);
      }
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value as 'nuts' | 'dates' | 'dried-fruits' | 'mixed' | 'seeds' | 'premium' }));
  };

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

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const openAddModal = () => {
    setSelectedProduct(null);
    setFormData({
      name: '',
      description: '',
      category: 'nuts',
      price250g: 0,
      price500g: 0,
      price1kg: 0,
      stock: 0,
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      image: '/placeholder.svg'
    });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price250g: product.prices['250g'],
      price500g: product.prices['500g'],
      price1kg: product.prices['1kg'],
      stock: product.stock,
      calories: product.nutritionalInfo.calories,
      protein: product.nutritionalInfo.protein,
      fat: product.nutritionalInfo.fat,
      carbs: product.nutritionalInfo.carbs,
      fiber: product.nutritionalInfo.fiber,
      image: product.image
    });
    setImageFiles([]);
    setImagePreviews([]);
    // Set existing images from product
    setExistingImages(product.images || [product.image]);
    setIsModalOpen(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted!', formData);
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        image: formData.image,
        prices: {
          '250g': formData.price250g,
          '500g': formData.price500g,
          '1kg': formData.price1kg
        },
        nutritionalInfo: {
          calories: formData.calories,
          protein: formData.protein,
          fat: formData.fat,
          carbs: formData.carbs,
          fiber: formData.fiber
        },
        category: formData.category as 'nuts' | 'dates' | 'dried-fruits' | 'mixed' | 'seeds' | 'premium',
        stock: formData.stock
      };

      if (selectedProduct) {
        // Update existing product
        await updateProduct(
          selectedProduct.id, 
          productData, 
          imageFiles.length > 0 ? imageFiles : undefined,
          existingImages
        );
        toast({
          title: "Success",
          description: "Product updated successfully"
        });
      } else {
        // Add new product
        await addProduct(productData, imageFiles.length > 0 ? imageFiles : undefined);
        toast({
          title: "Success",
          description: "Product added successfully"
        });
      }
      
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: selectedProduct ? "Failed to update product" : "Failed to add product",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      await deleteProduct(selectedProduct.id);
      toast({
        title: "Success",
        description: "Product deleted successfully"
      });
      setIsDeleteModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const handleToggleBestSeller = async (product: Product) => {
    try {
      const newStatus = !product.isBestSeller;
      await toggleBestSeller(product.id, newStatus);
      toast({
        title: "Success",
        description: `${product.name} ${newStatus ? 'added to' : 'removed from'} Best Sellers`
      });
      fetchProducts();
    } catch (error) {
      console.error('Error toggling best seller:', error);
      toast({
        title: "Error",
        description: "Failed to update best seller status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-playfair text-3xl font-bold">Manage Products</h1>
        <Button className="btn-primary" onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Product
        </Button>
      </div>
      
      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
      </div>
      
      {/* Products Table */}
      <div className="card-premium overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-secondary" />
            <span className="ml-2">Loading products...</span>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4">Product</th>
                <th className="text-left py-3 px-4">Category</th>
                <th className="text-left py-3 px-4">Price Range</th>
                <th className="text-left py-3 px-4">Stock</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-center py-3 px-4">Best Seller</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{product.category}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <p>₹{product.prices['250g']} - ₹{product.prices['1kg']}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${product.stock < 20 ? 'text-destructive' : 'text-green-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center">
                        <Button
                          variant={product.isBestSeller ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleBestSeller(product)}
                          className={product.isBestSeller ? 'bg-[#C99700] hover:bg-[#B8860B] text-white' : ''}
                        >
                          <Star className={`w-4 h-4 ${product.isBestSeller ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(product)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => openDeleteModal(product)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No products found. {searchTerm && 'Try a different search term.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-xl font-playfair">{selectedProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription className="sr-only">
              {selectedProduct ? 'Edit the product details below' : 'Fill in the details to add a new product'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-1 space-y-5 pb-4">
              {/* AI Auto-fill Toggle */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <h4 className="font-bold text-lg">Prasanna's AI Auto-fill</h4>
                      <p className="text-sm text-muted-foreground">Automatically fill nutritional data & description when you enter product name</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAIEnabled}
                      onChange={(e) => setIsAIEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-blue-600"></div>
                    <span className="ms-3 text-sm font-medium text-gray-900">{isAIEnabled ? 'ON' : 'OFF'}</span>
                  </label>
                </div>
                {isAILoading && (
                  <div className="mt-3 flex items-center gap-2 text-purple-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">AI is filling data automatically...</span>
                  </div>
                )}
              </div>

              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field w-full"
                      required
                      placeholder={isAIEnabled ? "Enter product name (AI will auto-fill)" : "Enter product name"}
                    />
                    {isAIEnabled && (
                      <p className="text-xs text-purple-600 mt-1">✨ AI will auto-fill when you type at least 3 characters</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Category *</label>
                    <Select value={formData.category} onValueChange={handleCategoryChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nuts">Nuts</SelectItem>
                        <SelectItem value="dates">Dates</SelectItem>
                        <SelectItem value="dried-fruits">Dried Fruits</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                        <SelectItem value="seeds">Seeds</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1.5">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="input-field w-full h-20 resize-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1.5">Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              {/* Pricing Section */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3 text-base">Pricing</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">250g (₹) *</label>
                    <input
                      type="number"
                      name="price250g"
                      value={formData.price250g}
                      onChange={handleInputChange}
                      className="input-field w-full"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1.5">500g (₹) *</label>
                    <input
                      type="number"
                      name="price500g"
                      value={formData.price500g}
                      onChange={handleInputChange}
                      className="input-field w-full"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1.5">1kg (₹) *</label>
                    <input
                      type="number"
                      name="price1kg"
                      value={formData.price1kg}
                      onChange={handleInputChange}
                      className="input-field w-full"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Product Images Section */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3 text-base">Product Images</h3>
                
                {/* Upload Button */}
                <label className="w-full mb-3 block">
                  <div className="btn-outline flex items-center justify-center w-full py-2.5 rounded-md cursor-pointer hover:bg-accent transition-colors">
                    <Upload className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">Add Images</span>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                </label>

                {/* Image Preview Grid */}
                {(existingImages.length > 0 || imagePreviews.length > 0) ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {/* Existing Images */}
                    {existingImages.map((url, index) => (
                      <div key={`existing-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-border hover:border-secondary transition-colors">
                        <img 
                          src={url} 
                          alt={`Existing ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {/* New Image Previews */}
                    {imagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-secondary hover:border-primary transition-colors">
                        <img 
                          src={preview} 
                          alt={`New ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 bg-secondary text-white text-xs px-2 py-0.5 rounded">New</div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No images uploaded yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Click "Add Images" to upload product photos</p>
                  </div>
                )}
              </div>
            
              {/* Nutritional Info Section */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3 text-base">Nutritional Information (per 100g)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Calories (kcal) *</label>
                    <input
                      type="number"
                      name="calories"
                      value={formData.calories}
                      onChange={handleInputChange}
                      className="input-field w-full text-sm"
                      min="0"
                      step="0.1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Protein (g) *</label>
                    <input
                      type="number"
                      name="protein"
                      value={formData.protein}
                      onChange={handleInputChange}
                      className="input-field w-full text-sm"
                      min="0"
                      step="0.1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Fat (g) *</label>
                    <input
                      type="number"
                      name="fat"
                      value={formData.fat}
                      onChange={handleInputChange}
                      className="input-field w-full text-sm"
                      min="0"
                      step="0.1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Carbs (g) *</label>
                    <input
                      type="number"
                      name="carbs"
                      value={formData.carbs}
                      onChange={handleInputChange}
                      className="input-field w-full text-sm"
                      min="0"
                      step="0.1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Fiber (g) *</label>
                    <input
                      type="number"
                      name="fiber"
                      value={formData.fiber}
                      onChange={handleInputChange}
                      className="input-field w-full text-sm"
                      min="0"
                      step="0.1"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4 bg-background z-10">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                type="submit" 
                className="btn-primary"
                onClick={(e) => {
                  console.log('Button clicked!');
                  // Form will handle submit
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                {selectedProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProduct}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
