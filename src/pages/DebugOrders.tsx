import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getTotalRevenue, getTotalOrders } from '@/services/analyticsService';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const DebugOrders = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runDebug = async () => {
    if (!user?.isAdmin) {
      alert('Admin access required');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Starting debug analysis...');
      
      // Get all orders
      const ordersRef = collection(db, 'orders');
      const allSnapshot = await getDocs(ordersRef);
      
      const orders = allSnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }));
      
      // Get paid orders specifically
      const paidQuery = query(ordersRef, where('paymentStatus', '==', 'paid'));
      const paidSnapshot = await getDocs(paidQuery);
      
      // Get analytics data
      const revenue = await getTotalRevenue();
      const totalOrders = await getTotalOrders();
      
      const debug = {
        totalOrdersInDB: allSnapshot.size,
        paidOrdersFromQuery: paidSnapshot.size,
        analyticsRevenue: revenue,
        analyticsTotalOrders: totalOrders,
        ordersSample: orders.map(order => ({
          id: order.id,
          paymentStatus: order.data.paymentStatus,
          totalAmount: order.data.totalAmount,
          userId: order.data.userId?.substring(0, 8) + '...',
          createdAt: order.data.createdAt?.toDate?.() || order.data.createdAt
        }))
      };
      
      console.log('🔍 Debug info:', debug);
      setDebugInfo(debug);
      
    } catch (error) {
      console.error('❌ Debug error:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isAdmin) {
    return <div className="p-4">Admin access required</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Orders Debug</h1>
      
      <Button onClick={runDebug} disabled={loading}>
        {loading ? 'Running Debug...' : 'Run Debug Analysis'}
      </Button>
      
      {debugInfo && (
        <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto text-sm">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default DebugOrders;
