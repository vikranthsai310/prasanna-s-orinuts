import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { mockProducts } from '@/data/mockProducts';
import { Product } from '@/types/product';
import { toast } from '@/components/ui/use-toast';
import { Check, Plus, RefreshCw } from 'lucide-react';
import { sampleStorage } from '@/utils/sampleStorage';

const AddSamples = () => {
  const navigate = useNavigate();
  const { addItem, items } = useCart();
  const [selectedSamples, setSelectedSamples] = useState<Product[]>([]);
  
  // Define sample products (first 6 products as samples)
  const sampleProducts = mockProducts.slice(0, 6);
  
  useEffect(() => {
    // Check if user came from cart (has items)
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add some products to your cart first.",
        variant: "destructive"
      });
      navigate('/products');
      return;
    }

    // Load existing selected samples
    const existingSamples = sampleStorage.getSelectedSamples();
    if (existingSamples.length > 0) {
      const existingProducts = existingSamples
        .map(sample => sampleProducts.find(p => p.id === sample.id))
        .filter(Boolean) as Product[];
      
      setSelectedSamples(existingProducts);
      
      if (existingSamples.length === 2) {
        toast({
          title: "Existing samples loaded",
          description: "Your previously selected samples are shown. You can change them if needed.",
          variant: "default"
        });
      }
    }
  }, [items, navigate, sampleProducts]);
  
  const handleSampleSelect = (product: Product) => {
    if (selectedSamples.some(sample => sample.id === product.id)) {
      // Remove sample if already selected
      setSelectedSamples(prev => prev.filter(sample => sample.id !== product.id));
    } else if (selectedSamples.length < 2) {
      // Add sample if less than 2 selected
      setSelectedSamples(prev => [...prev, product]);
    } else {
      // Show error if trying to select more than 2
      toast({
        title: "Maximum samples reached",
        description: "You can only select 2 samples.",
        variant: "destructive"
      });
    }
  };
  
  const handleProceedToCheckout = () => {
    if (selectedSamples.length !== 2) {
      toast({
        title: "Please select samples",
        description: "You must select exactly 2 samples to proceed.",
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
        item.id === sample.id && item.name.includes('(Sample)')
      );
      
      if (!existingCartItem) {
        addItem({
          id: sample.id,
          name: `${sample.name} (Sample)`,
          price: 0, // Free sample
          weight: '50g', // Sample size
          image: sample.image
        }, 1); // quantity as second parameter
      }
    });
    
    toast({
      title: "Samples saved and added!",
      description: "2 free samples have been saved and added to your order.",
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
  
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-playfair text-3xl font-bold mb-4">
            Choose Your Free Samples
          </h1>
          <p className="text-muted-foreground text-lg mb-2">
            Select exactly 2 samples to try with your order
          </p>
          <p className="text-sm text-muted-foreground">
            Selected: {selectedSamples.length}/2 samples
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {sampleProducts.map((product) => {
            const isSelected = isSampleSelected(product.id);
            
            return (
              <div
                key={product.id}
                className={`card-premium cursor-pointer transition-all duration-200 hover:scale-105 ${
                  isSelected ? 'ring-2 ring-secondary bg-secondary/5' : ''
                }`}
                onClick={() => handleSampleSelect(product)}
              >
                <div className="relative bg-accent rounded-lg">
                  <img
                    src={product.image}
                    alt={product.name}
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
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Sample Size: 50g
                  </div>
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className={isSelected ? "btn-secondary" : ""}
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
                  {sample.name} (50g sample)
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