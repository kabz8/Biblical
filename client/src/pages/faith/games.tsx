import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Brain, Search, ChevronLeft, CheckCircle2, XCircle, Trophy, RotateCcw, MapPin, BookOpen } from "lucide-react";

// ── Multiple Choice Quiz Questions (from uploaded slides) ──────────────────
const QUIZ_QUESTIONS = [
  {
    id: 1, scripture: "Acts 4:32",
    question: "Based on Acts 4:32, how did the early multitude of believers approach their personal possessions?",
    options: ["they sold them for individual profit", "they discarded all material wealth", "they kept their belongings strictly private", "they held all things in common"],
    correct: 3,
  },
  {
    id: 2, scripture: "James 1:21",
    question: "According to James 1:21, what must be received with 'meekness' to enable the salvation of the soul?",
    options: ["the engrafted word", "strict societal laws", "personal intuition", "worldly philosophy"],
    correct: 0,
  },
  {
    id: 3, scripture: "1 Chronicles 16:27",
    question: "According to 1 Chronicles 16:27, which pair of attributes is found 'in his dwelling place'?",
    options: ["splendor and majesty", "peace and protection", "glory and honor", "strength and joy"],
    correct: 3,
  },
  {
    id: 4, scripture: "Proverbs 22:7",
    question: "According to Proverbs 22:7, the borrower is servant to the ___?",
    options: ["king", "lender", "creditor", "wise man"],
    correct: 1,
  },
  {
    id: 5, scripture: "Luke 16:10",
    question: "According to Luke 16:10, whoever is faithful in very little is also faithful in ___?",
    options: ["great things", "nothing more", "much", "everything"],
    correct: 2,
  },
  {
    id: 6, scripture: "Malachi 3:10",
    question: "What does Malachi 3:10 instruct believers to bring into the storehouse?",
    options: ["their firstfruits", "their offerings", "the whole tithe", "tithes and offerings"],
    correct: 2,
  },
  {
    id: 7, scripture: "2 Corinthians 9:7",
    question: "What kind of giver does God love, according to 2 Corinthians 9:7?",
    options: ["generous", "regular", "cheerful", "willing"],
    correct: 2,
  },
  {
    id: 8, scripture: "Matthew 6:24",
    question: "According to Matthew 6:24, you cannot serve God and ___?",
    options: ["man", "the world", "mammon", "self"],
    correct: 2,
  },
  {
    id: 9, scripture: "Deuteronomy 8:18",
    question: "According to Deuteronomy 8:18, who gives you the ability to produce wealth?",
    options: ["your own wisdom", "your ancestors", "God", "diligent work"],
    correct: 2,
  },
  {
    id: 10, scripture: "Proverbs 13:22",
    question: "According to Proverbs 13:22, a good person leaves an inheritance for ___?",
    options: ["the poor", "the church", "their children", "their children's children"],
    correct: 3,
  },
];

// ── Word Search Data (from uploaded docx) ─────────────────────────────────
const WORD_CATEGORIES = {
  places: {
    label: "Places in the Bible",
    icon: MapPin,
    color: "text-amber-600",
    words: ["BETHANY","DEADSEA","EDEN","GOSHEN","ARARAT","CARMEL","NEBO","SINAI","ZION","JORDAN","GALILEE","GETHSEMANE"],
  },
  books: {
    label: "New Testament Books",
    icon: BookOpen,
    color: "text-blue-600",
    words: ["ACTS","COLOSSIANS","EPHESIANS","GALATIANS","HEBREWS","JAMES","JOHN","JUDE","LUKE","MARK","MATTHEW","PETER","PHILEMON","PHILIPPIANS","REVELATION","ROMANS","TITUS","TIMOTHY"],
  },
};

const GRID_SIZE = 18;
const DIRECTIONS: [number, number][] = [[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]];

