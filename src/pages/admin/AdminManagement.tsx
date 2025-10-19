/**
 * Admin Management Page
 * Super Admin can add/remove admins
 * Super Admin (+916301308477) cannot be removed
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Crown,
  UserPlus,
  UserMinus,
  Loader2,
  Search,
  AlertTriangle,
  CheckCircle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  getAllUsers,
  getAllAdmins,
  promoteToAdmin,
  demoteFromAdmin,
  AdminUser,
  formatTimestamp,
} from '@/services/userService';
import { SUPER_ADMIN_PHONES } from '@/config';

const AdminManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Check if user is super admin
    if (!user?.adminRole || user.adminRole !== 'super-admin') {
      toast({
        title: 'Access Denied',
        description: 'Only Super Admin can access this page.',
        variant: 'destructive',
      });
      navigate('/admin/dashboard');
      return;
    }

    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [adminsData, usersData] = await Promise.all([
        getAllAdmins(),
        getAllUsers(),
      ]);
      setAdmins(adminsData);
      setAllUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to promote ${userName} to Admin?`)) {
      return;
    }

    setProcessing(userId);
    try {
      await promoteToAdmin(userId, 'admin');
      toast({
        title: 'Admin Added',
        description: `${userName} is now an admin.`,
      });
      await fetchData();
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to promote user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleDemoteFromAdmin = async (userId: string, userName: string, adminRole?: string) => {
    // Prevent removing super admin
    if (adminRole === 'super-admin') {
      toast({
        title: 'Cannot Remove Super Admin',
        description: 'Super Admin cannot be removed by anyone.',
        variant: 'destructive',
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to remove ${userName} from Admin role? They will become a regular user.`)) {
      return;
    }

    setProcessing(userId);
    try {
      await demoteFromAdmin(userId);
      toast({
        title: 'Admin Removed',
        description: `${userName} is no longer an admin.`,
      });
      await fetchData();
    } catch (error) {
      console.error('Error demoting admin:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove admin. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  const nonAdminUsers = allUsers.filter(u => !u.isAdmin);
  const filteredNonAdmins = nonAdminUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone.includes(searchTerm) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
            <Shield className="w-8 h-8 text-purple-600" />
            Admin Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage admin access and permissions (Super Admin Only)
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add New Admin
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card-premium">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{admins.length}</h3>
              <p className="text-sm text-muted-foreground">Total Admins</p>
            </div>
          </div>
        </div>

        <div className="card-premium">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {admins.filter(a => a.adminRole === 'super-admin').length}
              </h3>
              <p className="text-sm text-muted-foreground">Super Admins</p>
            </div>
          </div>
        </div>

        <div className="card-premium">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {admins.filter(a => a.adminRole !== 'super-admin').length}
              </h3>
              <p className="text-sm text-muted-foreground">Regular Admins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Admins List */}
      <div className="card-premium mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Current Admins
        </h2>

        <div className="space-y-4">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {admin.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-lg">{admin.name}</p>
                    {admin.adminRole === 'super-admin' ? (
                      <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Super Admin
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-800">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <p>📧 {admin.email || 'No email'}</p>
                    <p>📱 {admin.phone}</p>
                    <p>📅 Joined {formatTimestamp(admin.joinDate)}</p>
                  </div>
                </div>
              </div>

              <div>
                {admin.adminRole === 'super-admin' ? (
                  <div className="flex items-center gap-2 text-purple-600">
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">Protected</span>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoteFromAdmin(admin.id, admin.name, admin.adminRole || undefined)}
                    disabled={processing === admin.id}
                    className="text-red-600 hover:text-red-700"
                  >
                    {processing === admin.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <UserMinus className="w-4 h-4 mr-2" />
                    )}
                    Remove Admin
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card-premium max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <UserPlus className="w-6 h-6" />
                Add New Admin
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users by name, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>
            </div>

            {/* User List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredNonAdmins.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? 'No users found matching your search.' : 'All users are already admins.'}
                  </p>
                </div>
              ) : (
                filteredNonAdmins.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <div className="flex gap-3 text-sm text-muted-foreground">
                          <span>📱 {user.phone}</span>
                          <span>📧 {user.email || 'No email'}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        handlePromoteToAdmin(user.id, user.name);
                        setShowAddModal(false);
                        setSearchTerm('');
                      }}
                      disabled={processing === user.id}
                      className="flex items-center gap-2"
                    >
                      {processing === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Make Admin
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="card-premium bg-purple-50 border-purple-200">
        <div className="flex gap-4">
          <Crown className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-purple-900 mb-2">Super Admin Protection</h3>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>✓ Super Admins ({SUPER_ADMIN_PHONES.join(', ')}) cannot be removed</li>
              <li>✓ Only Super Admins can add or remove other admins</li>
              <li>✓ Regular admins have full access but cannot manage other admins</li>
              <li>✓ Admins can be added or removed at any time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
