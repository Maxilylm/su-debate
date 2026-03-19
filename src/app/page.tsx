"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Persona {
  name: string;
  emoji: string;
}

interface Argument {
  speaker: string;
  text: string;
  side: "left" | "right";
  round: number;
}

type Phase = "setup" | "vs" | "debate" | "results";

// ─── Data ────────────────────────────────────────────────────────────────────

const PERSONAS: Persona[] = [
  { name: "Elon Musk", emoji: "\u{1F680}" },
  { name: "Steve Jobs", emoji: "\u{1F34E}" },
  { name: "Einstein", emoji: "\u{1F9E0}" },
  { name: "Socrates", emoji: "\u{1F3DB}\uFE0F" },
  { name: "Shakespeare", emoji: "\u{1F3AD}" },
  { name: "Marie Curie", emoji: "\u2697\uFE0F" },
  { name: "Nikola Tesla", emoji: "\u26A1" },
];

const QUICK_TOPICS = [
  "Should AI replace programmers?",
  "Is pineapple on pizza acceptable?",
  "Tabs vs spaces",
  "Is social media good for humanity?",
  "Should we colonize Mars?",
  "Are video games art?",
  "Is capitalism the best system?",
  "Should homework be abolished?",
];

const TOTAL_ROUNDS = 5;

// ─── Components ──────────────────────────────────────────────────────────────

function PersonaCard({
  persona,
  selected,
  onSelect,
  side,
}: {
  persona: Persona;
  selected: boolean;
  onSelect: () => void;
  side: "left" | "right";
}) {
  const borderColor =
    side === "left"
      ? selected
        ? "border-blue-500 bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
        : "border-gray-700 hover:border-blue-400/50"
      : selected
        ? "border-red-500 bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
        : "border-gray-700 hover:border-red-400/50";

  return (
    <button
      onClick={onSelect}
      className={`border-2 rounded-xl p-3 transition-all duration-300 cursor-pointer text-center ${borderColor}`}
    >
      <div className="text-3xl mb-1">{persona.emoji}</div>
      <div className="text-sm font-semibold">{persona.name}</div>
    </button>
  );
}

function CustomPersonaInput({
  value,
  onChange,
  side,
}: {
  value: string;
  onChange: (v: string) => void;
  side: "left" | "right";
}) {
  const accent = side === "left" ? "focus:border-blue-500" : "focus:border-red-500";
  return (
    <input
      type="text"
      placeholder="Type custom persona..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full mt-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm ${accent} outline-none transition`}
    />
  );
}

function ThinkingIndicator({ side }: { side: "left" | "right" }) {
  const color = side === "left" ? "bg-blue-500" : "bg-red-500";
  return (
    <div
      className={`flex items-center gap-1 p-3 rounded-xl ${
        side === "left" ? "mr-auto" : "ml-auto"
      } max-w-[80%] ${
        side === "left"
          ? "bg-blue-500/10 border border-blue-500/30"
          : "bg-red-500/10 border border-red-500/30"
      }`}
    >
      <span className="text-sm text-gray-400 mr-2">Thinking</span>
      <span className={`thinking-dot w-2 h-2 rounded-full ${color}`}></span>
      <span className={`thinking-dot w-2 h-2 rounded-full ${color}`}></span>
      <span className={`thinking-dot w-2 h-2 rounded-full ${color}`}></span>
    </div>
  );
}

function SpeechBubble({ arg }: { arg: Argument }) {
  const isLeft = arg.side === "left";
  return (
    <div
      className={`max-w-[85%] ${isLeft ? "mr-auto animate-slide-left" : "ml-auto animate-slide-right"}`}
    >
      <div
        className={`rounded-2xl p-4 ${
          isLeft
            ? "bg-blue-500/10 border border-blue-500/30"
            : "bg-red-500/10 border border-red-500/30"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {arg.speaker} &bull; Round {arg.round}
          </span>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{arg.text}</p>
      </div>
    </div>
  );
}

function VsSplash({
  p1,
  p2,
  onDone,
}: {
  p1: { name: string; emoji: string };
  p2: { name: string; emoji: string };
  onDone: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
      <div className="flex items-center gap-8">
        <div className="text-center animate-slide-left">
          <div className="text-8xl mb-4">{p1.emoji}</div>
          <div className="text-2xl font-black text-blue-400">{p1.name}</div>
        </div>
        <div className="animate-vs-flash">
          <div className="text-7xl font-black text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]">
            VS
          </div>
        </div>
        <div className="text-center animate-slide-right">
          <div className="text-8xl mb-4">{p2.emoji}</div>
          <div className="text-2xl font-black text-red-400">{p2.name}</div>
        </div>
      </div>
    </div>
  );
}

function RoundAnnouncement({ round }: { round: number }) {
  return (
    <div className="text-center py-4 animate-round-announce">
      <div className="inline-block px-6 py-2 bg-yellow-500/20 border border-yellow-500/40 rounded-full">
        <span className="text-yellow-400 font-black text-lg tracking-widest uppercase">
          {round <= TOTAL_ROUNDS ? `Round ${round} of ${TOTAL_ROUNDS}` : "Debate Complete"}
        </span>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function Home() {
  const [phase, setPhase] = useState<Phase>("setup");

  // Setup state
  const [persona1, setPersona1] = useState<Persona | null>(null);
  const [persona2, setPersona2] = useState<Persona | null>(null);
  const [custom1, setCustom1] = useState("");
  const [custom2, setCustom2] = useState("");
  const [useCustom1, setUseCustom1] = useState(false);
  const [useCustom2, setUseCustom2] = useState(false);
  const [topic, setTopic] = useState("");

  // Debate state
  const [args, setArgs] = useState<Argument[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentSide, setCurrentSide] = useState<"left" | "right">("left");
  const [isThinking, setIsThinking] = useState(false);
  const [showRoundAnnounce, setShowRoundAnnounce] = useState(false);
  const [announceRound, setAnnounceRound] = useState(1);
  const [debateOver, setDebateOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Results state
  const [voted, setVoted] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const debateRunning = useRef(false);

  const getP1 = useCallback((): { name: string; emoji: string } => {
    if (useCustom1 && custom1.trim()) return { name: custom1.trim(), emoji: "\u{1F464}" };
    return persona1 || { name: "Unknown", emoji: "?" };
  }, [useCustom1, custom1, persona1]);

  const getP2 = useCallback((): { name: string; emoji: string } => {
    if (useCustom2 && custom2.trim()) return { name: custom2.trim(), emoji: "\u{1F464}" };
    return persona2 || { name: "Unknown", emoji: "?" };
  }, [useCustom2, custom2, persona2]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [args, isThinking]);

  const canStart =
    (persona1 || (useCustom1 && custom1.trim())) &&
    (persona2 || (useCustom2 && custom2.trim())) &&
    topic.trim();

  const fetchArgument = useCallback(
    async (
      persona: string,
      opponent: string,
      round: number,
      prevArgs: Argument[]
    ): Promise<string> => {
      const res = await fetch("/api/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona,
          opponent,
          topic,
          round,
          totalRounds: TOTAL_ROUNDS,
          previousArguments: prevArgs.map((a) => ({ speaker: a.speaker, text: a.text })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "API error");
      return data.argument;
    },
    [topic]
  );

  const runDebate = useCallback(async () => {
    if (debateRunning.current) return;
    debateRunning.current = true;

    const p1 = getP1();
    const p2 = getP2();
    const allArgs: Argument[] = [];

    for (let round = 1; round <= TOTAL_ROUNDS; round++) {
      if (!debateRunning.current) break;

      // Round announcement
      setAnnounceRound(round);
      setShowRoundAnnounce(true);
      setCurrentRound(round);
      await new Promise((r) => setTimeout(r, 1200));
      setShowRoundAnnounce(false);

      // Persona 1 argues
      setCurrentSide("left");
      setIsThinking(true);
      try {
        const text1 = await fetchArgument(p1.name, p2.name, round, allArgs);
        const arg1: Argument = { speaker: p1.name, text: text1, side: "left", round };
        allArgs.push(arg1);
        setArgs([...allArgs]);
        setIsThinking(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to generate argument");
        setIsThinking(false);
        debateRunning.current = false;
        return;
      }

      await new Promise((r) => setTimeout(r, 800));

      // Persona 2 argues
      setCurrentSide("right");
      setIsThinking(true);
      try {
        const text2 = await fetchArgument(p2.name, p1.name, round, allArgs);
        const arg2: Argument = { speaker: p2.name, text: text2, side: "right", round };
        allArgs.push(arg2);
        setArgs([...allArgs]);
        setIsThinking(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to generate argument");
        setIsThinking(false);
        debateRunning.current = false;
        return;
      }

      await new Promise((r) => setTimeout(r, 600));
    }

    setDebateOver(true);
    setAnnounceRound(TOTAL_ROUNDS + 1);
    setShowRoundAnnounce(true);
    await new Promise((r) => setTimeout(r, 1500));
    setShowRoundAnnounce(false);
    setPhase("results");
    debateRunning.current = false;
  }, [getP1, getP2, fetchArgument]);

  const startDebate = () => {
    setPhase("vs");
  };

  const handleVsDone = useCallback(() => {
    setPhase("debate");
    runDebate();
  }, [runDebate]);

  const copyTranscript = () => {
    const p1 = getP1();
    const p2 = getP2();
    const transcript = [
      `AI DEBATE ARENA`,
      `${p1.name} vs ${p2.name}`,
      `Topic: ${topic}`,
      `${"=".repeat(50)}`,
      ...args.map((a) => `\n[Round ${a.round} - ${a.speaker}]\n${a.text}`),
    ].join("\n");
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetAll = () => {
    setPhase("setup");
    setPersona1(null);
    setPersona2(null);
    setCustom1("");
    setCustom2("");
    setUseCustom1(false);
    setUseCustom2(false);
    setTopic("");
    setArgs([]);
    setCurrentRound(1);
    setCurrentSide("left");
    setIsThinking(false);
    setShowRoundAnnounce(false);
    setDebateOver(false);
    setError(null);
    setVoted(null);
    setCopied(false);
    debateRunning.current = false;
  };

  // suppress unused var warnings
  void currentRound;
  void debateOver;

  // ─── Setup Screen ──────────────────────────────────────────────────────────

  if (phase === "setup") {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="text-center py-8">
          <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent">
            AI DEBATE ARENA
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Pick two titans. Choose a topic. Watch them clash.
          </p>
        </header>

        <div className="flex-1 max-w-6xl mx-auto w-full px-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">
            {/* Persona 1 */}
            <div>
              <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-sm">
                  1
                </span>
                Blue Corner
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PERSONAS.map((p) => (
                  <PersonaCard
                    key={p.name}
                    persona={p}
                    selected={!useCustom1 && persona1?.name === p.name}
                    onSelect={() => {
                      setPersona1(p);
                      setUseCustom1(false);
                    }}
                    side="left"
                  />
                ))}
                <button
                  onClick={() => {
                    setUseCustom1(true);
                    setPersona1(null);
                  }}
                  className={`border-2 rounded-xl p-3 transition-all duration-300 cursor-pointer text-center ${
                    useCustom1
                      ? "border-blue-500 bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                      : "border-gray-700 hover:border-blue-400/50"
                  }`}
                >
                  <div className="text-3xl mb-1">{"\u270D\uFE0F"}</div>
                  <div className="text-sm font-semibold">Custom</div>
                </button>
              </div>
              {useCustom1 && (
                <CustomPersonaInput value={custom1} onChange={setCustom1} side="left" />
              )}
            </div>

            {/* Topic (Center) */}
            <div className="lg:w-64 flex flex-col items-center justify-center gap-4 py-4">
              <div className="text-4xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                VS
              </div>
              <div className="w-full">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 block text-center">
                  Debate Topic
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter a spicy topic..."
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm focus:border-yellow-500 outline-none transition resize-none h-20"
                />
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTopic(t)}
                    className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full transition cursor-pointer"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Persona 2 */}
            <div>
              <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-sm">
                  2
                </span>
                Red Corner
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PERSONAS.map((p) => (
                  <PersonaCard
                    key={p.name}
                    persona={p}
                    selected={!useCustom2 && persona2?.name === p.name}
                    onSelect={() => {
                      setPersona2(p);
                      setUseCustom2(false);
                    }}
                    side="right"
                  />
                ))}
                <button
                  onClick={() => {
                    setUseCustom2(true);
                    setPersona2(null);
                  }}
                  className={`border-2 rounded-xl p-3 transition-all duration-300 cursor-pointer text-center ${
                    useCustom2
                      ? "border-red-500 bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                      : "border-gray-700 hover:border-red-400/50"
                  }`}
                >
                  <div className="text-3xl mb-1">{"\u270D\uFE0F"}</div>
                  <div className="text-sm font-semibold">Custom</div>
                </button>
              </div>
              {useCustom2 && (
                <CustomPersonaInput value={custom2} onChange={setCustom2} side="right" />
              )}
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center mt-10">
            <button
              disabled={!canStart}
              onClick={startDebate}
              className={`px-12 py-4 text-xl font-black uppercase tracking-widest rounded-2xl transition-all duration-500 cursor-pointer ${
                canStart
                  ? "bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 hover:from-blue-500 hover:via-purple-500 hover:to-red-500 animate-pulse-glow text-white"
                  : "bg-gray-800 text-gray-600 cursor-not-allowed"
              }`}
            >
              Start Debate
            </button>
            {!canStart && (
              <p className="text-gray-600 text-sm mt-3">
                Select both personas and enter a topic
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── VS Splash ─────────────────────────────────────────────────────────────

  if (phase === "vs") {
    return <VsSplash p1={getP1()} p2={getP2()} onDone={handleVsDone} />;
  }

  // ─── Debate Screen ─────────────────────────────────────────────────────────

  const p1 = getP1();
  const p2 = getP2();

  if (phase === "debate" || phase === "results") {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Top Bar */}
        <div className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{p1.emoji}</span>
              <span className="font-bold text-blue-400">{p1.name}</span>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wider">Topic</div>
              <div className="text-sm font-semibold text-yellow-400 max-w-[200px] truncate">
                {topic}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-red-400">{p2.name}</span>
              <span className="text-2xl">{p2.emoji}</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-gray-900">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-red-500 transition-all duration-1000"
              style={{
                width: `${(Math.min(args.length, TOTAL_ROUNDS * 2) / (TOTAL_ROUNDS * 2)) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Debate Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl mx-auto w-full">
          {error && (
            <div className="text-center mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 animate-shake">
              Error: {error}
              <button
                onClick={resetAll}
                className="block mx-auto mt-2 text-sm underline cursor-pointer"
              >
                Start Over
              </button>
            </div>
          )}

          <div className="space-y-4">
            {args.map((arg, i) => {
              const showRound = i === 0 || arg.round !== args[i - 1]?.round;
              return (
                <div key={i}>
                  {showRound && <RoundAnnouncement round={arg.round} />}
                  <SpeechBubble arg={arg} />
                </div>
              );
            })}

            {showRoundAnnounce && !args.some((a) => a.round === announceRound) && (
              <RoundAnnouncement round={announceRound} />
            )}

            {isThinking && <ThinkingIndicator side={currentSide} />}
          </div>
        </div>

        {/* Results Panel */}
        {phase === "results" && (
          <div className="border-t border-gray-800 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="max-w-3xl mx-auto px-4 py-6 text-center">
              <h2 className="text-2xl font-black mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                The Debate is Over!
              </h2>

              {!voted ? (
                <div>
                  <p className="text-gray-400 mb-4">Who won?</p>
                  <div className="flex gap-4 justify-center flex-wrap">
                    <button
                      onClick={() => setVoted(p1.name)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition cursor-pointer flex items-center gap-2"
                    >
                      <span className="text-xl">{p1.emoji}</span> {p1.name}
                    </button>
                    <button
                      onClick={() => setVoted("tie")}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold transition cursor-pointer"
                    >
                      Tie
                    </button>
                    <button
                      onClick={() => setVoted(p2.name)}
                      className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold transition cursor-pointer flex items-center gap-2"
                    >
                      {p2.name} <span className="text-xl">{p2.emoji}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <p className="text-xl mb-4">
                    {voted === "tie" ? "You declared it a tie!" : `You voted for ${voted}!`}
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-center mt-6">
                <button
                  onClick={copyTranscript}
                  className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm transition cursor-pointer"
                >
                  {copied ? "Copied!" : "Copy Transcript"}
                </button>
                <button
                  onClick={resetAll}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-500 hover:to-red-500 rounded-xl text-sm font-bold transition cursor-pointer"
                >
                  New Debate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
