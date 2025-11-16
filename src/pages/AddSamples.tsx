import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/components/ui/use-toast';
import { Check, Plus, RefreshCw, Loader2, Package } from 'lucide-react';
import { sampleStorage } from '@/utils/sampleStorage';
import { getActiveSamples, SampleProduct } from '@/services/sampleService';

const AddSamples = () => {
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const [selectedSamples, setSelectedSamples] = useState<SampleProduct[]>([]);
  const [sampleProducts, setSampleProducts] = useState<SampleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchSamples();
  }, []);

  const fetchSamples = async () => {
    setLoading(true);
    try {
      // Fetch active samples from Firestore
      const activeSamples = await getActiveSamples();
      
      // Filter samples with stock > 0
      const availableSamples = activeSamples.filter(sample => sample.stock > 0);
      
      setSampleProducts(availableSamples);
      
      if (availableSamples.length === 0) {
        toast({
          title: "No samples available",
          description: "Sorry, no samples are currently available. Please check back later.",
          variant: "destructive"
        });
      }
      
      // Load existing selected samples from localStorage
      const existingSamples = sampleStorage.getSelectedSamples();
      if (existingSamples.length > 0) {
        const existingProducts = existingSamples
          .map(sample => availableSamples.find(p => p.id === sample.id))
          .filter(Boolean) as SampleProduct[];
        
        setSelectedSamples(existingProducts);
        
        if (existingProducts.length === 2) {
          toast({
            title: "Existing samples loaded",
            description: "Your previously selected samples are shown. You can change them if needed.",
            variant: "default"
          });
        }
      }
    } catch (error) {
      console.error('Error fetching samples:', error);
      toast({
        title: "Error loading samples",
        description: "Failed to load sample products. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Check if user came from cart (has items)
    if (items.length === 0 && !loading) {
      toast({
        title: "Cart is empty",
        description: "Please add some products to your cart first.",
        variant: "destructive"
      });
      navigate('/products');
      return;
    }
  }, [items, navigate, loading]);
  
  const handleSampleSelect = (sample: SampleProduct) => {
    // Check stock availability
    if (sample.stock <= 0) {
      toast({
        title: "Out of stock",
        description: "This sample is currently out of stock.",
        variant: "destructive"
      });
      return;
    }

    if (selectedSamples.some(s => s.id === sample.id)) {
      // Remove sample if already selected
      setSelectedSamples(prev => prev.filter(s => s.id !== sample.id));
    } else if (selectedSamples.length < sample.maxQuantity) {
      // Add sample if less than maxQuantity selected
      setSelectedSamples(prev => [...prev, sample]);
    } else {
      // Show error if trying to select more than allowed
      toast({
        title: "Maximum samples reached",
        description: `You can only select ${sample.maxQuantity} sample(s).`,
        variant: "destructive"
      });
    }
  };
  
  const handleProceedToCheckout = () => {
    if (selectedSamples.length === 0) {
      toast({
        title: "Please select samples",
        description: "Please select at least one sample to proceed.",
        variant: "destructive"
      });
      return;
    }

    // Verify stock availability
    const outOfStockSamples = selectedSamples.filter(s => s.stock <= 0);
    if (outOfStockSamples.length > 0) {
      toast({
        title: "Some samples are out of stock",
        description: "Please remove out of stock samples and try again.",
        variant: "destructive"
      });
      return;
    }
    
    // Save selected samples to localStorage
    sampleStorage.saveSelectedSamples(selectedSamples);
    
    // Add selected samples to cart (as free samples)
    selectedSamples.forEach(sample => {
      // Check if sample is not already in cart to avoid duplicates
      const existingCartItem = items.find(item => 
        item.id === sample.productId && item.name.includes('(Sample)')
      );
      
      if (!existingCartItem) {
        addItem({
          id: sample.productId,
          name: `${sample.productName} (Sample)`,
          price: 0, // Free sample
          weight: 'Sample',
          image: sample.productImage
        }, 1); // quantity as second parameter
      }
    });
    
    toast({
      title: "Samples saved and added!",
      description: `${selectedSamples.length} free sample(s) have been added to your order.`,
      variant: "default"
    });
    
    // Navigate to checkout
    navigate('/checkout');
  };

  const handleClearSamples = () => {
    setSelectedSamples([]);
    sampleStorage.clearSelectedSamples();
    toast({
      title: "Samples cleared",
      description: "Please select 2 new samples.",
      variant: "default"
    });
  };
  
  const isSampleSelected = (productId: string) => {
    return selectedSamples.some(sample => sample.id === productId);
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 animate-spin text-secondary mb-4" />
            <p className="text-muted-foreground">Loading samples...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state
  if (sampleProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="font-playfair text-2xl font-bold mb-2">No Samples Available</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Sorry, there are no samples currently available. Please check back later or contact us for more information.
            </p>
            <Button onClick={() => navigate('/products')} variant="default">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-playfair text-3xl font-bold mb-4">
            Choose Your Free Samples
          </h1>
          <p className="text-muted-foreground text-lg mb-2">
            Select up to {sampleProducts[0]?.maxQuantity || 2} samples to try with your order
          </p>
          <p className="text-sm text-muted-foreground">
            Selected: {selectedSamples.length}/{sampleProducts[0]?.maxQuantity || 2} samples
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {sampleProducts.map((sample) => {
            const isSelected = isSampleSelected(sample.id);
            
            return (
              <div
                key={sample.id}
                className={`card-premium cursor-pointer transition-all duration-200 hover:scale-105 ${
                  isSelected ? 'ring-2 ring-secondary bg-secondary/5' : ''
                } ${sample.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleSampleSelect(sample)}
              >
                <div className="relative bg-accent rounded-lg">
                  <img
                    src={sample.productImage}
                    alt={sample.productName}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    loading="lazy"
                    decoding="async"
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-secondary text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                    FREE SAMPLE
                  </div>
                  {sample.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {sample.stock > 0 && sample.stock < 10 && (
                    <div className="absolute bottom-2 left-2 bg-orange-600 text-white px-2 py-1 rounded text-xs font-medium">
                      Only {sample.stock} left
                    </div>
                  )}
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{sample.productName}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Premium quality sample to try before buying
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <span className="text-xs text-gray-500">FREE</span>
                  </div>
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={isSelected ? "btn-secondary" : ""}
                    disabled={sample.stock <= 0}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Selected
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        Select
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            variant="outline"
            onClick={() => navigate('/cart')}
            className="w-full sm:w-auto"
          >
            Back to Cart
          </Button>
          
          {selectedSamples.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearSamples}
              className="w-full sm:w-auto text-destructive hover:text-destructive"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Clear Samples
            </Button>
          )}
          
          <Button
            onClick={handleProceedToCheckout}
            disabled={selectedSamples.length !== 2}
            className="w-full sm:w-auto btn-primary"
          >
            Proceed to Checkout ({selectedSamples.length}/2 samples selected)
          </Button>
        </div>
        
        {selectedSamples.length > 0 && (
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Selected Samples:</h3>
            <ul className="space-y-1">
              {selectedSamples.map(sample => (
                <li key={sample.id} className="flex items-center">
                  <Check className="w-4 h-4 text-green-600 mr-2" />
                  {sample.productName} (Sample)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddSamples;