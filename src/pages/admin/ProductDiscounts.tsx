import { useState, useEffect } from 'react';
import { 
  getAllDiscounts, 
  setProductDiscount, 
  deleteProductDiscount, 
  toggleDiscountStatus,
  ProductDiscount,
  calculateDiscountedPrice
} from '@/services/discountService';
import { getAllProducts } from '@/services/productService';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Percent, 
  Plus, 
  Trash2, 
  Edit, 
  ToggleLeft, 
  ToggleRight,
  Tag,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const ProductDiscounts = () => {
  const { user } = useAuth();
  const [discounts, setDiscounts] = useState<ProductDiscount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<ProductDiscount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading discounts and products...');
      const [discountsData, productsData] = await Promise.all([
        getAllDiscounts(),
        getAllProducts()
      ]);
      console.log('✅ Loaded discounts:', discountsData.length);
      console.log('✅ Loaded products:', productsData.length);
      console.log('📦 Products:', productsData);
      setDiscounts(discountsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (discount?: ProductDiscount) => {
    console.log('🔓 Opening dialog, available products:', availableProducts.length);
    console.log('📦 Available products:', availableProducts);
    if (discount) {
      setEditingDiscount(discount);
      setSelectedProductId(discount.id);
      setDiscountPercentage(discount.discountPercentage.toString());
      setIsActive(discount.isActive);
    } else {
      setEditingDiscount(null);
      setSelectedProductId('');
      setDiscountPercentage('');
      setIsActive(true);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDiscount(null);
    setSelectedProductId('');
    setDiscountPercentage('');
    setIsActive(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProductId || !discountPercentage) {
      toast.error('Please fill all fields');
      return;
    }

    const percentage = parseFloat(discountPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      toast.error('Discount percentage must be between 0 and 100');
      return;
    }

    try {
      const product = products.find(p => p.id === selectedProductId);
      if (!product) {
        toast.error('Product not found');
        return;
      }

      await setProductDiscount({
        productId: selectedProductId,
        productName: product.name,
        discountPercentage: percentage,
        isActive,
        createdBy: user?.phone || 'unknown'
      });

      toast.success(editingDiscount ? 'Discount updated successfully' : 'Discount added successfully');
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error('Error saving discount:', error);
      toast.error('Failed to save discount');
    }
  };

  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    try {
      await toggleDiscountStatus(productId, !currentStatus);
      toast.success(`Discount ${!currentStatus ? 'activated' : 'deactivated'}`);
      loadData();
    } catch (error) {
      console.error('Error toggling discount:', error);
      toast.error('Failed to update discount status');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this discount?')) {
      return;
    }

    try {
      await deleteProductDiscount(productId);
      toast.success('Discount deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting discount:', error);
      toast.error('Failed to delete discount');
    }
  };

  const getProductById = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const filteredDiscounts = discounts.filter(discount => 
    discount.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discount.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableProducts = products.filter(product => 
    !discounts.find(d => d.id === product.id) || editingDiscount?.id === product.id
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Tag className="w-8 h-8 text-secondary" />
            Product Discounts
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage percentage-based discounts for products
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Discount
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <Tag className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Discounts</p>
              <p className="text-2xl font-bold">{discounts.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <ToggleRight className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">
                {discounts.filter(d => d.isActive).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-500/10 rounded-lg">
              <ToggleLeft className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inactive</p>
              <p className="text-2xl font-bold">
                {discounts.filter(d => !d.isActive).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Percent className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Discount</p>
              <p className="text-2xl font-bold">
                {discounts.length > 0 
                  ? Math.round(discounts.reduce((sum, d) => sum + d.discountPercentage, 0) / discounts.length)
                  : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by product name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Discounts List */}
      <div className="space-y-4">
        {filteredDiscounts.length === 0 ? (
          <Card className="p-12 text-center">
            <Tag className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No discounts found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? 'Try a different search term' : 'Add your first product discount to get started'}
            </p>
            {!searchTerm && (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Discount
              </Button>
            )}
          </Card>
        ) : (
          filteredDiscounts.map((discount) => {
            const product = getProductById(discount.id);
            const originalPrice = product?.prices?.['250g'] || 0;
            const discountedPrice = calculateDiscountedPrice(originalPrice, discount.discountPercentage);

            return (
              <Card key={discount.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    {/* Product Image */}
                    {product?.image && (
                      <img 
                        src={product.image} 
                        alt={discount.productName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    
                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{discount.productName}</h3>
                        <Badge variant={discount.isActive ? 'default' : 'secondary'}>
                          {discount.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Discount</p>
                          <p className="text-2xl font-bold text-secondary flex items-center gap-1">
                            {discount.discountPercentage}%
                            <Percent className="w-5 h-5" />
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Original Price</p>
                          <p className="text-lg font-medium line-through text-muted-foreground">
                            ₹{originalPrice.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Discounted Price</p>
                          <p className="text-lg font-bold text-green-600">
                            ₹{discountedPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                        <span>Product ID: {discount.id.slice(0, 8)}...</span>
                        <span>•</span>
                        <span>Updated: {discount.updatedAt.toDate().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleToggleStatus(discount.id, discount.isActive)}
                      title={discount.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {discount.isActive ? (
                        <ToggleRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-gray-500" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenDialog(discount)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(discount.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingDiscount ? 'Edit Discount' : 'Add New Discount'}
            </DialogTitle>
            <DialogDescription>
              {editingDiscount 
                ? 'Update the discount percentage for this product. The discount will be applied immediately if active.'
                : 'Select a product and set a percentage-based discount. You can see a live preview of the discounted price.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Product Selection */}
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                {availableProducts.length === 0 && !editingDiscount ? (
                  <div className="p-4 border rounded-md text-center text-muted-foreground">
                    <p className="mb-2">No products available</p>
                    <p className="text-sm">All products already have discounts or loading failed</p>
                  </div>
                ) : (
                  <Select
                    value={selectedProductId}
                    onValueChange={(value) => {
                      console.log('🎯 Selected product:', value);
                      setSelectedProductId(value);
                    }}
                    disabled={!!editingDiscount}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProducts.length > 0 ? (
                        availableProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - ₹{product.prices['250g']}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          No products available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                )}
                {editingDiscount && (
                  <p className="text-sm text-muted-foreground">
                    Product cannot be changed. Delete and create new discount to change product.
                  </p>
                )}
              </div>

              {/* Discount Percentage */}
              <div className="space-y-2">
                <Label htmlFor="percentage">Discount Percentage (%)</Label>
                <div className="relative">
                  <Input
                    id="percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    placeholder="e.g., 12"
                    className="pr-8"
                  />
                  <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              {/* Price Preview */}
              {selectedProductId && discountPercentage && (
                <Card className="p-4 bg-accent/50">
                  <p className="text-sm font-medium mb-2">Price Preview:</p>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Original</p>
                      <p className="text-lg line-through text-muted-foreground">
                        ₹{products.find(p => p.id === selectedProductId)?.prices['250g'].toFixed(2)}
                      </p>
                    </div>
                    <div className="text-2xl text-muted-foreground">→</div>
                    <div>
                      <p className="text-xs text-muted-foreground">Discounted</p>
                      <p className="text-lg font-bold text-green-600">
                        ₹{calculateDiscountedPrice(
                          products.find(p => p.id === selectedProductId)?.prices['250g'] || 0,
                          parseFloat(discountPercentage) || 0
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active (discount will be applied immediately)
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingDiscount ? 'Update' : 'Add'} Discount
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDiscounts;
