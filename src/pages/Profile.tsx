
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Phone, Mail, Edit, Trash2, Plus, Check, Shield, AlertCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import ProfileCompletionDialog from '@/components/ProfileCompletionDialog';
import { 
  getUserAddresses, 
  addAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress,
  ADDRESS_TYPES,
  type Address,
  type AddressType
} from '@/services/addressService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from '@/components/ui/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const [addressForm, setAddressForm] = useState({
    type: 'Home' as AddressType,
    email: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  // Check if phone is verified
  const isPhoneVerified = user?.phoneVerified || false;
  const hasPhone = user?.phone && user.phone.length > 0;
  
  // Update profile data when user data changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);
  
  // Fetch user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (user?.id) {
        setIsLoading(true);
        try {
          const userAddresses = await getUserAddresses(user.id);
          setAddresses(userAddresses);
        } catch (error) {
          console.error('Error fetching addresses:', error);
          toast({
            title: "Error",
            description: "Failed to load your addresses. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchAddresses();
  }, [user?.id]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    try {
      // Update user profile in Firestore
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        name: profileData.name,
        phone: profileData.phone,
        // Don't update email as it's tied to authentication
      });
      
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setAddressForm(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'type') {
      // Ensure type is properly cast as AddressType
      setAddressForm(prev => ({ ...prev, type: value as AddressType }));
    } else {
      setAddressForm(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const openAddressDialog = (address?: Address) => {
    if (address) {
      setEditingAddressId(address.id);
      setAddressForm({
        type: address.type,
        email: address.email || user?.email || '',
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        isDefault: address.isDefault
      });
    } else {
      setEditingAddressId(null);
      setAddressForm({
        type: 'Home' as AddressType,
        email: user?.email || '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: addresses.length === 0 // Set as default if it's the first address
      });
    }
    setIsAddressDialogOpen(true);
  };
  
  const handleSaveAddress = async () => {
    if (!user?.id) return;
    
    try {
      if (editingAddressId) {
        // Update existing address
        await updateAddress(editingAddressId, {
          ...addressForm,
          userId: user.id,
          name: user.name,
          phone: user.phone || ''
        });
        
        setAddresses(prev => 
          prev.map(addr => 
            addr.id === editingAddressId 
              ? { ...addr, ...addressForm } 
              : addr.isDefault && addressForm.isDefault 
                ? { ...addr, isDefault: false } 
                : addr
          )
        );
        
        toast({
          title: "Address Updated",
          description: "Your address has been updated successfully."
        });
      } else {
        // Add new address
        const newAddressId = await addAddress({
          userId: user.id,
          name: user.name,
          phone: user.phone || '',
          ...addressForm
        });
        
        const newAddress: Address = {
          id: newAddressId,
          userId: user.id,
          name: user.name,
          phone: user.phone || '',
          ...addressForm
        };
        
        setAddresses(prev => 
          addressForm.isDefault 
            ? [newAddress, ...prev.map(addr => ({ ...addr, isDefault: false }))]
            : [newAddress, ...prev]
        );
        
        toast({
          title: "Address Added",
          description: "Your new address has been added successfully."
        });
      }
      
      setIsAddressDialogOpen(false);
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: "Error",
        description: "Failed to save address. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteAddress = async (addressId: string) => {
    try {
      await deleteAddress(addressId);
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      
      toast({
        title: "Address Deleted",
        description: "Your address has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: "Failed to delete address. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      await setDefaultAddress(addressId);
      
      setAddresses(prev => 
        prev.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId
        }))
      );
      
      toast({
        title: "Default Address Updated",
        description: "Your default address has been updated successfully."
      });
    } catch (error) {
      console.error('Error setting default address:', error);
      toast({
        title: "Error",
        description: "Failed to set default address. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePhoneVerificationComplete = async () => {
    if (!user?.id) return;
    
    try {
      // Update user's phone verification status in Firestore
      await updateDoc(doc(db, 'users', user.id), {
        phoneVerified: true,
        updatedAt: new Date()
      });
      
      // Close the verification dialog
      setShowPhoneVerification(false);
      
      // Show success message
      toast({
        title: "Phone Verified! ✅",
        description: "Your phone number has been verified successfully. You'll now receive order updates via SMS.",
        duration: 5000,
      });
      
      // Refresh user data to show verification status
      window.location.reload(); // Simple way to refresh user state
      
    } catch (error) {
      console.error('Error updating phone verification status:', error);
      toast({
        title: "Verification Failed",
        description: "Phone verification succeeded, but failed to update your profile. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        variant: "default"
      });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="font-playfair text-3xl font-bold mb-8">My Profile</h1>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="addresses">Saved Addresses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <div className="card-premium max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-secondary-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold text-xl">{user?.name}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              
              <Button
                variant={isEditing ? "default" : "outline"}
                onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
              >
                {isEditing ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                  className={`input-field w-full ${!isEditing ? 'bg-muted' : ''}`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={profileData.email}
                    disabled={true} // Email is tied to authentication, so don't allow editing
                    className="input-field flex-1 bg-muted"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center flex-1 space-x-2 min-w-0">
                      <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="+91 XXXXXXXXXX"
                        className={`input-field flex-1 min-w-0 ${!isEditing ? 'bg-muted' : ''}`}
                      />
                    </div>
                    {hasPhone && (
                      <Badge 
                        variant={isPhoneVerified ? "default" : "secondary"}
                        className={`flex items-center justify-center space-x-1 flex-shrink-0 ${
                          isPhoneVerified 
                            ? 'bg-green-100 text-green-800 border-green-200' 
                            : 'bg-orange-100 text-orange-800 border-orange-200'
                        }`}
                      >
                        {isPhoneVerified ? (
                          <>
                            <Shield className="w-3 h-3" />
                            <span className="text-xs sm:text-sm">Verified</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" />
                            <span className="text-xs sm:text-sm">Unverified</span>
                          </>
                        )}
                      </Badge>
                    )}
                  </div>
                  
                  {hasPhone && !isPhoneVerified && (
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex-1 text-sm text-muted-foreground">
                        Your phone number is not verified. Verify it to enable order notifications and better security.
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPhoneVerification(true)}
                        className="whitespace-nowrap"
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        Verify Phone
                      </Button>
                    </div>
                  )}
                  
                  {!hasPhone && !isEditing && (
                    <div className="flex items-center space-x-2 mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                      <div className="flex-1 text-sm text-orange-800">
                        Add your phone number to receive order updates and enable phone verification.
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="whitespace-nowrap border-orange-300 text-orange-700 hover:bg-orange-100"
                      >
                        Add Phone
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Logout Section */}
            <div className="border-t pt-6 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">Account Actions</h3>
                  <p className="text-sm text-muted-foreground">Manage your account settings</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="addresses">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-xl">Saved Addresses</h2>
              <Button className="btn-primary" onClick={() => openAddressDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Address
              </Button>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading your addresses...</p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8 card-premium">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Addresses Found</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't added any delivery addresses yet.
                </p>
                <Button onClick={() => openAddressDialog()}>
                  Add Your First Address
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div key={address.id} className="card-premium">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-secondary" />
                        <span className="font-semibold">{address.type}</span>
                        {address.isDefault && (
                          <span className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openAddressDialog(address)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive"
                          onClick={() => handleDeleteAddress(address.id!)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{address.street}</p>
                      <p>{address.city}, {address.state} - {address.pincode}</p>
                    </div>
                    
                    {!address.isDefault && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => handleSetDefaultAddress(address.id!)}
                      >
                        Set as Default
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Address Dialog */}
      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAddressId ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Address Type</label>
              <select
                name="type"
                value={addressForm.type}
                onChange={handleAddressInputChange}
                className="input-field w-full"
              >
                {ADDRESS_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={addressForm.email}
                onChange={handleAddressInputChange}
                className="input-field w-full"
                placeholder="Enter your email address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Street Address</label>
              <input
                type="text"
                name="street"
                value={addressForm.street}
                onChange={handleAddressInputChange}
                className="input-field w-full"
                placeholder="Enter your complete address"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={addressForm.city}
                  onChange={handleAddressInputChange}
                  className="input-field w-full"
                  placeholder="City"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={addressForm.state}
                  onChange={handleAddressInputChange}
                  className="input-field w-full"
                  placeholder="State"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={addressForm.pincode}
                onChange={handleAddressInputChange}
                className="input-field w-full"
                placeholder="6-digit pincode"
                maxLength={6}
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={addressForm.isDefault}
                onChange={handleAddressInputChange}
                className="h-4 w-4"
              />
              <label htmlFor="isDefault" className="text-sm font-medium">
                Set as default address
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveAddress}>
              {editingAddressId ? 'Update Address' : 'Save Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Phone Verification Dialog */}
      <ProfileCompletionDialog
        isOpen={showPhoneVerification}
        onClose={() => setShowPhoneVerification(false)}
        onComplete={handlePhoneVerificationComplete}
      />

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <LogOut className="w-5 h-5 text-red-500" />
              <span>Confirm Logout</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </p>
          </div>
          
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Yes, Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
