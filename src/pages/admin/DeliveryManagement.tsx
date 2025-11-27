import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Package, CheckCircle, Clock, AlertCircle, MapPin, Phone, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createShiprocketOrder, trackShipment } from '@/services/shippingService';

interface Order {
  id: string;
  userId: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    weight: string;
  }>;
  totalAmount: number;
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  deliveryMethod?: 'self' | 'shiprocket';
  shiprocketOrderId?: number;
  shiprocketShipmentId?: number;
  shiprocketAwbCode?: string;
  trackingUrl?: string;
  createdAt: any;
  updatedAt: any;
}

const DeliveryManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'shipped'>('pending');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersRef = collection(db, 'orders');
      
      let q;
      if (filter === 'all') {
        q = query(
          ordersRef,
          where('paymentStatus', '==', 'paid'),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          ordersRef,
          where('paymentStatus', '==', 'paid'),
          where('orderStatus', '==', filter),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];

      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelfDelivery = async (orderId: string) => {
    try {
      setProcessingOrder(orderId);
      
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        deliveryMethod: 'self',
        orderStatus: 'processing',
        updatedAt: Timestamp.now()
      });

      toast({
        title: 'Success',
        description: 'Order marked for self delivery',
      });

      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update delivery method',
        variant: 'destructive'
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleShiprocketShipment = async (order: Order) => {
    try {
      setProcessingOrder(order.id);

      console.log('🚀 Creating Shiprocket shipment for order:', order.id);

      // Create Shiprocket order
      const shiprocketResponse = await createShiprocketOrder(order);

      console.log('✅ Shiprocket response:', shiprocketResponse);

      // Update order in database
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        deliveryMethod: 'shiprocket',
        orderStatus: 'processing',
        shiprocketOrderId: shiprocketResponse.order_id || 0,
        shiprocketShipmentId: shiprocketResponse.shipment_id || 0,
        shiprocketAwbCode: shiprocketResponse.awb_code || '',
        updatedAt: Timestamp.now()
      });

      toast({
        title: 'Success',
        description: 'Shiprocket order created successfully!',
      });

      fetchOrders();
    } catch (error: any) {
      console.error('❌ Error creating Shiprocket shipment:', error);
      
      let errorMessage = error.message || 'Failed to create Shiprocket shipment';
      
      // Provide specific guidance for common errors
      if (error.message?.includes('credentials are not configured')) {
        errorMessage = '⚠️ Shiprocket credentials are missing. Please configure VITE_SHIPROCKET_EMAIL and VITE_SHIPROCKET_PASSWORD in your environment variables.';
      } else if (error.message?.includes('Authentication failed') || error.message?.includes('Unauthorized')) {
        errorMessage = '⚠️ Shiprocket authentication failed. Please check your credentials.';
      } else if (error.message?.includes('channel_id')) {
        errorMessage = '⚠️ Shiprocket Channel ID is missing. Please set VITE_SHIPROCKET_CHANNEL_ID.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
        duration: 10000,
      });
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleTrackShipment = async (awbCode: string) => {
    try {
      const tracking = await trackShipment(awbCode);
      
      toast({
        title: 'Tracking Information',
        description: `Status: ${tracking.tracking_data?.track_status || 'N/A'}\nLocation: ${tracking.tracking_data?.current_status || 'N/A'}`,
      });
    } catch (error) {
      console.error('Error tracking shipment:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tracking information',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Management</h1>
        <p className="text-gray-600">Manage order deliveries and schedule pickups</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['pending', 'processing', 'shipped', 'all'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            onClick={() => setFilter(status as any)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.slice(-8).toUpperCase()}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus.toUpperCase()}
                    </span>
                    {order.deliveryMethod && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-800">
                        {order.deliveryMethod === 'self' ? '🚗 Self Delivery' : '📦 Shiprocket'}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Info */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Customer Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {order.shippingAddress.name}</p>
                      <p className="flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {order.shippingAddress.phone}
                      </p>
                      <p className="flex items-start">
                        <MapPin className="w-3 h-3 mr-1 mt-1 flex-shrink-0" />
                        <span>
                          {order.shippingAddress.street}, {order.shippingAddress.city},<br />
                          {order.shippingAddress.state} - {order.shippingAddress.pincode}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      Order Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Items:</span> {order.items.length}</p>
                      <p><span className="font-medium">Amount:</span> ₹{order.totalAmount}</p>
                      <p><span className="font-medium">Payment:</span> {order.paymentMethod.toUpperCase()}</p>
                      {order.shiprocketAwbCode && (
                        <>
                          <p><span className="font-medium">AWB Code:</span> {order.shiprocketAwbCode}</p>
                          {order.trackingUrl && (
                            <a 
                              href={order.trackingUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline inline-flex items-center"
                            >
                              Track Shipment →
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="mt-4 pt-4 border-t">
                  <h5 className="font-medium text-sm mb-2">Items:</h5>
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-sm text-gray-600 flex justify-between">
                        <span>{item.name} ({item.weight})</span>
                        <span>x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                {order.orderStatus === 'pending' && !order.deliveryMethod && (
                  <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => handleSelfDelivery(order.id)}
                      disabled={processingOrder === order.id}
                      variant="outline"
                      className="flex-1"
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Self Delivery
                    </Button>
                    <Button
                      onClick={() => handleShiprocketShipment(order)}
                      disabled={processingOrder === order.id}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {processingOrder === order.id ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Package className="w-4 h-4 mr-2" />
                          Create Shiprocket Shipment
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {order.shiprocketAwbCode && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      onClick={() => handleTrackShipment(order.shiprocketAwbCode!)}
                      variant="outline"
                      size="sm"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Check Status
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryManagement;
