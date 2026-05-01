import { 
  collection, addDoc, getDocs, getDoc, doc, setDoc,
  query, where, orderBy, updateDoc, Timestamp,
  writeBatch, increment 
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

// Create order (both online and walk-in)
export const createOrder = async (orderData) => {
  try {
    const batch = writeBatch(db);
    const pricePerItem = orderData.jerseyType === 'full-set' ? 800 : 400;
    const totalAmount = pricePerItem * orderData.items.length;
    const userId = auth.currentUser?.uid;

    let customerId, customerName, customerContact, customerEmail, orderType;

    if (orderData.orderType === 'online') {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      customerId = userId;
      customerName = userData.fullName;
      customerContact = userData.contactNumber;
      customerEmail = userData.email;
      orderType = 'online';
    } else {
      customerId = 'walk-in';
      customerName = orderData.customerName;
      customerContact = orderData.customerContact;
      customerEmail = orderData.customerEmail || '';
      orderType = 'walk-in';
    }

   const orderRef = doc(collection(db, 'orders'));

// Generate sequential order number
const counterRef = doc(db, 'counters', 'orderNumber');
const counterDoc = await getDoc(counterRef);
let nextNumber = 1;
if (counterDoc.exists()) {
  nextNumber = (counterDoc.data().current || 0) + 1;
  batch.update(counterRef, { current: nextNumber });
} else {
  batch.set(counterRef, { current: 1 });
}
const orderNumber = `ORD-${String(nextNumber).padStart(4, '0')}`;
    
batch.set(orderRef, {
  orderId: orderRef.id,
  orderNumber: orderNumber,  // ORD-0001, ORD-0002, etc.
  userId: customerId,
  customerName,
  customerContact,
  customerEmail,
  jerseyType: orderData.jerseyType,
  pricePerItem,
  quantity: orderData.items.length,
  totalAmount,
  designReferenceURL: orderData.designReferenceURL || '',
  orderType,
  status: 'pending',
  processedBy: null,
  processedByName: null,
  orderDate: Timestamp.now(),
  confirmedDate: null,
  completedDate: null
});
    // Add items
    orderData.items.forEach((item) => {
      const itemRef = doc(collection(db, `orders/${orderRef.id}/items`));
      batch.set(itemRef, {
        itemId: itemRef.id,
        size: item.size,
        number: item.number,
        surname: item.surname,
        quantity: 1
      });
    });

    // Add status history
    const historyRef = doc(collection(db, `orders/${orderRef.id}/statusHistory`));
    batch.set(historyRef, {
      historyId: historyRef.id,
      status: 'pending',
      changedBy: userId || 'walk-in',
      changedByName: customerName,
      timestamp: Timestamp.now(),
      notes: 'Order created'
    });

    if (orderType === 'online') {
      batch.update(doc(db, 'users', customerId), {
        totalOrders: increment(1)
      });
    }

    await batch.commit();
    return { success: true, orderId: orderRef.id, totalAmount };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Upload design image to Cloudinary
export const uploadDesignImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );

    const data = await response.json();

    if (data.error) {
      return { success: false, error: data.error.message };
    }

    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get customer's orders
export const getCustomerOrders = async (customerId) => {
  try {
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', customerId),
      orderBy('orderDate', 'desc')
    );
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      orderDate: doc.data().orderDate?.toDate()
    }));
    return { success: true, orders };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get single order with items and history
