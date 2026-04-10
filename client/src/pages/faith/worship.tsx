import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Play, Users, Clock, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useActionCTA } from "@/hooks/use-action-cta";

const liveStreams = [
  { time: "Sunday 10:00 AM", title: "Morning Worship Service", host: "BFC Worship Team", viewers: 1245, status: "Next Sunday" },
  { time: "Wednesday 7:00 PM", title: "Midweek Praise Night", host: "Sister Grace & Team", viewers: 567, status: "Wednesday" },
  { time: "Friday 8:00 PM", title: "Glory Night — Extended Worship", host: "Pastor Nathaniel", viewers: 892, status: "This Friday" },
];

const devotionals = [
  { day: "Today", scripture: "Psalm 100:1-5", title: "Enter His Courts with Praise", summary: "Discover why gratitude is the gateway to God's presence. When we offer thanksgiving, we position ourselves to receive all that God has for us." },
  { day: "Yesterday", scripture: "John 4:23-24", title: "Worship in Spirit and in Truth", summary: "Jesus defines authentic worship as going beyond outward ritual to an inner alignment with God's heart. What does this look like practically today?" },
  { day: "2 days ago", scripture: "Hebrews 13:15", title: "A Sacrifice of Praise", summary: "Even when circumstances are hard, our praise becomes a holy offering. This passage unlocks the power of worship as a spiritual weapon." },
];

const scriptureInsights = [
  { ref: "Psalm 22:3", text: '"You are holy, enthroned on the praises of Israel."', insight: "God inhabits our praises — worship is not just an expression, it's an invitation for His presence." },
  { ref: "Revelation 4:11", text: '"You are worthy, our Lord and God, to receive glory and honor and power."', insight: "Heavenly worship focuses on who God IS, not what He does. This transforms our earthly praise." },
  { ref: "Romans 12:1", text: '"Offer your bodies as a living sacrifice, holy and pleasing to God — this is true worship."', insight: "Biblical worship extends beyond songs into every area of life, including how we handle money." },
];

const stats = [
  { value: "3", label: "Live Services/Week", color: "text-purple-600" },
  { value: "47", label: "Countries Reached", color: "text-amber-600" },
  { value: "12,450", label: "Community Members", color: "text-primary" },
  { value: "500+", label: "Registered Believers", color: "text-green-600" },
];

function SongCard({ song }: { song: any }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-bold truncate">{song.title}</h4>
            <p className="text-xs text-muted-foreground">{song.artist}</p>
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
            {song.audioUrl && (
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Audio</p>
                <audio controls className="w-full" src={song.audioUrl} />
              </div>
            )}
            {song.lyrics && <div><p className="text-xs font-bold text-muted-foreground uppercase mb-1">Lyrics</p><pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{song.lyrics}</pre></div>}
            {song.chords && <div><p className="text-xs font-bold text-muted-foreground uppercase mb-1">Chords</p><pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">{song.chords}</pre></div>}
          </div>
        )}
        <Button size="sm" className="w-full mt-3 rounded-full font-bold" onClick={() => setExpanded(true)}>
          <Music className="w-3 h-3 mr-1" />Worship with this song
        </Button>
      </CardContent>
    </Card>
  );
}

export default function WorshipPage() {
  const { joinSession, startActivity, joinCommunity } = useActionCTA();
  const { data: allSongs = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/songs"] });
  const songs = allSongs.filter((s: any) => s.displayOn === "worship" || s.displayOn === "both");

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-foreground text-background py-16 text-center">
        <div className="container mx-auto px-4">
          <Music className="w-14 h-14 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Worship</h1>
          <p className="text-lg text-background/70 max-w-2xl mx-auto">
            Enter into God's presence through song, scripture, and community — experiencing the depths of biblical worship
          </p>
        </div>
      </section>

      {/* Stats */}
      <div className="border-b bg-muted/30 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map(s => (
              <div key={s.label}><div className={`text-2xl font-bold ${s.color}`}>{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Worship Streams */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Live Worship Services</h2>
          <p className="text-muted-foreground">Join our weekly live streams and worship together in real time</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {liveStreams.map((s) => (
            <Card key={s.title} className="border border-border/50 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <div className="h-1 bg-primary" />
              <CardContent className="p-6 text-center">
                <Badge className="mb-4 bg-primary/10 text-primary border-0">{s.status}</Badge>
                <h3 className="font-bold text-lg mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">Led by {s.host}</p>
                <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mb-1"><Clock className="w-4 h-4" />{s.time}</div>
                <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mb-5"><Users className="w-4 h-4" />{s.viewers.toLocaleString()} attend</div>
                <Button className="w-full font-bold rounded-full" onClick={() => joinSession(s.title)}>
                  <Play className="w-4 h-4 mr-2" />Join Worship
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Hymn & Song Library — from admin */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Hymn & Song Library</h2>
            <p className="text-muted-foreground">Worship songs and hymns for your personal devotion</p>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : songs.length === 0 ? (
            <div className="text-center py-16">
              <Music className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Songs Coming Soon</h3>
              <p className="text-muted-foreground">Hymns and songs will be published here by the admin.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {songs.map((song: any) => <SongCard key={song.id} song={song} />)}
            </div>
          )}
        </div>
      </section>

      {/* Scripture Insights */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Biblical Foundations of Worship</h2>
          <p className="text-muted-foreground">What does God's Word say about worship?</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {scriptureInsights.map((s) => (
            <Card key={s.ref} className="border border-border/50 shadow-sm">
              <CardContent className="p-6">
                <p className="text-primary font-bold text-sm mb-3">{s.ref}</p>
                <p className="text-sm italic text-foreground mb-4 leading-relaxed border-l-2 border-primary pl-3">{s.text}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.insight}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Daily Devotionals */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Daily Worship Devotionals</h2>
            <p className="text-muted-foreground">Short scripture-based reflections to fuel your daily praise</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-5">
            {devotionals.map((d) => (
              <Card key={d.title} className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="min-w-[80px] text-center">
                      <div className="text-xs font-bold text-primary">{d.day}</div>
                      <div className="text-xs text-muted-foreground mt-1">{d.scripture}</div>
                    </div>
                    <div className="border-l pl-4 flex-1">
                      <h4 className="font-bold mb-2">{d.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{d.summary}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="shrink-0 rounded-full" onClick={() => startActivity(d.title)}>
                      Read <Play className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-white py-16 text-center">
        <div className="container mx-auto px-4">
          <Music className="w-10 h-10 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-3">Worship Together, Grow Together</h2>
          <p className="text-white/75 max-w-xl mx-auto mb-8">Join thousands of believers lifting their voices to God. Worship is the foundation of everything we do here.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold px-10 rounded-full" onClick={joinCommunity}>Join the Community</Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold px-10 rounded-full" onClick={() => startActivity("Worship Resources")}>Explore Resources</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
