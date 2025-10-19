/**
 * Admin User Details Page
 * View individual user information, order history, and analytics
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Edit,
  Ban,
  CheckSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { getUserById, AdminUser, suspendUser, unsuspendUser } from '@/services/userService';
import { getUserOrders, Order } from '@/services/orderService';

const UserDetails = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [suspending, setSuspending] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const [userData, userOrders] = await Promise.all([
        getUserById(userId),
        getUserOrders(userId),
      ]);
      
      setUser(userData);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const calculateOrderStats = () => {
    const total = orders.length;
    const completed = orders.filter((o) => o.orderStatus === 'delivered').length;
    const pending = orders.filter((o) => ['pending', 'confirmed', 'processing'].includes(o.orderStatus)).length;
    const cancelled = orders.filter((o) => o.orderStatus === 'cancelled').length;
    const avgOrderValue = total > 0 ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / total : 0;
    
    return { total, completed, pending, cancelled, avgOrderValue };
  };

  const handleSuspendToggle = async () => {
    if (!user || !userId) return;
    
    const action = user.isSuspended ? 'unsuspend' : 'suspend';
    const confirmMessage = user.isSuspended 
      ? `Are you sure you want to unsuspend ${user.name}? They will be able to access the website again.`
      : `Are you sure you want to suspend ${user.name}? They will be immediately logged out and blocked from accessing the website.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    setSuspending(true);
    try {
      if (user.isSuspended) {
        await unsuspendUser(userId);
        toast({
          title: 'User Unsuspended',
          description: `${user.name} can now access the website.`,
        });
      } else {
        await suspendUser(userId);
        toast({
          title: 'User Suspended',
          description: `${user.name} has been suspended and logged out.`,
          variant: 'destructive',
        });
      }
      
      // Refresh user data
      await fetchUserData();
    } catch (error) {
      console.error('Error toggling suspend status:', error);
      toast({
        title: 'Error',
        description: `Failed to ${action} user. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setSuspending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
          <Button onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  const stats = calculateOrderStats();

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/users')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Users</span>
        </Button>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit User
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSuspendToggle}
            disabled={suspending}
            className={user?.isSuspended ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}
          >
            {suspending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : user?.isSuspended ? (
              <CheckSquare className="w-4 h-4 mr-2" />
            ) : (
              <Ban className="w-4 h-4 mr-2" />
            )}
            {user?.isSuspended ? 'Unsuspend' : 'Suspend'}
          </Button>
        </div>
      </div>

      {/* User Profile Header */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
              <div className="flex flex-wrap gap-3 text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {(user.createdAt instanceof Date ? user.createdAt : user.createdAt.toDate()).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {user.isAdmin && (
                  <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
                )}
                {user.isSuspended ? (
                  <Badge className="bg-red-100 text-red-800">Suspended</Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <ShoppingBag className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">₹{user.totalSpent.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Order Value</p>
              <p className="text-2xl font-bold">₹{Math.round(stats.avgOrderValue).toLocaleString()}</p>
            </div>
            <Package className="w-8 h-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Order History ({orders.length})</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Order Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-10 h-10 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <CheckSquare className="w-10 h-10 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed Orders</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <XCircle className="w-10 h-10 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.cancelled}</p>
                  <p className="text-sm text-muted-foreground">Cancelled Orders</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.createdAt.toDate().toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{order.totalAmount.toLocaleString()}</p>
                    <Badge className={getOrderStatusColor(order.orderStatus)}>
                      {order.orderStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">All Orders</h3>
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="font-bold text-lg hover:text-secondary"
                      >
                        Order #{order.id.slice(0, 8)}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {order.createdAt.toDate().toLocaleString()}
                      </p>
                    </div>
                    <Badge className={getOrderStatusColor(order.orderStatus)}>
                      {order.orderStatus}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Items</p>
                      <p className="font-semibold">{order.items.length} products</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Amount</p>
                      <p className="font-semibold">₹{order.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment</p>
                      <p className="font-semibold capitalize">{order.paymentMethod}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground">Delivery Address</p>
                    <p className="text-sm">{order.shippingAddress.street}, {order.shippingAddress.city}</p>
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No orders yet</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Saved Addresses</h3>
            <div className="space-y-4">
              {user.addresses && user.addresses.length > 0 ? (
                user.addresses.map((address, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-secondary mt-1" />
                      <div>
                        <p className="font-semibold">{address.name}</p>
                        <p className="text-sm">{address.phone}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {address.address}, {address.city}, {address.state} - {address.pincode}
                        </p>
                        {address.isDefault && (
                          <Badge className="mt-2 bg-blue-100 text-blue-800">Default</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No saved addresses</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDetails;
