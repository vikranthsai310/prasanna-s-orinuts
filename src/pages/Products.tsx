
import { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { mockProducts } from '@/data/mockProducts';
import { Button } from '@/components/ui/button';

const Products = () => {
  const [filter, setFilter] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'nuts', name: 'Nuts' },
    { id: 'dates', name: 'Dates' },
    { id: 'dried-fruits', name: 'Dried Fruits' },
    { id: 'mixed', name: 'Mixed' }
  ];

  const filteredProducts = filter === 'all' 
    ? mockProducts 
    : mockProducts.filter(product => product.category === filter);

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-4">
          Our Premium Collection
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover our carefully curated selection of the finest dry fruits from around the world
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={filter === category.id ? "default" : "outline"}
            onClick={() => setFilter(category.id)}
            className="mb-2"
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No products found in this category.
          </p>
        </div>
      )}
    </div>
  );
};

export default Products;
