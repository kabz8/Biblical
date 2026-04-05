import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2, Trophy, Users, Clock, Star, Zap, BookOpen, Brain, Target } from "lucide-react";
import { useActionCTA } from "@/hooks/use-action-cta";

const liveSessions = [
  { id: 1, category: "Trivia", tag: "Live", level: "All Levels", title: "Bible Trivia Challenge", description: "Test your Bible knowledge in this fast-paced trivia game.", players: "23/50", host: "Community Host", status: "Starting in 5 minutes", action: "Join Now", actionStyle: "bg-primary" },
  { id: 2, category: "Memory", tag: "Live", level: "Intermediate", title: "Scripture Memory Race", description: "Race to complete Bible verse memory challenges.", players: "45/50", host: "Community Host", status: "10 minutes remaining", action: "Join Game", actionStyle: "bg-green-600" },
  { id: 3, category: "Characters", tag: "Waiting", level: "Beginner", title: "Bible Character Guess", description: "Guess the Bible character from clues and descriptions.", players: "8/50", host: "Community Host", status: "Waiting for players", action: "Enter Lobby", actionStyle: "bg-secondary" },
  { id: 4, category: "Parable", tag: "Live", level: "Advanced", title: "Parable Puzzle", description: "Solve puzzles based on Jesus' parables.", players: "12/30", host: "Community Host", status: "2 minutes remaining", action: "Join Game", actionStyle: "bg-green-600" },
  { id: 5, category: "Music", tag: "Live", level: "All Levels", title: "Worship Song Challenge", description: "Name the Christian songs and hymns.", players: "33/50", host: "Community Host", status: "Starting soon", action: "Join Game", actionStyle: "bg-green-600" },
  { id: 6, category: "Geography", tag: "Waiting", level: "Intermediate", title: "Bible Geography", description: "Explore biblical locations and their significance.", players: "6/40", host: "Community Host", status: "Waiting for players", action: "Enter Lobby", actionStyle: "bg-secondary" },
];

const tournaments = [
  { id: 1, tag: "Tournament", level: "All Levels", title: "Christmas Bible Bowl", description: "Annual Christmas-themed Bible knowledge competition.", start: "December 20, 2026", duration: "3 days", prize: "Christmas Gift Basket", registered: "Open registration", ends: "December 15" },
  { id: 2, tag: "Tournament", level: "Advanced", title: "New Testament Marathon", description: "Comprehensive competition covering all New Testament books.", start: "January 10, 2026", duration: "5 weeks", prize: "Study Bible + Amazon Gift Card", registered: "Open registration", ends: "January 10" },
  { id: 3, tag: "Youth", level: "Youth", title: "Youth Bible Games", description: "Special tournament designed for teenagers and young adults.", start: "February 1, 2026", duration: "2 days", prize: "Youth Group-themed Scholarship", registered: "Open registration", ends: "January 25" },
  { id: 4, tag: "Tournament", level: "Intermediate", title: "Psalms Poetry Contest", description: "Creative games based on the poetic books of the Bible.", start: "March 10, 2026", duration: "3 weeks", prize: "Poetry Book Collection", registered: "Open registration", ends: "March 2" },
];

const categories = [
  { icon: <BookOpen className="w-8 h-8" />, title: "Bible Trivia", description: "Test your knowledge of Scripture", games: 12, avg: "15 min", color: "bg-amber-100 text-amber-700" },
  { icon: <Brain className="w-8 h-8" />, title: "Memory Games", description: "Scripture memorization challenges", games: 8, avg: "10 min", color: "bg-green-100 text-green-700" },
  { icon: <Users className="w-8 h-8" />, title: "Bible Characters", description: "Learn about biblical figures", games: 15, avg: "20 min", color: "bg-purple-100 text-purple-700" },
  { icon: <Target className="w-8 h-8" />, title: "Word Puzzles", description: "Biblical word games and crosswords", games: 10, avg: "12 min", color: "bg-orange-100 text-orange-700" },
];

const tips = [
  { icon: <Clock className="w-5 h-5 text-primary" />, title: "Play Regularly", desc: "Consistent gaming helps reinforce Biblical knowledge and build lasting friendships in the community." },
  { icon: <Users className="w-5 h-5 text-primary" />, title: "Join Team Games", desc: "Collaborate with others to solve challenges and learn from different perspectives on Scripture." },
  { icon: <Star className="w-5 h-5 text-primary" />, title: "Challenge Yourself", desc: "Try games at different difficulty levels to continue growing in your Biblical knowledge." },
  { icon: <Zap className="w-5 h-5 text-primary" />, title: "Have Fun Learning", desc: "Remember that games are meant to be enjoyable while deepening your understanding of God's Word." },
];

