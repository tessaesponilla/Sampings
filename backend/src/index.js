const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.createStaffAccount = functions.https.onCall(async (data, context) => {
  
  const callerDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  if (callerDoc.data().role !== 'owner') {
    throw new functions.https.HttpsError('permission-denied', 'Only owner can create staff');
  }
  
  
  const userRecord = await admin.auth().createUser({
    email: data.email,
    password: data.password,
    displayName: data.fullName
  });
  
  await admin.firestore().collection('users').doc(userRecord.uid).set({
    userId: userRecord.uid,
    fullName: data.fullName,
    email: data.email,
    contactNumber: data.contactNumber,
    role: 'staff',
    status: 'active',
    processedOrders: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  return { success: true, userId: userRecord.uid };
});


exports.confirmOrder = functions.https.onCall(async (data, context) => {
  
  const staffDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  if (staffDoc.data().role !== 'staff') {
    throw new functions.https.HttpsError('permission-denied', 'Only staff can confirm orders');
  }
  
  const batch = admin.firestore().batch();
  const orderRef = admin.firestore().collection('orders').doc(data.orderId);
  

  batch.update(orderRef, {
    status: 'confirmed',
    processedBy: context.auth.uid,
    processedByName: staffDoc.data().fullName,
    confirmedDate: admin.firestore.FieldValue.serverTimestamp()
  });

  const historyRef = orderRef.collection('statusHistory').doc();
  batch.set(historyRef, {
    status: 'confirmed',
    changedBy: context.auth.uid,
    changedByName: staffDoc.data().fullName,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
  

  batch.update(admin.firestore().collection('users').doc(context.auth.uid), {
    processedOrders: admin.firestore.FieldValue.increment(1)
  });
  
  await batch.commit();
  return { success: true };
});


exports.getOwnerInsights = functions.https.onCall(async (data, context) => {
  
  const ownerDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  if (ownerDoc.data().role !== 'owner') {
    throw new functions.https.HttpsError('permission-denied', 'Only owner can view insights');
  }
  
  const ordersSnapshot = await admin.firestore().collection('orders').get();
  
  const insights = {
    totalOrders: 0,
    totalRevenue: 0,
    statusBreakdown: {}
  };
  
  ordersSnapshot.forEach(doc => {
    const order = doc.data();
    insights.totalOrders++;
    insights.totalRevenue += order.totalAmount || 0;
    insights.statusBreakdown[order.status] = (insights.statusBreakdown[order.status] || 0) + 1;
  });
  
  return insights;
});

exports.deactivateStaff = functions.https.onCall(async (data, context) => {
  const ownerDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  if (ownerDoc.data().role !== 'owner') {
    throw new functions.https.HttpsError('permission-denied', 'Only owner can deactivate staff');
  }
  
  await admin.firestore().collection('users').doc(data.staffId).update({
    status: 'inactive'
  });
  
  await admin.auth().updateUser(data.staffId, { disabled: true });
  
  return { success: true };
});