import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import logoPng from "@assets/logo_1772459405886.png";
import { getAuthToken } from "@/lib/supabase";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[0-9]/, "Password must include a number")
    .regex(/[^A-Za-z0-9]/, "Password must include a symbol"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const { user, login, register } = useAuth();
  const [, setLocation] = useLocation();
  const nextPath = (() => {
    if (typeof window === "undefined") return "/dashboard";
    const p = new URLSearchParams(window.location.search).get("next");
    return p && p.startsWith("/") ? p : "/dashboard";
  })();
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resolvingRedirect, setResolvingRedirect] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Always call hooks first — redirect as a side effect
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "", firstName: "", lastName: "" },
  });

  useEffect(() => {
    let cancelled = false;
    async function resolveRedirect() {
      if (!user) return;
      setResolvingRedirect(true);
      try {
        const token = await getAuthToken();
        if (!token) {
          if (!cancelled) setLocation("/dashboard");
          return;
        }
        const res = await fetch("/api/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!res.ok) {
          if (!cancelled) setLocation("/dashboard");
          return;
        }
        const serverUser = await res.json();
        if (!cancelled) {
          const role = String(serverUser?.role || "").toLowerCase();
          if (role === "admin" || role === "super_admin" || role === "super-admin" || role === "superadmin") {
            setLocation("/admin");
          } else {
            setLocation(nextPath);
          }
        }
      } catch {
        if (!cancelled) setLocation(nextPath);
      } finally {
        if (!cancelled) setResolvingRedirect(false);
      }
    }
    resolveRedirect();
    return () => {
      cancelled = true;
    };
  }, [user, setLocation, nextPath]);

  if (user || resolvingRedirect) return null;

  async function handleLoginSubmit(data: { email: string; password: string }) {
    setLoginError(null);
    try {
      await login(data);
    } catch (err: any) {
      setLoginError(err?.message || "Login failed. Please try again.");
    }
  }

  async function handleRegisterSubmit(data: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
  }) {
    setRegisterError(null);
    try {
      const { confirmPassword, ...payload } = data;
      await register(payload);
    } catch (err: any) {
      setRegisterError(err?.message || "Registration failed. Please try again.");
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-b from-muted/40 to-background">
      <Card className="w-full max-w-md shadow-xl border border-border/60">
        <CardHeader className="text-center space-y-3 pb-6">
          <img src={logoPng} alt="Logo" className="h-12 mx-auto" />
          <h1 className="text-2xl font-bold tracking-tight">Welcome to Biblical</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to continue your learning journey or create a new account.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showLoginPassword ? "text" : "password"} {...field} />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                              onClick={() => setShowLoginPassword((v) => !v)}
                              aria-label={showLoginPassword ? "Hide password" : "Show password"}
                            >
                              {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-11 text-lg font-bold bg-primary hover:bg-primary/90 rounded-full">
                    {loginForm.formState.isSubmitting ? "Logging in..." : "Login"}
                  </Button>
                  {loginError && <p className="text-sm text-destructive">{loginError}</p>}
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl><Input placeholder="John" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl><Input placeholder="Doe" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showRegisterPassword ? "text" : "password"} {...field} />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                              onClick={() => setShowRegisterPassword((v) => !v)}
                              aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                            >
                              {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type={showConfirmPassword ? "text" : "password"} {...field} />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                              onClick={() => setShowConfirmPassword((v) => !v)}
                              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Password must include lowercase, uppercase, number, and symbol (minimum 6 characters).
                  </p>
                  <Button type="submit" className="w-full h-11 text-lg font-bold bg-primary hover:bg-primary/90 rounded-full">
                    {registerForm.formState.isSubmitting ? "Creating account..." : "Create Account"}
                  </Button>
                  {registerError && <p className="text-sm text-destructive">{registerError}</p>}
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
