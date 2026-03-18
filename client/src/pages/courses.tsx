import { CourseCard } from "@/components/course-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Filter } from "lucide-react";
import { useState } from "react";
import { ALL_COURSES } from "@/data/courses";

const LEVELS = ["all", "beginner", "intermediate", "advanced"] as const;
type Level = typeof LEVELS[number];

const TRACKS = [
  { id: "all", label: "All Tracks" },
  { id: 1, label: "Foundations" },
  { id: 2, label: "Investing" },
  { id: 3, label: "Debt Freedom" },
  { id: 4, label: "Generosity" },
];

const STATS = [
  { value: "6", label: "Courses" },
  { value: "32+", label: "Hours of Content" },
  { value: "12,000+", label: "Students" },
  { value: "2", label: "Free Courses" },
];

export default function CoursesPage() {
  const [level, setLevel] = useState<Level>("all");
  const [track, setTrack] = useState<number | "all">("all");

  const filtered = ALL_COURSES.filter(c => {
    const levelMatch = level === "all" || c.level === level;
    const trackMatch = track === "all" || c.trackId === track;
    return levelMatch && trackMatch;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-foreground text-background py-16 text-center">
        <div className="container mx-auto px-4">
          <BookOpen className="w-14 h-14 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">All Courses</h1>
          <p className="text-lg text-background/70 max-w-2xl mx-auto">
            Practical, faith-driven financial education — at every stage of your stewardship journey
          </p>
        </div>
      </section>

      {/* Stats */}
      <div className="border-b bg-muted/30 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(s => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-10">
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground shrink-0">
            <Filter className="w-4 h-4" /> Filter by:
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex flex-wrap gap-2">
              {LEVELS.map(l => (
                <Button
                  key={l}
                  size="sm"
                  variant={level === l ? "default" : "outline"}
                  className="rounded-full capitalize font-bold"
                  onClick={() => setLevel(l)}
                >
                  {l === "all" ? "All Levels" : l}
                </Button>
              ))}
            </div>

            <div className="w-px bg-border hidden sm:block" />

            <div className="flex flex-wrap gap-2">
              {TRACKS.map(t => (
                <Button
                  key={String(t.id)}
                  size="sm"
                  variant={track === t.id ? "default" : "outline"}
                  className="rounded-full font-bold"
                  onClick={() => setTrack(t.id as number | "all")}
                >
                  {t.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="ml-auto text-sm text-muted-foreground shrink-0">
            {filtered.length} course{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Course Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No courses match your filters.</p>
            <Button variant="link" className="mt-2" onClick={() => { setLevel("all"); setTrack("all"); }}>
              Clear filters
            </Button>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-primary text-white py-16 text-center mt-8">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-3">Not sure where to start?</h2>
          <p className="text-white/75 max-w-xl mx-auto mb-8">
            Begin with Stewardship 101 — it's free, foundational, and sets the biblical framework for everything else.
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold px-12 rounded-full">
            Start Free: Stewardship 101
          </Button>
        </div>
      </section>
    </div>
  );
}
