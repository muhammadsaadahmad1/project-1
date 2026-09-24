import React, { createContext, useContext, useState, useEffect } from "react";
import { firebaseAuth, isFirebaseActive } from "../config/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { useStore } from "./StoreContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { settings } = useStore();

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("aura_user");
    return saved ? JSON.parse(saved) : {
      uid: "usr-guest-01",
      displayName: "Guest Patron",
      email: "guest@auraparfums.com",
      phone: "+14155550198",
      address: "742 Evergreen Terrace, Beverly Hills, CA 90210",
      isGuest: true
    };
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    // Clean up stale permanent local storage clearance if present
    localStorage.removeItem("aura_is_admin");
    return sessionStorage.getItem("aura_is_admin") === "true";
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("aura_user", JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    if (isAdmin) {
      sessionStorage.setItem("aura_is_admin", "true");
    } else {
      sessionStorage.removeItem("aura_is_admin");
      localStorage.removeItem("aura_is_admin");
    }
  }, [isAdmin]);

  // Listen to Firebase Auth if active
  useEffect(() => {
    if (!isFirebaseActive || !firebaseAuth) return;

    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          displayName: user.displayName || user.email?.split("@")[0] || "Patron",
          email: user.email,
          phone: user.phoneNumber || "",
          isGuest: false
        });
      }
    });

    return unsubscribe;
  }, []);

  const loginWithAdminPasscode = (passcode) => {
    const expected = settings?.adminPasscode || "aura2026";
    if (passcode.trim() === expected.trim()) {
      setIsAdmin(true);
      return { success: true };
    }
    return { success: false, message: "Invalid Atelier Master Passcode" };
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
  };

  const loginUser = async (email, password) => {
    if (isFirebaseActive && firebaseAuth) {
      try {
        const userCred = await signInWithEmailAndPassword(firebaseAuth, email, password);
        setCurrentUser({
          uid: userCred.user.uid,
          displayName: userCred.user.displayName || email.split("@")[0],
          email: userCred.user.email,
          isGuest: false
        });
        return { success: true };
      } catch (err) {
        return { success: false, message: err.message };
      }
    } else {
      // Local mode login simulation
      setCurrentUser({
        uid: `usr-${Date.now()}`,
        displayName: email.split("@")[0],
        email: email,
        phone: "+14155550198",
        address: "742 Evergreen Terrace, Beverly Hills, CA 90210",
        isGuest: false
      });
      return { success: true };
    }
  };

  const registerUser = async (name, email, password) => {
    if (isFirebaseActive && firebaseAuth) {
      try {
        const userCred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        setCurrentUser({
          uid: userCred.user.uid,
          displayName: name,
          email: userCred.user.email,
          isGuest: false
        });
        return { success: true };
      } catch (err) {
        return { success: false, message: err.message };
      }
    } else {
      setCurrentUser({
        uid: `usr-${Date.now()}`,
        displayName: name,
        email: email,
        phone: "+14155550198",
        address: "Boutique Suite, Manhattan, NY",
        isGuest: false
      });
      return { success: true };
    }
  };

  const updateUserProfile = (profileData) => {
    setCurrentUser(prev => ({
      ...prev,
      ...profileData
    }));
  };

  const logoutUser = async () => {
    if (isFirebaseActive && firebaseAuth) {
      await signOut(firebaseAuth);
    }
    setCurrentUser({
      uid: "usr-guest-01",
      displayName: "Guest Patron",
      email: "guest@auraparfums.com",
      isGuest: true
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isAuthModalOpen,
        setIsAuthModalOpen,
        loginWithAdminPasscode,
        logoutAdmin,
        loginUser,
        registerUser,
        logoutUser,
        updateUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
