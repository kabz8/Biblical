import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useEnrollments } from "@/hooks/use-enrollments";
import { useProgress } from "@/hooks/use-progress";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, BookOpen, CheckCircle } from "lucide-react";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments();
  const { data: progressList } = useProgress();

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

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content - Active Courses */}
        <div className="lg:col-span-2 space-y-8">
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

        {/* Sidebar - Stats & Achievements */}
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
        </div>
      </div>
    </div>
  );
}
