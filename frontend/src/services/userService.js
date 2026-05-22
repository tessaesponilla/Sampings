import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { updatePassword, createUserWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential} from 'firebase/auth';

import { db, auth } from '../config/firebase';

export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      fullName: profileData.fullName,
      contactNumber: profileData.contactNumber,
      updatedAt: Timestamp.now()
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const changeUserPassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) return { success: false, error: 'No user logged in' };
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};


export const createStaffAccount = async (staffData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      staffData.email, 
      staffData.password
    );
    
    
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      userId: userCredential.user.uid,
      fullName: staffData.fullName,
      email: staffData.email,
      contactNumber: staffData.contactNumber,
      role: 'staff',
      status: 'active',
      processedOrders: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    return { success: true, userId: userCredential.user.uid };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAllStaff = async () => {
  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'staff')
    );
    
    const snapshot = await getDocs(q);
    const staff = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, staff };
  } catch (error) {
    return { success: false, error: error.message };
  }
};


export const deactivateStaffMember = async (staffId) => {
  try {
    await updateDoc(doc(db, 'users', staffId), {
      status: 'inactive',
      updatedAt: Timestamp.now()
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const checkLoginAttempts = async (email) => {
  try {
    const attemptsRef = doc(db, 'loginAttempts', email);
    const attemptsSnap = await getDoc(attemptsRef);

    if (!attemptsSnap.exists()) return { locked: false };

    const data = attemptsSnap.data();
    const now = Timestamp.now().toMillis();
    const windowStart = now - 15 * 60 * 1000; 

    if (data.lastAttempt?.toMillis() < windowStart) {
      await setDoc(attemptsRef, { count: 0, locked: false, lastAttempt: Timestamp.now() });
      return { locked: false };
    }

    if (data.locked && data.lastAttempt?.toMillis() > windowStart) {
      const remainingMs = data.lastAttempt.toMillis() + 15 * 60 * 1000 - now;
      const remainingMin = Math.ceil(remainingMs / 60000);
      return { locked: true, remainingMin };
    }

    return { locked: false };
  } catch (error) {
    return { locked: false };
  }
};

export const recordFailedAttempt = async (email) => {
  try {
    const attemptsRef = doc(db, 'loginAttempts', email);
    const attemptsSnap = await getDoc(attemptsRef);
    const now = Timestamp.now();
    const windowStart = now.toMillis() - 15 * 60 * 1000;

    let count = 1;

    if (attemptsSnap.exists()) {
      const data = attemptsSnap.data();
      count = data.lastAttempt?.toMillis() > windowStart ? data.count + 1 : 1;
    }

    await setDoc(attemptsRef, {
      count,
      locked: count >= 5,
      lastAttempt: now
    });
  } catch (error) {
    console.error('Failed to record attempt:', error);
  }
};

export const clearLoginAttempts = async (email) => {
  try {
    const attemptsRef = doc(db, 'loginAttempts', email);
    await setDoc(attemptsRef, { count: 0, locked: false, lastAttempt: Timestamp.now() });
  } catch (error) {
    console.error('Failed to clear attempts:', error);
  }
};