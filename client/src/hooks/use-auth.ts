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
  role?: string | null;
};

function toAppUser(u: SupabaseUser): AppUser {
  const meta = u.user_metadata || {};
  return {
    id: u.id,
    email: u.email ?? "",
    firstName: meta.first_name || meta.firstName || null,
    lastName: meta.last_name || meta.lastName || null,
    profileImageUrl: meta.avatar_url || null,
    role: meta.role || null,
  };
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  async function fetchServerUserRole(): Promise<Partial<AppUser> | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return null;
      const res = await fetch("/api/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) return null;
      const data = await res.json();
      return {
        role: data.role ?? null,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        email: data.email ?? "",
      };
    } catch {
      return null;
    }
  }

  useEffect(() => {
    // Initialise from existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const baseUser = toAppUser(session.user);
      const serverUser = await fetchServerUserRole();
      setUser({ ...baseUser, ...serverUser });
      setIsLoading(false);
    });

    // Keep in sync with Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null);
        return;
      }
      const baseUser = toAppUser(session.user);
      const serverUser = await fetchServerUserRole();
      setUser({ ...baseUser, ...serverUser });
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
    const serverUser = await fetchServerUserRole();
    const resolvedUser = { ...appUser, ...serverUser };
    setUser(resolvedUser);
    return resolvedUser;
  }

  async function register({ email, password, firstName, lastName }: {
    email: string; password: string; firstName: string; lastName: string;
  }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName, role: "student" } },
    });
    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
      throw error;
    }
    // If email confirmation is enabled, Supabase returns no session until the user confirms.
    if (!data.session) {
      setUser(null);
      toast({
        title: "Registration successful",
        description: "Check your email and click the confirmation link to activate your account.",
      });
      return null;
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
