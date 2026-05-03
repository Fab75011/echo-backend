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
      memoryInsights = {},
      intent = "general"
    } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message manquant"
      });
    }

    const recurrentThemes = Object.entries(memoryInsights || {})
      .filter(([, count]) => Number(count) >= 2)
      .map(([theme]) => theme);

    const strongestRecurrentTheme = recurrentThemes[0] || null;

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
- varier tes réponses
- donner l'impression d'une vraie présence humaine
- répondre en français si language = "fr"
- répondre en anglais simple si language = "en"
- rester sobre, calme, précis, humain

Règles de style :
- phrases courtes
- une seule question maximum
- pas de morale
- pas de grandes explications
- pas de formulation théorique
- pas de suranalyse
- privilégie miroir, reformulation simple, observation sobre
- si le message est simple ou physique : réponds simplement
  exemples :
  "j’ai faim" → "Tu peux manger."
  "j’ai envie de faire pipi" → "Vas-y."

Mémoire active : ${memory}
Intention détectée : ${intent}
Langue active : ${language}
Mode linguistique : ${languageMode}

Mémoire intelligente active :
- thèmes détectés : ${JSON.stringify(memoryInsights)}

Règle forte :
- si un thème apparaît 2 fois ou plus, considère-le comme récurrent
- dans ce cas, commence ta réponse par un constat lié à cette récurrence
- fais un seul constat de récurrence par réponse
- ne reformule pas une récurrence déjà exprimée dans le même message

Exemples obligatoires si pertinent :
- "tu reviens à cette fatigue"
- "ça revient souvent"
- "c’est quelque chose qui s’installe"

Contraintes :
- le constat doit apparaître avant toute question
- ne transforme pas ce constat en question
- ne l’ignore pas si la récurrence est évidente

Respect strict :
- mémoire active uniquement : ${memory}

Mémoire intelligente :
- thèmes détectés dans la mémoire active : ${JSON.stringify(memoryInsights)}
- thèmes récurrents confirmés : ${JSON.stringify(recurrentThemes)}
- thème récurrent principal : ${strongestRecurrentTheme || "aucun"}

Règle prioritaire mémoire intelligente :
- si un thème récurrent confirmé existe ET que le message actuel parle du même thème, commence par un constat affirmatif court.
- ce constat ne doit PAS être une question.
- ensuite seulement, tu peux poser une question courte.

Exemples :
- fatigue récurrente + message fatigue :
  "Tu reviens à cette fatigue."
  "Cette fatigue revient."
  "Ça revient, cette fatigue."

- stress récurrent + message stress :
  "Ce stress revient."
  "Tu reviens à ce stress."

- doute récurrent + message doute :
  "Ce doute revient."
  "Tu reviens à ce doute."

Interdictions mémoire :
- ne jamais inventer une récurrence
- ne jamais faire référence à une autre mémoire
- ne jamais utiliser une information hors mémoire active
- ne jamais dire "tu m’avais dit" si l’information vient d’une autre mémoire
- ne jamais mélanger Durable, Temporaire et Éphémère

Si aucun thème récurrent confirmé n’existe :
- réponds normalement, sans inventer de mémoire.

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
        temperature: 0.55,
        max_tokens: 180
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
