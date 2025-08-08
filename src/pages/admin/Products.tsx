
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Loader2, X, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
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
  deleteProduct 
} from '@/services/productService';
import { Product } from '@/types/product';
import { useToast } from '@/hooks/use-toast';

const AdminProducts = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name.startsWith('price') || name === 'stock' || 
                                       name === 'calories' || name === 'protein' || 
                                       name === 'fat' || name === 'carbs' || 
                                       name === 'fiber' ? Number(value) : value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value as 'nuts' | 'dates' | 'dried-fruits' | 'mixed' }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    setImageFile(null);
    setImagePreview(null);
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
    setImageFile(null);
    setImagePreview(product.image);
    setIsModalOpen(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        category: formData.category,
        stock: formData.stock
      };

      if (selectedProduct) {
        // Update existing product
        await updateProduct(selectedProduct.id, productData, imageFile || undefined);
        toast({
          title: "Success",
          description: "Product updated successfully"
        });
      } else {
        // Add new product
        await addProduct(productData, imageFile || undefined);
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
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="input-field w-full h-24"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <Select value={formData.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nuts">Nuts</SelectItem>
                      <SelectItem value="dates">Dates</SelectItem>
                      <SelectItem value="dried-fruits">Dried Fruits</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
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
              
              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (250g)</label>
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
                  <label className="block text-sm font-medium mb-1">Price (500g)</label>
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
                  <label className="block text-sm font-medium mb-1">Price (1kg)</label>
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
                
                <div>
                  <label className="block text-sm font-medium mb-1">Product Image</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-md overflow-hidden">
                      <img 
                        src={imagePreview || formData.image} 
                        alt="Product preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <label className="flex-1">
                      <div className="btn-outline flex items-center justify-center w-full py-2 rounded-md cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        <span>Upload Image</span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Nutritional Info */}
            <div>
              <h3 className="font-medium mb-3">Nutritional Information (per 100g)</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Calories</label>
                  <input
                    type="number"
                    name="calories"
                    value={formData.calories}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Protein (g)</label>
                  <input
                    type="number"
                    name="protein"
                    value={formData.protein}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fat (g)</label>
                  <input
                    type="number"
                    name="fat"
                    value={formData.fat}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    name="carbs"
                    value={formData.carbs}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fiber (g)</label>
                  <input
                    type="number"
                    name="fiber"
                    value={formData.fiber}
                    onChange={handleInputChange}
                    className="input-field w-full"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="btn-primary">
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
