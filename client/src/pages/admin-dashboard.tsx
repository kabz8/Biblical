import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, LogIn, Music, Brain, Search, Grid3X3, MessageSquare, ChevronRight, Eye, EyeOff } from "lucide-react";

// ── Crossword auto-layout algorithm ──────────────────────────────────────
type CWWord = { word: string; clue: string; row: number; col: number; dir: "across" | "down"; num: number };
type CWData = { words: CWWord[]; gridH: number; gridW: number };

function buildCrossword(pairs: { word: string; clue: string }[]): CWData {
  const wordList = pairs
    .map(p => ({ ...p, word: p.word.toUpperCase().replace(/[^A-Z]/g, "") }))
    .filter(p => p.word.length >= 2)
    .sort((a, b) => b.word.length - a.word.length);

  if (!wordList.length) return { words: [], gridH: 0, gridW: 0 };

  const cells = new Map<string, string>();
  const placed: CWWord[] = [];
  let clueNum = 1;
  const k = (r: number, c: number) => `${r},${c}`;

  const canPlace = (word: string, r: number, c: number, dir: "across" | "down"): boolean => {
    const dr = dir === "down" ? 1 : 0;
    const dc = dir === "across" ? 1 : 0;
    if (cells.has(k(r - dr, c - dc))) return false;
    if (cells.has(k(r + dr * word.length, c + dc * word.length))) return false;
    for (let i = 0; i < word.length; i++) {
      const cr = r + dr * i, cc = c + dc * i;
      const ex = cells.get(k(cr, cc));
      if (ex !== undefined && ex !== word[i]) return false;
      if (ex === undefined) {
        if (dir === "across" && (cells.has(k(cr - 1, cc)) || cells.has(k(cr + 1, cc)))) return false;
        if (dir === "down" && (cells.has(k(cr, cc - 1)) || cells.has(k(cr, cc + 1)))) return false;
      }
    }
    return true;
  };

  const doPlace = (word: string, clue: string, r: number, c: number, dir: "across" | "down", num: number) => {
    const dr = dir === "down" ? 1 : 0;
    const dc = dir === "across" ? 1 : 0;
    for (let i = 0; i < word.length; i++) cells.set(k(r + dr * i, c + dc * i), word[i]);
    placed.push({ word, clue, row: r, col: c, dir, num });
  };

  doPlace(wordList[0].word, wordList[0].clue, 0, 0, "across", clueNum++);

  for (let wi = 1; wi < wordList.length; wi++) {
    const { word, clue } = wordList[wi];
    let done = false;
    for (const pw of placed) {
      if (done) break;
      const newDir: "across" | "down" = pw.dir === "across" ? "down" : "across";
      const pdr = pw.dir === "down" ? 1 : 0;
      const pdc = pw.dir === "across" ? 1 : 0;
      for (let pi = 0; pi < pw.word.length && !done; pi++) {
        const pR = pw.row + pdr * pi, pC = pw.col + pdc * pi;
        for (let wi2 = 0; wi2 < word.length && !done; wi2++) {
          if (pw.word[pi] !== word[wi2]) continue;
          const sR = newDir === "down" ? pR - wi2 : pR;
          const sC = newDir === "across" ? pC - wi2 : pC;
          if (canPlace(word, sR, sC, newDir)) {
            doPlace(word, clue, sR, sC, newDir, clueNum++);
            done = true;
          }
        }
      }
    }
  }

  if (!placed.length) return { words: [], gridH: 0, gridW: 0 };
  const allKeys = [...cells.keys()];
  const rows = allKeys.map(k => parseInt(k.split(",")[0]));
  const cols = allKeys.map(k => parseInt(k.split(",")[1]));
  const minR = Math.min(...rows), minC = Math.min(...cols);
  const maxR = Math.max(...rows), maxC = Math.max(...cols);
  return {
    words: placed.map(p => ({ ...p, row: p.row - minR, col: p.col - minC })),
    gridH: maxR - minR + 1,
    gridW: maxC - minC + 1,
  };
}

