import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CourseCard } from "@/components/course-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "wouter";
import heroImg from "@assets/7323_1752152530250-30yzAfBJ_1772459664361.jpg";
import { FEATURED_COURSES } from "@/data/courses";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-x-hidden">
      {/* Hero Section */}
      <section className="pt-20 pb-20 px-4 container mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs mb-6 border border-primary/20 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 fill-current" /> Financial discipleship, rooted in the Word
            </div>
            
            <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-4">
              Biblical Financial Courses
            </p>
            
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
              Steward your finances God's way
            </h1>
            
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-lg">
              Learn practical, faith-driven steps to budget wisely, give generously, and build a lasting legacy.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/courses">
                <Button size="lg" className="rounded-full text-lg px-10 h-14 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all hover:-translate-y-1">
                  Begin Your Plan <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="rounded-full text-lg px-10 h-14 border-2 hover:bg-muted">
                  View Course Tracks
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-8 border-background z-10">
              <img 
                src={heroImg} 
                alt="Biblical Stewardship" 
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            <div className="absolute -top-10 -right-10 w-full h-full bg-secondary opacity-20 rounded-[3rem] -z-10 blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-full h-full bg-primary opacity-10 rounded-[3rem] -z-10 blur-3xl"></div>
          </motion.div>
        </div>
      </section>

      {/* Featured Courses Section — 3 only */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Featured Courses</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Start your journey with our most popular tracks — blending Scripture, practical tools, and community accountability.
              </p>
            </div>
            <Link href="/courses">
              <Button variant="link" className="text-primary font-bold text-lg p-0 h-auto whitespace-nowrap">
                View all 6 courses <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURED_COURSES.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/courses">
              <Button size="lg" className="rounded-full px-12 h-14 font-bold shadow-lg hover:-translate-y-1 transition-all">
                Explore All Courses <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
