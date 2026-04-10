import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Brain, Search, Grid3X3, ChevronLeft, CheckCircle2, XCircle, Trophy, RotateCcw, MapPin, BookOpen, Loader2 } from "lucide-react";

// ── Word Search grid builder ──────────────────────────────────────────────
const GRID_SIZE = 18;
const DIRS: [number, number][] = [[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]];

function generateGrid(words: string[]) {
  const grid: string[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(""));
  const placements: Record<string, [number, number][]> = {};
  const sorted = [...words].sort((a, b) => b.length - a.length);
  for (const word of sorted) {
    let placed = false;
    for (let attempt = 0; attempt < 400 && !placed; attempt++) {
      const [dr, dc] = DIRS[Math.floor(Math.random() * DIRS.length)];
      const rMin = dr < 0 ? word.length - 1 : 0;
      const rMax = dr > 0 ? GRID_SIZE - word.length : GRID_SIZE - 1;
      const cMin = dc < 0 ? word.length - 1 : 0;
      const cMax = dc > 0 ? GRID_SIZE - word.length : GRID_SIZE - 1;
      if (rMax < rMin || cMax < cMin) continue;
      const r0 = rMin + Math.floor(Math.random() * (rMax - rMin + 1));
      const c0 = cMin + Math.floor(Math.random() * (cMax - cMin + 1));
      const positions: [number, number][] = [];
      let fits = true;
      for (let i = 0; i < word.length; i++) {
        const r = r0 + dr * i, c = c0 + dc * i;
        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) { fits = false; break; }
        if (grid[r][c] !== "" && grid[r][c] !== word[i]) { fits = false; break; }
        positions.push([r, c]);
      }
      if (fits) {
        positions.forEach(([r, c], i) => { grid[r][c] = word[i]; });
        placements[word] = positions;
        placed = true;
      }
    }
  }
  const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < GRID_SIZE; r++)
    for (let c = 0; c < GRID_SIZE; c++)
      if (!grid[r][c]) grid[r][c] = ALPHA[Math.floor(Math.random() * 26)];
  return { grid, placements };
}

function cellKey(r: number, c: number) { return `${r},${c}`; }
function pathBetween(a: [number,number], b: [number,number]): [number,number][] | null {
  const [r1,c1] = a, [r2,c2] = b;
  const dr = r2-r1, dc = c2-c1;
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
  const len = Math.max(Math.abs(dr), Math.abs(dc));
  const sr = Math.sign(dr), sc = Math.sign(dc);
  return Array.from({ length: len+1 }, (_,i) => [r1+sr*i, c1+sc*i] as [number,number]);
}

// ── Crossword Game ────────────────────────────────────────────────────────
type CWWord = { word: string; clue: string; row: number; col: number; dir: "across" | "down"; num: number };
type CWData = { words: CWWord[]; gridH: number; gridW: number };

