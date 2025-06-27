
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OrderConfirmation = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        
        <h1 className="font-playfair text-3xl font-bold mb-4">
          Order Confirmed!
        </h1>
        
        <p className="text-muted-foreground text-lg mb-8">
          Thank you for your order. We've received your payment and will start processing your order shortly.
        </p>
        
        <div className="card-premium text-left mb-8">
          <h2 className="font-semibold text-xl mb-4">Order Details</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Number:</span>
              <span className="font-semibold">{id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Delivery:</span>
              <span>3-5 business days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Status:</span>
              <span className="text-green-600 font-semibold">Paid</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="flex items-center space-x-3 p-4 bg-accent/20 rounded-lg">
            <Package className="w-8 h-8 text-secondary" />
            <div className="text-left">
              <h3 className="font-semibold">Processing</h3>
              <p className="text-sm text-muted-foreground">We're preparing your order</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-accent/20 rounded-lg">
            <Truck className="w-8 h-8 text-secondary" />
            <div className="text-left">
              <h3 className="font-semibold">Shipping</h3>
              <p className="text-sm text-muted-foreground">Free shipping included</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <Link to={`/track/${id}`}>
            <Button className="btn-primary mr-4">
              Track Your Order
            </Button>
          </Link>
          
          <Link to="/products">
            <Button variant="outline">
              Continue Shopping
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 p-4 bg-accent/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            We'll send you email updates about your order status. 
            If you have any questions, feel free to <Link to="/contact" className="text-secondary hover:underline">contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
