import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export type AppUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl?: string | null;
};

function toAppUser(u: SupabaseUser): AppUser {
  const meta = u.user_metadata || {};
  return {
    id: u.id,
    email: u.email ?? "",
    firstName: meta.first_name || meta.firstName || null,
    lastName: meta.last_name || meta.lastName || null,
    profileImageUrl: meta.avatar_url || null,
  };
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Initialise from existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? toAppUser(session.user) : null);
      setIsLoading(false);
    });

    // Keep in sync with Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? toAppUser(session.user) : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login({ email, password }: { email: string; password: string }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      throw error;
    }
    const appUser = toAppUser(data.user);
    setUser(appUser);
    return appUser;
  }

  async function register({ email, password, firstName, lastName }: {
    email: string; password: string; firstName: string; lastName: string;
  }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName } },
    });
    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
      throw error;
    }
    if (!data.user) {
      toast({ title: "Check your email", description: "Please verify your email address to continue." });
      return null;
    }
    const appUser = toAppUser(data.user);
    setUser(appUser);
    // Sync to our public.users table
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        await fetch("/api/auth/sync", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
      }
    } catch { /* non-fatal */ }
    return appUser;
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    isLoggingIn: false,
    isRegistering: false,
    isLoggingOut: false,
  };
}
