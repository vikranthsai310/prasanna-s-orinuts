
export interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
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
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  weight: string;
  quantity: number;
  image: string;
}
