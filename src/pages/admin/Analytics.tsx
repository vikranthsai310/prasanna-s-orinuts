/**
 * Admin Analytics Page
 * Comprehensive analytics and reports dashboard
 */

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllOrders, Order } from '@/services/orderService';
import { getAllUsers } from '@/services/userService';
import { getAllProducts } from '@/services/productService';
import { toast } from '@/components/ui/use-toast';

interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  avgOrderValue: number;
  conversionRate: number;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  ordersByStatus: Record<string, number>;
}

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [orders, users, products] = await Promise.all([
        getAllOrders(),
        getAllUsers(),
        getAllProducts(),
      ]);

      const now = new Date();
      const filterDate = getFilterDate(dateRange);
      
      // Filter orders by date range
      const filteredOrders = orders.filter((order) => {
        const orderDate = order.createdAt.toDate();
        return dateRange === 'all' || orderDate >= filterDate;
      });

      // Calculate analytics
      const paidOrders = filteredOrders.filter((o) => o.paymentStatus === 'paid');
      const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

      // Calculate growth (compare with previous period)
      const previousPeriodOrders = getPreviousPeriodOrders(orders, dateRange);
      const previousRevenue = previousPeriodOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const revenueGrowth = previousRevenue > 0 
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
        : 0;
      const ordersGrowth = previousPeriodOrders.length > 0
        ? ((paidOrders.length - previousPeriodOrders.length) / previousPeriodOrders.length) * 100
        : 0;

      // Top products
      const productSales: Record<string, { sales: number; revenue: number; name: string }> = {};
      paidOrders.forEach((order) => {
        order.items.forEach((item) => {
          if (!productSales[item.id]) {
            productSales[item.id] = { sales: 0, revenue: 0, name: item.name };
          }
          productSales[item.id].sales += item.quantity;
          productSales[item.id].revenue += item.price * item.quantity;
        });
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Revenue by month
      const monthlyRevenue: Record<string, number> = {};
      paidOrders.forEach((order) => {
        const month = order.createdAt.toDate().toLocaleDateString('en-US', { 
          month: 'short',
          year: 'numeric' 
        });
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + order.totalAmount;
      });

      const revenueByMonth = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
        month,
        revenue,
      }));

      // Orders by status
      const ordersByStatus: Record<string, number> = {};
      filteredOrders.forEach((order) => {
        ordersByStatus[order.orderStatus] = (ordersByStatus[order.orderStatus] || 0) + 1;
      });

      setAnalytics({
        totalRevenue,
        totalOrders: paidOrders.length,
        totalCustomers: users.length,
        totalProducts: products.length,
        revenueGrowth,
        ordersGrowth,
        avgOrderValue,
        conversionRate: users.length > 0 ? (paidOrders.length / users.length) * 100 : 0,
        topProducts,
        revenueByMonth,
        ordersByStatus,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilterDate = (range: string): Date => {
    const now = new Date();
    switch (range) {
      case '7d':
        return new Date(now.setDate(now.getDate() - 7));
      case '30d':
        return new Date(now.setDate(now.getDate() - 30));
      case '90d':
        return new Date(now.setDate(now.getDate() - 90));
      default:
        return new Date(0);
    }
  };

  const getPreviousPeriodOrders = (orders: Order[], range: string): Order[] => {
    const now = new Date();
    let startDate: Date, endDate: Date;

    switch (range) {
      case '7d':
        startDate = new Date(now.setDate(now.getDate() - 14));
        endDate = new Date(now.setDate(now.getDate() + 7));
        break;
      case '30d':
        startDate = new Date(now.setDate(now.getDate() - 60));
        endDate = new Date(now.setDate(now.getDate() + 30));
        break;
      case '90d':
        startDate = new Date(now.setDate(now.getDate() - 180));
        endDate = new Date(now.setDate(now.getDate() + 90));
        break;
      default:
        return [];
    }

    return orders.filter((order) => {
      const orderDate = order.createdAt.toDate();
      return orderDate >= startDate && orderDate < endDate && order.paymentStatus === 'paid';
    });
  };

  const exportData = () => {
    toast({
      title: 'Export Started',
      description: 'Your analytics report is being generated...',
    });
    // TODO: Implement CSV export
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!analytics) {
    return <div className="container mx-auto px-4 py-8">No data available</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-playfair text-3xl font-bold mb-2">Analytics & Reports</h1>
          <p className="text-muted-foreground">Comprehensive business insights and metrics</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Date Range Selector */}
          <div className="flex space-x-2">
            {['7d', '30d', '90d', 'all'].map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange(range as any)}
              >
                {range === '7d' && 'Last 7 Days'}
                {range === '30d' && 'Last 30 Days'}
                {range === '90d' && 'Last 90 Days'}
                {range === 'all' && 'All Time'}
              </Button>
            ))}
          </div>
          
          <Button onClick={exportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            {analytics.revenueGrowth >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
          </div>
          <h3 className="text-2xl font-bold mb-1">₹{analytics.totalRevenue.toLocaleString()}</h3>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className={`text-sm mt-2 ${analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {analytics.revenueGrowth >= 0 ? '+' : ''}{analytics.revenueGrowth.toFixed(1)}% vs prev period
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            {analytics.ordersGrowth >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
          </div>
          <h3 className="text-2xl font-bold mb-1">{analytics.totalOrders}</h3>
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className={`text-sm mt-2 ${analytics.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {analytics.ordersGrowth >= 0 ? '+' : ''}{analytics.ordersGrowth.toFixed(1)}% vs prev period
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1">₹{Math.round(analytics.avgOrderValue).toLocaleString()}</h3>
          <p className="text-sm text-muted-foreground">Avg Order Value</p>
          <p className="text-sm mt-2 text-muted-foreground">Per transaction</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-1">{analytics.totalCustomers}</h3>
          <p className="text-sm text-muted-foreground">Total Customers</p>
          <p className="text-sm mt-2 text-muted-foreground">
            {analytics.conversionRate.toFixed(1)}% conversion rate
          </p>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="orders">Order Status</TabsTrigger>
        </TabsList>

        {/* Revenue Trends */}
        <TabsContent value="revenue">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">Revenue by Month</h3>
                <p className="text-sm text-muted-foreground">Monthly revenue breakdown</p>
              </div>
              <BarChart3 className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {analytics.revenueByMonth.map((item) => (
                <div key={item.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.month}</span>
                    <span className="font-bold">₹{item.revenue.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-secondary h-2 rounded-full"
                      style={{
                        width: `${(item.revenue / Math.max(...analytics.revenueByMonth.map((r) => r.revenue))) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Top Products */}
        <TabsContent value="products">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">Best Selling Products</h3>
                <p className="text-sm text-muted-foreground">Top 10 products by revenue</p>
              </div>
              <Package className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center space-x-4 pb-4 border-b last:border-0">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-white">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sales} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Order Status Distribution */}
        <TabsContent value="orders">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">Orders by Status</h3>
                <p className="text-sm text-muted-foreground">Distribution of order statuses</p>
              </div>
              <PieChart className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {Object.entries(analytics.ordersByStatus).map(([status, count]) => {
                const percentage = (count / analytics.totalOrders) * 100;
                const colors: Record<string, string> = {
                  pending: 'bg-yellow-500',
                  confirmed: 'bg-blue-500',
                  processing: 'bg-purple-500',
                  shipped: 'bg-indigo-500',
                  delivered: 'bg-green-500',
                  cancelled: 'bg-red-500',
                };
                
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">{status}</span>
                      <span className="font-bold">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${colors[status] || 'bg-gray-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
