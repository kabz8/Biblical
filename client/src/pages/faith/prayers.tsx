import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeartHandshake, Heart, Users, Clock, BookOpen, Send, Shield, Globe, Sunrise } from "lucide-react";
import { useActionCTA } from "@/hooks/use-action-cta";

const prayerGroups = [
  { title: "Business Owners Circle", members: 234, frequency: "Tuesdays 7 PM", focus: "Business owners seeking God's wisdom for their enterprises, clients, and employees.", verse: "Proverbs 3:5-6", open: true },
  { title: "Debt-Free Seekers", members: 456, frequency: "Thursdays 8 PM", focus: "Families and individuals believing God for supernatural debt cancellation and financial breakthrough.", verse: "Luke 4:18", open: true },
  { title: "Global Missions Intercession", members: 189, frequency: "Saturdays 6 AM", focus: "Interceding for the spread of biblical financial literacy to unreached nations and communities.", verse: "Matthew 28:19-20", open: true },
  { title: "Single Parents Prayer Network", members: 167, frequency: "Wednesdays 8 PM", focus: "Praying together for the specific needs of single-parent households — provision, wisdom, and strength.", verse: "Psalm 68:5", open: true },
  { title: "Youth Financial Freedom", members: 312, frequency: "Fridays 7 PM", focus: "Young adults seeking God's guidance for education debt, career direction, and financial foundations.", verse: "Jeremiah 29:11", open: true },
  { title: "Marriage & Money", members: 278, frequency: "Mondays 7 PM", focus: "Couples praying together for financial unity, healing from money conflicts, and building a godly home.", verse: "Ecclesiastes 4:9", open: false },
];

const prayerThemes = [
  { day: "Monday", theme: "Provision", verse: "Philippians 4:19", focus: "Lord, you are Jehovah Jireh — our Provider. We declare that every need is met according to Your riches in glory." },
  { day: "Tuesday", theme: "Wisdom", verse: "James 1:5", focus: "God, we ask for supernatural wisdom in our financial decisions — for investments, purchases, and giving." },
  { day: "Wednesday", theme: "Freedom from Debt", verse: "Romans 13:8", focus: "Lord, we pray for complete deliverance from the spirit of debt. What You have freed, let no man re-enslave." },
  { day: "Thursday", theme: "Generosity", verse: "2 Corinthians 9:7", focus: "Give us cheerful, liberating hearts that love to give. May our generosity become a testimony to Your grace." },
  { day: "Friday", theme: "Business & Career", verse: "Proverbs 22:29", focus: "God, establish the work of our hands. Bring our skills before kings and open doors that no man can shut." },
  { day: "Saturday", theme: "Family Blessing", verse: "Psalm 128:1-2", focus: "We pray that the fear of God makes every family in our community a place of abundance and peace." },
  { day: "Sunday", theme: "Kingdom Finance", verse: "Matthew 6:33", focus: "As we seek Your Kingdom first, we trust that all these things shall be added to us. Let Your will be done in our finances." },
];

const intercessors = [
  { name: "Pastor James R.", role: "Lead Intercessor", specialty: "Business Breakthrough", country: "USA", sessions: 456 },
  { name: "Sister Grace A.", role: "Prayer Leader", specialty: "Family Restoration", country: "Nigeria", sessions: 389 },
  { name: "Elder Moses K.", role: "Night Watch Leader", specialty: "Debt Freedom", country: "Kenya", sessions: 312 },
  { name: "Prophetess Ruth M.", role: "Prophetic Intercession", specialty: "Divine Direction", country: "Ghana", sessions: 267 },
];

const stats = [
  { value: "45,000+", label: "Prayers Answered", color: "text-primary" },
  { value: "2,340", label: "Active Intercessors", color: "text-purple-600" },
  { value: "24/7", label: "Prayer Coverage", color: "text-green-600" },
  { value: "89", label: "Prayer Groups", color: "text-amber-600" },
];

