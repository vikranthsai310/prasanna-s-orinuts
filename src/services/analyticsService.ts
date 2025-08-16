import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit as firestoreLimit, 
  Timestamp,
  getFirestore
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from './orderService';
import { Product } from '@/types/product';

// Get total revenue
export const getTotalRevenue = async (): Promise<number> => {
  try {
    console.log('🔍 Fetching total revenue...');
    
    // Try to get all orders first to debug the issue
    const ordersRef = collection(db, 'orders');
    
    try {
      // First attempt: get all orders to see what exists
      const allSnapshot = await getDocs(ordersRef);
      console.log(`📋 Total orders found: ${allSnapshot.size}`);
      
      let totalRevenue = 0;
      let paidOrdersCount = 0;
      
      allSnapshot.docs.forEach(doc => {
        const order = doc.data();
        console.log(`📄 Order ${doc.id}:`, {
          paymentStatus: order.paymentStatus,
          totalAmount: order.totalAmount,
          userId: order.userId?.substring(0, 8) + '...' // Only show first 8 chars for privacy
        });
        
        if (order.paymentStatus === 'paid') {
          totalRevenue += (order.totalAmount || 0);
          paidOrdersCount++;
        }
      });
      
      console.log(`💰 Revenue calculation: ${paidOrdersCount} paid orders, total: ₹${totalRevenue}`);
      return totalRevenue;
      
    } catch (firestoreError) {
      console.error('❌ Firestore access error:', firestoreError);
      console.log('⚠️ Trying alternative approach with where clause...');
      
      // Fallback: try with where clause
      const q = query(ordersRef, where('paymentStatus', '==', 'paid'));
      const snapshot = await getDocs(q);
      
      const totalRevenue = snapshot.docs.reduce((total, doc) => {
        const order = doc.data() as Order;
        return total + (order.totalAmount || 0);
      }, 0);
      
      console.log(`💰 Fallback revenue calculation: ₹${totalRevenue} from ${snapshot.docs.length} orders`);
      return totalRevenue;
    }
    
  } catch (error) {
    console.error('❌ Error fetching total revenue:', error);
    return 0; // Return 0 instead of throwing to prevent dashboard from breaking
  }
};

// Get total orders (only paid orders)
export const getTotalOrders = async (): Promise<number> => {
  try {
    console.log('🔍 Fetching total orders...');
    const ordersRef = collection(db, 'orders');
    
    try {
      // Get all orders and count paid ones
      const allSnapshot = await getDocs(ordersRef);
      const paidOrdersCount = allSnapshot.docs.filter(doc => {
        const order = doc.data();
        return order.paymentStatus === 'paid';
      }).length;
      
      console.log(`📊 Total paid orders: ${paidOrdersCount} out of ${allSnapshot.size} total orders`);
      return paidOrdersCount;
      
    } catch (firestoreError) {
      console.error('❌ Firestore access error for total orders:', firestoreError);
      
      // Fallback: try with where clause
      const q = query(ordersRef, where('paymentStatus', '==', 'paid'));
      const snapshot = await getDocs(q);
      console.log(`📊 Fallback total orders count: ${snapshot.size}`);
      return snapshot.size;
    }
    
  } catch (error) {
    console.error('❌ Error fetching total orders:', error);
    return 0; // Return 0 instead of throwing
  }
};

// Get total users
export const getTotalUsers = async (): Promise<number> => {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  return snapshot.size;
};

// Get total products
export const getTotalProducts = async (): Promise<number> => {
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  return snapshot.size;
};

// Get orders by date range for chart (only paid orders)
export const getOrdersByDateRange = async (days: number = 7): Promise<{ date: string; orders: number }[]> => {
  const ordersRef = collection(db, 'orders');
  
  // Calculate start date (n days ago)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const q = query(
    ordersRef,
    where('paymentStatus', '==', 'paid'),
    where('createdAt', '>=', startDate),
    orderBy('createdAt', 'asc')
  );
  
  const snapshot = await getDocs(q);
  
  // Create a map to store orders by date
  const ordersByDate = new Map<string, number>();
  
  // Initialize all dates in the range with 0 orders
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    ordersByDate.set(dateStr, 0);
  }
  
  // Count orders by date (only paid orders)
  snapshot.docs.forEach(doc => {
    const order = doc.data();
    const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
    const dateStr = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const currentCount = ordersByDate.get(dateStr) || 0;
    ordersByDate.set(dateStr, currentCount + 1);
  });
  
  // Convert map to array
  return Array.from(ordersByDate).map(([date, orders]) => ({ date, orders }));
};

// Get recent orders (only paid orders)
export const getRecentOrders = async (limitCount: number = 5): Promise<Order[]> => {
  const ordersRef = collection(db, 'orders');
  const q = query(
    ordersRef,
    where('paymentStatus', '==', 'paid'),
    orderBy('createdAt', 'desc'),
    firestoreLimit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Order));
};

// Get low stock products
export const getLowStockProducts = async (threshold: number = 20): Promise<Product[]> => {
  const productsRef = collection(db, 'products');
  const q = query(
    productsRef,
    where('stock', '<=', threshold),
    orderBy('stock', 'asc'),
    firestoreLimit(5)
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Product));
};

// Get revenue by date range
export const getRevenueByDateRange = async (days: number = 7): Promise<{ date: string; revenue: number }[]> => {
  const ordersRef = collection(db, 'orders');
  
  // Calculate start date (n days ago)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const q = query(
    ordersRef,
    where('paymentStatus', '==', 'paid'),
    where('createdAt', '>=', startDate),
    orderBy('createdAt', 'asc')
  );
  
  const snapshot = await getDocs(q);
  
  // Create a map to store revenue by date
  const revenueByDate = new Map<string, number>();
  
  // Initialize all dates in the range with 0 revenue
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    revenueByDate.set(dateStr, 0);
  }
  
  // Sum revenue by date
  snapshot.docs.forEach(doc => {
    const order = doc.data();
    const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
    const dateStr = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const currentRevenue = revenueByDate.get(dateStr) || 0;
    revenueByDate.set(dateStr, currentRevenue + (order.totalAmount || 0));
  });
  
  // Convert map to array
  return Array.from(revenueByDate).map(([date, revenue]) => ({ date, revenue }));
}; 