import React, { createContext, useContext, useState, useEffect } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import {
  fetchUserProfile,
  registerUser as registerSupabaseUser,
  signInAdmin,
  signInUser,
  signOutUser,
  updateUserProfile as updateSupabaseUserProfile
} from "../services/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    if (isSupabaseConfigured) {
      localStorage.removeItem("aura_user");
      return {
        uid: "usr-guest-01",
        displayName: "Guest Patron",
        email: "guest@auraparfums.com",
        phone: "+14155550198",
        address: "742 Evergreen Terrace, Beverly Hills, CA 90210",
        isGuest: true
      };
    }
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
    localStorage.removeItem("aura_is_admin");
    sessionStorage.removeItem("aura_is_admin");
    return false;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem("aura_user", JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    if (isAdmin) {
      sessionStorage.setItem("aura_is_admin", "true");
    } else {
      sessionStorage.removeItem("aura_is_admin");
      localStorage.removeItem("aura_is_admin");
    }
  }, [isAdmin]);

  // Supabase Auth is the source of truth for customer and administrator sessions.
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setIsAdmin(false);
        setCurrentUser({ uid: "usr-guest-01", displayName: "Guest Patron", email: "guest@auraparfums.com", isGuest: true });
        return;
      }
      const userId = session.user.id;
      setTimeout(() => {
        fetchUserProfile(userId).then(profile => {
          setCurrentUser({ ...profile, uid: profile.id, isGuest: false });
          setIsAdmin(Boolean(profile.isAdmin));
        }).catch(error => console.error("Failed to load Supabase user profile", error));
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginAdmin = async (email, password) => {
    try {
      const profile = await signInAdmin(email, password);
      setCurrentUser({ ...profile, uid: profile.id, isGuest: false });
      setIsAdmin(true);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || "Administrator sign-in failed." };
    }
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    if (isSupabaseConfigured) void logoutUser().catch(error => console.error("Supabase sign-out failed", error));
  };

  const loginUser = async (email, password) => {
    if (isSupabaseConfigured) {
      try {
        const profile = await signInUser(email, password);
        setCurrentUser({ ...profile, uid: profile.id, isGuest: false });
        setIsAdmin(Boolean(profile.isAdmin));
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
    if (isSupabaseConfigured) {
      try {
        const profile = await registerSupabaseUser(name, email, password);
        setCurrentUser({ ...profile, uid: profile.id, isGuest: false });
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
    if (isSupabaseConfigured && currentUser?.uid && !currentUser.isGuest) {
      void updateSupabaseUserProfile(currentUser.uid, {
        displayName: profileData.displayName || currentUser.displayName,
        phone: profileData.phone ?? currentUser.phone,
        address: profileData.address ?? currentUser.address
      }).catch(error => console.error("Failed to save user profile", error));
    }
  };

  const logoutUser = async () => {
    if (isSupabaseConfigured) {
      await signOutUser();
    }
    setIsAdmin(false);
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
        loginAdmin,
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