// ── Login Form ────────────────────────────────────────────────────────────
function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("admin@biblicalfinancialcourses.com");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        setError("Invalid email or password");
        return;
      }
      if (data.user.email !== "admin@biblicalfinancialcourses.com") {
        setError("You do not have admin access.");
        await supabase.auth.signOut();
        return;
      }
      toast({ title: "Welcome, Admin!" });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onLogin();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center pb-2">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-black">Admin Login</CardTitle>
          <p className="text-sm text-muted-foreground">Biblical Financial Courses CMS</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input id="password" type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            <Button type="submit" className="w-full rounded-full font-bold" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Shared Delete Button ──────────────────────────────────────────────────
function DeleteBtn({ onDelete }: { onDelete: () => void }) {
  return (
    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0" onClick={onDelete}>
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}

// ── Songs Tab ─────────────────────────────────────────────────────────────
function SongsTab() {
  const { toast } = useToast();
  const { data: songs = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/songs"] });
  const [form, setForm] = useState({ title: "", artist: "", category: "Worship", songKey: "", tempo: "", lyrics: "", chords: "", displayOn: "sing-along" });

  const create = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/songs", form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/songs"] }); setForm({ title: "", artist: "", category: "Worship", songKey: "", tempo: "", lyrics: "", chords: "", displayOn: "sing-along" }); toast({ title: "Song added!" }); },
    onError: () => toast({ title: "Failed to add song", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/songs/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/songs"] }),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Add New Song</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Title *</Label><Input className="mt-1" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Amazing Grace" /></div>
            <div><Label>Artist</Label><Input className="mt-1" value={form.artist} onChange={e => setForm(f => ({ ...f, artist: e.target.value }))} placeholder="Traditional" /></div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Worship", "Hymn", "Gospel", "Contemporary"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Display On</Label>
              <Select value={form.displayOn} onValueChange={v => setForm(f => ({ ...f, displayOn: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sing-along">Sing Along page</SelectItem>
                  <SelectItem value="worship">Worship page</SelectItem>
                  <SelectItem value="both">Both pages</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Key</Label><Input className="mt-1" value={form.songKey} onChange={e => setForm(f => ({ ...f, songKey: e.target.value }))} placeholder="G" /></div>
            <div><Label>Tempo</Label><Input className="mt-1" value={form.tempo} onChange={e => setForm(f => ({ ...f, tempo: e.target.value }))} placeholder="72 BPM" /></div>
          </div>
          <div><Label>Lyrics</Label><Textarea className="mt-1 min-h-[100px]" value={form.lyrics} onChange={e => setForm(f => ({ ...f, lyrics: e.target.value }))} placeholder="Paste song lyrics here…" /></div>
          <div><Label>Chords</Label><Textarea className="mt-1" value={form.chords} onChange={e => setForm(f => ({ ...f, chords: e.target.value }))} placeholder="Chord chart or tab notation…" /></div>
          <Button onClick={() => create.mutate()} disabled={!form.title || create.isPending} className="rounded-full font-bold">
            <Plus className="w-4 h-4 mr-2" />{create.isPending ? "Adding…" : "Add Song"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Songs ({songs.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-muted-foreground text-sm">Loading…</p> :
            songs.length === 0 ? <p className="text-muted-foreground text-sm">No songs yet. Add one above.</p> :
              <div className="space-y-2">
                {songs.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.artist} · <Badge variant="outline" className="text-xs">{s.category}</Badge> · {s.displayOn}</p>
                    </div>
                    <DeleteBtn onDelete={() => del.mutate(s.id)} />
                  </div>
                ))}
              </div>}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Quiz Questions Tab ────────────────────────────────────────────────────
function QuizTab() {
  const { toast } = useToast();
  const { data: questions = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/quiz-questions"] });
  const [form, setForm] = useState({ scripture: "", question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: 0 });

  const create = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/quiz-questions", form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/quiz-questions"] }); setForm({ scripture: "", question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: 0 }); toast({ title: "Question added!" }); },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/quiz-questions/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/quiz-questions"] }),
  });

  const options = ["A", "B", "C", "D"];
  const optionKeys = ["optionA", "optionB", "optionC", "optionD"] as const;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Add Quiz Question</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Scripture Reference *</Label><Input className="mt-1" value={form.scripture} onChange={e => setForm(f => ({ ...f, scripture: e.target.value }))} placeholder="Matthew 6:24" /></div>
            <div>
              <Label>Correct Answer</Label>
              <Select value={String(form.correctOption)} onValueChange={v => setForm(f => ({ ...f, correctOption: Number(v) }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {options.map((o, i) => <SelectItem key={i} value={String(i)}>Option {o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Question *</Label><Textarea className="mt-1" value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="What does this scripture teach about…" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            {optionKeys.map((key, i) => (
              <div key={key}>
                <Label className={form.correctOption === i ? "text-green-600 font-bold" : ""}>Option {options[i]}{form.correctOption === i ? " ✓ (correct)" : ""}</Label>
                <Input className={`mt-1 ${form.correctOption === i ? "border-green-500" : ""}`} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={`Answer option ${options[i]}…`} />
              </div>
            ))}
          </div>
          <Button onClick={() => create.mutate()} disabled={!form.question || !form.scripture || !form.optionA || create.isPending} className="rounded-full font-bold">
            <Plus className="w-4 h-4 mr-2" />{create.isPending ? "Adding…" : "Add Question"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Questions ({questions.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-muted-foreground text-sm">Loading…</p> :
            questions.length === 0 ? <p className="text-muted-foreground text-sm">No questions yet.</p> :
              <div className="space-y-2">
                {questions.map((q: any, idx: number) => (
                  <div key={q.id} className="flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-card">
                    <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-primary font-bold mb-0.5">{q.scripture}</p>
                      <p className="text-sm font-medium">{q.question}</p>
                      <p className="text-xs text-green-600 mt-1">✓ {[q.optionA, q.optionB, q.optionC, q.optionD][q.correctOption]}</p>
                    </div>
                    <DeleteBtn onDelete={() => del.mutate(q.id)} />
                  </div>
                ))}
              </div>}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Word Search Tab ───────────────────────────────────────────────────────
function WordSearchTab() {
  const { toast } = useToast();
  const { data: words = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/word-search-words"] });
  const [form, setForm] = useState({ word: "", category: "places" });

  const create = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/word-search-words", { ...form, word: form.word.toUpperCase().trim() }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/word-search-words"] }); setForm(f => ({ ...f, word: "" })); toast({ title: "Word added!" }); },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/word-search-words/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/word-search-words"] }),
  });

  const places = words.filter((w: any) => w.category === "places");
  const books = words.filter((w: any) => w.category === "books");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Add Word</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Word *</Label><Input className="mt-1" value={form.word} onChange={e => setForm(f => ({ ...f, word: e.target.value }))} placeholder="BETHANY" /></div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="places">Places in the Bible</SelectItem>
                  <SelectItem value="books">New Testament Books</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={() => create.mutate()} disabled={!form.word.trim() || create.isPending} className="rounded-full font-bold">
            <Plus className="w-4 h-4 mr-2" />{create.isPending ? "Adding…" : "Add Word"}
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {[{ label: "Places in the Bible", list: places }, { label: "New Testament Books", list: books }].map(({ label, list }) => (
          <Card key={label}>
            <CardHeader><CardTitle className="text-base">{label} ({list.length})</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> :
                list.length === 0 ? <p className="text-sm text-muted-foreground">No words yet.</p> :
                  <div className="flex flex-wrap gap-2">
                    {list.map((w: any) => (
                      <div key={w.id} className="flex items-center gap-1 bg-muted rounded-full pl-3 pr-1 py-1">
                        <span className="text-sm font-mono font-bold">{w.word}</span>
                        <button onClick={() => del.mutate(w.id)} className="text-red-400 hover:text-red-600 w-5 h-5 flex items-center justify-center rounded-full">×</button>
                      </div>
                    ))}
                  </div>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Crossword Tab ─────────────────────────────────────────────────────────
function CrosswordTab() {
  const { toast } = useToast();
  const { data: puzzles = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/crosswords"] });
  const [title, setTitle] = useState("");
  const [pairsText, setPairsText] = useState("");
  const [preview, setPreview] = useState<CWData | null>(null);

  const create = useMutation({
    mutationFn: () => {
      if (!preview) throw new Error("No puzzle generated");
      return apiRequest("POST", "/api/admin/crosswords", { title, data: JSON.stringify(preview) });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/crosswords"] }); setTitle(""); setPairsText(""); setPreview(null); toast({ title: "Crossword saved!" }); },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/crosswords/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/crosswords"] }),
  });

  function handleGenerate() {
    const pairs = pairsText.split("\n")
      .map(line => { const [word, ...rest] = line.split("|"); return { word: (word || "").trim(), clue: rest.join("|").trim() }; })
      .filter(p => p.word && p.clue);
    if (pairs.length === 0) { toast({ title: "Enter word|clue pairs", variant: "destructive" }); return; }
    setPreview(buildCrossword(pairs));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Create Crossword Puzzle</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Puzzle Title *</Label><Input className="mt-1" value={title} onChange={e => setTitle(e.target.value)} placeholder="Biblical Finance Crossword" /></div>
          <div>
            <Label>Word & Clue Pairs</Label>
            <p className="text-xs text-muted-foreground mb-1">One per line: <code className="bg-muted px-1 rounded">WORD|Clue text here</code></p>
            <Textarea className="mt-1 min-h-[180px] font-mono text-sm" value={pairsText} onChange={e => setPairsText(e.target.value)} placeholder={"TITHE|What we give to God as firstfruits\nSTEWARD|One who manages another's resources\nFAITH|Trust and confidence in God\nGRACE|Unmerited favour from God"} />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleGenerate} className="rounded-full font-bold">Generate Preview</Button>
            <Button onClick={() => create.mutate()} disabled={!preview || !title || create.isPending} className="rounded-full font-bold">
              <Plus className="w-4 h-4 mr-2" />{create.isPending ? "Saving…" : "Save Crossword"}
            </Button>
          </div>

          {preview && preview.words.length > 0 && (
            <div className="mt-4 p-4 bg-muted/30 rounded-xl">
              <p className="text-sm font-bold mb-3">Preview — {preview.words.length} words placed ({preview.gridW}×{preview.gridH} grid):</p>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-xs uppercase text-muted-foreground mb-2">Across</p>
                  {preview.words.filter(w => w.dir === "across").map(w => (
                    <p key={w.num} className="mb-1"><span className="font-bold text-primary">{w.num}.</span> {w.clue} ({w.word.length})</p>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-xs uppercase text-muted-foreground mb-2">Down</p>
                  {preview.words.filter(w => w.dir === "down").map(w => (
                    <p key={w.num} className="mb-1"><span className="font-bold text-primary">{w.num}.</span> {w.clue} ({w.word.length})</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Saved Crosswords ({puzzles.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> :
            puzzles.length === 0 ? <p className="text-sm text-muted-foreground">No crosswords yet.</p> :
              <div className="space-y-2">
                {puzzles.map((p: any) => {
                  const d: CWData = JSON.parse(p.data);
                  return (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card">
                      <div className="flex-1"><p className="font-bold">{p.title}</p><p className="text-xs text-muted-foreground">{d.words.length} words · {d.gridW}×{d.gridH}</p></div>
                      <DeleteBtn onDelete={() => del.mutate(p.id)} />
                    </div>
                  );
                })}
              </div>}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Testimonies Tab ───────────────────────────────────────────────────────
function TestimoniesTab() {
  const { toast } = useToast();
  const { data: testimonies = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/testimonies"] });
  const [form, setForm] = useState({ name: "", location: "", category: "Debt Freedom", title: "", story: "" });

  const create = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/testimonies", form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/testimonies"] }); setForm({ name: "", location: "", category: "Debt Freedom", title: "", story: "" }); toast({ title: "Testimony added!" }); },
    onError: () => toast({ title: "Failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/testimonies/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/testimonies"] }),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Add Testimony</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Name *</Label><Input className="mt-1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Abigail Mensah" /></div>
            <div><Label>Location</Label><Input className="mt-1" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Ghana 🇬🇭" /></div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Debt Freedom", "Business Breakthrough", "Family Restoration", "Job Miracle", "Home Purchased", "Investment Win", "General"].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Title *</Label><Input className="mt-1" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="God Cancelled Our Debt!" /></div>
          </div>
          <div><Label>Story *</Label><Textarea className="mt-1 min-h-[120px]" value={form.story} onChange={e => setForm(f => ({ ...f, story: e.target.value }))} placeholder="Share the full testimony here…" /></div>
          <Button onClick={() => create.mutate()} disabled={!form.name || !form.title || !form.story || create.isPending} className="rounded-full font-bold">
            <Plus className="w-4 h-4 mr-2" />{create.isPending ? "Adding…" : "Add Testimony"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Testimonies ({testimonies.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> :
            testimonies.length === 0 ? <p className="text-sm text-muted-foreground">No testimonies yet. Add one above.</p> :
              <div className="space-y-2">
                {testimonies.map((t: any) => (
                  <div key={t.id} className="flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-card">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{t.name} · {t.location} · <Badge variant="outline" className="text-xs">{t.category}</Badge></p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.story}</p>
                    </div>
                    <DeleteBtn onDelete={() => del.mutate(t.id)} />
                  </div>
                ))}
              </div>}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Admin Dashboard ──────────────────────────────────────────────────
const TABS = [
  { id: "songs", label: "Songs", icon: Music },
  { id: "quiz", label: "Quiz Questions", icon: Brain },
  { id: "wordsearch", label: "Word Search", icon: Search },
  { id: "crossword", label: "Crossword", icon: Grid3X3 },
  { id: "testimonies", label: "Testimonies", icon: MessageSquare },
] as const;

type TabId = typeof TABS[number]["id"];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("songs");
  const [loggedIn, setLoggedIn] = useState(false);
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery<any>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    setLoggedIn(false);
    toast({ title: "Logged out" });
  }

  const isAdmin = user?.role === "admin" || user?.email === "admin@biblicalfinancialcourses.com";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <LoginForm onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="bg-foreground text-background py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black">BFC Admin</h1>
            <p className="text-xs text-background/60">Content Management System</p>
          </div>
          <Button variant="ghost" size="sm" className="text-background hover:bg-white/10 rounded-full" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${activeTab === tab.id ? "border-primary bg-primary/5" : "border-border/50 bg-card hover:border-primary/30"}`}>
                <Icon className={`w-5 h-5 shrink-0 ${activeTab === tab.id ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-sm font-bold ${activeTab === tab.id ? "text-primary" : ""}`}>{tab.label}</span>
                {activeTab === tab.id && <ChevronRight className="w-4 h-4 text-primary ml-auto" />}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === "songs" && <SongsTab />}
        {activeTab === "quiz" && <QuizTab />}
        {activeTab === "wordsearch" && <WordSearchTab />}
        {activeTab === "crossword" && <CrosswordTab />}
        {activeTab === "testimonies" && <TestimoniesTab />}
      </div>
    </div>
  );
}
