import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, firebaseApp } from '../config/firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';


export const registerCustomer = async (fullName, contactNumber, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userData = {
      userId: user.uid,
      fullName,
      email,
      contactNumber,
      role: 'customer',
      status: 'active',
      totalOrders: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    return { success: true, user, userData };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const registerStaff = async (fullName, email, contactNumber, password) => {
  try {
    const firebaseConfig = firebaseApp.options;
    const secondaryApp = initializeApp(firebaseConfig, 'SecondaryStaff_' + Date.now());
    const secondaryAuth = getAuth(secondaryApp);

    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      userId: user.uid,
      fullName,
      email,
      contactNumber,
      role: 'staff',
      status: 'active',
      processedOrders: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await signOut(secondaryAuth);
    await deleteApp(secondaryApp);

    return { success: true, userId: user.uid, message: 'Staff account created successfully!' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      const userData = {
        userId: userCredential.user.uid,
        email: userCredential.user.email,
        role: 'customer',
        status: 'active'
      };
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      return { success: true, user: userCredential.user, userData };
    }

    const userData = userDoc.data();
    
    if (userData.status === 'inactive') {
      await signOut(auth);
      return { success: false, error: 'Account is deactivated' };
    }

    return { success: true, user: userCredential.user, userData };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    }
    return { success: false, error: 'User not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};