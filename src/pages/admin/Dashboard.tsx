
import { useState, useEffect } from 'react';
import { BarChart3, ShoppingBag, Users, TrendingUp, Package, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  getTotalRevenue, 
  getTotalOrders, 
  getTotalUsers, 
  getTotalProducts, 
  getOrdersByDateRange,
  getRecentOrders,
  getLowStockProducts
} from '@/services/analyticsService';
import { useToast } from '@/hooks/use-toast';
import { Order } from '@/services/orderService';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/badge';

const AdminDashboard = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0
  });
  const [orderData, setOrderData] = useState<{ date: string; orders: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      console.log('🚀 Starting dashboard data fetch...');
      
      // Fetch all data in parallel
      const [
        revenue, 
        orders, 
        users, 
        products, 
        ordersByDate,
        recentOrdersData,
        lowStockProductsData
      ] = await Promise.all([
        getTotalRevenue(),
        getTotalOrders(),
        getTotalUsers(),
        getTotalProducts(),
        getOrdersByDateRange(7),
        getRecentOrders(5),
        getLowStockProducts(20)
      ]);

      console.log('📊 Dashboard data fetched:', {
        revenue,
        orders,
        users,
        products
      });

      setStats({
        totalOrders: orders,
        totalRevenue: revenue,
        totalUsers: users,
        totalProducts: products
      });
      
      setOrderData(ordersByDate);
      setRecentOrders(recentOrdersData);
      setLowStockProducts(lowStockProductsData);
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500';
      case 'shipped':
        return 'bg-blue-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'pending':
        return 'bg-orange-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary mr-2" />
        <span>Loading dashboard data...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-playfair text-3xl font-bold mb-2">Admin Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Showing data for paid orders only</span>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Successfully paid orders</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From paid orders only</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Total products in inventory</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Paid Orders Over Time (Last 7 Days)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={orderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#C99700" 
                  strokeWidth={2}
                  dot={{ fill: '#C99700' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Paid Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center space-x-3">
                    <Badge className={`${getStatusColor(order.orderStatus)} w-2 h-2 rounded-full p-0 border-0`} />
                    <div className="flex-1">
                      <p className="text-sm">
                        New order <span className="font-mono">{order.id.slice(0, 8)}...</span>
                        {order.orderStatus === 'pending' && ' received'}
                        {order.orderStatus === 'processing' && ' processing'}
                        {order.orderStatus === 'shipped' && ' shipped'}
                        {order.orderStatus === 'delivered' && ' delivered'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.shippingAddress.name} • ₹{order.totalAmount}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">No recent orders</p>
              )}

              {lowStockProducts.length > 0 && (
                <>
                  <div className="border-t border-border pt-4 mt-4">
                    <h3 className="font-medium text-sm mb-2">Low Stock Alerts</h3>
                  </div>
                  
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center space-x-3">
                      <Badge className="bg-yellow-500 w-2 h-2 rounded-full p-0 border-0" />
                      <div className="flex-1">
                        <p className="text-sm">
                          Low stock alert: {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Only {product.stock} units remaining
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