function generateGrid(words: string[]) {
  const grid: string[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(""));
  const placements: Record<string, [number, number][]> = {};

  const sorted = [...words].sort((a, b) => b.length - a.length);

  for (const word of sorted) {
    let placed = false;
    for (let attempt = 0; attempt < 400 && !placed; attempt++) {
      const [dr, dc] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
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

  // Fill blanks with random letters
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

// ── Sub-components ─────────────────────────────────────────────────────────

function GameHub({ onSelect }: { onSelect: (g: "quiz"|"wordsearch") => void }) {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-foreground text-background py-16 text-center">
        <div className="container mx-auto px-4">
          <Gamepad2 className="w-14 h-14 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Faith Games</h1>
          <p className="text-lg text-background/70 max-w-2xl mx-auto">
            Engage with interactive Bible-based games designed to deepen your knowledge and strengthen your faith
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <Card
            className="border-2 border-border hover:border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => onSelect("quiz")}
          >
            <CardContent className="p-10 text-center">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <Brain className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Multiple Choice Quiz</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Test your knowledge of Scripture with 10 carefully crafted questions on biblical finance and faith.
              </p>
              <div className="flex justify-center gap-3 flex-wrap mb-6">
                <Badge variant="outline">10 Questions</Badge>
                <Badge variant="outline">Scripture-based</Badge>
                <Badge variant="outline">All Levels</Badge>
              </div>
              <Button className="w-full rounded-full font-bold">Play Quiz</Button>
            </CardContent>
          </Card>

          <Card
            className="border-2 border-border hover:border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={() => onSelect("wordsearch")}
          >
            <CardContent className="p-10 text-center">
              <div className="w-20 h-20 rounded-3xl bg-amber-100 flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-200 transition-colors">
                <Search className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Word Search</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Find hidden Bible places and New Testament books in our interactive word search puzzle.
              </p>
              <div className="flex justify-center gap-3 flex-wrap mb-6">
                <Badge variant="outline">2 Categories</Badge>
                <Badge variant="outline">Bible Places</Badge>
                <Badge variant="outline">NT Books</Badge>
              </div>
              <Button className="w-full rounded-full font-bold" variant="outline">Play Word Search</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function MultipleChoiceGame({ onBack }: { onBack: () => void }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const q = QUIZ_QUESTIONS[current];

  function handleAnswer(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === q.correct;
    if (correct) setScore(s => s+1);
    setAnswers(a => [...a, correct]);
  }

  function handleNext() {
    if (current + 1 >= QUIZ_QUESTIONS.length) {
      setFinished(true);
    } else {
      setCurrent(c => c+1);
      setSelected(null);
    }
  }

  function handleRestart() {
    setCurrent(0); setSelected(null); setScore(0); setFinished(false); setAnswers([]);
  }

  if (finished) {
    const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-foreground text-background py-6 px-4">
          <div className="container mx-auto flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-background hover:bg-white/10" onClick={onBack}>
              <ChevronLeft className="w-4 h-4 mr-1" />Back
            </Button>
            <h2 className="text-xl font-bold">Quiz Complete</h2>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <Trophy className={`w-20 h-20 mx-auto mb-6 ${pct >= 80 ? "text-amber-500" : pct >= 50 ? "text-blue-500" : "text-muted-foreground"}`} />
            <h2 className="text-4xl font-black mb-2">{score}/{QUIZ_QUESTIONS.length}</h2>
            <p className="text-2xl font-bold text-primary mb-4">{pct}%</p>
            <p className="text-muted-foreground mb-8">
              {pct === 100 ? "Perfect score! You know your Scripture well! 🎉" : pct >= 80 ? "Excellent! Keep studying God's Word!" : pct >= 50 ? "Good effort! Keep growing in biblical knowledge." : "Don't be discouraged — every attempt deepens understanding."}
            </p>
            <div className="grid grid-cols-10 gap-1.5 mb-8">
              {answers.map((correct, i) => (
                <div key={i} className={`h-6 rounded ${correct ? "bg-green-500" : "bg-red-400"}`} />
              ))}
            </div>
            <div className="flex gap-3">
              <Button className="flex-1 rounded-full font-bold" onClick={handleRestart}>
                <RotateCcw className="w-4 h-4 mr-2" />Play Again
              </Button>
              <Button variant="outline" className="flex-1 rounded-full font-bold" onClick={onBack}>
                Game Hub
              </Button>
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
          <Button variant="ghost" size="sm" className="text-background hover:bg-white/10" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-1" />Back
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-background/70">Question {current+1} of {QUIZ_QUESTIONS.length}</span>
            <Badge className="bg-primary text-white border-0">Score: {score}</Badge>
          </div>
        </div>
      </div>

      <div className="w-full bg-muted h-1.5">
        <div className="bg-primary h-1.5 transition-all duration-500" style={{ width: `${((current) / QUIZ_QUESTIONS.length) * 100}%` }} />
      </div>

      <div className="flex-1 flex items-start justify-center p-6 pt-10">
        <div className="max-w-2xl w-full">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">{q.scripture}</p>
          <h2 className="text-xl md:text-2xl font-bold leading-relaxed mb-10">{q.question}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {q.options.map((opt, idx) => {
              let bg = "bg-card border-border/50 hover:border-primary/50 hover:bg-primary/5";
              if (selected !== null) {
                if (idx === q.correct) bg = "bg-green-100 border-green-500 text-green-800";
                else if (idx === selected && idx !== q.correct) bg = "bg-red-100 border-red-400 text-red-800";
                else bg = "bg-card border-border/30 opacity-50";
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={selected !== null}
                  className={`text-left p-5 rounded-2xl border-2 font-medium transition-all duration-200 ${bg} ${selected === null ? "cursor-pointer" : "cursor-default"}`}
                >
                  <span className="text-xs font-bold text-muted-foreground mr-2">{String.fromCharCode(65+idx)}.</span>
                  {opt}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div className="flex items-start gap-3 mb-6">
              {selected === q.correct
                ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                : <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
              <p className="text-sm text-muted-foreground">
                {selected === q.correct
                  ? `Correct! "${q.options[q.correct]}" — from ${q.scripture}.`
                  : `Incorrect. The correct answer is: "${q.options[q.correct]}" — ${q.scripture}.`}
              </p>
            </div>
          )}

          {selected !== null && (
            <Button className="w-full rounded-full font-bold h-12" onClick={handleNext}>
              {current + 1 >= QUIZ_QUESTIONS.length ? "See Results" : "Next Question →"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function WordSearchGame({ onBack }: { onBack: () => void }) {
  const [category, setCategory] = useState<"places"|"books">("places");
  const [startCell, setStartCell] = useState<[number,number] | null>(null);
  const [hoverCell, setHoverCell] = useState<[number,number] | null>(null);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCellKeys, setFoundCellKeys] = useState<Set<string>>(new Set());

  const words = WORD_CATEGORIES[category].words;

  const { grid, placements } = useMemo(() => generateGrid(words), [category]);

  const previewPath = useMemo(() => {
    if (!startCell || !hoverCell) return new Set<string>();
    const path = pathBetween(startCell, hoverCell);
    if (!path) return new Set<string>();
    return new Set(path.map(([r,c]) => cellKey(r,c)));
  }, [startCell, hoverCell]);

  function handleCellClick(r: number, c: number) {
    if (!startCell) {
      setStartCell([r,c]);
      return;
    }
    if (startCell[0] === r && startCell[1] === c) {
      setStartCell(null);
      return;
    }
    const path = pathBetween(startCell, [r,c]);
    if (!path) { setStartCell([r,c]); return; }

    const word = path.map(([pr,pc]) => grid[pr][pc]).join("");
    const rev = [...word].reverse().join("");
    const matched = words.find(w => (w === word || w === rev) && !foundWords.includes(w));

    if (matched) {
      setFoundWords(fw => [...fw, matched]);
      setFoundCellKeys(fck => {
        const next = new Set(fck);
        path.forEach(([pr,pc]) => next.add(cellKey(pr,pc)));
        return next;
      });
    }
    setStartCell(null);
    setHoverCell(null);
  }

  function handleRestart() {
    setStartCell(null); setHoverCell(null); setFoundWords([]); setFoundCellKeys(new Set());
  }

  function switchCategory(cat: "places"|"books") {
    setCategory(cat);
    setStartCell(null); setHoverCell(null); setFoundWords([]); setFoundCellKeys(new Set());
  }

  const catMeta = WORD_CATEGORIES[category];
  const done = foundWords.length === words.length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-foreground text-background py-4 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" className="text-background hover:bg-white/10" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-1" />Back
          </Button>
          <h2 className="text-xl font-bold">Word Search</h2>
          <Badge className="bg-primary text-white border-0">{foundWords.length}/{words.length} found</Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex-1">
        {/* Category toggle */}
        <div className="flex gap-3 justify-center mb-6">
          {(Object.entries(WORD_CATEGORIES) as [string, typeof WORD_CATEGORIES[keyof typeof WORD_CATEGORIES]][]).map(([key, meta]) => (
            <Button
              key={key}
              size="sm"
              variant={category === key ? "default" : "outline"}
              className="rounded-full font-bold"
              onClick={() => switchCategory(key as "places"|"books")}
            >
              {meta.label}
            </Button>
          ))}
        </div>

        {done && (
          <div className="bg-green-100 border border-green-400 rounded-2xl p-4 text-center mb-6">
            <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="font-bold text-green-800 text-lg">You found all {words.length} words! 🎉</p>
            <Button size="sm" className="mt-3 rounded-full" onClick={handleRestart}>
              <RotateCcw className="w-4 h-4 mr-1" />Play Again
            </Button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Grid */}
          <div className="overflow-x-auto">
            <div
              className="inline-grid border border-border rounded-xl overflow-hidden shadow-lg select-none"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
            >
              {grid.map((row, r) =>
                row.map((letter, c) => {
                  const key = cellKey(r,c);
                  const isFound = foundCellKeys.has(key);
                  const isStart = startCell && startCell[0]===r && startCell[1]===c;
                  const isPreview = previewPath.has(key) && !isFound;
                  let bg = "bg-card hover:bg-primary/5";
                  if (isFound) bg = "bg-green-200";
                  else if (isStart) bg = "bg-blue-300";
                  else if (isPreview) bg = "bg-blue-100";

                  return (
                    <div
                      key={key}
                      onClick={() => handleCellClick(r,c)}
                      onMouseEnter={() => startCell && setHoverCell([r,c])}
                      onMouseLeave={() => setHoverCell(null)}
                      className={`w-[22px] h-[22px] sm:w-7 sm:h-7 flex items-center justify-center text-[10px] sm:text-xs font-bold border border-border/20 cursor-pointer transition-colors ${bg}`}
                    >
                      {letter}
                    </div>
                  );
                })
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Click a starting letter, then click the ending letter to select a word
            </p>
          </div>

          {/* Word list */}
          <div className="w-full lg:w-56 shrink-0">
            <h3 className="font-bold text-sm mb-3 text-muted-foreground uppercase tracking-widest">{catMeta.label}</h3>
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

// ── Main export ────────────────────────────────────────────────────────────
export default function GamesPage() {
  const [mode, setMode] = useState<"hub"|"quiz"|"wordsearch">("hub");

  if (mode === "quiz") return <MultipleChoiceGame onBack={() => setMode("hub")} />;
  if (mode === "wordsearch") return <WordSearchGame onBack={() => setMode("hub")} />;
  return <GameHub onSelect={setMode} />;
}
