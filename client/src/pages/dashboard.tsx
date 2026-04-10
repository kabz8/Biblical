import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useEnrollments } from "@/hooks/use-enrollments";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: enrollments = [], isLoading: enrollmentsLoading, isError: enrollmentsError, error: enrollmentsErrObj } = useEnrollments();
  const { data: payments = [], isError: paymentsError, error: paymentsErrObj } = useQuery<any[]>({ queryKey: ["/api/me/payments"] });
  const { data: tasks = [], isError: tasksError, error: tasksErrObj } = useQuery<any[]>({ queryKey: ["/api/me/tasks"] });
  const { data: profile, isError: profileError, error: profileErrObj } = useQuery<any>({ queryKey: ["/api/me/profile"] });

  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", locale: "en", theme: "system" });
  const [prayerForm, setPrayerForm] = useState({ title: "", content: "" });
  const [testimonyForm, setTestimonyForm] = useState({ title: "", story: "", category: "General", location: "" });

  useEffect(() => {
    if (!authLoading && !user) setLocation("/auth?next=%2Fdashboard");
  }, [authLoading, user, setLocation]);

  useEffect(() => {
    if (!profile) return;
    setProfileForm({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      locale: profile.locale || "en",
      theme: profile.theme || "system",
    });
  }, [profile]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/me/profile", profileForm);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me/profile"] });
      toast({ title: "Profile saved" });
    },
    onError: (e: any) => toast({ title: "Profile update failed", description: e?.message, variant: "destructive" }),
  });

  const submitPrayer = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/me/prayers", prayerForm);
      return res.json();
    },
    onSuccess: () => {
      setPrayerForm({ title: "", content: "" });
      toast({ title: "Prayer submitted" });
    },
    onError: (e: any) => toast({ title: "Prayer submission failed", description: e?.message, variant: "destructive" }),
  });

  const submitTestimony = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/me/testimonies", testimonyForm);
      return res.json();
    },
    onSuccess: () => {
      setTestimonyForm({ title: "", story: "", category: "General", location: "" });
      toast({ title: "Testimony submitted" });
    },
    onError: (e: any) => toast({ title: "Testimony submission failed", description: e?.message, variant: "destructive" }),
  });

  const completeTask = useMutation({
    mutationFn: async (taskId: number) => apiRequest("PATCH", `/api/me/tasks/${taskId}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me/tasks"] });
      toast({ title: "Task marked complete" });
    },
    onError: (e: any) => toast({ title: "Task update failed", description: e?.message, variant: "destructive" }),
  });

  if (authLoading || !user) return <div className="p-10 text-center">Checking session...</div>;
  if (enrollmentsLoading) return <div className="p-10 text-center">Loading dashboard...</div>;

  const errors = [
    enrollmentsError ? (enrollmentsErrObj as Error)?.message : null,
    paymentsError ? (paymentsErrObj as Error)?.message : null,
    tasksError ? (tasksErrObj as Error)?.message : null,
    profileError ? (profileErrObj as Error)?.message : null,
  ].filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-black">Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {user.firstName || user.email}</p>
      </div>

      {errors.length > 0 && (
        <Card className="border-red-300">
          <CardHeader><CardTitle className="text-red-600 text-lg">Some data failed to load</CardTitle></CardHeader>
          <CardContent className="text-sm text-red-700 space-y-1">
            {errors.map((err, idx) => <p key={idx}>{err}</p>)}
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Enrolled Courses</p><p className="text-2xl font-black">{enrollments.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Assigned Tasks</p><p className="text-2xl font-black">{tasks.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Payments</p><p className="text-2xl font-black">{payments.length}</p></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>First Name</Label><Input value={profileForm.firstName} onChange={e => setProfileForm(f => ({ ...f, firstName: e.target.value }))} /></div>
            <div><Label>Last Name</Label><Input value={profileForm.lastName} onChange={e => setProfileForm(f => ({ ...f, lastName: e.target.value }))} /></div>
            <div><Label>Locale</Label><Input value={profileForm.locale} onChange={e => setProfileForm(f => ({ ...f, locale: e.target.value }))} /></div>
            <Button onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending}>{saveProfile.isPending ? "Saving..." : "Save Profile"}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">My Tasks</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {tasks.length === 0 ? <p className="text-sm text-muted-foreground">No tasks assigned.</p> : tasks.map((t: any) => (
              <div key={t.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{t.title}</p>
                  <span className="text-xs border px-2 py-0.5 rounded-full">{t.status}</span>
                </div>
                {t.description ? <p className="text-sm text-muted-foreground mt-1">{t.description}</p> : null}
                {t.status !== "completed" && (
                  <Button size="sm" className="mt-2" onClick={() => completeTask.mutate(t.id)} disabled={completeTask.isPending}>Mark Complete</Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Submit Prayer Request</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Title</Label><Input value={prayerForm.title} onChange={e => setPrayerForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Prayer</Label><Textarea value={prayerForm.content} onChange={e => setPrayerForm(f => ({ ...f, content: e.target.value }))} /></div>
            <Button onClick={() => submitPrayer.mutate()} disabled={submitPrayer.isPending || !prayerForm.title || !prayerForm.content}>
              {submitPrayer.isPending ? "Submitting..." : "Submit Prayer"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Share Testimony</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Title</Label><Input value={testimonyForm.title} onChange={e => setTestimonyForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Category</Label><Input value={testimonyForm.category} onChange={e => setTestimonyForm(f => ({ ...f, category: e.target.value }))} /></div>
            <div><Label>Location</Label><Input value={testimonyForm.location} onChange={e => setTestimonyForm(f => ({ ...f, location: e.target.value }))} /></div>
            <div><Label>Story</Label><Textarea value={testimonyForm.story} onChange={e => setTestimonyForm(f => ({ ...f, story: e.target.value }))} /></div>
            <Button onClick={() => submitTestimony.mutate()} disabled={submitTestimony.isPending || !testimonyForm.title || !testimonyForm.story}>
              {submitTestimony.isPending ? "Submitting..." : "Submit Testimony"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
