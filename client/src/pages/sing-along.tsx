import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic2, Play, Music2, Users, Heart, Star, Upload } from "lucide-react";
import { useActionCTA } from "@/hooks/use-action-cta";

const liveSessions = [
  { id: 1, title: "Sunday Morning Praise", host: "Worship Team", participants: 234, genre: "Contemporary", status: "Live", time: "Now" },
  { id: 2, title: "Hymns & Classics", host: "Sister Agnes", participants: 89, genre: "Traditional", status: "Starting Soon", time: "In 15 min" },
  { id: 3, title: "Gospel Choir Night", host: "Grace Choir", participants: 312, genre: "Gospel", status: "Live", time: "Now" },
];

const tips = [
  { icon: <Heart className="w-5 h-5 text-primary" />, title: "Sing from the Heart", desc: "Worship is about intimacy with God, not performance. Focus on the meaning of the words you sing." },
  { icon: <Users className="w-5 h-5 text-primary" />, title: "Join Live Sessions", desc: "Singing together amplifies your worship experience and builds community bonds." },
  { icon: <Star className="w-5 h-5 text-primary" />, title: "Learn New Songs", desc: "Regularly adding new songs enriches your personal worship and keeps your faith vibrant." },
  { icon: <Music2 className="w-5 h-5 text-primary" />, title: "Use the Toolkit", desc: "Access chord charts and backing tracks to improve your musical ability and lead others in worship." },
];

export default function SingAlong() {
  const { joinSession, joinCommunity } = useActionCTA();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-foreground text-background py-16 text-center">
        <div className="container mx-auto px-4">
          <Mic2 className="w-14 h-14 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sing Along</h1>
          <p className="text-lg text-background/70 max-w-2xl mx-auto">
            Lift your voice in praise and worship with our global community of believers
          </p>
        </div>
      </section>

      {/* Live Sessions */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Live Worship Sessions</h2>
          <p className="text-muted-foreground">Sing together with others right now</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {liveSessions.map((s) => (
            <Card key={s.id} className="border border-border/50 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <div className="h-1 w-full bg-primary" />
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={`text-xs text-white ${s.status === "Live" ? "bg-red-500" : "bg-amber-500"}`}>{s.status}</Badge>
                  <span className="text-xs text-muted-foreground">{s.time}</span>
                </div>
                <h3 className="font-bold text-lg mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground mb-1">Host: {s.host}</p>
                <Badge variant="outline" className="text-xs mb-4">{s.genre}</Badge>
                <div className="flex items-center gap-2 mb-5 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />{s.participants} singing now
                </div>
                <Button className="w-full font-bold rounded-full" onClick={() => joinSession(s.title)}>
                  <Play className="w-4 h-4 mr-2" />Join Session
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Song Library — Coming Soon */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Song Library</h2>
            <p className="text-muted-foreground">Songs and lyrics will appear here once uploaded</p>
          </div>
          <div className="max-w-lg mx-auto">
            <Card className="border-2 border-dashed border-border/50 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Songs Coming Soon</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  The song library is being prepared. Once songs are uploaded by the admin, they will appear here with lyrics, chord charts, and backing tracks.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Worship Tips */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Worship Tips</h2>
          <p className="text-muted-foreground">Enhance your worship experience with these insights</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {tips.map((tip) => (
            <div key={tip.title} className="flex gap-4 p-6 border border-border/50 rounded-2xl bg-card">
              <div className="mt-0.5">{tip.icon}</div>
              <div>
                <h4 className="font-bold mb-1">{tip.title}</h4>
                <p className="text-sm text-muted-foreground">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white py-16 text-center">
        <div className="container mx-auto px-4">
          <Mic2 className="w-10 h-10 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-3">Raise Your Voice in Praise</h2>
          <p className="text-white/75 max-w-xl mx-auto mb-8">Join thousands of believers lifting their voices together in worship of our great God.</p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold px-10 rounded-full" onClick={joinCommunity}>
            Start Singing
          </Button>
        </div>
      </section>
    </div>
  );
}
