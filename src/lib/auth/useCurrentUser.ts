"use client";

import { useEffect, useState } from "react";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: "BUYER" | "FACTORY" | "ADMIN";
  isFactory: boolean;
  isBuyer: boolean;
  avatarUrl?: string | null;
  factoryProfile?: {
    id: string;
    slug: string;
    nameAr: string;
    verificationStatus: string;
    rating: number;
  } | null;
  buyerProfile?: {
    id: string;
    companyName: string;
    businessType: string;
  } | null;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setUser(data.user || null);
          }
        }
      } catch (err) {
        console.error("Failed to load authenticated user:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isFactory: Boolean(user?.isFactory || user?.factoryProfile || user?.role === "FACTORY"),
    isBuyer: Boolean(user?.isBuyer || user?.buyerProfile || user?.role === "BUYER"),
    isAdmin: user?.role === "ADMIN",
    factoryProfile: user?.factoryProfile || null,
  };
}