export default function GameAlong() {
  const { joinSession, registerTournament, explore, joinCommunity } = useActionCTA();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-foreground text-background py-16 text-center">
        <div className="container mx-auto px-4">
          <Gamepad2 className="w-14 h-14 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Game Along</h1>
          <p className="text-lg text-background/70 max-w-2xl mx-auto">
            Join our community in fun, educational games that teach Bible stories and strengthen faith together
          </p>
        </div>
      </section>

      {/* Live Game Sessions */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Live Game Sessions</h2>
          <p className="text-muted-foreground">Join multiplayer games happening now with other community members</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveSessions.map((s) => (
            <Card key={s.id} className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">{s.category}</Badge>
                  <Badge className={`text-xs text-white ${s.tag === "Live" ? "bg-green-500" : "bg-secondary"}`}>{s.tag}</Badge>
                  <span className="ml-auto text-xs text-muted-foreground">{s.level}</span>
                </div>
                <h3 className="font-bold text-base mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{s.description}</p>
                <div className="space-y-1 text-xs text-muted-foreground mb-4">
                  <div className="flex justify-between"><span>Players:</span><span className="font-medium text-foreground">{s.players}</span></div>
                  <div className="flex justify-between"><span>Status:</span><span className="font-medium text-green-600">{s.status}</span></div>
                </div>
                <Button
                  className={`w-full text-white font-bold rounded-full ${s.actionStyle}`}
                  onClick={() => joinSession(s.title)}
                >
                  {s.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Upcoming Tournaments */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Upcoming Tournaments</h2>
            <p className="text-muted-foreground">Compete in special tournaments for prizes and recognition</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {tournaments.map((t) => (
              <Card key={t.id} className="border border-border/50 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">{t.tag}</Badge>
                    <span className="ml-auto text-xs text-muted-foreground">{t.level}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{t.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t.description}</p>
                  <div className="space-y-1.5 text-sm mb-5">
                    <div className="flex justify-between"><span className="text-muted-foreground">Start Date:</span><span>{t.start}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Duration:</span><span>{t.duration}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Prize:</span><span className="text-primary font-medium">{t.prize}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Registration Ends:</span><span>{t.ends}</span></div>
                  </div>
                  <Button
                    className="w-full font-bold rounded-full"
                    onClick={() => registerTournament(t.title)}
                  >
                    <Trophy className="w-4 h-4 mr-2" />Register for Tournament
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Game Categories */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Game Categories</h2>
          <p className="text-muted-foreground">Explore different types of faith-based games for all skill levels</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Card key={cat.title} className="text-center border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${cat.color}`}>{cat.icon}</div>
                <h3 className="font-bold text-base mb-2">{cat.title}</h3>
                <p className="text-xs text-muted-foreground mb-4">{cat.description}</p>
                <div className="text-xs text-muted-foreground space-y-1 mb-4">
                  <div>{cat.games} games</div>
                  <div>Avg. {cat.avg}</div>
                </div>
                <Button variant="default" size="sm" className="w-full font-bold rounded-full" onClick={() => explore(cat.title)}>
                  Play Games
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Community Stats */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="bg-background rounded-3xl border p-10 text-center max-w-3xl mx-auto">
            <Gamepad2 className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-1">Community Gaming Stats</h3>
            <p className="text-muted-foreground text-sm mb-8">See how our community is growing through faith-based gaming</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "1,567", label: "Active Players", color: "text-primary" },
                { value: "89", label: "Available Games", color: "text-purple-600" },
                { value: "24,567", label: "Games Played", color: "text-green-600" },
                { value: "456", label: "Hours of Learning", color: "text-amber-600" },
              ].map((s) => (
                <div key={s.label}>
                  <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gaming Tips */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Gaming Tips for Better Learning</h2>
          <p className="text-muted-foreground">Get the most out of your faith-based gaming experience</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
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
          <Gamepad2 className="w-10 h-10 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-3">Join the Game Community</h2>
          <p className="text-white/75 max-w-xl mx-auto mb-8">Connect with fellow believers while learning God's Word through fun, interactive games. Start playing today and grow in faith together!</p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold px-10 rounded-full" onClick={joinCommunity}>
            Start Playing
          </Button>
        </div>
      </section>
    </div>
  );
}
