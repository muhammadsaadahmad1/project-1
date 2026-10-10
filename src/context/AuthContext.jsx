import React, { createContext, useContext, useState, useEffect } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import {
  fetchAdminProfile,
  signInAdmin,
  signOutAdmin,
  verifyCurrentAdmin
} from "../services/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let active = true;
    let requestId = 0;
    const applySession = async (session) => {
      const currentRequest = ++requestId;
      if (!session?.user) {
        if (active && currentRequest === requestId) {
          setCurrentAdmin(null);
          setAuthLoading(false);
        }
        return;
      }
      try {
        const profile = await fetchAdminProfile(session.user.id);
        if (active && currentRequest === requestId) {
          setCurrentAdmin(profile.role === "admin" ? profile : null);
        }
      } catch (error) {
        if (active && currentRequest === requestId) {
          setCurrentAdmin(null);
          console.error("Failed to load admin profile", error);
        }
      } finally {
        if (active && currentRequest === requestId) setAuthLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });
    void supabase.auth.getSession().then(({ data }) => applySession(data.session));

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const loginAdmin = async (identifier, password) => {
    try {
      const profile = await signInAdmin(identifier, password);
      setCurrentAdmin(profile);
      return { success: true };
    } catch (error) {
      return { success: false, message: "Invalid credentials or access denied." };
    }
  };

  const logoutAdmin = async () => {
    await signOutAdmin();
    setCurrentAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentAdmin,
        authLoading,
        loginAdmin,
        verifyCurrentAdmin,
        logoutAdmin
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
