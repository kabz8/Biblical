import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useEnrollments } from "@/hooks/use-enrollments";
import { useProgress } from "@/hooks/use-progress";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, BookOpen, ReceiptText, Settings, Send, HeartHandshake } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments();
  const { data: progressList } = useProgress();
  const { data: payments = [] } = useQuery<any[]>({ queryKey: ["/api/me/payments"] });
  const { data: tasks = [] } = useQuery<any[]>({ queryKey: ["/api/me/tasks"] });
  const { data: profile } = useQuery<any>({ queryKey: ["/api/me/profile"] });
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", locale: "en", theme: "system" });
  const [prayerForm, setPrayerForm] = useState({ title: "", content: "" });
  const [testimonyForm, setTestimonyForm] = useState({ title: "", story: "", category: "General", location: "" });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        locale: profile.locale || "en",
        theme: profile.theme || "system",
      });
    }
  }, [profile]);

  const saveProfile = useMutation({
    mutationFn: () =>
      fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
        credentials: "include",
      }).then(async (r) => {
        if (!r.ok) throw new Error((await r.text()) || "Failed to save profile");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me/profile"] });
      toast({ title: "Profile updated" });
    },
    onError: (e: any) => toast({ title: "Profile update failed", description: e.message, variant: "destructive" }),
  });

  const submitPrayer = useMutation({
    mutationFn: () =>
      fetch("/api/me/prayers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prayerForm),
        credentials: "include",
      }).then(async (r) => {
        if (!r.ok) throw new Error((await r.text()) || "Failed to submit prayer");
        return r.json();
      }),
    onSuccess: () => {
      setPrayerForm({ title: "", content: "" });
      toast({ title: "Prayer submitted", description: "Your request has been received." });
    },
    onError: (e: any) => toast({ title: "Prayer submission failed", description: e.message, variant: "destructive" }),
  });

  const submitTestimony = useMutation({
    mutationFn: () =>
      fetch("/api/me/testimonies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testimonyForm),
        credentials: "include",
      }).then(async (r) => {
        if (!r.ok) throw new Error((await r.text()) || "Failed to submit testimony");
        return r.json();
      }),
    onSuccess: () => {
      setTestimonyForm({ title: "", story: "", category: "General", location: "" });
      toast({ title: "Testimony submitted", description: "Thank you for sharing your testimony." });
    },
    onError: (e: any) => toast({ title: "Testimony submission failed", description: e.message, variant: "destructive" }),
  });

  const completeTask = useMutation({
    mutationFn: (taskId: number) =>
      fetch(`/api/me/tasks/${taskId}/complete`, {
        method: "PATCH",
        credentials: "include",
      }).then(async (r) => {
        if (!r.ok) throw new Error((await r.text()) || "Failed to complete task");
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me/tasks"] });
      toast({ title: "Task marked complete" });
    },
    onError: (e: any) => toast({ title: "Task update failed", description: e.message, variant: "destructive" }),
  });

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/auth");
    }
  }, [authLoading, user, setLocation]);

  if (authLoading || !user) {
    return <div className="p-12 text-center">Checking session...</div>;
  }

  if (enrollmentsLoading) {
    return <div className="p-12 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.firstName}! 👋</h1>
        <p className="text-muted-foreground text-lg">Pick up right where you left off.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-card border rounded-2xl p-5 sticky top-24">
            <h3 className="font-bold text-lg mb-4">Dashboard Operations</h3>
            <div className="space-y-2">
              <a href="#learning" className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">My Learning Path</a>
              <a href="#payments" className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">Payment History</a>
              <a href="#profile-settings" className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">Profile Settings</a>
              <a href="#prayer-submit" className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">Submit Prayer Request</a>
              <a href="#testimony-submit" className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">Share Testimony</a>
              <a href="#my-tasks" className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">My Tasks</a>
            </div>
          </div>
        </div>

        {/* Main Content - Active Courses */}
        <div id="learning" className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> My Learning Path
          </h2>
          
          {enrollments?.length === 0 ? (
            <div className="bg-card border rounded-2xl p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <PlayCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-6">You haven't enrolled in any courses.</p>
              <Link href="/">
                <a className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
                  Browse Courses
                </a>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {enrollments?.map((enrollment: any) => {
                const course = enrollment.course;
                // Calculate progress (mocked logic if lessons aren't fully loaded here)
                // In a real app, backend would send { completedLessons, totalLessons }
                const progressValue = 35; // mock 35%
                
                return (
                  <div key={enrollment.id} className="bg-card border rounded-2xl p-6 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
                    <div className="w-full sm:w-48 aspect-video rounded-xl overflow-hidden bg-muted shrink-0">
                      <img src={course.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80"} alt={course.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                      <div className="mt-auto pt-4">
                        <div className="flex justify-between text-sm mb-2 font-medium">
                          <span>Progress</span>
                          <span>{progressValue}%</span>
                        </div>
                        <Progress value={progressValue} className="h-2" />
                      </div>
                      <div className="mt-6 flex justify-end">
                        <Link href={`/learn/${course.slug}`}>
                          <a className="inline-flex h-10 items-center justify-center rounded-full bg-secondary/10 px-6 text-sm font-semibold text-secondary transition-colors hover:bg-secondary/20">
                            Continue Learning <PlayCircle className="w-4 h-4 ml-2" />
                          </a>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar - Stats & Extras */}
        <div className="space-y-8">
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-6 border-b pb-4">Learning Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Enrolled Courses</span>
                <span className="font-bold text-xl">{enrollments?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Lessons Completed</span>
                <span className="font-bold text-xl">{progressList?.length || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-brand rounded-2xl p-6 text-white shadow-xl shadow-primary/20">
            <h3 className="font-bold text-lg mb-2 text-white">Join the Community</h3>
            <p className="text-white/80 text-sm mb-6">Connect with other students, ask questions, and share your wins.</p>
            <button className="w-full bg-white text-primary font-bold py-3 rounded-xl hover:bg-white/90 transition-colors">
              Go to Discord
            </button>
          </div>

          <div id="payments" className="bg-card border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ReceiptText className="w-5 h-5 text-primary" /> Payment History</h3>
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payment records yet.</p>
            ) : (
              <div className="space-y-3">
                {payments.slice(0, 5).map((p: any) => (
                  <div key={p.id} className="rounded-xl border border-border/50 p-3 text-sm">
                    <p className="font-semibold">{p.courseTitle || `Course #${p.courseId}`}</p>
                    <p className="text-muted-foreground">
                      {(Number(p.amount || 0) / 100).toFixed(2)} {p.currency} · {p.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mt-10">
        <div id="profile-settings" className="bg-card border rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> Profile Settings</h3>
          <div className="space-y-3">
            <div><Label>First Name</Label><Input value={profileForm.firstName} onChange={(e) => setProfileForm(f => ({ ...f, firstName: e.target.value }))} /></div>
            <div><Label>Last Name</Label><Input value={profileForm.lastName} onChange={(e) => setProfileForm(f => ({ ...f, lastName: e.target.value }))} /></div>
            <div><Label>Locale</Label><Input value={profileForm.locale} onChange={(e) => setProfileForm(f => ({ ...f, locale: e.target.value }))} /></div>
            <div><Label>Theme</Label><Input value={profileForm.theme} onChange={(e) => setProfileForm(f => ({ ...f, theme: e.target.value }))} /></div>
            <Button onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending} className="rounded-full">
              {saveProfile.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>

        <div id="prayer-submit" className="bg-card border rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Send className="w-5 h-5 text-primary" /> Submit Prayer Request</h3>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={prayerForm.title} onChange={(e) => setPrayerForm(f => ({ ...f, title: e.target.value }))} placeholder="Prayer for family" /></div>
            <div><Label>Prayer</Label><Textarea value={prayerForm.content} onChange={(e) => setPrayerForm(f => ({ ...f, content: e.target.value }))} className="min-h-[120px]" /></div>
            <Button onClick={() => submitPrayer.mutate()} disabled={submitPrayer.isPending || !prayerForm.title || !prayerForm.content} className="rounded-full">
              {submitPrayer.isPending ? "Submitting..." : "Submit Prayer"}
            </Button>
          </div>
        </div>

        <div id="testimony-submit" className="bg-card border rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><HeartHandshake className="w-5 h-5 text-primary" /> Share Testimony</h3>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={testimonyForm.title} onChange={(e) => setTestimonyForm(f => ({ ...f, title: e.target.value }))} placeholder="God made a way" /></div>
            <div><Label>Category</Label><Input value={testimonyForm.category} onChange={(e) => setTestimonyForm(f => ({ ...f, category: e.target.value }))} /></div>
            <div><Label>Location</Label><Input value={testimonyForm.location} onChange={(e) => setTestimonyForm(f => ({ ...f, location: e.target.value }))} /></div>
            <div><Label>Story</Label><Textarea value={testimonyForm.story} onChange={(e) => setTestimonyForm(f => ({ ...f, story: e.target.value }))} className="min-h-[120px]" /></div>
            <Button onClick={() => submitTestimony.mutate()} disabled={submitTestimony.isPending || !testimonyForm.title || !testimonyForm.story} className="rounded-full">
              {submitTestimony.isPending ? "Submitting..." : "Submit Testimony"}
            </Button>
          </div>
        </div>

        <div id="my-tasks" className="bg-card border rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4">My Assigned Tasks</h3>
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks assigned yet.</p>
          ) : (
            <div className="space-y-3">
              {tasks.map((t: any) => (
                <div key={t.id} className="rounded-xl border border-border/50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{t.title}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full border">{t.status}</span>
                  </div>
                  {t.description ? <p className="text-sm text-muted-foreground mt-1">{t.description}</p> : null}
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.courseTitle ? `Course: ${t.courseTitle}` : "General task"}
                    {t.dueAt ? ` · Due: ${new Date(t.dueAt).toLocaleString()}` : ""}
                  </p>
                  {t.status !== "completed" && (
                    <Button size="sm" className="mt-3 rounded-full" onClick={() => completeTask.mutate(t.id)} disabled={completeTask.isPending}>
                      Mark Complete
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
