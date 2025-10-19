import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  updateDoc, 
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getUserOrders } from './orderService';

export type AdminRole = 'super-admin' | 'admin' | null;

export interface Address {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  adminRole?: AdminRole;
  phoneVerified: boolean;
  isSuspended?: boolean;
  joinDate: Timestamp | Date;
  createdAt: Timestamp | Date;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Timestamp | Date;
  addresses?: Address[];
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Timestamp | Date;
}

const USERS_COLLECTION = 'users';

// Get all users with optimized stats fetching (admin only)
export const getAllUsers = async (): Promise<AdminUser[]> => {
  try {
    console.log('Fetching all users from Firestore...');
    const usersRef = collection(db, USERS_COLLECTION);
    const usersQuery = query(usersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(usersQuery);
    
    console.log(`Found ${snapshot.docs.length} users`);
    
    // First, get all users without stats
    const users: AdminUser[] = [];
    const userIds: string[] = [];
    
    snapshot.docs.forEach(doc => {
      const userData = doc.data();
      userIds.push(doc.id);
      
      users.push({
        id: doc.id,
        name: userData.name || 'User',
        email: userData.email || '',
        phone: userData.phone || '',
        isAdmin: userData.isAdmin || false,
        phoneVerified: userData.phoneVerified || false,
        joinDate: userData.createdAt || new Date(),
        createdAt: userData.createdAt || new Date(),
        totalOrders: 0,
        totalSpent: 0,
        lastOrderDate: undefined,
        addresses: userData.addresses || []
      });
    });
    
    // Then fetch all orders at once and calculate stats (only paid orders)
    console.log('Fetching order statistics...');
    const ordersRef = collection(db, 'orders');
    const ordersQuery = query(ordersRef, where('paymentStatus', '==', 'paid'));
    const ordersSnapshot = await getDocs(ordersQuery);
    
    // Group orders by userId
    const ordersByUser: { [userId: string]: any[] } = {};
    
    ordersSnapshot.docs.forEach(doc => {
      const orderData = doc.data();
      const userId = orderData.userId;
      
      if (!ordersByUser[userId]) {
        ordersByUser[userId] = [];
      }
      
      ordersByUser[userId].push(orderData);
    });
    
    // Update user stats (only count paid orders)
    users.forEach(user => {
      const userOrders = ordersByUser[user.id] || [];
      
      user.totalOrders = userOrders.length;
      user.totalSpent = userOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      if (userOrders.length > 0) {
        // Find the most recent order
        const sortedOrders = userOrders.sort((a, b) => {
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
          return timeB - timeA;
        });
        
        user.lastOrderDate = sortedOrders[0].createdAt;
      }
    });
    
    console.log('User statistics calculated successfully');
    return users;
    
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Get user statistics (orders and spending - only paid orders)
export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    // Get all orders for the user
    const allOrders = await getUserOrders(userId);
    
    // Filter only paid orders
    const paidOrders = allOrders.filter(order => order.paymentStatus === 'paid');
    
    const totalOrders = paidOrders.length;
    const totalSpent = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Find the most recent paid order
    const lastOrderDate = paidOrders.length > 0 
      ? paidOrders.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : (a.createdAt as any);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : (b.createdAt as any);
          const timeA = dateA instanceof Date ? dateA.getTime() : new Date(dateA).getTime();
          const timeB = dateB instanceof Date ? dateB.getTime() : new Date(dateB).getTime();
          return timeB - timeA;
        })[0].createdAt
      : undefined;
    
    return {
      totalOrders,
      totalSpent,
      lastOrderDate
    };
  } catch (error) {
    console.error(`Error fetching stats for user ${userId}:`, error);
    return {
      totalOrders: 0,
      totalSpent: 0
    };
  }
};

// Get a single user by ID (admin only)
export const getUserById = async (userId: string): Promise<AdminUser | null> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data();
      const stats = await getUserStats(userId);
      
      return {
        id: docSnap.id,
        name: userData.name || 'User',
        email: userData.email || '',
        phone: userData.phone || '',
        isAdmin: userData.isAdmin || false,
        phoneVerified: userData.phoneVerified || false,
        joinDate: userData.createdAt || new Date(),
        createdAt: userData.createdAt || new Date(),
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        lastOrderDate: stats.lastOrderDate,
        addresses: userData.addresses || []
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// Search users by name or email
export const searchUsers = async (searchTerm: string): Promise<AdminUser[]> => {
  try {
    const allUsers = await getAllUsers();
    
    return allUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Format timestamp for display
export const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return 'N/A';
  
  // Handle Firestore Timestamp
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleDateString();
  }
  
  // Handle regular Date or string
  return new Date(timestamp).toLocaleDateString();
};

// Suspend a user (admin only)
export const suspendUser = async (userId: string): Promise<void> => {
  try {
    console.log('Suspending user:', userId);
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      isSuspended: true,
      suspendedAt: new Date(),
      updatedAt: new Date()
    });
    console.log('User suspended successfully');
  } catch (error) {
    console.error('Error suspending user:', error);
    throw error;
  }
};

// Unsuspend a user (admin only)
export const unsuspendUser = async (userId: string): Promise<void> => {
  try {
    console.log('Unsuspending user:', userId);
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      isSuspended: false,
      unsuspendedAt: new Date(),
      updatedAt: new Date()
    });
    console.log('User unsuspended successfully');
  } catch (error) {
    console.error('Error unsuspending user:', error);
    throw error;
  }
};

// Get all admins (super admin only)
export const getAllAdmins = async (): Promise<AdminUser[]> => {
  try {
    console.log('Fetching all admins from Firestore...');
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('isAdmin', '==', true));
    const querySnapshot = await getDocs(q);
    
    const admins: AdminUser[] = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      const userData = docSnapshot.data();
      const stats = await getUserStats(docSnapshot.id);
      
      admins.push({
        id: docSnapshot.id,
        name: userData.name || 'Admin',
        email: userData.email || '',
        phone: userData.phone || '',
        isAdmin: true,
        adminRole: userData.adminRole || 'admin',
        phoneVerified: userData.phoneVerified || false,
        isSuspended: userData.isSuspended || false,
        joinDate: userData.createdAt || new Date(),
        createdAt: userData.createdAt || new Date(),
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        lastOrderDate: stats.lastOrderDate,
        addresses: userData.addresses || []
      });
    }
    
    console.log(`Found ${admins.length} admins`);
    return admins;
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};

// Promote user to admin (super admin only)
export const promoteToAdmin = async (userId: string, adminRole: 'admin' = 'admin'): Promise<void> => {
  try {
    console.log('Promoting user to admin:', userId);
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      isAdmin: true,
      adminRole: adminRole,
      promotedAt: new Date(),
      updatedAt: new Date()
    });
    console.log('User promoted to admin successfully');
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    throw error;
  }
};

// Demote admin to regular user (super admin only, cannot demote super admin)
export const demoteFromAdmin = async (userId: string): Promise<void> => {
  try {
    console.log('Demoting admin to regular user:', userId);
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      isAdmin: false,
      adminRole: null,
      demotedAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Admin demoted to regular user successfully');
  } catch (error) {
    console.error('Error demoting admin:', error);
    throw error;
  }
};
