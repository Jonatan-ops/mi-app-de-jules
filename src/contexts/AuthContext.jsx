import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin' | 'encargado' | 'mecanico'
  const [companyId, setCompanyId] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
            // Fetch user profile
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserRole(userData.role);
              setCompanyId(userData.companyId);

              // Fetch Company Data
              if (userData.companyId) {
                 const companyDoc = await getDoc(doc(db, 'companies', userData.companyId));
                 if (companyDoc.exists()) {
                     setCompany({ id: companyDoc.id, ...companyDoc.data() });
                 }
              }
            } else {
                // Legacy or Broken state: User exists in Auth but not in Firestore
                // For recovery, we might treat them as admin of a new company or just log error.
                console.error("User profile not found in Firestore.");
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setCompanyId(null);
        setCompany(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, password, companyName = "Mi Taller") => {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create Company Doc
      const companyRef = await addDoc(collection(db, 'companies'), {
          name: companyName,
          createdAt: serverTimestamp(),
          subscriptionStatus: 'active', // Default to active
          ownerId: user.uid
      });

      // 3. Create User Profile linked to Company
      await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          role: 'admin',
          companyId: companyRef.id,
          createdAt: serverTimestamp()
      });

      return user;
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    userRole,
    companyId,
    company,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
