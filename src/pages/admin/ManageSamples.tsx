import { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Save,
  X,
  Loader2,
  Search,
  GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  getAllSamples,
  addSample,
  updateSample,
  deleteSample,
  toggleSampleStatus,
  SampleProduct,
  SampleProductInput
} from '@/services/sampleService';
import { getAllProducts } from '@/services/productService';
import { Product } from '@/types/product';

const AdminSamples = () => {
  const [samples, setSamples] = useState<SampleProduct[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSample, setEditingSample] = useState<SampleProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState<SampleProductInput>({
    productId: '',
    productName: '',
    productImage: '',
    sampleWeight: '50g',
    maxQuantity: 2,
    stock: 100,
    isActive: true,
    order: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [samplesData, productsData] = await Promise.all([
        getAllSamples(),
        getAllProducts()
      ]);
      setSamples(samplesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load samples. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setFormData(prev => ({
        ...prev,
        productId: product.id,
        productName: product.name,
        productImage: product.images?.[0] || product.image || ''
      }));
    }
  };

  const handleAddSample = async () => {
    if (!formData.productId || !formData.productName) {
      toast({
        title: 'Validation Error',
        description: 'Please select a product.',
        variant: 'destructive',
      });
      return;
    }

    setProcessing('adding');
    try {
      const newSample = {
        ...formData,
        order: samples.length
      };
      
      await addSample(newSample);
      
      toast({
        title: 'Success',
        description: 'Sample product added successfully.',
      });
      
      setShowAddModal(false);
      resetForm();
      await fetchData();
    } catch (error) {
      console.error('Error adding sample:', error);
      toast({
        title: 'Error',
        description: 'Failed to add sample. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleUpdateSample = async () => {
    if (!editingSample) return;

    setProcessing('updating');
    try {
      await updateSample(editingSample.id, formData);
      
      toast({
        title: 'Success',
        description: 'Sample updated successfully.',
      });
      
      setEditingSample(null);
      resetForm();
      await fetchData();
    } catch (error) {
      console.error('Error updating sample:', error);
      toast({
        title: 'Error',
        description: 'Failed to update sample. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteSample = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    setProcessing(id);
    try {
      await deleteSample(id);
      
      toast({
        title: 'Success',
        description: 'Sample deleted successfully.',
      });
      
      await fetchData();
    } catch (error) {
      console.error('Error deleting sample:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete sample. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setProcessing(id);
    try {
      await toggleSampleStatus(id, !currentStatus);
      
      toast({
        title: 'Success',
        description: `Sample ${!currentStatus ? 'activated' : 'deactivated'} successfully.`,
      });
      
      await fetchData();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  const openEditModal = (sample: SampleProduct) => {
    setEditingSample(sample);
    setFormData({
      productId: sample.productId,
      productName: sample.productName,
      productImage: sample.productImage,
      sampleWeight: sample.sampleWeight,
      maxQuantity: sample.maxQuantity,
      stock: sample.stock,
      isActive: sample.isActive,
      order: sample.order
    });
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      productName: '',
      productImage: '',
      sampleWeight: '50g',
      maxQuantity: 2,
      stock: 100,
      isActive: true,
      order: 0
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingSample(null);
    resetForm();
  };

  const filteredSamples = samples.filter(sample =>
    sample.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeSamplesCount = samples.filter(s => s.isActive).length;
  const totalStock = samples.reduce((sum, s) => sum + s.stock, 0);
  const lowStockCount = samples.filter(s => s.stock < 10 && s.stock > 0).length;
  const outOfStockCount = samples.filter(s => s.stock === 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl font-bold flex items-center gap-3">
            <Package className="w-8 h-8 text-orange-600" />
            Manage Sample Products
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure which products are available as free samples
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Sample Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card-premium">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{samples.length}</h3>
              <p className="text-sm text-muted-foreground">Total Samples</p>
            </div>
          </div>
        </div>

        <div className="card-premium">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{activeSamplesCount}</h3>
              <p className="text-sm text-muted-foreground">Active Samples</p>
            </div>
          </div>
        </div>

        <div className="card-premium">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{totalStock}</h3>
              <p className="text-sm text-muted-foreground">Total Stock</p>
            </div>
          </div>
        </div>

        <div className="card-premium">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${outOfStockCount > 0 ? 'bg-red-100' : 'bg-orange-100'}`}>
              <Package className={`w-6 h-6 ${outOfStockCount > 0 ? 'text-red-600' : 'text-orange-600'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{outOfStockCount > 0 ? outOfStockCount : lowStockCount}</h3>
              <p className="text-sm text-muted-foreground">{outOfStockCount > 0 ? 'Out of Stock' : 'Low Stock'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search samples by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
      </div>

      {/* Samples List */}
      <div className="card-premium">
        <h2 className="text-xl font-bold mb-4">Sample Products</h2>

        {filteredSamples.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No samples found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search.' : 'Start by adding your first sample product.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Sample Product
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSamples.map((sample) => (
              <div
                key={sample.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition"
              >
                {/* Drag Handle */}
                <div className="cursor-move text-muted-foreground">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Product Image */}
                <img
                  src={sample.productImage}
                  alt={sample.productName}
                  className="w-16 h-16 object-cover rounded-lg"
                />

                {/* Product Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{sample.productName}</h3>
                    <Badge variant={sample.isActive ? 'default' : 'secondary'}>
                      {sample.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {sample.stock === 0 && (
                      <Badge variant="destructive">Out of Stock</Badge>
                    )}
                    {sample.stock > 0 && sample.stock < 10 && (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        Low Stock
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Weight:</span> {sample.sampleWeight} • 
                    <span className="ml-2 font-medium">Max Qty:</span> {sample.maxQuantity} • 
                    <span className="ml-2 font-medium">Stock:</span> 
                    <span className={`ml-1 font-semibold ${
                      sample.stock === 0 ? 'text-red-600' : 
                      sample.stock < 10 ? 'text-orange-600' : 
                      'text-green-600'
                    }`}>
                      {sample.stock}
                    </span> • 
                    <span className="ml-2 font-medium">Order:</span> {sample.order}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(sample.id, sample.isActive)}
                    disabled={processing === sample.id}
                  >
                    {processing === sample.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : sample.isActive ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(sample)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSample(sample.id, sample.productName)}
                    disabled={processing === sample.id}
                    className="text-red-600 hover:text-red-700"
                  >
                    {processing === sample.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingSample) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card-premium max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {editingSample ? <Edit className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                {editingSample ? 'Edit Sample Product' : 'Add Sample Product'}
              </h2>
              <Button variant="ghost" size="sm" onClick={closeModal}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Product *
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="input-field w-full"
                  disabled={!!editingSample}
                >
                  <option value="">Choose a product...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  {editingSample ? 'Product cannot be changed after creation' : 'Select which product this sample represents'}
                </p>
              </div>

              {/* Product Preview */}
              {formData.productImage && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <img
                    src={formData.productImage}
                    alt={formData.productName}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{formData.productName}</p>
                    <p className="text-sm text-muted-foreground">Selected product</p>
                  </div>
                </div>
              )}

              {/* Sample Weight */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sample Weight *
                </label>
                <select
                  value={formData.sampleWeight}
                  onChange={(e) => setFormData(prev => ({ ...prev, sampleWeight: e.target.value }))}
                  className="input-field w-full"
                >
                  <option value="25g">25g</option>
                  <option value="50g">50g</option>
                  <option value="75g">75g</option>
                  <option value="100g">100g</option>
                </select>
              </div>

              {/* Max Quantity */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Maximum Quantity Per Order
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxQuantity: parseInt(e.target.value) || 1 }))}
                  className="input-field w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  How many of this sample can a customer select? (Usually 1-2)
                </p>
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                  className="input-field w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available stock for this sample. Stock decreases automatically when ordered.
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Active (visible to customers)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={editingSample ? handleUpdateSample : handleAddSample}
                  disabled={!formData.productId || processing === 'adding' || processing === 'updating'}
                  className="flex-1"
                >
                  {(processing === 'adding' || processing === 'updating') ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingSample ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingSample ? 'Update Sample' : 'Add Sample'}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={closeModal}
                  disabled={processing === 'adding' || processing === 'updating'}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSamples;
