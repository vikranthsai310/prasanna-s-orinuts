
import { Product } from '@/types/product';
import { FIREBASE_IMAGE_URLS } from '@/services/imageService';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Almonds',
    description: 'California premium almonds, rich in vitamin E and healthy fats. Perfect for snacking or cooking.',
    image: FIREBASE_IMAGE_URLS.almond,
    prices: {
      '250g': 299,
      '500g': 589,
      '1kg': 1149
    },
    nutritionalInfo: {
      calories: 575,
      protein: 21,
      fat: 50,
      carbs: 22,
      fiber: 12
    },
    category: 'nuts',
    stock: 50
  },
  {
    id: '2',
    name: 'Afghani Dates',
    description: 'Sweet, soft Afghani dates packed with natural sugars and essential minerals.',
    image: FIREBASE_IMAGE_URLS.dates,
    prices: {
      '250g': 199,
      '500g': 389,
      '1kg': 749
    },
    nutritionalInfo: {
      calories: 277,
      protein: 2,
      fat: 0.2,
      carbs: 75,
      fiber: 7
    },
    category: 'dates',
    stock: 30
  },
  {
    id: '3',
    name: 'Kashmir Walnuts',
    description: 'Premium Kashmir walnuts, known for their superior quality and rich omega-3 content.',
    image: FIREBASE_IMAGE_URLS.walnut,
    prices: {
      '250g': 399,
      '500g': 789,
      '1kg': 1549
    },
    nutritionalInfo: {
      calories: 654,
      protein: 15,
      fat: 65,
      carbs: 14,
      fiber: 7
    },
    category: 'nuts',
    stock: 25
  },
  {
    id: '4',
    name: 'Iranian Pistachios',
    description: 'Finest Iranian pistachios with a distinctive taste and perfect crunch.',
    image: FIREBASE_IMAGE_URLS.pista,
    prices: {
      '250g': 549,
      '500g': 1089,
      '1kg': 2149
    },
    nutritionalInfo: {
      calories: 560,
      protein: 20,
      fat: 45,
      carbs: 28,
      fiber: 10
    },
    category: 'nuts',
    stock: 20
  },
  {
    id: '5',
    name: 'Turkish Figs',
    description: 'Sun-dried Turkish figs, naturally sweet and rich in fiber and potassium.',
    image: '/placeholder.svg',
    prices: {
      '250g': 229,
      '500g': 449,
      '1kg': 879
    },
    nutritionalInfo: {
      calories: 249,
      protein: 3,
      fat: 1,
      carbs: 64,
      fiber: 10
    },
    category: 'dried-fruits',
    stock: 35
  },
  {
    id: '6',
    name: 'Golden Raisins',
    description: 'Premium golden raisins, naturally sweet and perfect for baking and snacking.',
    image: FIREBASE_IMAGE_URLS.rasins,
    prices: {
      '250g': 149,
      '500g': 289,
      '1kg': 569
    },
    nutritionalInfo: {
      calories: 299,
      protein: 3,
      fat: 0.5,
      carbs: 79,
      fiber: 4
    },
    category: 'dried-fruits',
    stock: 40
  },
  {
    id: '7',
    name: 'Brazilian Cashews',
    description: 'Creamy Brazilian cashews, rich in healthy fats and minerals.',
    image: FIREBASE_IMAGE_URLS.cashew,
    prices: {
      '250g': 349,
      '500g': 689,
      '1kg': 1349
    },
    nutritionalInfo: {
      calories: 553,
      protein: 18,
      fat: 44,
      carbs: 30,
      fiber: 3
    },
    category: 'nuts',
    stock: 30
  },
  {
    id: '8',
    name: 'Dried Apricots',
    description: 'Turkish dried apricots, naturally sweet and rich in beta-carotene.',
    image: FIREBASE_IMAGE_URLS.apricot,
    prices: {
      '250g': 199,
      '500g': 389,
      '1kg': 759
    },
    nutritionalInfo: {
      calories: 241,
      protein: 3,
      fat: 0.5,
      carbs: 63,
      fiber: 7
    },
    category: 'dried-fruits',
    stock: 25
  },
  {
    id: '9',
    name: 'Medjool Dates',
    description: 'Premium Medjool dates, known as the king of dates for their size and sweetness.',
    image: FIREBASE_IMAGE_URLS.dates,
    prices: {
      '250g': 299,
      '500g': 589,
      '1kg': 1149
    },
    nutritionalInfo: {
      calories: 277,
      protein: 2,
      fat: 0.2,
      carbs: 75,
      fiber: 7
    },
    category: 'dates',
    stock: 20
  },
  {
    id: '10',
    name: 'Mixed Berry Trail Mix',
    description: 'A perfect blend of dried cranberries, blueberries, and strawberries.',
    image: '/placeholder.svg',
    prices: {
      '250g': 249,
      '500g': 489,
      '1kg': 959
    },
    nutritionalInfo: {
      calories: 325,
      protein: 2,
      fat: 1,
      carbs: 82,
      fiber: 5
    },
    category: 'mixed',
    stock: 30
  },
  {
    id: '11',
    name: 'Pine Nuts',
    description: 'Premium pine nuts with a delicate flavor, perfect for Mediterranean cuisine.',
    image: '/placeholder.svg',
    prices: {
      '250g': 899,
      '500g': 1789,
      '1kg': 3549
    },
    nutritionalInfo: {
      calories: 673,
      protein: 14,
      fat: 68,
      carbs: 13,
      fiber: 4
    },
    category: 'nuts',
    stock: 15
  },
  {
    id: '12',
    name: 'Premium Mix',
    description: 'Our signature mix of almonds, cashews, pistachios, and walnuts.',
    image: '/placeholder.svg',
    prices: {
      '250g': 399,
      '500g': 789,
      '1kg': 1549
    },
    nutritionalInfo: {
      calories: 590,
      protein: 18,
      fat: 52,
      carbs: 21,
      fiber: 8
    },
    category: 'mixed',
    stock: 40
  }
];
