/**
 * Admin Coupon Management Page
 * Create, view, edit, and delete discount coupons
 */

import { useState, useEffect } from 'react';
import { 
  getAllCoupons, 
  createCoupon, 
  updateCoupon, 
  deleteCoupon,
  generateCouponCode,
  type Coupon 
} from '@/services/couponService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  XCircle,
  Calendar,
  TrendingUp,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    validFrom: '',
    validUntil: '',
    usageLimit: 0,
    perUserLimit: 1,
    isActive: true,
    description: '',
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await getAllCoupons();
      setCoupons(data);
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = () => {
    const code = generateCouponCode('', 8);
    setFormData({ ...formData, code });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || formData.discountValue <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const couponData = {
        ...formData,
        code: formData.code.toUpperCase(),
        validFrom: new Date(formData.validFrom),
        validUntil: new Date(formData.validUntil),
      };

      if (editingCoupon) {
        await updateCoupon(editingCoupon.id!, couponData);
        toast.success('Coupon updated successfully!');
      } else {
        await createCoupon(couponData);
        toast.success('Coupon created successfully!');
      }

      // Reset form
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        validFrom: '',
        validUntil: '',
        usageLimit: 0,
        perUserLimit: 1,
        isActive: true,
        description: '',
      });
      setShowCreateForm(false);
      setEditingCoupon(null);
      loadCoupons();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save coupon');
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxDiscountAmount: coupon.maxDiscountAmount || 0,
      validFrom: coupon.validFrom.toISOString().split('T')[0],
      validUntil: coupon.validUntil.toISOString().split('T')[0],
      usageLimit: coupon.usageLimit || 0,
      perUserLimit: coupon.perUserLimit || 1,
      isActive: coupon.isActive,
      description: coupon.description || '',
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      await deleteCoupon(couponId);
      toast.success('Coupon deleted successfully!');
      loadCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied!');
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      await updateCoupon(coupon.id!, { isActive: !coupon.isActive });
      toast.success(`Coupon ${!coupon.isActive ? 'activated' : 'deactivated'}`);
      loadCoupons();
    } catch (error) {
      toast.error('Failed to update coupon status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupon Management</h1>
          <p className="text-gray-600 mt-1">Create and manage discount coupons</p>
        </div>
        <Button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setEditingCoupon(null);
            setFormData({
              code: '',
              discountType: 'percentage',
              discountValue: 0,
              minOrderAmount: 0,
              maxDiscountAmount: 0,
              validFrom: '',
              validUntil: '',
              usageLimit: 0,
              perUserLimit: 1,
              isActive: true,
              description: '',
            });
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="p-6 mb-8 bg-white shadow-lg">
          <h2 className="text-xl font-semibold mb-4">
            {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Coupon Code */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Coupon Code *
                </label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SAVE20"
                  required
                  maxLength={20}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">&nbsp;</label>
                <Button type="button" onClick={handleGenerateCode} variant="outline" className="w-full">
                  Generate Code
                </Button>
              </div>
            </div>

            {/* Discount Type & Value */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Discount Type *</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Discount Value * {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                </label>
                <Input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                  placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 100'}
                  min="0"
                  max={formData.discountType === 'percentage' ? '100' : undefined}
                  required
                />
              </div>
            </div>

            {/* Min Order & Max Discount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Minimum Order Amount (₹)</label>
                <Input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                  placeholder="0 = No minimum"
                  min="0"
                />
              </div>
              {formData.discountType === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Max Discount Amount (₹)</label>
                  <Input
                    type="number"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                    placeholder="0 = No limit"
                    min="0"
                  />
                </div>
              )}
            </div>

            {/* Validity Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Valid From *</label>
                <Input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Valid Until *</label>
                <Input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Usage Limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Total Usage Limit</label>
                <Input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                  placeholder="0 = Unlimited"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Per User Limit</label>
                <Input
                  type="number"
                  value={formData.perUserLimit}
                  onChange={(e) => setFormData({ ...formData, perUserLimit: Number(e.target.value) })}
                  placeholder="1"
                  min="1"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Diwali Special Offer"
                className="w-full px-3 py-2 border rounded-md"
                rows={2}
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Activate coupon immediately
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingCoupon(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Coupons List */}
      <div className="grid grid-cols-1 gap-4">
        {coupons.length === 0 ? (
          <Card className="p-8 text-center">
            <Tag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No coupons created yet</p>
            <p className="text-sm text-gray-400 mt-1">Create your first coupon to get started</p>
          </Card>
        ) : (
          coupons.map((coupon) => (
            <Card key={coupon.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Coupon Code & Status */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-primary">{coupon.code}</h3>
                    {coupon.isActive ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        <XCircle className="w-3 h-3" /> Inactive
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyCode(coupon.code)}
                      className="h-7 px-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Description */}
                  {coupon.description && (
                    <p className="text-gray-600 text-sm mb-3">{coupon.description}</p>
                  )}

                  {/* Discount Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Discount:</span>
                      <p className="font-semibold">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}%`
                          : `₹${coupon.discountValue}`}
                        {coupon.maxDiscountAmount > 0 && (
                          <span className="text-xs text-gray-500"> (max ₹{coupon.maxDiscountAmount})</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Min Order:</span>
                      <p className="font-semibold">
                        {coupon.minOrderAmount ? `₹${coupon.minOrderAmount}` : 'None'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Usage:</span>
                      <p className="font-semibold">
                        {coupon.usageCount}/{coupon.usageLimit || '∞'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Valid Until:</span>
                      <p className="font-semibold">{new Date(coupon.validUntil).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(coupon)}
                  >
                    {coupon.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(coupon)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(coupon.id!)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
