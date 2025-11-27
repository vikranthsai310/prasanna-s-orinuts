
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOrderById, Order } from '@/services/orderService';
import { trackShipment } from '@/services/shippingService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface ShiprocketTrackingActivity {
  date: string;
  status: string;
  activity: string;
  location: string;
  sr_status_label?: string;
}

interface ShiprocketTracking {
  awb_code: string;
  courier_name: string;
  current_status: string;
  shipment_status: string;
  shipment_track_activities: ShiprocketTrackingActivity[];
  edd?: string;
}

const TrackOrder = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveTracking, setLiveTracking] = useState<ShiprocketTracking | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching order:', id);
        const orderData = await getOrderById(id);
        
        if (!orderData) {
          toast({
            title: "Order not found",
            description: "The order you're looking for doesn't exist or has been removed.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        // Check if user owns this order
        if (user && orderData.userId !== user.id) {
          toast({
            title: "Access denied",
            description: "You don't have permission to view this order.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        console.log('Fetched order data:', orderData);
        setOrder(orderData);
        
        // Fetch live tracking if Shiprocket AWB code exists
        if (orderData.shiprocketAwbCode) {
          fetchLiveTracking(orderData.shiprocketAwbCode);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast({
          title: "Error",
          description: "Failed to load order details. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, user?.id]);

  const fetchLiveTracking = async (awbCode: string) => {
    try {
      setTrackingLoading(true);
      const trackingData = await trackShipment(awbCode);
      console.log('Live tracking data:', trackingData);
      setLiveTracking(trackingData);
    } catch (error) {
      console.error('Error fetching live tracking:', error);
      // Don't show error toast, just log it
    } finally {
      setTrackingLoading(false);
    }
  };

  const generateTrackingSteps = (order: Order) => {
    const steps = [
      {
        status: 'pending',
        title: 'Order Placed',
        description: 'Your order has been received and is being processed',
        timestamp: order.createdAt,
        completed: true
      }
    ];

    if (order.orderStatus === 'processing' || order.orderStatus === 'shipped' || order.orderStatus === 'delivered') {
      steps.push({
        status: 'processing',
        title: 'Order Processing',
        description: 'Your order is being prepared for shipping',
        timestamp: order.updatedAt,
        completed: true
      });
    }

    if (order.orderStatus === 'shipped' || order.orderStatus === 'delivered') {
      steps.push({
        status: 'shipped',
        title: 'Order Shipped',
        description: order.trackingId ? `Your order is on the way (${order.trackingId})` : 'Your order is on the way',
        timestamp: order.updatedAt,
        completed: true
      });
    }

    steps.push({
      status: 'delivered',
      title: 'Order Delivered',
      description: 'Your order has been delivered successfully',
      timestamp: order.orderStatus === 'delivered' ? order.updatedAt : null,
      completed: order.orderStatus === 'delivered'
    });

    return steps;
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    
    // Handle Firestore Timestamp
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString();
    }
    
    // Handle regular Date or string
    return new Date(timestamp).toLocaleString();
  };

  const getStepIcon = (status: string, completed: boolean) => {
    if (completed) {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
    
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-muted-foreground" />;
      case 'processing':
        return <Package className="w-6 h-6 text-muted-foreground" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-muted-foreground" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-muted-foreground" />;
      default:
        return <Clock className="w-6 h-6 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <Link to="/orders" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Link>
        
        <h1 className="font-playfair text-3xl font-bold mb-8">Track Order</h1>
        
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading order details...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <Link to="/orders" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Link>
        
        <h1 className="font-playfair text-3xl font-bold mb-8">Track Order</h1>
        
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="font-playfair text-2xl font-bold mb-2">Order not found</h2>
          <p className="text-muted-foreground mb-6">
            The order you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/orders">
            <Button className="btn-primary">Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const trackingSteps = generateTrackingSteps(order);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <Link to="/orders" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Orders
      </Link>
      
      <h1 className="font-playfair text-3xl font-bold mb-8">Track Order</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card-premium mb-6">
            <h2 className="font-semibold text-xl mb-4">Order #{order.id.slice(-8).toUpperCase()}</h2>
            
            <div className="space-y-6">
              {trackingSteps.map((step, index) => (
                <div key={step.status} className="flex space-x-4">
                  <div className="flex flex-col items-center">
                    {getStepIcon(step.status, step.completed)}
                    {index < trackingSteps.length - 1 && (
                      <div className={`w-0.5 h-12 mt-2 ${step.completed ? 'bg-green-500' : 'bg-border'}`} />
                    )}
                  </div>
                  
                  <div className="flex-1 pb-6">
                    <h3 className={`font-semibold ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1">{step.description}</p>
                    {step.timestamp && (
                      <p className="text-muted-foreground text-xs mt-2">{formatTimestamp(step.timestamp)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card-premium">
            <h3 className="font-semibold text-lg mb-4 flex items-center justify-between">
              <span>Shipping Details</span>
              {trackingLoading && <Loader2 className="w-4 h-4 animate-spin text-secondary" />}
            </h3>
            
            {/* Live Tracking from Shiprocket */}
            {liveTracking && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Live Tracking</h4>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Current Status:</span>
                    <span className="font-medium text-blue-900">{liveTracking.current_status}</span>
                  </div>
                  {liveTracking.edd && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Expected Delivery:</span>
                      <span className="font-medium text-blue-900">{new Date(liveTracking.edd).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                {/* Live Tracking Activities */}
                {liveTracking.shipment_track_activities && liveTracking.shipment_track_activities.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-medium text-blue-900 mb-2 text-sm">Tracking History</h5>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {liveTracking.shipment_track_activities.map((activity, index) => (
                        <div key={index} className="flex gap-3 text-xs border-l-2 border-blue-300 pl-3 py-1">
                          <div className="flex-1">
                            <p className="font-medium text-blue-900">{activity.activity}</p>
                            {activity.location && (
                              <p className="text-blue-600 mt-0.5">{activity.location}</p>
                            )}
                            <p className="text-blue-500 mt-1">{new Date(activity.date).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-2 text-sm">
              {order.courierName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Courier:</span>
                  <span className="font-medium">{order.courierName}</span>
                </div>
              )}
              {order.shiprocketAwbCode && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AWB Code:</span>
                  <span className="font-mono">{order.shiprocketAwbCode}</span>
                </div>
              )}
              {order.trackingId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tracking ID:</span>
                  <span className="font-mono">{order.trackingId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="capitalize font-medium">{order.orderStatus}</span>
              </div>
            </div>
            
            {order.shiprocketAwbCode && (
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => fetchLiveTracking(order.shiprocketAwbCode!)}
                disabled={trackingLoading}
              >
                {trackingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Refresh Tracking
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="card-premium">
            <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date:</span>
                <span>{formatTimestamp(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items:</span>
                <span>{order.items.length} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status:</span>
                <span className={`capitalize font-medium ${
                  order.paymentStatus === 'paid' ? 'text-green-600' : 
                  order.paymentStatus === 'failed' ? 'text-red-600' : 'text-orange-600'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-secondary">₹{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <Button variant="outline" className="w-full" size="sm">
                Download Invoice
              </Button>
              <Link to="/contact" className="block">
                <Button variant="outline" className="w-full" size="sm">
                  Need Help?
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Order Items */}
          <div className="card-premium mt-6">
            <h3 className="font-semibold text-lg mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 py-2 border-b last:border-b-0">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <p className="text-muted-foreground text-xs">{item.weight} • Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
