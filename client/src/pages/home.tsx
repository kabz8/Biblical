import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CourseCard } from "@/components/course-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImg from "@assets/7323_1752152530250-30yzAfBJ_1772459664361.jpg";
import type { Course } from "@shared/schema";

const COURSES: Course[] = [
  {
    id: 1,
    trackId: 1,
    slug: "stewardship-101",
    title: "Stewardship 101",
    description: "A comprehensive introduction to biblical financial management. Learn what the Bible says about money, resources, and your role as a steward.",
    price: 0,
    level: "beginner",
    duration: "4 hours",
    imageUrl: "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=800&q=80",
    isPublished: true,
  },
  {
    id: 2,
    trackId: 1,
    slug: "budgeting-masterclass",
    title: "Budgeting Masterclass",
    description: "Take control of your cash flow with practical, Bible-based budgeting tools. Build a spending plan that reflects your values and honours God.",
    price: 9900,
    level: "intermediate",
    duration: "6 hours",
    imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80",
    isPublished: true,
  },
  {
    id: 3,
    trackId: 2,
    slug: "kingdom-investing",
    title: "Kingdom Investing Principles",
    description: "Learn how to grow your wealth while keeping an eternal perspective. Biblical wisdom for the stock market, real estate, and business.",
    price: 14900,
    level: "intermediate",
    duration: "8 hours",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    isPublished: true,
  },
  {
    id: 4,
    trackId: 2,
    slug: "retirement-gods-way",
    title: "Retirement God's Way",
    description: "Plan for the future with faith and wisdom. How to save, invest, and leave a godly legacy for the next generation.",
    price: 12900,
    level: "advanced",
    duration: "5 hours",
    imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80",
    isPublished: true,
  },
  {
    id: 5,
    trackId: 3,
    slug: "debt-freedom-plan",
    title: "The Debt Freedom Plan",
    description: "A proven, Scripture-backed system for eliminating all consumer debt and achieving true financial freedom in Christ.",
    price: 7900,
    level: "beginner",
    duration: "6 hours",
    imageUrl: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=80",
    isPublished: true,
  },
  {
    id: 6,
    trackId: 4,
    slug: "radical-generosity",
    title: "Radical Generosity",
    description: "Experience the transforming power of giving. Learn the principles of tithing, offerings, and how generosity unlocks God's blessing.",
    price: 0,
    level: "beginner",
    duration: "3 hours",
    imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80",
    isPublished: true,
  },
];

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
              <Button size="lg" className="rounded-full text-lg px-10 h-14 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all hover:-translate-y-1">
                Begin Your Plan <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full text-lg px-10 h-14 border-2 hover:bg-muted">
                View Course Tracks
              </Button>
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
            {/* Decorative background shape from logo colors */}
            <div className="absolute -top-10 -right-10 w-full h-full bg-secondary opacity-20 rounded-[3rem] -z-10 blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-full h-full bg-primary opacity-10 rounded-[3rem] -z-10 blur-3xl"></div>
          </motion.div>
        </div>
      </section>

      {/* Course Tracks Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Focused Track Learning</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">Six focused tracks blend Scripture, practical exercises, and community to provide a clear path to biblical stewardship.</p>
            </div>
            <Button variant="link" className="text-primary font-bold text-lg p-0 h-auto">Explore all tracks <ArrowRight className="ml-2 w-5 h-5" /></Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {COURSES.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
