import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchProducts } from '@/services/productService';
import { Product } from '@/types/product';
import { mockProducts } from '@/data/mockProducts';

interface SearchBarProps {
  className?: string;
  isMobile?: boolean;
  isExpandable?: boolean;
}

const SearchBar = ({ className = '', isMobile = false, isExpandable = false }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle search
  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      // Try Firebase search first, fallback to mock data
      let searchResults: Product[] = [];
      try {
        searchResults = await searchProducts(searchTerm);
      } catch (error) {
        // Fallback to searching mock products
        searchResults = mockProducts.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setResults(searchResults.slice(0, 5)); // Limit to 5 results
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        handleSearch(query);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        if (isMobile || isExpandable) setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isExpandable]);

  // Handle product selection
  const handleProductSelect = (productId: string) => {
    navigate(`/products/${productId}`);
    setQuery('');
    setShowResults(false);
    if (isMobile) setIsOpen(false);
  };

  // Handle search submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query)}`);
      setQuery('');
      setShowResults(false);
      if (isMobile || isExpandable) setIsOpen(false);
    }
  };

  // Handle X button click - clear content if exists, close search if empty
  const handleClearOrClose = () => {
    if (query.trim()) {
      // Clear search content
      setQuery('');
      setResults([]);
      setShowResults(false);
    } else {
      // Close search bar
      if (isMobile || isExpandable) {
        setIsOpen(false);
      }
    }
  };

  // Search icon only (mobile or expandable desktop)
  if ((isMobile || isExpandable) && !isOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative group hover:bg-secondary/10 hover:scale-105 transition-all duration-200 hover:shadow-md"
      >
        <Search className="h-5 w-5 group-hover:text-secondary group-hover:scale-110 transition-all duration-200" />
      </Button>
    );
  }

  return (
    <>
      {/* Backdrop overlay for expandable desktop search */}
      {isExpandable && isOpen && !isMobile && (
        <div 
          className="fixed inset-0 bg-black/5 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div ref={searchRef} className={`relative ${className} ${isExpandable && isOpen ? 'z-50' : ''}`}>
        <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          <div className={`
            flex items-center transition-all duration-300 ease-out
            ${isExpandable && !isMobile ? 'animate-in slide-in-from-right-10 fade-in' : ''}
          `}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-secondary transition-colors z-10" />
            <Input
              type="text"
              placeholder="Search premium dry fruits..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`
                pl-10 pr-12 h-11
                bg-background/50 
                border-2 border-border/50 
                focus:border-secondary 
                focus:ring-secondary/20 
                focus:ring-4
                focus:shadow-lg
                focus:shadow-secondary/10
                transition-all duration-300
                backdrop-blur-sm
                hover:bg-background/80
                hover:border-border/70
                focus:bg-background
                shadow-md
                rounded-xl
                ${isMobile ? 'w-full' : isExpandable ? 'w-80 xl:w-96' : 'w-64 lg:w-80'}
                ${isExpandable && !isMobile ? 'animate-in slide-in-from-right-5 fade-in duration-300' : ''}
              `}
              autoComplete="off"
              autoFocus={isExpandable || isMobile}
            />
            
            {/* Single X button - clears content if exists, closes search if empty */}
            {(isMobile || isExpandable) && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClearOrClose}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-lg hover:bg-secondary/10 hover:text-secondary transition-all duration-200 hover:scale-105 z-10"
                title={query ? "Clear search" : "Close search"}
              >
                <X className="h-4 w-4 stroke-[2.5]" />
              </Button>
            )}
            
            {/* Clear button for non-expandable desktop search */}
            {!isMobile && !isExpandable && query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClearOrClose}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-lg hover:bg-secondary/10 hover:text-secondary transition-all duration-200 hover:scale-105 z-10"
                title="Clear search"
              >
                <X className="h-4 w-4 stroke-[2.5]" />
              </Button>
            )}
            
            {isLoading && (
              <Loader2 className="absolute right-12 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground z-10" />
            )}
          </div>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border border-border/50 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {results.length > 0 ? (
            <>
              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product.id)}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-muted/50 transition-colors text-left border-b border-border/30 last:border-b-0"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded-md bg-muted"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ₹{product.prices['250g']} / 250g • ₹{product.prices['500g']} / 500g
                    </p>
                  </div>
                </button>
              ))}
              {query && (
                <button
                  onClick={handleSubmit}
                  className="w-full p-3 text-center text-sm text-secondary hover:bg-muted/50 transition-colors border-t border-border/30"
                >
                  View all results for "{query}"
                </button>
              )}
            </>
          ) : query ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No products found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
    </>
  );
};

export default SearchBar; 