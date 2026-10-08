import React, { createContext, useContext, useState, useEffect } from "react";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import {
  fetchUserProfile,
  registerUser as registerSupabaseUser,
  signInAdmin,
  signInUser,
  signOutUser,
  verifyCurrentAdmin,
  resendVerificationCode,
  requestContactVerification,
  verifyAuthOtp,
  updateUserProfile as updateSupabaseUserProfile
} from "../services/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let active = true;
    let requestId = 0;
    const applySession = async (session) => {
      const currentRequest = ++requestId;
      if (!session?.user) {
        if (active && currentRequest === requestId) {
          setCurrentUser(null);
          setAuthLoading(false);
        }
        return;
      }
      try {
        const profile = await fetchUserProfile(session.user.id);
        if (active && currentRequest === requestId) setCurrentUser(profile);
      } catch (error) {
        if (active && currentRequest === requestId) {
          setCurrentUser(null);
          console.error("Failed to load user profile", error);
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
      setCurrentUser(profile);
      return { success: true };
    } catch (error) {
      return { success: false, message: "Invalid credentials or access denied." };
    }
  };

  const loginUser = async (identifier, password) => {
    try {
      const profile = await signInUser(identifier, password);
      setCurrentUser(profile);
      return { success: true };
    } catch (error) {
      return { success: false, message: "Unable to sign in. Check your details and try again." };
    }
  };

  const registerUser = async ({ email, password }) => {
    try {
      const registration = await registerSupabaseUser(email, password);
      if (registration.profile) setCurrentUser(registration.profile);
      return { success: true, confirmationRequired: registration.confirmationRequired };
    } catch (error) {
      const message = error.message || "Unable to create your account.";
      return {
        success: false,
        message: /email address not authorized/i.test(message)
          ? "Email delivery is limited to project-team addresses. Configure custom SMTP in Supabase to send codes to customers."
          : message
      };
    }
  };

  const updateUserProfile = async (profileData) => {
    if (!currentUser) return;
    const updatedProfile = {
      ...currentUser,
      displayName: profileData.displayName ?? currentUser.displayName,
      address: profileData.address ?? currentUser.address
    };
    setCurrentUser(updatedProfile);
    await updateSupabaseUserProfile(currentUser.id, {
      displayName: updatedProfile.displayName,
      address: updatedProfile.address
    });
  };

  const logoutUser = async () => {
    await signOutUser();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authLoading,
        loginAdmin,
        loginUser,
        registerUser,
        verifyCurrentAdmin,
        logoutUser,
        updateUserProfile,
        requestContactVerification,
        resendVerificationCode,
        verifyAuthOtp
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
