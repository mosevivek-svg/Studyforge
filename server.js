// StudyForge backend — no Claude login required.
// The AI key is kept on the server, never exposed to visitors.
const express = require("express");
const path = require("path");

const app = express();
app.use(express.json({ limit: "200kb" }));
app.use(express.static(path.join(__dirname, "public")));

const API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.AI_MODEL || "gpt-6-luna";

// Simple in-memory rate limit: 15 requests / 10 minutes / IP.
const hits = new Map();
function limited(ip) {
  const now = Date.now(), win = 10 * 60 * 1000;
  const list = (hits.get(ip) || []).filter(t => now - t < win);
  list.push(now);
  hits.set(ip, list);
  return list.length > 15;
}

app.post("/api/generate", async (req, res) => {
  if (!API_KEY) return res.status(500).json({
    error: "Server is missing OPENAI_API_KEY. Add it in your hosting provider's environment variables."
  });
  if (limited(req.ip)) return res.status(429).json({
    error: "Too many requests. Try again in a few minutes."
  });

  const { text, level = "Undergraduate", count = 8 } = req.body || {};
  if (!text || typeof text !== "string" || text.trim().length < 3)
    return res.status(400).json({ error: "Please provide some material or a topic." });

  const n = Math.min(Math.max(parseInt(count) || 8, 3), 20);
  const prompt = `You are a study assistant for ${String(level).slice(0, 30)} engineering students.
From the material below (or from your own knowledge if it is only a topic), create study notes, exactly ${n} flashcards, and 5 multiple-choice questions.
Return ONLY valid JSON matching this structure:
{"title":"","summary":"2-3 sentences","sections":[{"heading":"","points":[""]}],"key_terms":[{"term":"","definition":""}],"flashcards":[{"question":"","answer":""}],"quiz":[{"question":"","options":["","","",""],"answer_index":0,"explanation":""}]}
Be concise and technically accurate.

Material:
"""${text.slice(0, 12000)}"""`;

  try {
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        input: prompt,
        text: { format: { type: "json_object" } },
        max_output_tokens: 4000
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(502).json({
      error: data.error?.message || "AI request failed."
    });

    const raw = data.output_text || "";
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start < 0 || end < start) throw new Error("The AI returned invalid JSON.");
    const json = JSON.parse(raw.slice(start, end + 1));
    res.json(json);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Could not generate content. Please try again." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`StudyForge running on port ${PORT}`));
