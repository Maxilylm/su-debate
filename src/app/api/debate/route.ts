export const maxDuration = 30;

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface DebateRequest {
  persona: string;
  personaStyle: string;
  opponent: string;
  topic: string;
  round: number;
  totalRounds: number;
  previousArguments: { speaker: string; text: string }[];
}

const PERSONA_STYLES: Record<string, string> = {
  "Elon Musk":
    "You argue like Elon Musk: bold, provocative, reference first principles thinking, mention Mars and rockets metaphorically, use Twitter-style quips, and occasionally drop audacious claims.",
  "Steve Jobs":
    "You argue like Steve Jobs: minimalist and elegant reasoning, reference design and simplicity, use reality distortion field confidence, say things like 'here\'s the thing' and 'insanely great'.",
  Einstein:
    "You argue like Albert Einstein: use thought experiments, reference relativity and physics metaphors, speak with gentle wisdom and humor, occasionally use German phrases.",
  Socrates:
    "You argue like Socrates: use the Socratic method, answer questions with more questions, deconstruct your opponent's assumptions, reference ancient Greek philosophy.",
  Shakespeare:
    "You argue like William Shakespeare: use poetic language, iambic pentameter hints, dramatic flair, theatrical metaphors, and occasional Old English turns of phrase.",
  "Marie Curie":
    "You argue like Marie Curie: methodical, evidence-based, reference scientific rigor, speak with quiet determination, pioneer's perspective, and measured confidence.",
  "Nikola Tesla":
    "You argue like Nikola Tesla: visionary and electric, reference invention and alternating currents metaphorically, speak with passionate intensity about the future of technology.",
};

export async function POST(request: Request) {
  const body: DebateRequest = await request.json();
  const { persona, personaStyle, opponent, topic, round, totalRounds, previousArguments } = body;

  const style =
    PERSONA_STYLES[persona] ||
    `You argue as ${persona}: ${personaStyle || "with passion and conviction, using your unique perspective and expertise."}`;

  // Truncate to last 4 exchanges to stay within token limits
  const recentArgs = previousArguments.slice(-4);

  const conversationHistory = recentArgs
    .map((arg) => `[${arg.speaker}]: ${arg.text}`)
    .join("\n\n");

  const systemPrompt = `You are ${persona} in a debate arena. ${style}

RULES:
- You are debating ${opponent} on the topic: "${topic}"
- This is round ${round} of ${totalRounds}
- Keep your argument to 2-3 paragraphs MAX
- Be persuasive, dramatic, and entertaining
- Directly counter your opponent's last point if there is one
- Stay in character at all times
- ${round === totalRounds ? "This is the FINAL ROUND. Make your closing argument powerful and memorable!" : "Build your case strategically."}
- ${round === 1 ? "This is the opening round. Make a strong first impression!" : ""}`;

  const messages: Message[] = [
    { role: "system", content: systemPrompt },
  ];

  if (conversationHistory) {
    messages.push({
      role: "user",
      content: `Here is the debate so far:\n\n${conversationHistory}\n\nNow deliver your argument for round ${round}.`,
    });
  } else {
    messages.push({
      role: "user",
      content: `The topic is: "${topic}"\n\nDeliver your opening argument.`,
    });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
  }

  const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.9,
      max_tokens: 500,
    }),
  });

  if (!groqResponse.ok) {
    const errText = await groqResponse.text();
    return Response.json(
      { error: "Groq API error", details: errText },
      { status: groqResponse.status }
    );
  }

  const data = await groqResponse.json();
  const argument = data.choices?.[0]?.message?.content ?? "No argument generated.";

  return Response.json({ argument });
}
