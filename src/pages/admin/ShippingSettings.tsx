import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Truck, Save, DollarSign } from 'lucide-react';

interface ShippingSettings {
  deliveryFee: number;
  freeDeliveryThreshold: number;
}

const ShippingSettingsPage = () => {
  const [settings, setSettings] = useState<ShippingSettings>({
    deliveryFee: 70,
    freeDeliveryThreshold: 500,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'settings', 'shipping');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setSettings(docSnap.data() as ShippingSettings);
      }
    } catch (error) {
      console.error('Error fetching shipping settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load shipping settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate inputs
      if (settings.deliveryFee < 0) {
        toast({
          title: 'Invalid Input',
          description: 'Delivery fee cannot be negative',
          variant: 'destructive',
        });
        return;
      }

      if (settings.freeDeliveryThreshold < 0) {
        toast({
          title: 'Invalid Input',
          description: 'Free delivery threshold cannot be negative',
          variant: 'destructive',
        });
        return;
      }

      const docRef = doc(db, 'settings', 'shipping');
      await setDoc(docRef, {
        deliveryFee: Number(settings.deliveryFee),
        freeDeliveryThreshold: Number(settings.freeDeliveryThreshold),
        updatedAt: new Date(),
      });

      toast({
        title: 'Success',
        description: 'Shipping settings updated successfully',
      });
    } catch (error) {
      console.error('Error saving shipping settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save shipping settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipping Settings</h1>
        <p className="text-gray-600">Configure delivery fees and free shipping threshold</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Delivery Fee Configuration
          </CardTitle>
          <CardDescription>
            Set the delivery fee and minimum order value for free delivery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Delivery Fee */}
          <div className="space-y-2">
            <Label htmlFor="deliveryFee" className="text-base font-semibold">
              Delivery Fee (₹)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                id="deliveryFee"
                type="number"
                min="0"
                step="1"
                value={settings.deliveryFee}
                onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })}
                className="pl-10 text-lg"
                placeholder="Enter delivery fee"
              />
            </div>
            <p className="text-sm text-gray-500">
              This fee will be charged for all orders below the free delivery threshold
            </p>
          </div>

          {/* Free Delivery Threshold */}
          <div className="space-y-2">
            <Label htmlFor="freeDeliveryThreshold" className="text-base font-semibold">
              Free Delivery Above (₹)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                id="freeDeliveryThreshold"
                type="number"
                min="0"
                step="1"
                value={settings.freeDeliveryThreshold}
                onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })}
                className="pl-10 text-lg"
                placeholder="Enter minimum order value"
              />
            </div>
            <p className="text-sm text-gray-500">
              Orders above this amount will get free delivery
            </p>
          </div>

          {/* Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">Preview</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Order below ₹{settings.freeDeliveryThreshold}:</span>
                <span className="font-semibold text-gray-900">+₹{settings.deliveryFee} delivery fee</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Order ₹{settings.freeDeliveryThreshold} or above:</span>
                <span className="font-semibold text-green-600">FREE delivery</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShippingSettingsPage;
