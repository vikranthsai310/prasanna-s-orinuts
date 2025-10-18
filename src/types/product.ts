
export interface Product {
  id: string;
  name: string;
  description: string;
  image: string; // Primary image (for backward compatibility)
  images?: string[]; // Multiple images array (optional for backward compatibility)
  prices: {
    '250g': number;
    '500g': number;
    '1kg': number;
  };
  nutritionalInfo: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
  };
  category: 'nuts' | 'dates' | 'dried-fruits' | 'mixed';
  stock: number;
  isBestSeller?: boolean; // Flag to mark product as best seller
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  weight: string;
  quantity: number;
  image: string;
}
