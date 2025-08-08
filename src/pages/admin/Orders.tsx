
import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { 
  getAllOrders, 
  getOrdersByStatus, 
  updateOrderStatus, 
  addTrackingInfo,
  Order
} from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';

const AdminOrders = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      let fetchedOrders: Order[];
      
      if (statusFilter === 'all') {
        fetchedOrders = await getAllOrders();
      } else {
        fetchedOrders = await getOrdersByStatus(statusFilter as Order['orderStatus']);
      }
      
      setOrders(fetchedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.shippingAddress.name && order.shippingAddress.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

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

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus as Order['orderStatus']);
      
      // If status is shipped and there's no tracking ID, open the tracking modal
      if (newStatus === 'shipped') {
        const order = orders.find(o => o.id === orderId);
        if (order && !order.trackingId) {
          setSelectedOrder(order);
          setIsTrackingModalOpen(true);
          return;
        }
      }
      
      toast({
        title: "Status Updated",
        description: `Order status updated to ${newStatus}`
      });
      
      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const handleAddTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrder || !trackingId.trim()) return;
    
    try {
      await addTrackingInfo(selectedOrder.id, trackingId);
      toast({
        title: "Tracking Added",
        description: "Tracking information added successfully"
      });
      setIsTrackingModalOpen(false);
      setTrackingId('');
      fetchOrders();
    } catch (error) {
      console.error('Error adding tracking info:', error);
      toast({
        title: "Error",
        description: "Failed to add tracking information",
        variant: "destructive"
      });
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <h1 className="font-playfair text-3xl font-bold mb-8">Manage Orders</h1>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search by order ID or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Orders Table */}
      <div className="card-premium overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-secondary" />
            <span className="ml-2">Loading orders...</span>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4">Order ID</th>
                <th className="text-left py-3 px-4">Customer</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Items</th>
                <th className="text-left py-3 px-4">Total</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm">{order.id.slice(0, 8)}...</span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{order.shippingAddress.name}</p>
                        <p className="text-sm text-muted-foreground">{order.userId}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">{formatDate(order.createdAt)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span>{order.items.length} items</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold">₹{order.totalAmount.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Select 
                        value={order.orderStatus} 
                        onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <Badge className={`${getStatusColor(order.orderStatus)} text-white border-0`}>
                            {order.orderStatus.toUpperCase()}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => openOrderDetails(order)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No orders found. {searchTerm && 'Try a different search term.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="font-medium font-mono">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={`${getStatusColor(selectedOrder.orderStatus)} text-white border-0`}>
                    {selectedOrder.orderStatus.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment</p>
                  <Badge variant={selectedOrder.paymentStatus === 'paid' ? 'default' : 'outline'}>
                    {selectedOrder.paymentStatus.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              {/* Tracking Info */}
              {selectedOrder.trackingId && (
                <div>
                  <p className="text-sm text-muted-foreground">Tracking ID</p>
                  <p className="font-medium">{selectedOrder.trackingId}</p>
                </div>
              )}
              
              {/* Customer Info */}
              <div>
                <h3 className="font-medium mb-2">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-accent/10 p-4 rounded-md">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p>{selectedOrder.shippingAddress.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p>{selectedOrder.shippingAddress.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Shipping Address</p>
                    <p>
                      {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div>
                <h3 className="font-medium mb-2">Order Items</h3>
                <div className="bg-accent/10 rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-accent/20">
                      <tr>
                        <th className="text-left py-2 px-4">Item</th>
                        <th className="text-left py-2 px-4">Weight</th>
                        <th className="text-right py-2 px-4">Price</th>
                        <th className="text-right py-2 px-4">Qty</th>
                        <th className="text-right py-2 px-4">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index} className="border-t border-border">
                          <td className="py-2 px-4">
                            <div className="flex items-center space-x-2">
                              <img 
                                src={item.image || '/placeholder.svg'} 
                                alt={item.name} 
                                className="w-8 h-8 object-cover rounded-md"
                              />
                              <span>{item.name}</span>
                            </div>
                          </td>
                          <td className="py-2 px-4">{item.weight}</td>
                          <td className="py-2 px-4 text-right">₹{item.price}</td>
                          <td className="py-2 px-4 text-right">{item.quantity || 1}</td>
                          <td className="py-2 px-4 text-right">₹{(item.price * (item.quantity || 1))}</td>
                        </tr>
                      ))}
                      <tr className="border-t border-t-2 border-border">
                        <td colSpan={4} className="py-2 px-4 text-right font-medium">Total</td>
                        <td className="py-2 px-4 text-right font-bold">₹{selectedOrder.totalAmount}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <DialogFooter>
                {selectedOrder.orderStatus === 'shipped' && !selectedOrder.trackingId && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      setIsTrackingModalOpen(true);
                    }}
                  >
                    Add Tracking
                  </Button>
                )}
                <Button variant="outline" className="ml-2">
                  <FileText className="w-4 h-4 mr-2" />
                  Print Invoice
                </Button>
                <DialogClose asChild>
                  <Button>Close</Button>
                </DialogClose>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Tracking Modal */}
      <Dialog open={isTrackingModalOpen} onOpenChange={setIsTrackingModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tracking Information</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddTracking} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tracking ID</label>
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="input-field w-full"
                placeholder="Enter tracking number"
                required
              />
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Tracking Info</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
