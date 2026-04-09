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
import { Trash2, Plus, LogIn, Music, Brain, Search, Grid3X3, MessageSquare, ChevronRight, Eye, EyeOff, GraduationCap, Users } from "lucide-react";

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
  const [email, setEmail] = useState("");
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
    onError: (err: any) => toast({ title: "Failed to add song", description: err?.message, variant: "destructive" }),
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
    onError: (err: any) => toast({ title: "Failed", description: err?.message, variant: "destructive" }),
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
    onError: (err: any) => toast({ title: "Failed", description: err?.message, variant: "destructive" }),
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
    onError: (err: any) => toast({ title: "Failed", description: err?.message, variant: "destructive" }),
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
  const { data: testimonies = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/testimonies"] });
  const [form, setForm] = useState({ name: "", location: "", category: "Debt Freedom", title: "", story: "" });

  const create = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/testimonies", form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonies"] }); setForm({ name: "", location: "", category: "Debt Freedom", title: "", story: "" }); toast({ title: "Testimony added!" }); },
    onError: (err: any) => toast({ title: "Failed", description: err?.message, variant: "destructive" }),
  });

  const approve = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/admin/testimonies/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonies"] });
      toast({ title: "Testimony approved" });
    },
  });

  const del = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/testimonies/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/testimonies"] }),
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
                      {!t.isApproved && <p className="text-xs text-amber-600 mt-1">Pending admin approval</p>}
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.story}</p>
                    </div>
                    {!t.isApproved && (
                      <Button variant="outline" size="sm" className="shrink-0" onClick={() => approve.mutate(t.id)}>
                        Approve
                      </Button>
                    )}
                    <DeleteBtn onDelete={() => del.mutate(t.id)} />
                  </div>
                ))}
              </div>}
        </CardContent>
      </Card>
    </div>
  );
}