function CrosswordGame({ puzzle, onBack }: { puzzle: any; onBack: () => void }) {
  const data: CWData = JSON.parse(puzzle.data);
  const { words, gridH, gridW } = data;

  const cellMap = useMemo(() => {
    const m: Record<string, { letter: string; nums: number[]; acrossNum?: number; downNum?: number }> = {};
    for (const w of words) {
      const dr = w.dir === "down" ? 1 : 0;
      const dc = w.dir === "across" ? 1 : 0;
      for (let i = 0; i < w.word.length; i++) {
        const k = cellKey(w.row + dr * i, w.col + dc * i);
        if (!m[k]) m[k] = { letter: w.word[i], nums: [] };
        if (i === 0) { m[k].nums.push(w.num); if (w.dir === "across") m[k].acrossNum = w.num; else m[k].downNum = w.num; }
      }
    }
    return m;
  }, [words]);

  const [typed, setTyped] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [selectedDir, setSelectedDir] = useState<"across" | "down">("across");
  const [selectedNum, setSelectedNum] = useState<number | null>(null);

  function handleKey(k: string, letter: string, e: React.KeyboardEvent) {
    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      setTyped(t => ({ ...t, [k]: e.key.toUpperCase() }));
    } else if (e.key === "Backspace") {
      setTyped(t => { const n = { ...t }; delete n[k]; return n; });
    }
  }

  const allCorrect = words.every(w => {
    const dr = w.dir === "down" ? 1 : 0;
    const dc = w.dir === "across" ? 1 : 0;
    return w.word.split("").every((l, i) => typed[cellKey(w.row + dr * i, w.col + dc * i)] === l);
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-foreground text-background py-4 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" className="text-background hover:bg-white/10" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" />Back</Button>
          <h2 className="text-lg font-bold">{puzzle.title}</h2>
          <Button size="sm" variant="ghost" className="text-background hover:bg-white/10" onClick={() => setChecked(c => !c)}>{checked ? "Hide" : "Check"}</Button>
        </div>
      </div>

      {allCorrect && <div className="bg-green-100 border-b border-green-300 py-3 text-center"><Trophy className="w-5 h-5 text-amber-500 inline mr-2" /><span className="font-bold text-green-800">Congratulations! Puzzle complete!</span></div>}

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-3 mb-4">
          {(["across","down"] as const).map(d => (
            <Button key={d} size="sm" variant={selectedDir === d ? "default" : "outline"} className="rounded-full capitalize" onClick={() => setSelectedDir(d)}>{d}</Button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="overflow-x-auto">
            <div className="inline-grid gap-px bg-border rounded-lg overflow-hidden shadow-lg"
              style={{ gridTemplateColumns: `repeat(${gridW}, minmax(0, 1fr))` }}>
              {Array.from({ length: gridH }, (_, r) =>
                Array.from({ length: gridW }, (__, c) => {
                  const k = cellKey(r, c);
                  const cell = cellMap[k];
                  if (!cell) return <div key={k} className="w-8 h-8 bg-foreground" />;
                  const userLetter = typed[k] || "";
                  const isCorrect = checked ? userLetter === cell.letter : null;
                  return (
                    <div key={k} className="relative w-8 h-8 bg-card">
                      {cell.nums.length > 0 && <span className="absolute top-0 left-0.5 text-[8px] font-bold text-muted-foreground leading-none">{cell.nums[0]}</span>}
                      <input
                        maxLength={1}
                        value={userLetter}
                        onKeyDown={e => handleKey(k, cell.letter, e)}
                        onChange={() => {}}
                        className={`w-full h-full text-center text-sm font-bold uppercase bg-transparent outline-none border-0 pt-1
                          ${isCorrect === true ? "text-green-600" : isCorrect === false ? "text-red-500" : "text-foreground"}`}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {(["across","down"] as const).map(dir => (
                <div key={dir}>
                  <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-3 capitalize">{dir}</h3>
                  <div className="space-y-1.5">
                    {words.filter(w => w.dir === dir).map(w => (
                      <button key={w.num} onClick={() => { setSelectedNum(w.num); setSelectedDir(dir); }}
                        className={`w-full text-left text-sm p-2 rounded-lg transition-colors ${selectedNum === w.num && selectedDir === dir ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                        <span className="font-bold text-primary">{w.num}.</span> {w.clue}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Multiple Choice Quiz ──────────────────────────────────────────────────
function MultipleChoiceGame({ onBack }: { onBack: () => void }) {
  const { data: rawQuestions = [], isLoading, isError, error } = useQuery<any[]>({ queryKey: ["/api/quiz-questions"] });
  const questions = rawQuestions.map(q => ({
    id: q.id, scripture: q.scripture, question: q.question,
    options: [q.optionA, q.optionB, q.optionC, q.optionD],
    correct: q.correctOption,
  }));

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);

  function handleAnswer(idx: number) {
    if (selected !== null || !questions.length) return;
    setSelected(idx);
    const correct = idx === questions[current].correct;
    if (correct) setScore(s => s+1);
    setAnswers(a => [...a, correct]);
  }
  function handleNext() {
    if (current + 1 >= questions.length) setFinished(true);
    else { setCurrent(c => c+1); setSelected(null); }
  }
  function handleRestart() { setCurrent(0); setSelected(null); setScore(0); setFinished(false); setAnswers([]); }

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading questions…</p>
    </div>
  );

  if (isError) return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-foreground text-background py-4 px-4">
        <div className="container mx-auto"><Button variant="ghost" size="sm" className="text-background hover:bg-white/10" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" />Back</Button></div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div><Brain className="w-16 h-16 text-destructive/60 mx-auto mb-4" /><h2 className="text-xl font-bold mb-2">Could not load quiz</h2><p className="text-muted-foreground">{(error as Error)?.message || "API request failed."}</p></div>
      </div>
    </div>
  );

  if (!questions.length) return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-foreground text-background py-4 px-4">
        <div className="container mx-auto"><Button variant="ghost" size="sm" className="text-background hover:bg-white/10" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" />Back</Button></div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div><Brain className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" /><h2 className="text-xl font-bold mb-2">No Questions Yet</h2><p className="text-muted-foreground">Quiz questions are added by the admin. Check back soon!</p></div>
      </div>
    </div>
  );

  const q = questions[current];
  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-foreground text-background py-4 px-4"><div className="container mx-auto"><Button variant="ghost" size="sm" className="text-background hover:bg-white/10" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" />Back</Button></div></div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <Trophy className={`w-20 h-20 mx-auto mb-6 ${pct >= 80 ? "text-amber-500" : pct >= 50 ? "text-blue-500" : "text-muted-foreground"}`} />
            <h2 className="text-4xl font-black mb-2">{score}/{questions.length}</h2>
            <p className="text-2xl font-bold text-primary mb-4">{pct}%</p>
            <p className="text-muted-foreground mb-8">{pct === 100 ? "Perfect! You know your Scripture well! 🎉" : pct >= 80 ? "Excellent! Keep studying God's Word!" : pct >= 50 ? "Good effort! Keep growing in biblical knowledge." : "Don't be discouraged — every attempt deepens understanding."}</p>
            <div className="grid grid-cols-10 gap-1.5 mb-8">{answers.map((c, i) => <div key={i} className={`h-6 rounded ${c ? "bg-green-500" : "bg-red-400"}`} />)}</div>
            <div className="flex gap-3">
              <Button className="flex-1 rounded-full font-bold" onClick={handleRestart}><RotateCcw className="w-4 h-4 mr-2" />Play Again</Button>
              <Button variant="outline" className="flex-1 rounded-full font-bold" onClick={onBack}>Game Hub</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-foreground text-background py-4 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" className="text-background hover:bg-white/10" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" />Back</Button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-background/70">Question {current+1} of {questions.length}</span>
            <Badge className="bg-primary text-white border-0">Score: {score}</Badge>
          </div>
        </div>
      </div>
      <div className="w-full bg-muted h-1.5"><div className="bg-primary h-1.5 transition-all duration-500" style={{ width: `${(current / questions.length) * 100}%` }} /></div>
      <div className="flex-1 flex items-start justify-center p-6 pt-10">
        <div className="max-w-2xl w-full">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">{q.scripture}</p>
          <h2 className="text-xl md:text-2xl font-bold leading-relaxed mb-10">{q.question}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {q.options.map((opt: string, idx: number) => {
              let bg = "bg-card border-border/50 hover:border-primary/50 hover:bg-primary/5";
              if (selected !== null) {
                if (idx === q.correct) bg = "bg-green-100 border-green-500 text-green-800";
                else if (idx === selected) bg = "bg-red-100 border-red-400 text-red-800";
                else bg = "bg-card border-border/30 opacity-50";
              }
              return (
                <button key={idx} onClick={() => handleAnswer(idx)} disabled={selected !== null}
                  className={`text-left p-5 rounded-2xl border-2 font-medium transition-all duration-200 ${bg} ${selected === null ? "cursor-pointer" : "cursor-default"}`}>
                  <span className="text-xs font-bold text-muted-foreground mr-2">{String.fromCharCode(65+idx)}.</span>{opt}
                </button>
              );
            })}
          </div>
          {selected !== null && (
            <>
              <div className="flex items-start gap-3 mb-6">
                {selected === q.correct ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
                <p className="text-sm text-muted-foreground">{selected === q.correct ? `Correct! "${q.options[q.correct]}" — from ${q.scripture}.` : `The correct answer is: "${q.options[q.correct]}" — ${q.scripture}.`}</p>
              </div>
              <Button className="w-full rounded-full font-bold h-12" onClick={handleNext}>{current + 1 >= questions.length ? "See Results" : "Next Question →"}</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Word Search Game ──────────────────────────────────────────────────────
function WordSearchGame({ onBack }: { onBack: () => void }) {
  const [category, setCategory] = useState<"places"|"books">("places");
  const { data: allWords = [], isLoading, isError, error } = useQuery<any[]>({ queryKey: ["/api/word-search-words"] });

  const words = allWords.filter((w: any) => w.category === category).map((w: any) => w.word.toUpperCase());

  const [startCell, setStartCell] = useState<[number,number] | null>(null);
  const [hoverCell, setHoverCell] = useState<[number,number] | null>(null);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCellKeys, setFoundCellKeys] = useState<Set<string>>(new Set());

  const { grid, placements } = useMemo(() => generateGrid(words), [category, words.join(",")]);

  const previewPath = useMemo(() => {
    if (!startCell || !hoverCell) return new Set<string>();
    const path = pathBetween(startCell, hoverCell);
    if (!path) return new Set<string>();
    return new Set(path.map(([r,c]) => cellKey(r,c)));
  }, [startCell, hoverCell]);

  function handleCellClick(r: number, c: number) {
    if (!startCell) { setStartCell([r,c]); return; }
    if (startCell[0] === r && startCell[1] === c) { setStartCell(null); return; }
    const path = pathBetween(startCell, [r,c]);
    if (!path) { setStartCell([r,c]); return; }
    const word = path.map(([pr,pc]) => grid[pr][pc]).join("");
    const rev = [...word].reverse().join("");
    const matched = words.find(w => (w === word || w === rev) && !foundWords.includes(w));
    if (matched) {
      setFoundWords(fw => [...fw, matched]);
      setFoundCellKeys(fck => { const n = new Set(fck); path.forEach(([pr,pc]) => n.add(cellKey(pr,pc))); return n; });
    }
    setStartCell(null); setHoverCell(null);
  }

  function handleSwitchCategory(cat: "places"|"books") {
    setCategory(cat); setStartCell(null); setHoverCell(null); setFoundWords([]); setFoundCellKeys(new Set());
  }

  const done = words.length > 0 && foundWords.length === words.length;

  if (isLoading) return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-foreground text-background py-4 px-4"><div className="container mx-auto"><Button variant="ghost" size="sm" className="text-background hover:bg-white/10" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" />Back</Button></div></div>
      <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    </div>
  );

  if (isError) return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-foreground text-background py-4 px-4"><div className="container mx-auto"><Button variant="ghost" size="sm" className="text-background hover:bg-white/10" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" />Back</Button></div></div>
      <div className="flex-1 flex items-center justify-center text-center p-6">
        <div><Search className="w-16 h-16 text-destructive/60 mx-auto mb-4" /><h2 className="text-xl font-bold mb-2">Could not load word search</h2><p className="text-muted-foreground">{(error as Error)?.message || "API request failed."}</p></div>
      </div>
    </div>
  );

  if (words.length === 0) return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-foreground text-background py-4 px-4"><div className="container mx-auto"><Button variant="ghost" size="sm" className="text-background hover:bg-white/10" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" />Back</Button></div></div>
      <div className="flex-1 flex items-center justify-center text-center p-6">
        <div><Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" /><h2 className="text-xl font-bold mb-2">No Words Yet</h2><p className="text-muted-foreground">Word search words are added by the admin. Check back soon!</p></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-foreground text-background py-4 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" className="text-background hover:bg-white/10" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" />Back</Button>
          <h2 className="text-xl font-bold">Word Search</h2>
          <Badge className="bg-primary text-white border-0">{foundWords.length}/{words.length} found</Badge>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6 flex-1">
        <div className="flex gap-3 justify-center mb-6">
          <Button size="sm" variant={category === "places" ? "default" : "outline"} className="rounded-full font-bold" onClick={() => handleSwitchCategory("places")}><MapPin className="w-3 h-3 mr-1" />Places</Button>
          <Button size="sm" variant={category === "books" ? "default" : "outline"} className="rounded-full font-bold" onClick={() => handleSwitchCategory("books")}><BookOpen className="w-3 h-3 mr-1" />NT Books</Button>
        </div>
        {done && <div className="bg-green-100 border border-green-400 rounded-2xl p-4 text-center mb-6"><Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" /><p className="font-bold text-green-800 text-lg">You found all {words.length} words! 🎉</p><Button size="sm" className="mt-3 rounded-full" onClick={() => { setFoundWords([]); setFoundCellKeys(new Set()); }}><RotateCcw className="w-4 h-4 mr-1" />Play Again</Button></div>}
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          <div className="overflow-x-auto">
            <div className="inline-grid border border-border rounded-xl overflow-hidden shadow-lg select-none" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
              {grid.map((row, r) => row.map((letter, c) => {
                const k = cellKey(r,c);
                const isFound = foundCellKeys.has(k);
                const isStart = startCell && startCell[0]===r && startCell[1]===c;
                const isPreview = previewPath.has(k) && !isFound;
                let bg = "bg-card hover:bg-primary/5";
                if (isFound) bg = "bg-green-200";
                else if (isStart) bg = "bg-blue-300";
                else if (isPreview) bg = "bg-blue-100";
                return (
                  <div key={k} onClick={() => handleCellClick(r,c)} onMouseEnter={() => startCell && setHoverCell([r,c])} onMouseLeave={() => setHoverCell(null)}
                    className={`w-[22px] h-[22px] sm:w-7 sm:h-7 flex items-center justify-center text-[10px] sm:text-xs font-bold border border-border/20 cursor-pointer transition-colors ${bg}`}>{letter}</div>
                );
              }))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">Click a starting letter, then click the ending letter</p>
          </div>
          <div className="w-full lg:w-56 shrink-0">
            <h3 className="font-bold text-sm mb-3 text-muted-foreground uppercase tracking-widest">Words to Find</h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
              {words.map(word => {
                const found = foundWords.includes(word);
                return (
                  <div key={word} className={`flex items-center gap-2 text-sm py-1 px-2 rounded-lg transition-colors ${found ? "text-green-600 bg-green-50" : "text-foreground"}`}>
                    {found ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30 shrink-0" />}
                    <span className={found ? "line-through text-muted-foreground" : ""}>{word}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Crossword Picker ──────────────────────────────────────────────────────
function CrosswordPicker({ onSelect, onBack }: { onSelect: (p: any) => void; onBack: () => void }) {
  const { data: puzzles = [], isLoading, isError, error } = useQuery<any[]>({ queryKey: ["/api/crosswords"] });
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-foreground text-background py-4 px-4"><div className="container mx-auto"><Button variant="ghost" size="sm" className="text-background hover:bg-white/10" onClick={onBack}><ChevronLeft className="w-4 h-4 mr-1" />Back</Button></div></div>
      <div className="container mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-center mb-8">Choose a Crossword</h2>
        {isLoading ? <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> :
          isError ? (
            <div className="text-center py-16"><Grid3X3 className="w-16 h-16 text-destructive/60 mx-auto mb-4" /><h3 className="text-xl font-bold mb-2">Could not load crosswords</h3><p className="text-muted-foreground">{(error as Error)?.message || "API request failed."}</p></div>
          ) :
          puzzles.length === 0 ? (
            <div className="text-center py-16"><Grid3X3 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" /><h3 className="text-xl font-bold mb-2">No Crosswords Yet</h3><p className="text-muted-foreground">Crossword puzzles are created by the admin. Check back soon!</p></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {puzzles.map((p: any) => {
                const d: CWData = JSON.parse(p.data);
                return (
                  <Card key={p.id} className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/50" onClick={() => onSelect(p)}>
                    <CardContent className="p-6 text-center">
                      <Grid3X3 className="w-10 h-10 text-primary mx-auto mb-3" />
                      <h3 className="font-bold text-lg mb-2">{p.title}</h3>
                      <p className="text-sm text-muted-foreground">{d.words.length} words · {d.gridW}×{d.gridH} grid</p>
                      <Button className="w-full mt-4 rounded-full font-bold" size="sm">Play</Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}

// ── Game Hub ──────────────────────────────────────────────────────────────
function GameHub({ onSelect }: { onSelect: (g: "quiz"|"wordsearch"|"crossword") => void }) {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-foreground text-background py-16 text-center">
        <div className="container mx-auto px-4">
          <Gamepad2 className="w-14 h-14 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Faith Games</h1>
          <p className="text-lg text-background/70 max-w-2xl mx-auto">Interactive Bible-based games designed to deepen your knowledge and strengthen your faith</p>
        </div>
      </section>
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { id: "quiz" as const, icon: Brain, title: "Multiple Choice Quiz", desc: "Test your Scripture knowledge with questions on biblical finance and faith.", badges: ["Scripture-based", "All Levels"], variant: "default" as const },
            { id: "wordsearch" as const, icon: Search, title: "Word Search", desc: "Find hidden Bible places and New Testament books in our interactive puzzle.", badges: ["2 Categories", "Bible Places"], variant: "outline" as const },
            { id: "crossword" as const, icon: Grid3X3, title: "Crossword Puzzle", desc: "Solve crossword puzzles built around biblical finance vocabulary and scripture.", badges: ["Multiple Puzzles", "Challenging"], variant: "outline" as const },
          ].map(g => {
            const Icon = g.icon;
            return (
              <Card key={g.id} className="border-2 border-border hover:border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={() => onSelect(g.id)}>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold mb-3">{g.title}</h2>
                  <p className="text-muted-foreground mb-5 text-sm leading-relaxed">{g.desc}</p>
                  <div className="flex justify-center gap-2 flex-wrap mb-5">{g.badges.map(b => <Badge key={b} variant="outline" className="text-xs">{b}</Badge>)}</div>
                  <Button className="w-full rounded-full font-bold" variant={g.variant}>Play</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────
export default function GamesPage() {
  const [mode, setMode] = useState<"hub"|"quiz"|"wordsearch"|"crossword">("hub");
  const [selectedPuzzle, setSelectedPuzzle] = useState<any>(null);

  if (mode === "quiz") return <MultipleChoiceGame onBack={() => setMode("hub")} />;
  if (mode === "wordsearch") return <WordSearchGame onBack={() => setMode("hub")} />;
  if (mode === "crossword" && selectedPuzzle) return <CrosswordGame puzzle={selectedPuzzle} onBack={() => { setSelectedPuzzle(null); }} />;
  if (mode === "crossword") return <CrosswordPicker onSelect={p => setSelectedPuzzle(p)} onBack={() => setMode("hub")} />;
  return <GameHub onSelect={setMode} />;
}