export default function PrayersPage() {
  const { joinSession, startActivity, joinCommunity } = useActionCTA();
  const { data: publicPrayers = [], isLoading: loadingPrayers } = useQuery<any[]>({ queryKey: ["/api/prayers"] });

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-foreground text-background py-16 text-center">
        <div className="container mx-auto px-4">
          <HeartHandshake className="w-14 h-14 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Prayers</h1>
          <p className="text-lg text-background/70 max-w-2xl mx-auto">
            Submit your requests, join intercessory groups, and stand in the gap for others in our global house of prayer
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

      {/* Weekly Prayer Themes */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Weekly Prayer Themes</h2>
          <p className="text-muted-foreground">Join the global community in agreement prayer — each day focused on a specific area of financial life</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {prayerThemes.map((p) => (
            <Card key={p.day} className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-primary">{p.day}</span>
                  <Badge className="bg-primary/10 text-primary border-0 text-xs">{p.theme}</Badge>
                </div>
                <p className="text-xs text-muted-foreground font-medium mb-2">{p.verse}</p>
                <p className="text-xs text-muted-foreground leading-relaxed italic">{p.focus}</p>
                <Button size="sm" className="w-full mt-4 rounded-full font-bold text-xs" onClick={() => startActivity(`${p.theme} Prayer`)}>
                  Pray This Prayer
                </Button>
              </CardContent>
            </Card>
          ))}
          <Card className="border-2 border-primary/30 shadow-lg bg-primary/5 md:col-span-2 lg:col-span-1 flex items-center justify-center">
            <CardContent className="p-5 text-center">
              <Globe className="w-10 h-10 text-primary mx-auto mb-3" />
              <h4 className="font-bold mb-2">Join Global Prayer</h4>
              <p className="text-xs text-muted-foreground mb-4">Thousands praying in agreement daily. Your prayer matters.</p>
              <Button className="w-full rounded-full font-bold" onClick={() => joinSession("Global Prayer Hour")}>Join Now</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Intercessory Groups */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Intercessory Prayer Groups</h2>
            <p className="text-muted-foreground">Join specialized groups praying for specific areas of financial life and community need</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prayerGroups.map((group) => (
              <Card key={group.title} className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={`text-xs border-0 ${group.open ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                      {group.open ? "Open" : "Full"}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                      <Users className="w-3 h-3" />{group.members}
                    </div>
                  </div>
                  <h3 className="font-bold text-base mb-2">{group.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{group.focus}</p>
                  <div className="space-y-1 text-xs mb-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground"><Clock className="w-3 h-3" />{group.frequency}</div>
                    <div className="flex items-center gap-1.5 text-muted-foreground"><BookOpen className="w-3 h-3" />{group.verse}</div>
                  </div>
                  <Button size="sm" className="w-full rounded-full font-bold" disabled={!group.open} onClick={() => joinSession(group.title)}>
                    {group.open ? "Join Group" : "Group Full"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Community Prayer Requests</h2>
          <p className="text-muted-foreground">Approved prayer requests submitted by members</p>
        </div>
        {loadingPrayers ? (
          <div className="text-center text-muted-foreground">Loading prayers...</div>
        ) : publicPrayers.length === 0 ? (
          <div className="text-center text-muted-foreground">No public prayer requests yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicPrayers.map((p: any) => (
              <Card key={p.id} className="border border-border/50 shadow-sm">
                <CardContent className="p-5">
                  <h3 className="font-bold mb-1">{p.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{p.name}{p.status ? ` · ${p.status}` : ""}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Meet Our Intercessors */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Our Prayer Leaders</h2>
          <p className="text-muted-foreground">Dedicated intercessors who carry the prayer burden for our global community</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {intercessors.map((p) => (
            <Card key={p.name} className="text-center border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {p.name[0]}
                </div>
                <h4 className="font-bold">{p.name}</h4>
                <p className="text-xs text-primary font-medium mb-1">{p.role}</p>
                <p className="text-xs text-muted-foreground mb-3">{p.country} · {p.specialty}</p>
                <p className="text-xs text-muted-foreground mb-4">{p.sessions} sessions led</p>
                <Button size="sm" variant="outline" className="w-full rounded-full" onClick={() => startActivity(`Prayer with ${p.name}`)}>
                  Request Prayer
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-primary text-white py-16 text-center">
        <div className="container mx-auto px-4">
          <HeartHandshake className="w-10 h-10 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-3">The Effectual Prayer of the Righteous Avails Much</h2>
          <p className="text-white/75 max-w-xl mx-auto mb-8 italic">"Therefore confess your sins to each other and pray for each other so that you may be healed." — James 5:16</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold px-10 rounded-full" onClick={joinCommunity}>Join Prayer Community</Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold px-10 rounded-full" onClick={() => startActivity("Submit Prayer Request")}>Submit a Request</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
