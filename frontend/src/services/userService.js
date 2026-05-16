import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { updatePassword, createUserWithEmailAndPassword } from 'firebase/auth';
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

// Change password
export const changeUserPassword = async (newPassword) => {
  try {
    const user = auth.currentUser;
    if (user) {
      await updatePassword(user, newPassword);
      return { success: true };
    }
    return { success: false, error: 'No user logged in' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Create staff account (owner only)
export const createStaffAccount = async (staffData) => {
  try {
    // Create auth account
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      staffData.email, 
      staffData.password
    );
    
    // Set user document
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

// Get all staff members (owner only)
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

// Deactivate staff (owner only)
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