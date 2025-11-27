import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Truck, Save, DollarSign, Package, Sparkles, TrendingUp } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-600 mx-auto"></div>
            <Truck className="w-8 h-8 text-amber-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-playfair font-bold bg-gradient-to-r from-amber-900 via-amber-700 to-orange-700 bg-clip-text text-transparent">
                Shipping Settings
              </h1>
              <p className="text-gray-600 mt-1">Configure delivery fees and free shipping threshold</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Settings Card */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-amber-100 shadow-2xl bg-white/80 backdrop-blur">
              <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Package className="w-6 h-6 text-amber-700" />
                  </div>
                  Delivery Fee Configuration
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Set the delivery fee and minimum order value for free delivery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                {/* Delivery Fee */}
                <div className="space-y-3">
                  <Label htmlFor="deliveryFee" className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                    Delivery Fee
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl font-semibold text-gray-600">₹</span>
                    <Input
                      id="deliveryFee"
                      type="number"
                      min="0"
                      step="1"
                      value={settings.deliveryFee}
                      onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })}
                      className="pl-10 pr-4 text-xl h-14 border-2 border-gray-200 focus:border-amber-500 rounded-xl font-semibold transition-all"
                      placeholder="Enter delivery fee"
                    />
                  </div>
                  <p className="text-sm text-gray-500 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    This fee will be charged for all orders below the free delivery threshold
                  </p>
                </div>

                {/* Free Delivery Threshold */}
                <div className="space-y-3">
                  <Label htmlFor="freeDeliveryThreshold" className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Free Delivery Above
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl font-semibold text-gray-600">₹</span>
                    <Input
                      id="freeDeliveryThreshold"
                      type="number"
                      min="0"
                      step="1"
                      value={settings.freeDeliveryThreshold}
                      onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })}
                      className="pl-10 pr-4 text-xl h-14 border-2 border-gray-200 focus:border-green-500 rounded-xl font-semibold transition-all"
                      placeholder="Enter minimum order value"
                    />
                  </div>
                  <p className="text-sm text-gray-500 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Orders above this amount will get free delivery
                  </p>
                </div>

                {/* Save Button */}
                <div className="pt-6">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all rounded-xl"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-3" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Live Preview */}
            <Card className="border-2 border-blue-200 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 sticky top-6">
              <CardHeader className="border-b border-blue-200 pb-4">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Sparkles className="w-5 h-5" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="bg-white rounded-xl p-4 border-2 border-blue-100 shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Package className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-1">Order Below Threshold</p>
                      <p className="text-xs text-gray-500">Cart: ₹{Math.max(0, settings.freeDeliveryThreshold - 100)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Delivery Fee:</span>
                    <span className="text-lg font-bold text-red-600">+₹{settings.deliveryFee}</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border-2 border-green-200 shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Package className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-1">Order Above Threshold</p>
                      <p className="text-xs text-gray-500">Cart: ₹{settings.freeDeliveryThreshold}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Delivery Fee:</span>
                    <span className="text-lg font-bold text-green-600">FREE</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-2 border-amber-200 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-amber-900 text-base">
                  <TrendingUp className="w-5 h-5" />
                  Savings Incentive
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-amber-900 space-y-2">
                <p className="flex items-start gap-2">
                  <span className="text-2xl">💡</span>
                  <span>Customers need to add <strong>₹{settings.freeDeliveryThreshold}</strong> to cart for free delivery</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-2xl">🎯</span>
                  <span>This encourages higher order values and increases AOV</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingSettingsPage;
