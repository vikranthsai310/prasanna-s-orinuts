
import { useState } from 'react';
import { Save, MapPin, Bell, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const { toast } = useToast();
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "Prasanna's Orinut",
    address: '123 Business District, Mumbai, Maharashtra 400001',
    phone: '+91 9876543210',
    email: 'support@prasannaorinut.com',
    gst: 'GST123456789'
  });

  const [notifications, setNotifications] = useState({
    emailOrderUpdates: true,
    whatsappOrderUpdates: true,
    emailInventoryAlerts: true,
    whatsappInventoryAlerts: false,
    emailMarketing: true
  });

  const handleBusinessInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBusinessInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your business settings have been updated successfully."
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-playfair text-3xl font-bold">Settings</h1>
        <Button onClick={handleSave} className="btn-primary">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Business Information */}
        <div className="card-premium">
          <div className="flex items-center space-x-2 mb-6">
            <MapPin className="w-5 h-5 text-secondary" />
            <h2 className="font-semibold text-xl">Business Information</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Business Name</label>
              <input
                type="text"
                name="businessName"
                value={businessInfo.businessName}
                onChange={handleBusinessInfoChange}
                className="input-field w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Business Address</label>
              <input
                type="text"
                name="address"
                value={businessInfo.address}
                onChange={handleBusinessInfoChange}
                className="input-field w-full"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={businessInfo.phone}
                  onChange={handleBusinessInfoChange}
                  className="input-field w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={businessInfo.email}
                  onChange={handleBusinessInfoChange}
                  className="input-field w-full"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">GST Number</label>
              <input
                type="text"
                name="gst"
                value={businessInfo.gst}
                onChange={handleBusinessInfoChange}
                className="input-field w-full"
              />
            </div>
          </div>
        </div>
        
        {/* Notification Settings */}
        <div className="card-premium">
          <div className="flex items-center space-x-2 mb-6">
            <Bell className="w-5 h-5 text-secondary" />
            <h2 className="font-semibold text-xl">Notification Settings</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3 flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Email Notifications
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Order updates</span>
                  <Switch
                    checked={notifications.emailOrderUpdates}
                    onCheckedChange={(checked) => handleNotificationChange('emailOrderUpdates', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Inventory alerts</span>
                  <Switch
                    checked={notifications.emailInventoryAlerts}
                    onCheckedChange={(checked) => handleNotificationChange('emailInventoryAlerts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Marketing emails</span>
                  <Switch
                    checked={notifications.emailMarketing}
                    onCheckedChange={(checked) => handleNotificationChange('emailMarketing', checked)}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3 flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp Notifications
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Order updates</span>
                  <Switch
                    checked={notifications.whatsappOrderUpdates}
                    onCheckedChange={(checked) => handleNotificationChange('whatsappOrderUpdates', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Inventory alerts</span>
                  <Switch
                    checked={notifications.whatsappInventoryAlerts}
                    onCheckedChange={(checked) => handleNotificationChange('whatsappInventoryAlerts', checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
