import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic2, Music2, Users, Heart, Star, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useActionCTA } from "@/hooks/use-action-cta";

const tips = [
  { icon: <Heart className="w-5 h-5 text-primary" />, title: "Sing from the Heart", desc: "Worship is about intimacy with God, not performance. Focus on the meaning of the words you sing." },
  { icon: <Users className="w-5 h-5 text-primary" />, title: "Join Live Sessions", desc: "Singing together amplifies your worship experience and builds community bonds." },
  { icon: <Star className="w-5 h-5 text-primary" />, title: "Learn New Songs", desc: "Regularly adding new songs enriches your personal worship and keeps your faith vibrant." },
  { icon: <Music2 className="w-5 h-5 text-primary" />, title: "Use the Toolkit", desc: "Access chord charts and backing tracks to improve your musical ability and lead others in worship." },
];

function SongCard({ song }: { song: any }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold truncate">{song.title}</h3>
            <p className="text-sm text-muted-foreground">{song.artist}</p>
          </div>
          <Badge variant="outline" className="text-xs shrink-0 ml-2">{song.category}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground mb-3">
          {song.songKey && <span>Key: <strong>{song.songKey}</strong></span>}
          {song.tempo && <span>Tempo: <strong>{song.tempo}</strong></span>}
        </div>
        {(song.lyrics || song.chords) && (
          <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-1 text-xs text-primary font-bold mb-2">
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {expanded ? "Hide" : "View"} lyrics & chords
          </button>
        )}
        {expanded && (
          <div className="space-y-3 mt-2">
            {song.lyrics && <div><p className="text-xs font-bold text-muted-foreground uppercase mb-1">Lyrics</p><pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed text-foreground">{song.lyrics}</pre></div>}
            {song.chords && <div><p className="text-xs font-bold text-muted-foreground uppercase mb-1">Chords</p><pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed text-foreground">{song.chords}</pre></div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SingAlong() {
  const { joinCommunity } = useActionCTA();
  const { data: allSongs = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/songs"] });

  const songs = allSongs.filter((s: any) => s.displayOn === "sing-along" || s.displayOn === "both");

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

      {/* Song Library */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Song Library</h2>
            <p className="text-muted-foreground">Lyrics and chord charts for your worship</p>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : songs.length === 0 ? (
            <div className="text-center py-16">
              <Music2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Songs Coming Soon</h3>
              <p className="text-muted-foreground">Songs will be published here by the admin. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {songs.map((song: any) => <SongCard key={song.id} song={song} />)}
            </div>
          )}
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
            Join the Community
          </Button>
        </div>
      </section>
    </div>
  );
}
