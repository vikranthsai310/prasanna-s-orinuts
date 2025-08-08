import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CartItem } from '@/types/product';

export interface Address {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  shippingAddress: Address;
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingId?: string;
  // Shiprocket integration fields
  shiprocketOrderId?: number;
  shipmentId?: number;
  awbCode?: string;
  courierName?: string;
  courierCompanyId?: number;
  pickupScheduled?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type NewOrder = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;

const ORDERS_COLLECTION = 'orders';

// Create a new order
export const createOrder = async (orderData: NewOrder): Promise<string> => {
  const orderWithTimestamps = {
    ...orderData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderWithTimestamps);
  return docRef.id;
};

// Get all orders for a user
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  const q = query(
    ordersRef, 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Order));
};

// Get a single order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Order;
  }
  
  return null;
};

// Update order status
export const updateOrderStatus = async (
  orderId: string, 
  orderStatus: Order['orderStatus']
): Promise<void> => {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  await updateDoc(docRef, {
    orderStatus,
    updatedAt: serverTimestamp()
  });
};

// Update payment status
export const updatePaymentStatus = async (
  orderId: string, 
  paymentStatus: Order['paymentStatus']
): Promise<void> => {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  await updateDoc(docRef, {
    paymentStatus,
    updatedAt: serverTimestamp()
  });
};

// Add tracking information
export const addTrackingInfo = async (
  orderId: string, 
  trackingId: string
): Promise<void> => {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  await updateDoc(docRef, {
    trackingId,
    orderStatus: 'shipped',
    updatedAt: serverTimestamp()
  });
};

// Get all orders (admin only)
export const getAllOrders = async (): Promise<Order[]> => {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  const q = query(ordersRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Order));
};

// Get orders by status (admin only)
export const getOrdersByStatus = async (status: Order['orderStatus']): Promise<Order[]> => {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  const q = query(
    ordersRef, 
    where('orderStatus', '==', status),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Order));
};

// Update Shiprocket details
export const updateShiprocketDetails = async (
  orderId: string,
  shiprocketData: {
    shiprocketOrderId?: number;
    shipmentId?: number;
    awbCode?: string;
    courierName?: string;
    courierCompanyId?: number;
    pickupScheduled?: boolean;
  }
): Promise<void> => {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  await updateDoc(docRef, {
    ...shiprocketData,
    updatedAt: serverTimestamp()
  });
};

// Create shipment via Shiprocket
export const createShipment = async (order: Order): Promise<void> => {
  try {
    const response = await fetch('/api/create-shipment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order,
        pickupLocation: 'Primary', // Default pickup location
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create shipment: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      // Update order with Shiprocket details
      await updateShiprocketDetails(order.id, {
        shiprocketOrderId: result.order_id,
        shipmentId: result.shipment_id,
        awbCode: result.awb_code,
        courierName: result.courier_name,
        courierCompanyId: result.courier_company_id,
        pickupScheduled: true,
      });

      // Update order status to processing
      await updateOrderStatus(order.id, 'processing');
    } else {
      throw new Error('Shipment creation failed');
    }
  } catch (error) {
    console.error('Error creating shipment:', error);
    throw error;
  }
};

// Calculate shipping rates
export const calculateShippingRates = async (
  deliveryPincode: string,
  weight: number,
  isCod: boolean = false,
  pickupPincode: string = '110001' // Default pickup pincode, update with your actual pincode
): Promise<any> => {
  try {
    const response = await fetch('/api/calculate-shipping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pickupPincode,
        deliveryPincode,
        weight,
        isCod,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to calculate shipping: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error calculating shipping rates:', error);
    throw error;
  }
};

// Track shipment
export const trackShipment = async (awbCode: string): Promise<any> => {
  try {
    const response = await fetch(`/api/track-shipment?awb=${awbCode}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to track shipment: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error tracking shipment:', error);
    throw error;
  }
}; 