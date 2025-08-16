
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getUserOrders, Order } from '@/services/orderService';
import { toast } from '@/components/ui/use-toast';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching orders for user:', user.id);
        const userOrders = await getUserOrders(user.id);
        console.log('Fetched orders:', userOrders);
        setOrders(userOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Error",
          description: "Failed to load your orders. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500';
      case 'shipped':
        return 'bg-blue-500';
      case 'processing':
        return 'bg-orange-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore Timestamp
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    
    // Handle regular Date or string
    return new Date(timestamp).toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="font-playfair text-2xl font-bold mb-2">Please sign in</h2>
          <p className="text-muted-foreground mb-6">
            You need to sign in to view your orders.
          </p>
          <Link to="/auth">
            <Button className="btn-primary">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <h1 className="font-playfair text-3xl font-bold mb-8">Your Orders</h1>
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading your orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="font-playfair text-3xl font-bold mb-8">Your Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="font-playfair text-2xl font-bold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-6">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <Link to="/products">
            <Button className="btn-primary">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card-premium">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="font-semibold text-lg">#{order.id.slice(-8).toUpperCase()}</h3>
                    <Badge className={`${getStatusColor(order.orderStatus)} text-white`}>
                      {order.orderStatus.toUpperCase()}
                    </Badge>
                    {order.paymentStatus === 'paid' && (
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        PAID
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-muted-foreground space-y-1">
                    <p>Order Date: {formatDate(order.createdAt)}</p>
                    <p>{order.items.length} items • ₹{order.totalAmount.toLocaleString()}</p>
                    {order.trackingId && (
                      <p className="text-blue-600">Tracking ID: {order.trackingId}</p>
                    )}
                    {order.courierName && (
                      <p>Courier: {order.courierName}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 mt-4 md:mt-0">
                  <Link to={`/track/${order.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
