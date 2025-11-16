/**
 * Admin Delhivery Fees Management Page
 * Create, view, edit, and delete Delhivery shipping fees
 */

import { useState, useEffect } from 'react';
import { 
  getAllDelhiveryFees,
  createDelhiveryFee,
  updateDelhiveryFee,
  deleteDelhiveryFee,
  initializeDefaultFees,
  type DelhiveryFee 
} from '@/services/delhiveryFeesService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  IndianRupee,
  Truck,
  Package,
  MapPin,
  RefreshCw,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

export default function DelhiveryFeesPage() {
  const [fees, setFees] = useState<DelhiveryFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFee, setEditingFee] = useState<DelhiveryFee | null>(null);
  const [deletingFeeId, setDeletingFeeId] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Omit<DelhiveryFee, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    feeType: 'custom',
    amount: 0,
    isActive: true,
    applicableFor: 'all',
  });

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      setLoading(true);
      const data = await getAllDelhiveryFees();
      
      // Only initialize default fees on first load if collection is empty
      if (data.length === 0 && !hasInitialized) {
        await initializeDefaultFees();
        const newData = await getAllDelhiveryFees();
        setFees(newData);
        setHasInitialized(true);
        toast.success('Default fees initialized');
      } else {
        setFees(data);
      }
    } catch (error) {
      console.error('Error loading fees:', error);
      toast.error('Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.amount < 0) {
      toast.error('Please fill in all required fields with valid values');
      return;
    }

    try {
      if (editingFee) {
        await updateDelhiveryFee(editingFee.id!, formData);
        toast.success('Fee updated successfully!');
      } else {
        await createDelhiveryFee(formData);
        toast.success('Fee created successfully!');
      }

      // Reset form
      resetForm();
      loadFees();
    } catch (error) {
      console.error('Error saving fee:', error);
      toast.error('Failed to save fee');
    }
  };

  const handleEdit = (fee: DelhiveryFee) => {
    setEditingFee(fee);
    setFormData({
      name: fee.name,
      description: fee.description,
      feeType: fee.feeType,
      amount: fee.amount,
      isActive: fee.isActive,
      applicableFor: fee.applicableFor,
      minWeight: fee.minWeight,
      maxWeight: fee.maxWeight,
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (feeId: string) => {
    try {
      console.log('Attempting to delete fee:', feeId);
      await deleteDelhiveryFee(feeId);
      toast.success('Fee deleted successfully!');
      await loadFees();
      setDeletingFeeId(null);
    } catch (error: any) {
      console.error('Error deleting fee:', error);
      toast.error(error.message || 'Failed to delete fee. Please check your permissions.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      feeType: 'custom',
      amount: 0,
      isActive: true,
      applicableFor: 'all',
    });
    setEditingFee(null);
    setShowCreateForm(false);
  };

  const getFeeTypeIcon = (feeType: DelhiveryFee['feeType']) => {
    switch (feeType) {
      case 'base_rate':
        return <Truck className="h-4 w-4" />;
      case 'per_kg_metro':
      case 'per_kg_non_metro':
        return <Package className="h-4 w-4" />;
      case 'cod_charges':
        return <IndianRupee className="h-4 w-4" />;
      case 'packaging':
        return <Package className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getFeeTypeBadgeColor = (feeType: DelhiveryFee['feeType']) => {
    switch (feeType) {
      case 'base_rate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'per_kg_metro':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'per_kg_non_metro':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cod_charges':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'packaging':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-playfair mb-2">Delhivery Fees Management</h1>
          <p className="text-muted-foreground">Configure shipping fees for Delhivery integration</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Fee
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Fees</p>
                <p className="text-2xl font-bold">{fees.length}</p>
              </div>
              <Truck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Fees</p>
                <p className="text-2xl font-bold">{fees.filter(f => f.isActive).length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive Fees</p>
                <p className="text-2xl font-bold">{fees.filter(f => !f.isActive).length}</p>
              </div>
              <XCircle className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Base Rate</p>
                <p className="text-2xl font-bold">
                  ₹{fees.find(f => f.feeType === 'base_rate')?.amount || 0}
                </p>
              </div>
              <IndianRupee className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fees List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fees.map((fee) => (
          <Card key={fee.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getFeeTypeIcon(fee.feeType)}
                  <CardTitle className="text-lg">{fee.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {fee.isActive ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
              <CardDescription>{fee.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="text-lg font-bold text-primary">₹{fee.amount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getFeeTypeBadgeColor(fee.feeType)}`}>
                    {fee.feeType.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>

                {fee.applicableFor && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Applicable:</span>
                    <span className="text-sm font-medium capitalize">{fee.applicableFor}</span>
                  </div>
                )}

                {(fee.minWeight || fee.maxWeight) && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Weight Range:</span>
                    <span className="text-sm font-medium">
                      {fee.minWeight || 0}kg - {fee.maxWeight || '∞'}kg
                    </span>
                  </div>
                )}

                <div className="flex gap-2 mt-4 pt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEdit(fee)}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => {
                      if (!fee.id) {
                        toast.error('Cannot delete: Fee ID is missing');
                        return;
                      }
                      setDeletingFeeId(fee.id);
                    }}
                    disabled={!fee.id}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {fees.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No fees configured</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first Delhivery fee
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Fee
            </Button>
          </div>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateForm} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFee ? 'Edit Fee' : 'Create New Fee'}
            </DialogTitle>
            <DialogDescription>
              {editingFee 
                ? 'Update the fee details below. Active fees are automatically used in shipping calculations.' 
                : 'Add a new Delhivery shipping fee. Configure rates for different scenarios like base charges, weight-based pricing, or location-based fees.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Fee Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Metro City Base Rate, Heavy Package Surcharge"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Give this fee a descriptive name for easy identification</p>
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this fee"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="feeType">Fee Type *</Label>
                <Select 
                  value={formData.feeType} 
                  onValueChange={(value) => setFormData({ ...formData, feeType: value as DelhiveryFee['feeType'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="base_rate">Base Rate - Fixed charge for all shipments</SelectItem>
                    <SelectItem value="per_kg_metro">Per KG (Metro) - Additional charge per kg in metro cities</SelectItem>
                    <SelectItem value="per_kg_non_metro">Per KG (Non-Metro) - Additional charge per kg outside metros</SelectItem>
                    <SelectItem value="cod_charges">COD Charges - Cash on Delivery handling fee</SelectItem>
                    <SelectItem value="packaging">Packaging - Material and packing costs</SelectItem>
                    <SelectItem value="custom">Custom - Your own fee type</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Select how this fee should be applied in calculations</p>
                {formData.feeType === 'packaging' && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-700 dark:text-blue-300">
                    💡 <strong>Tip:</strong> Packaging fees are typically set to "All Areas" since every order needs packing materials regardless of location.
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="50"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Fee amount in rupees (e.g., 50 for ₹50)</p>
              </div>

              <div>
                <Label htmlFor="applicableFor">Applicable For</Label>
                <Select 
                  value={formData.applicableFor} 
                  onValueChange={(value) => setFormData({ ...formData, applicableFor: value as 'all' | 'metro' | 'non_metro' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Areas - Apply to all locations</SelectItem>
                    <SelectItem value="metro">Metro Cities Only - Mumbai, Delhi, Bangalore, etc.</SelectItem>
                    <SelectItem value="non_metro">Non-Metro Only - All other cities and towns</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Choose which locations this fee applies to</p>
              </div>

              <div>
                <Label htmlFor="minWeight">Min Weight (kg)</Label>
                <Input
                  id="minWeight"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.minWeight || ''}
                  onChange={(e) => setFormData({ ...formData, minWeight: parseFloat(e.target.value) || undefined })}
                  placeholder="0.5"
                />
                <p className="text-xs text-muted-foreground mt-1">Apply this fee only if weight is above this (optional)</p>
              </div>

              <div className="col-span-2">
                <Label htmlFor="maxWeight">Max Weight (kg)</Label>
                <Input
                  id="maxWeight"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.maxWeight || ''}
                  onChange={(e) => setFormData({ ...formData, maxWeight: parseFloat(e.target.value) || undefined })}
                  placeholder="10"
                />
                <p className="text-xs text-muted-foreground mt-1">Apply this fee only if weight is below this (leave empty for unlimited)</p>
              </div>

              <div className="col-span-2 flex items-center space-x-2 p-3 bg-accent/50 rounded-lg">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <div className="flex-1">
                  <Label htmlFor="isActive" className="cursor-pointer font-medium">
                    Active Status
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formData.isActive 
                      ? '✓ This fee will be included in shipping calculations' 
                      : '✗ This fee is disabled and will not be applied'}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">
                {editingFee ? 'Update Fee' : 'Create Fee'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingFeeId} onOpenChange={() => setDeletingFeeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fee Configuration?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingFeeId && (
                <span className="block mb-2 font-medium text-foreground">
                  {fees.find(f => f.id === deletingFeeId)?.name}
                </span>
              )}
              This will permanently delete this fee configuration. This action cannot be undone.
              The fee will no longer be used in shipping calculations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingFeeId) {
                  handleDelete(deletingFeeId);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Delete Fee
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
