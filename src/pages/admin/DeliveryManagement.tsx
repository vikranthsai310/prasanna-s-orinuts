import { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search,
  Filter,
  RefreshCw,
  Loader2,
  MapPin,
  User,
  Phone,
  Calendar,
  IndianRupee,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  getPaidOrders,
  assignDeliveryMethod,
  createDelhiveryShipmentForOrder,
  Order
} from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';

const DeliveryManagement = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const fetchedOrders = await getPaidOrders();
      
      // Filter by delivery status if needed
      let filteredOrders = fetchedOrders;
      if (statusFilter !== 'all') {
        filteredOrders = fetchedOrders.filter(order => {
          if (statusFilter === 'pending') {
            return !order.deliveryMethod || order.deliveryMethod === 'pending';
          }
          return order.deliveryMethod === statusFilter;
        });
      }
      
      setOrders(filteredOrders);
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
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.phone?.includes(searchTerm);
    return matchesSearch;
  });

  const handleOpenDeliveryModal = (order: Order) => {
    setSelectedOrder(order);
    setIsDeliveryModalOpen(true);
  };

  const handleSelfDeliver = async () => {
    if (!selectedOrder) return;

    setIsProcessing(true);
    try {
      await assignDeliveryMethod(selectedOrder.id, 'self');
      
      toast({
        title: "Success",
        description: "Order assigned for self-delivery. You can now process and deliver it yourself.",
      });
      
      setIsDeliveryModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error assigning self-delivery:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign delivery method",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelhiveryDeliver = async () => {
    if (!selectedOrder) return;

    setIsProcessing(true);
    try {
      // Create Delhivery shipment and assign delivery method
      const result = await createDelhiveryShipmentForOrder(selectedOrder.id);
      
      toast({
        title: "Success",
        description: `Delhivery shipment created successfully! Waybill: ${result.waybill}`,
      });
      
      setIsDeliveryModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error creating Delhivery shipment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create Delhivery shipment",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getDeliveryStatusBadge = (order: Order) => {
    if (!order.deliveryMethod || order.deliveryMethod === 'pending') {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending Assignment</Badge>;
    }
    
    if (order.deliveryMethod === 'self') {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Self Delivery</Badge>;
    }
    
    if (order.deliveryMethod === 'delhivery') {
      if (order.delhiveryWaybill) {
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Delhivery Assigned</Badge>;
      }
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Processing Delhivery</Badge>;
    }

    return <Badge variant="outline">Unknown</Badge>;
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500';
      case 'shipped':
        return 'bg-blue-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'pending':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Management</h1>
        <p className="text-gray-600">Manage order deliveries - Self-deliver or assign to Delhivery</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by Order ID, Customer Name, or Phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-64">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by delivery status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending Assignment</SelectItem>
                <SelectItem value="self">Self Delivery</SelectItem>
                <SelectItem value="delhivery">Delhivery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            onClick={fetchOrders}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium">Pending Assignment</p>
              <p className="text-2xl font-bold text-yellow-900">
                {orders.filter(o => !o.deliveryMethod || o.deliveryMethod === 'pending').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Self Delivery</p>
              <p className="text-2xl font-bold text-blue-900">
                {orders.filter(o => o.deliveryMethod === 'self').length}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Delhivery Assigned</p>
              <p className="text-2xl font-bold text-green-900">
                {orders.filter(o => o.deliveryMethod === 'delhivery').length}
              </p>
            </div>
            <Truck className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-purple-900">
                {orders.length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-600">No orders found</p>
          <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">#{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {order.shippingAddress.name}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <Phone className="w-3 h-3 mr-1" />
                          {order.shippingAddress.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <p className="flex items-start">
                          <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                          <span className="max-w-xs">
                            {order.shippingAddress.street}<br />
                            {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                            <span className="font-medium">{order.shippingAddress.pincode}</span>
                          </span>
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <IndianRupee className="w-4 h-4 mr-1" />
                        {order.totalAmount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getOrderStatusColor(order.orderStatus)}`}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getDeliveryStatusBadge(order)}
                      {order.delhiveryWaybill && (
                        <p className="text-xs text-gray-500 mt-1">
                          AWB: {order.delhiveryWaybill}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {(!order.deliveryMethod || order.deliveryMethod === 'pending') && (
                        <Button
                          size="sm"
                          onClick={() => handleOpenDeliveryModal(order)}
                          className="bg-amber-600 hover:bg-amber-700"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Assign Delivery
                        </Button>
                      )}
                      {order.deliveryMethod === 'delhivery' && order.delhiveryWaybill && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://www.delhivery.com/track/package/${order.delhiveryWaybill}`, '_blank')}
                        >
                          <Truck className="w-4 h-4 mr-1" />
                          Track
                        </Button>
                      )}
                      {order.deliveryMethod === 'self' && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          Ready for Pickup
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delivery Assignment Modal */}
      <Dialog open={isDeliveryModalOpen} onOpenChange={setIsDeliveryModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Choose Delivery Method</DialogTitle>
            <DialogDescription>
              Select how you want to deliver this order
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Order Summary</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">Order ID:</span> <span className="font-medium">#{selectedOrder.id.slice(0, 8)}</span></p>
                  <p><span className="text-gray-600">Customer:</span> <span className="font-medium">{selectedOrder.shippingAddress.name}</span></p>
                  <p><span className="text-gray-600">Amount:</span> <span className="font-medium">₹{selectedOrder.totalAmount.toLocaleString()}</span></p>
                  <p><span className="text-gray-600">Items:</span> <span className="font-medium">{selectedOrder.items.length} item(s)</span></p>
                </div>
              </div>

              {/* Delivery Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Self Delivery Option */}
                <div className="border-2 border-blue-200 rounded-lg p-4 hover:border-blue-400 transition-colors cursor-pointer group">
                  <div className="flex flex-col items-center text-center">
                    <Package className="w-12 h-12 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Self Delivery</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Deliver the order yourself or through your own logistics
                    </p>
                    <Button
                      onClick={handleSelfDeliver}
                      disabled={isProcessing}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Package className="w-4 h-4 mr-2" />
                          I'll Deliver
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Delhivery Option */}
                <div className="border-2 border-green-200 rounded-lg p-4 hover:border-green-400 transition-colors cursor-pointer group">
                  <div className="flex flex-col items-center text-center">
                    <Truck className="w-12 h-12 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Delhivery</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Automated pickup and delivery through Delhivery logistics
                    </p>
                    <Button
                      onClick={handleDelhiveryDeliver}
                      disabled={isProcessing}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Shipment...
                        </>
                      ) : (
                        <>
                          <Truck className="w-4 h-4 mr-2" />
                          Use Delhivery
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  <strong>Note:</strong> Once assigned, the delivery method cannot be changed. For Delhivery, 
                  a shipment will be automatically created and pickup will be scheduled from your warehouse.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeliveryModalOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryManagement;