export const getOrderDetails = async (orderId) => {
  try {
    const orderDoc = await getDoc(doc(db, 'orders', orderId));
    if (!orderDoc.exists()) {
      return { success: false, error: 'Order not found' };
    }

    const itemsSnapshot = await getDocs(collection(db, `orders/${orderId}/items`));
    const items = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const historySnapshot = await getDocs(
      query(collection(db, `orders/${orderId}/statusHistory`), orderBy('timestamp', 'asc'))
    );
    const statusHistory = historySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate()
    }));

    return {
      success: true,
      order: {
        ...orderDoc.data(),
        orderDate: orderDoc.data().orderDate?.toDate(),
        confirmedDate: orderDoc.data().confirmedDate?.toDate(),
        completedDate: orderDoc.data().completedDate?.toDate(),
        items,
        statusHistory
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Confirm order (staff action)
export const confirmOrder = async (orderId) => {
  try {
    const userId = auth.currentUser.uid;
    const userDoc = await getDoc(doc(db, 'users', userId));
    const staffName = userDoc.data().fullName;

    const batch = writeBatch(db);
    const orderRef = doc(db, 'orders', orderId);

    batch.update(orderRef, {
      status: 'confirmed',
      processedBy: userId,
      processedByName: staffName,
      confirmedDate: Timestamp.now()
    });

    const historyRef = doc(collection(db, `orders/${orderId}/statusHistory`));
    batch.set(historyRef, {
      historyId: historyRef.id,
      status: 'confirmed',
      changedBy: userId,
      changedByName: staffName,
      timestamp: Timestamp.now(),
      notes: 'Order confirmed by staff'
    });

    batch.update(doc(db, 'users', userId), {
      processedOrders: increment(1)
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update order status (staff/owner)
export const updateOrderStatus = async (orderId, newStatus, notes = '') => {
  try {
    const userId = auth.currentUser.uid;
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userName = userDoc.data().fullName;

    const batch = writeBatch(db);
    const orderRef = doc(db, 'orders', orderId);

    const updateData = { status: newStatus };
    if (newStatus === 'completed') {
      updateData.completedDate = Timestamp.now();
    }
    batch.update(orderRef, updateData);

    const historyRef = doc(collection(db, `orders/${orderId}/statusHistory`));
    batch.set(historyRef, {
      historyId: historyRef.id,
      status: newStatus,
      changedBy: userId,
      changedByName: userName,
      timestamp: Timestamp.now(),
      notes
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get customer dashboard stats
export const getCustomerStats = async (customerId) => {
  try {
    const q = query(collection(db, 'orders'), where('userId', '==', customerId));
    const snapshot = await getDocs(q);
    
    const stats = { totalOrders: 0, pending: 0, inProgress: 0, completed: 0 };
    
    snapshot.forEach(doc => {
      const order = doc.data();
      stats.totalOrders++;
      if (order.status === 'pending' || order.status === 'confirmed') stats.pending++;
      else if (order.status === 'in-progress') stats.inProgress++;
      else if (order.status === 'completed' || order.status === 'ready-for-pickup') stats.completed++;
    });
    
    return { success: true, stats };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get active orders for staff queue
export const getActiveOrders = async () => {
  try {
    const q = query(
      collection(db, 'orders'),
      where('status', 'in', ['pending', 'confirmed', 'in-progress', 'ready-for-pickup']),
      orderBy('orderDate', 'asc')
    );
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      orderDate: doc.data().orderDate?.toDate()
    }));
    return { success: true, orders };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get all orders (owner)
export const getAllOrders = async () => {
  try {
    const q = query(collection(db, 'orders'), orderBy('orderDate', 'desc'));
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      orderDate: doc.data().orderDate?.toDate()
    }));
    return { success: true, orders };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get owner insights
export const getOwnerInsights = async (period = 'all') => {
  try {
    const snapshot = await getDocs(collection(db, 'orders'));
    const insights = {
      totalOrders: 0,
      totalRevenue: 0,
      orderStatusBreakdown: { pending: 0, confirmed: 0, 'in-progress': 0, 'ready-for-pickup': 0, completed: 0 },
      orderTypeBreakdown: { online: 0, 'walk-in': 0 }
    };

    let startDate;
    const now = new Date();
    switch(period) {
      case 'daily': startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
      case 'weekly': startDate = new Date(now.setDate(now.getDate() - 7)); break;
      case 'monthly': startDate = new Date(now.getFullYear(), now.getMonth(), 1); break;
      case 'yearly': startDate = new Date(now.getFullYear(), 0, 1); break;
    }

    snapshot.forEach(doc => {
      const order = doc.data();
      const orderDate = order.orderDate?.toDate();
      if (startDate && orderDate && orderDate < startDate) return;

      insights.totalOrders++;
      insights.totalRevenue += order.totalAmount || 0;
      insights.orderStatusBreakdown[order.status] = (insights.orderStatusBreakdown[order.status] || 0) + 1;
      insights.orderTypeBreakdown[order.orderType] = (insights.orderTypeBreakdown[order.orderType] || 0) + 1;
    });

    insights.averageOrder = insights.totalOrders > 0 ? insights.totalRevenue / insights.totalOrders : 0;
    insights.completionRate = insights.totalOrders > 0 
      ? (insights.orderStatusBreakdown.completed / insights.totalOrders) * 100 : 0;

    return { success: true, insights };
  } catch (error) {
    return { success: false, error: error.message };
  }
};