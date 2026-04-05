import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Heart, Loader2 } from "lucide-react";
import { useActionCTA } from "@/hooks/use-action-cta";

const stats = [
  { value: "5,231+", label: "Testimonies Posted", color: "text-primary" },
  { value: "124K", label: "Lives Encouraged", color: "text-green-600" },
  { value: "78", label: "Countries Represented", color: "text-blue-600" },
  { value: "$2.4M", label: "Combined Debt Cleared", color: "text-amber-600" },
];

const AVATAR_COLORS = [
  "bg-primary/20 text-primary",
  "bg-amber-100 text-amber-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-pink-100 text-pink-700",
];

export default function TestimoniesPage() {
  const { joinCommunity } = useActionCTA();
  const { data: testimonies = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/testimonies"] });

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-foreground text-background py-16 text-center">
        <div className="container mx-auto px-4">
          <MessageSquare className="w-14 h-14 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Testimonies</h1>
          <p className="text-lg text-background/70 max-w-2xl mx-auto">
            Read powerful stories of God's provision, financial miracles, and the transformative power of biblical living
          </p>
        </div>
      </section>

      {/* Stats */}
      <div className="border-b bg-muted/30 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map(s => (
              <div key={s.label}>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonies from DB */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Stories of Faith & Victory</h2>
          <p className="text-muted-foreground">Real testimonies from our community around the world</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : testimonies.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Testimonies Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto">God is still writing amazing stories. Testimonies will be published here as they come in.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonies.map((t: any, idx: number) => {
              const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const initials = t.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
              return (
                <Card key={t.id} className="border border-border/50 shadow-md hover:shadow-lg transition-shadow flex flex-col">
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${avatarColor}`}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{t.name}</p>
                        {t.location && <p className="text-xs text-muted-foreground">{t.location}</p>}
                        <Badge variant="outline" className="text-xs mt-1">{t.category}</Badge>
                      </div>
                    </div>
                    <h3 className="font-bold text-base mb-3 leading-snug">{t.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{t.story}</p>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/30">
                      <Heart className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Praise God</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-primary text-white py-16 text-center">
        <div className="container mx-auto px-4">
          <MessageSquare className="w-10 h-10 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-3">Your Story Matters</h2>
          <p className="text-white/75 max-w-xl mx-auto mb-8">Has God moved in your financial life? Share your testimony and encourage the global community of believers.</p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold px-10 rounded-full" onClick={joinCommunity}>
            Share Your Testimony
          </Button>
        </div>
      </section>
    </div>
  );
}
