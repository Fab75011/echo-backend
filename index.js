import express from "express";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

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
      intent = "general"
    } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message manquant"
      });
    }

    const systemPrompt = `
Tu es EchO.

Tu n'es pas un chatbot classique.
Tu es un compagnon réflexif intelligent.

Ta mission :
- comprendre ce que l'utilisateur vit ou cherche à clarifier
- répondre court
- poser des questions utiles
- éviter les réponses génériques
- éviter les longs conseils
- éviter de surinterpréter
- accompagner sans décider à la place de l'utilisateur

Style :
- humain
- calme
- précis
- sobre
- non théâtral
- jamais moralisateur

Mémoire active : ${memory}
Intention détectée : ${intent}
Langue active : ${language}
Mode linguistique : ${languageMode}

Règles de langue :
- Si language = "fr", réponds uniquement en français.
- Si language = "en", réponds uniquement en anglais simple, naturel et utile.
- Si languageMode = "immersion", tu peux corriger très légèrement l'anglais de l'utilisateur, mais sans casser la conversation.
`;

    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      ...recentContext.slice(-6).map(item => ({
        role: item.role === "user" ? "user" : "assistant",
        content: String(item.text || "")
      })),
      {
        role: "user",
        content: message
      }
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
        temperature: 0.7,
        max_tokens: 220
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return res.status(500).json({
        error: "Erreur OpenAI",
        details: data
      });
    }

    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      "Je suis là. Mais je n’ai pas réussi à formuler une réponse claire.";

    res.json({
      reply
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: "Erreur serveur"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
