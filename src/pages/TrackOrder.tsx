
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TrackOrder = () => {
  const { id } = useParams();
  
  // Mock tracking data
  const trackingSteps = [
    {
      status: 'pending',
      title: 'Order Placed',
      description: 'Your order has been received and is being processed',
      timestamp: '2024-01-25 10:30 AM',
      completed: true
    },
    {
      status: 'packed',
      title: 'Order Packed',
      description: 'Your order has been packed and ready for shipping',
      timestamp: '2024-01-25 2:15 PM',
      completed: true
    },
    {
      status: 'shipped',
      title: 'Order Shipped',
      description: 'Your order is on the way',
      timestamp: '2024-01-26 9:00 AM',
      completed: true
    },
    {
      status: 'delivered',
      title: 'Order Delivered',
      description: 'Your order has been delivered successfully',
      timestamp: '',
      completed: false
    }
  ];

  const getStepIcon = (status: string, completed: boolean) => {
    if (completed) {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
    
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-muted-foreground" />;
      case 'packed':
        return <Package className="w-6 h-6 text-muted-foreground" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-muted-foreground" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-muted-foreground" />;
      default:
        return <Clock className="w-6 h-6 text-muted-foreground" />;
    }
  };

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
            <h2 className="font-semibold text-xl mb-4">Order {id}</h2>
            
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
                      <p className="text-muted-foreground text-xs mt-2">{step.timestamp}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card-premium">
            <h3 className="font-semibold text-lg mb-4">Shipping Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Courier:</span>
                <span>BlueDart Express</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tracking ID:</span>
                <span className="font-mono">BD123456789IN</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected Delivery:</span>
                <span>Jan 28, 2024</span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full mt-4">
              Track on Courier Website
            </Button>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="card-premium">
            <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date:</span>
                <span>Jan 25, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items:</span>
                <span>4 items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>₹1,599</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping:</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-secondary">₹1,599</span>
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
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
