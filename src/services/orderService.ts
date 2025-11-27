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
import { shippingConfig } from '@/config';
import { decreaseSampleStock, getAllSamples } from './sampleService';
import { createShiprocketOrder } from './shippingService';

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
  // Delivery method tracking
  deliveryMethod?: 'pending' | 'self' | 'shiprocket';
  deliveryAssignedAt?: Timestamp;
  // Shiprocket integration fields
  shiprocketOrderId?: number;
  shiprocketShipmentId?: number;
  shiprocketAwbCode?: string;
  courierName?: string;
  courierCompanyId?: number;
  pickupScheduled?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type NewOrder = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;

const ORDERS_COLLECTION = 'orders';

// Create a new order and reduce stock
export const createOrder = async (orderData: NewOrder): Promise<string> => {
  try {
    // Get all sample products to identify which items are samples
    const samples = await getAllSamples();
    const sampleProductIds = samples.map(s => s.productId);
    
    // First, verify stock availability for all items
    for (const item of orderData.items) {
      // Check if this is a sample product (price is 0 or name contains "Sample")
      const isSample = item.price === 0 || item.name.includes('(Sample)');
      
      if (isSample) {
        // Find the corresponding sample in our samples collection
        const sample = samples.find(s => 
          s.productId === item.id || 
          s.productName === item.name.replace(' (Sample)', '')
        );
        
        if (sample) {
          if (sample.stock < item.quantity) {
            throw new Error(`Insufficient sample stock for ${item.name}. Available: ${sample.stock}, Requested: ${item.quantity}`);
          }
        }
      } else {
        // Regular product stock check
        const productRef = doc(db, 'products', item.id);
        const productSnap = await getDoc(productRef);
        
        if (!productSnap.exists()) {
          throw new Error(`Product ${item.name} not found`);
        }
        
        const currentStock = productSnap.data().stock;
        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.name}. Available: ${currentStock}, Requested: ${item.quantity}`);
        }
      }
    }
    
    // Create the order
    const orderWithTimestamps = {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderWithTimestamps);
    
    // Reduce stock for each item
    for (const item of orderData.items) {
      const isSample = item.price === 0 || item.name.includes('(Sample)');
      
      if (isSample) {
        // Find and decrease sample stock
        const sample = samples.find(s => 
          s.productId === item.id || 
          s.productName === item.name.replace(' (Sample)', '')
        );
        
        if (sample) {
          await decreaseSampleStock(sample.id, item.quantity);
          console.log(`✅ Reduced sample stock for ${item.name}: ${sample.stock} -> ${sample.stock - item.quantity}`);
        }
      } else {
        // Regular product stock reduction
        const productRef = doc(db, 'products', item.id);
        const productSnap = await getDoc(productRef);
        const currentStock = productSnap.data().stock;
        
        await updateDoc(productRef, {
          stock: currentStock - item.quantity
        });
        
        console.log(`✅ Reduced stock for ${item.name}: ${currentStock} -> ${currentStock - item.quantity}`);
      }
    }
    
    // Automatically create Shiprocket shipment if payment is successful (paid)
    if (orderData.paymentStatus === 'paid') {
      try {
        console.log('🚀 Auto-creating Shiprocket shipment for order:', docRef.id);
        
        // Create full order object for Shiprocket
        const fullOrder: Order = {
          id: docRef.id,
          ...orderData,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        
        const shiprocketResponse = await createShiprocketOrder(fullOrder);
        
        if (shiprocketResponse.order_id && shiprocketResponse.shipment_id) {
          // Update order with Shiprocket details
          await updateDoc(doc(db, ORDERS_COLLECTION, docRef.id), {
            shiprocketOrderId: shiprocketResponse.order_id,
            shiprocketShipmentId: shiprocketResponse.shipment_id,
            deliveryMethod: 'shiprocket',
            deliveryAssignedAt: serverTimestamp(),
            orderStatus: 'processing',
            updatedAt: serverTimestamp()
          });
          
          console.log('✅ Shiprocket shipment created automatically:', {
            orderId: shiprocketResponse.order_id,
            shipmentId: shiprocketResponse.shipment_id
          });
        }
      } catch (shiprocketError) {
        // Log error but don't fail the order creation
        console.error('⚠️ Failed to auto-create Shiprocket shipment:', shiprocketError);
        // Order is still created, admin can manually create shipment later
      }
    }
    
    console.log('✅ Order created and stock updated successfully');
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating order:', error);
    throw error;
  }
};

// Get all orders for a user
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  console.log('🔍 getUserOrders called with userId:', userId);
  
  const ordersRef = collection(db, ORDERS_COLLECTION);
  const q = query(
    ordersRef, 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  console.log('📋 Executing Firestore query for userId:', userId);
  const snapshot = await getDocs(q);
  console.log('📊 Query returned', snapshot.docs.length, 'documents');
  
  const orders = snapshot.docs.map(doc => {
    const data = doc.data();
    console.log('📄 Order document:', {
      id: doc.id,
      userId: data.userId,
      totalAmount: data.totalAmount,
      createdAt: data.createdAt
    });
    return {
      id: doc.id,
      ...data
    } as Order;
  });
  
  return orders;
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
  
  // If order is being cancelled, restore stock
  if (orderStatus === 'cancelled') {
    const order = await getOrderById(orderId);
    if (order) {
      await restoreStock(order);
    }
  }
  
  await updateDoc(docRef, {
    orderStatus,
    updatedAt: serverTimestamp()
  });
};

// Restore stock when order is cancelled
export const restoreStock = async (order: Order): Promise<void> => {
  try {
    console.log('🔄 Restoring stock for cancelled order:', order.id);
    
    for (const item of order.items) {
      const productRef = doc(db, 'products', item.id);
      const productSnap = await getDoc(productRef);
      
      if (productSnap.exists()) {
        const currentStock = productSnap.data().stock;
        
        await updateDoc(productRef, {
          stock: currentStock + item.quantity
        });
        
        console.log(`✅ Restored stock for ${item.name}: ${currentStock} -> ${currentStock + item.quantity}`);
      }
    }
    
    console.log('✅ Stock restored successfully for order:', order.id);
  } catch (error) {
    console.error('❌ Error restoring stock:', error);
    throw error;
  }
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
    shiprocketShipmentId?: number;
    shiprocketAwbCode?: string;
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
        shiprocketShipmentId: result.shipment_id,
        shiprocketAwbCode: result.awb_code,
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
  pickupPincode: string = shippingConfig.shiprocket.warehouse.pincode
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

/**
 * Get all paid orders (payment status = 'paid')
 * Used for delivery management
 */
export const getPaidOrders = async (): Promise<Order[]> => {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(
      ordersRef,
      where('paymentStatus', '==', 'paid'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders: Order[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order));
    
    return orders;
  } catch (error) {
    console.error('Error fetching paid orders:', error);
    throw error;
  }
};

/**
 * Assign delivery method to an order
 * @param orderId - The order ID
 * @param deliveryMethod - 'self' or 'shiprocket'
 */
export const assignDeliveryMethod = async (
  orderId: string,
  deliveryMethod: 'self' | 'shiprocket'
): Promise<void> => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      throw new Error('Order not found');
    }
    
    const orderData = orderSnap.data();
    
    // Check if order is paid
    if (orderData.paymentStatus !== 'paid') {
      throw new Error('Order payment is not completed');
    }
    
    // Check if delivery method is already assigned
    if (orderData.deliveryMethod && orderData.deliveryMethod !== 'pending') {
      throw new Error('Delivery method already assigned to this order');
    }
    
    await updateDoc(orderRef, {
      deliveryMethod,
      deliveryAssignedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Update order status if it's still pending
      ...(orderData.orderStatus === 'pending' && { orderStatus: 'processing' })
    });
    
    console.log(`✅ Delivery method "${deliveryMethod}" assigned to order ${orderId}`);
  } catch (error) {
    console.error('Error assigning delivery method:', error);
    throw error;
  }
};

/**
 * Create Shiprocket shipment for an order
 * This will call the Shiprocket service and update the order with shipment details
 */
export const createShiprocketShipmentForOrder = async (orderId: string): Promise<any> => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      throw new Error('Order not found');
    }
    
    const order = { id: orderSnap.id, ...orderSnap.data() } as Order;
    
    // Check if order is paid
    if (order.paymentStatus !== 'paid') {
      throw new Error('Order payment is not completed');
    }
    
    // Check if Shiprocket shipment already exists
    if (order.shiprocketOrderId) {
      throw new Error('Shiprocket shipment already created for this order');
    }
    
    // Import createShiprocketOrder function
    const { createShiprocketOrder } = await import('./shippingService');
    
    // Create Shiprocket order
    const shipmentResult = await createShiprocketOrder(order);
    
    // Update order with Shiprocket details
    await updateDoc(orderRef, {
      deliveryMethod: 'shiprocket',
      deliveryAssignedAt: serverTimestamp(),
      shiprocketOrderId: shipmentResult.order_id,
      shiprocketShipmentId: shipmentResult.shipment_id,
      shiprocketAwbCode: shipmentResult.awb_code,
      courierName: shipmentResult.courier_name,
      pickupScheduled: true,
      trackingId: shipmentResult.awb_code, // Also set as tracking ID
      orderStatus: 'processing',
      updatedAt: serverTimestamp(),
    });
    
    console.log(`✅ Shiprocket shipment created for order ${orderId}. AWB: ${shipmentResult.awb_code}`);
    
    return shipmentResult;
  } catch (error) {
    console.error('Error creating Shiprocket shipment:', error);
    throw error;
  }
};
