import express from "express";

const app = express();

app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.sendStatus(204);

  next();
});

app.get("/", (req, res) => {
  res.send("Echo backend is running");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const {
      message,
      memory = "durable",
      language = "fr",
      languageMode = "locked",
      recentContext = [],
      memoryInsights = {},
      intent = "general"
    } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message manquant" });
    }

    const compactRecentContext = recentContext.slice(-6).map((item) => ({
      role: item.role === "user" ? "utilisateur" : "echo",
      text: String(item.text || "")
    }));

    const systemPrompt = `
Tu es EchO.
Tu es un compagnon réflexif intelligent.
Réponds court, naturel, humain, sobre.
Une seule question maximum.
Ne surinterprète pas.
Langue active : ${language}
Mode linguistique : ${languageMode}
Mémoire active : ${memory}
Intention : ${intent}
Contexte récent :
${JSON.stringify(compactRecentContext)}
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...recentContext.slice(-6).map((item) => ({
        role: item.role === "user" ? "user" : "assistant",
        content: String(item.text || "")
      })),
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages,
        temperature: 0.45,
        max_tokens: 180
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI chat error:", data);
      return res.status(500).json({ error: "Erreur OpenAI", details: data });
    }

    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      "Je suis là. Mais je n’ai pas réussi à formuler une réponse claire.";

    res.json({ reply });
  } catch (error) {
    console.error("Server chat error:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post("/api/tts", async (req, res) => {
  try {
    const { text, voice = "nova" } = req.body || {};

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Texte manquant" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Clé OpenAI manquante côté serveur" });
    }

    const cleanText = text.trim().slice(0, 1200);

    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice,
        input: cleanText,
        response_format: "mp3"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI TTS error:", errorText);
      return res.status(500).json({
        error: "Erreur OpenAI TTS",
        details: errorText
      });
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.send(audioBuffer);
  } catch (error) {
    console.error("Server TTS error:", error);
    res.status(500).json({ error: "Erreur serveur TTS" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