function PrayersTab() {
  const { toast } = useToast();
  const { data: prayers = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/prayers"] });
  const [form, setForm] = useState({ name: "", email: "", title: "", content: "", status: "open", isPublic: true });

  const create = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/prayers", form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prayers"] });
      setForm({ name: "", email: "", title: "", content: "", status: "open", isPublic: true });
      toast({ title: "Prayer added" });
    },
    onError: (err: any) => toast({ title: "Failed to add prayer", description: err?.message, variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/prayers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/prayers"] }),
  });

  const approve = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/admin/prayers/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/prayers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/prayers"] });
      toast({ title: "Prayer approved" });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Add Prayer</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Name *</Label><Input className="mt-1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Doe" /></div>
            <div><Label>Email</Label><Input className="mt-1" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@example.com" /></div>
            <div><Label>Title *</Label><Input className="mt-1" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Prayer for wisdom" /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">open</SelectItem>
                  <SelectItem value="answered">answered</SelectItem>
                  <SelectItem value="archived">archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Visibility</Label>
              <Select value={form.isPublic ? "public" : "private"} onValueChange={v => setForm(f => ({ ...f, isPublic: v === "public" }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Prayer *</Label><Textarea className="mt-1 min-h-[120px]" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Write the prayer content..." /></div>
          <Button onClick={() => create.mutate()} disabled={!form.name || !form.title || !form.content || create.isPending} className="rounded-full font-bold">
            <Plus className="w-4 h-4 mr-2" />{create.isPending ? "Adding..." : "Add Prayer"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Prayers ({prayers.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> :
            prayers.length === 0 ? <p className="text-sm text-muted-foreground">No prayers yet.</p> :
              <div className="space-y-2">
                {prayers.map((p: any) => (
                  <div key={p.id} className="flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-card">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.name} {p.email ? `· ${p.email}` : ""} · {p.status} · {p.isPublic ? "public" : "private"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.content}</p>
                    </div>
                    {!p.isPublic && (
                      <Button variant="outline" size="sm" className="shrink-0" onClick={() => approve.mutate(p.id)}>
                        Approve
                      </Button>
                    )}
                    <DeleteBtn onDelete={() => del.mutate(p.id)} />
                  </div>
                ))}
              </div>}
        </CardContent>
      </Card>
    </div>
  );
}

function StudentsTasksTab() {
  const { toast } = useToast();
  const { data: students = [], isLoading: loadingStudents } = useQuery<any[]>({ queryKey: ["/api/admin/students"] });
  const { data: courses = [] } = useQuery<any[]>({ queryKey: ["/api/courses"] });
  const { data: tasks = [], isLoading: loadingTasks } = useQuery<any[]>({ queryKey: ["/api/admin/tasks"] });
  const [form, setForm] = useState({
    studentUserId: "",
    courseId: "",
    title: "",
    description: "",
    dueAt: "",
  });

  const assignTask = useMutation({
    mutationFn: () =>
      apiRequest("POST", "/api/admin/tasks", {
        studentUserId: form.studentUserId,
        courseId: form.courseId ? Number(form.courseId) : null,
        title: form.title,
        description: form.description || null,
        dueAt: form.dueAt || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tasks"] });
      setForm({ studentUserId: "", courseId: "", title: "", description: "", dueAt: "" });
      toast({ title: "Task assigned" });
    },
    onError: (err: any) => toast({ title: "Failed to assign task", description: err?.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Assign Task to Student</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Student *</Label>
              <Select value={form.studentUserId} onValueChange={v => setForm(f => ({ ...f, studentUserId: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.map((s: any) => (
                    <SelectItem key={s.userId} value={s.userId}>
                      {(s.firstName || "") + " " + (s.lastName || "")} ({s.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Course (optional)</Label>
              <Select value={form.courseId} onValueChange={v => setForm(f => ({ ...f, courseId: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {courses.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Task Title *</Label><Input className="mt-1" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Complete Module 1 summary" /></div>
            <div><Label>Due Date</Label><Input className="mt-1" type="datetime-local" value={form.dueAt} onChange={e => setForm(f => ({ ...f, dueAt: e.target.value }))} /></div>
          </div>
          <div><Label>Description</Label><Textarea className="mt-1 min-h-[100px]" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Task details for the student..." /></div>
          <Button onClick={() => assignTask.mutate()} disabled={!form.studentUserId || !form.title || assignTask.isPending} className="rounded-full font-bold">
            <Plus className="w-4 h-4 mr-2" />{assignTask.isPending ? "Assigning..." : "Assign Task"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Enrolled Students ({students.length})</CardTitle></CardHeader>
        <CardContent>
          {loadingStudents ? <p className="text-sm text-muted-foreground">Loading…</p> :
            students.length === 0 ? <p className="text-sm text-muted-foreground">No enrolled students yet.</p> :
              <div className="space-y-2">
                {students.map((s: any) => (
                  <div key={s.userId} className="p-3 rounded-xl border border-border/50 bg-card">
                    <p className="font-semibold">{((s.firstName || "") + " " + (s.lastName || "")).trim() || s.email}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      Courses: {(s.enrollments || []).map((e: any) => e.courseTitle).filter(Boolean).join(", ") || "None"}
                    </p>
                  </div>
                ))}
              </div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Assigned Tasks ({tasks.length})</CardTitle></CardHeader>
        <CardContent>
          {loadingTasks ? <p className="text-sm text-muted-foreground">Loading…</p> :
            tasks.length === 0 ? <p className="text-sm text-muted-foreground">No tasks assigned yet.</p> :
              <div className="space-y-2">
                {tasks.map((t: any) => (
                  <div key={t.id} className="p-3 rounded-xl border border-border/50 bg-card">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{t.title}</p>
                      <Badge variant="outline">{t.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Student: {((t.studentFirstName || "") + " " + (t.studentLastName || "")).trim() || t.studentEmail}
                      {t.courseTitle ? ` · Course: ${t.courseTitle}` : ""}
                      {t.dueAt ? ` · Due: ${new Date(t.dueAt).toLocaleString()}` : ""}
                    </p>
                    {t.description ? <p className="text-sm text-muted-foreground mt-1">{t.description}</p> : null}
                  </div>
                ))}
              </div>}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tracks & Courses Tab ───────────────────────────────────────────────────
function CoursesTab() {
  const { toast } = useToast();
  const { data: tracks = [] } = useQuery<any[]>({ queryKey: ["/api/tracks"] });
  const { data: courses = [] } = useQuery<any[]>({ queryKey: ["/api/courses"] });

  const [trackForm, setTrackForm] = useState({
    slug: "",
    title: "",
    description: "",
    imageUrl: "",
    order: 0,
  });
  const [courseForm, setCourseForm] = useState({
    trackId: "",
    slug: "",
    title: "",
    description: "",
    price: 0,
    level: "beginner",
    duration: "",
    imageUrl: "",
    isPublished: true,
  });
  const [trackImageFile, setTrackImageFile] = useState<File | null>(null);
  const [courseImageFile, setCourseImageFile] = useState<File | null>(null);

  async function uploadImage(file: File, folder: "tracks" | "courses"): Promise<string> {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("course-images")
      .upload(path, file, { upsert: false, cacheControl: "3600" });
    if (uploadError) {
      throw new Error(
        `${uploadError.message}. Ensure a public 'course-images' bucket exists in Supabase Storage.`
      );
    }
    const { data } = supabase.storage.from("course-images").getPublicUrl(path);
    return data.publicUrl;
  }

  const createTrack = useMutation({
    mutationFn: async () => {
      let imageUrl = trackForm.imageUrl || null;
      if (trackImageFile) {
        imageUrl = await uploadImage(trackImageFile, "tracks");
      }
      return apiRequest("POST", "/api/admin/tracks", {
        ...trackForm,
        order: Number(trackForm.order) || 0,
        imageUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
      setTrackForm({ slug: "", title: "", description: "", imageUrl: "", order: 0 });
      setTrackImageFile(null);
      toast({ title: "Track created" });
    },
    onError: (err: any) => toast({ title: "Failed to create track", description: err?.message, variant: "destructive" }),
  });

  const createCourse = useMutation({
    mutationFn: async () => {
      let imageUrl = courseForm.imageUrl || null;
      if (courseImageFile) {
        imageUrl = await uploadImage(courseImageFile, "courses");
      }
      return apiRequest("POST", "/api/admin/courses", {
        ...courseForm,
        trackId: courseForm.trackId ? Number(courseForm.trackId) : null,
        price: Number(courseForm.price) || 0,
        imageUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setCourseForm({
        trackId: "",
        slug: "",
        title: "",
        description: "",
        price: 0,
        level: "beginner",
        duration: "",
        imageUrl: "",
        isPublished: true,
      });
      setCourseImageFile(null);
      toast({ title: "Course created" });
    },
    onError: (err: any) => toast({ title: "Failed to create course", description: err?.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-lg">Create Track</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Slug *</Label><Input className="mt-1" value={trackForm.slug} onChange={e => setTrackForm(f => ({ ...f, slug: e.target.value }))} placeholder="foundations" /></div>
            <div><Label>Title *</Label><Input className="mt-1" value={trackForm.title} onChange={e => setTrackForm(f => ({ ...f, title: e.target.value }))} placeholder="Foundations of Stewardship" /></div>
            <div><Label>Order</Label><Input className="mt-1" type="number" value={trackForm.order} onChange={e => setTrackForm(f => ({ ...f, order: Number(e.target.value) }))} /></div>
            <div>
              <Label>Track Image</Label>
              <Input
                className="mt-1"
                type="file"
                accept="image/*"
                onChange={e => setTrackImageFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <div><Label>Description *</Label><Textarea className="mt-1" value={trackForm.description} onChange={e => setTrackForm(f => ({ ...f, description: e.target.value }))} placeholder="Track description..." /></div>
          <Button onClick={() => createTrack.mutate()} disabled={!trackForm.slug || !trackForm.title || !trackForm.description || createTrack.isPending} className="rounded-full font-bold">
            <Plus className="w-4 h-4 mr-2" />{createTrack.isPending ? "Uploading/Creating..." : "Create Track"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Create Course</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Track</Label>
              <Select value={courseForm.trackId} onValueChange={v => setCourseForm(f => ({ ...f, trackId: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select a track" /></SelectTrigger>
                <SelectContent>
                  {tracks.map((t: any) => <SelectItem key={t.id} value={String(t.id)}>{t.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Slug *</Label><Input className="mt-1" value={courseForm.slug} onChange={e => setCourseForm(f => ({ ...f, slug: e.target.value }))} placeholder="stewardship-101" /></div>
            <div><Label>Title *</Label><Input className="mt-1" value={courseForm.title} onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))} placeholder="Stewardship 101" /></div>
            <div><Label>Price (cents)</Label><Input className="mt-1" type="number" value={courseForm.price} onChange={e => setCourseForm(f => ({ ...f, price: Number(e.target.value) }))} /></div>
            <div>
              <Label>Level</Label>
              <Select value={courseForm.level} onValueChange={v => setCourseForm(f => ({ ...f, level: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">beginner</SelectItem>
                  <SelectItem value="intermediate">intermediate</SelectItem>
                  <SelectItem value="advanced">advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Duration</Label><Input className="mt-1" value={courseForm.duration} onChange={e => setCourseForm(f => ({ ...f, duration: e.target.value }))} placeholder="4 hours" /></div>
            <div>
              <Label>Course Image</Label>
              <Input
                className="mt-1"
                type="file"
                accept="image/*"
                onChange={e => setCourseImageFile(e.target.files?.[0] || null)}
              />
            </div>
            <div>
              <Label>Published</Label>
              <Select value={courseForm.isPublished ? "true" : "false"} onValueChange={v => setCourseForm(f => ({ ...f, isPublished: v === "true" }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Published</SelectItem>
                  <SelectItem value="false">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Description *</Label><Textarea className="mt-1 min-h-[120px]" value={courseForm.description} onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))} placeholder="Course description..." /></div>
          <Button onClick={() => createCourse.mutate()} disabled={!courseForm.slug || !courseForm.title || !courseForm.description || createCourse.isPending} className="rounded-full font-bold">
            <Plus className="w-4 h-4 mr-2" />{createCourse.isPending ? "Uploading/Creating..." : "Create Course"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Current Data</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-bold mb-2">Tracks ({tracks.length})</p>
            <div className="space-y-2">
              {tracks.map((t: any) => (
                <div key={t.id} className="p-3 rounded-xl border border-border/50 bg-card text-sm">
                  <span className="font-semibold">{t.title}</span> <span className="text-muted-foreground">({t.slug})</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold mb-2">Courses ({courses.length})</p>
            <div className="space-y-2">
              {courses.map((c: any) => (
                <div key={c.id} className="p-3 rounded-xl border border-border/50 bg-card text-sm">
                  <span className="font-semibold">{c.title}</span> <span className="text-muted-foreground">({c.slug})</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Admin Dashboard ──────────────────────────────────────────────────
const TABS = [
  { id: "courses", label: "Courses", icon: GraduationCap },
  { id: "songs", label: "Songs", icon: Music },
  { id: "quiz", label: "Quiz Questions", icon: Brain },
  { id: "wordsearch", label: "Word Search", icon: Search },
  { id: "crossword", label: "Crossword", icon: Grid3X3 },
  { id: "testimonies", label: "Testimonies", icon: MessageSquare },
  { id: "prayers", label: "Prayers", icon: MessageSquare },
  { id: "students", label: "Students & Tasks", icon: Users },
] as const;

type TabId = typeof TABS[number]["id"];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("courses");
  const { toast } = useToast();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    toast({ title: "Logged out" });
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
        <div className="grid lg:grid-cols-[260px_1fr] gap-6 items-start">
          <aside className="lg:sticky lg:top-24">
            <div className="bg-card border border-border/50 rounded-2xl p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 pb-2">Admin Menu</p>
              <div className="space-y-2">
                {TABS.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        activeTab === tab.id
                          ? "border-primary bg-primary/5"
                          : "border-border/50 bg-background hover:border-primary/30"
                      }`}
                    >
                      <Icon className={`w-5 h-5 shrink-0 ${activeTab === tab.id ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-bold ${activeTab === tab.id ? "text-primary" : ""}`}>{tab.label}</span>
                      {activeTab === tab.id && <ChevronRight className="w-4 h-4 text-primary ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <main>
            {activeTab === "courses" && <CoursesTab />}
            {activeTab === "songs" && <SongsTab />}
            {activeTab === "quiz" && <QuizTab />}
            {activeTab === "wordsearch" && <WordSearchTab />}
            {activeTab === "crossword" && <CrosswordTab />}
            {activeTab === "testimonies" && <TestimoniesTab />}
            {activeTab === "prayers" && <PrayersTab />}
            {activeTab === "students" && <StudentsTasksTab />}
          </main>
        </div>
      </div>
    </div>
  );
}
