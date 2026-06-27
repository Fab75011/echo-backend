import express from "express";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const app = express();

app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.sendStatus(204);

  next();
});

const YOUBOT_VISUAL_BIBLE = `
Un YouBot est un robot compagnon vivant de l’univers YOUBOTS.
Chaque YouBot possède une identité unique, liée à son Maestrot.

Le Maestrot est l’humain synchronisé avec le YouBot.
Le Maestrot influence directement son apparence, son énergie, ses couleurs, son style, ses comportements et certaines de ses capacités.
Le YouBot reflète donc une partie de l’âme, des goûts, des passions, des défauts et des qualités de son Maestrot.

Un YouBot mesure toujours entre 1m20 et 1m40.
Sa silhouette doit être lisible, premium, expressive, héroïque et immédiatement reconnaissable.

Son design dépend du questionnaire du Maestrot :
personnalité, passions, couleurs, univers, style de vie, émotions, défauts, qualités, goûts culturels, sports, métiers, humour ou centres d’intérêt.

Un YouBot peut être :
humanoïde, animalisé ou hybride.
Mais il doit toujours rester identifiable comme un YouBot.

Il possède obligatoirement un symbole Y visible.
Le Y est généralement sur le torse, mais peut parfois être placé sur l’épaule, le casque, une cape, une arme, un bouclier ou un accessoire.

Un YouBot peut parfois porter :
des vêtements intégrés ou ajoutés à son design,
des accessoires,
des armes,
des gadgets,
des protections,
ou des éléments décoratifs.

Mais ces ajouts doivent toujours respecter la direction artistique générale du YouBot et sembler naturels dans son design.

Son style doit évoquer :
un personnage de manga premium,
un jouet collector haut de gamme,
un héros de jeu vidéo,
ou un combattant stylisé non létal.

Le design doit être fort, original, mémorable et cohérent.

Interdit :
reproduction quasi identique d’un personnage existant,
copie directe d’un costume iconique sans adaptation,
reprise exacte d’un visage, symbole ou silhouette protégée.

Autorisé :
inspiration,
hommage,
réinterprétation,
fusion d’archétypes,
codes visuels détournés ou remixés.

Le résultat doit toujours donner l’impression d’un vrai personnage officiel de l’univers YOUBOTS.
`;

app.get("/", (req, res) => {
  res.send("Echo backend is running");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/youbot-image", (req, res) => {
  res.json({
    status: "route_youbot_image_active",
    method: "GET diagnostic only",
    openaiKeyPresent: !!process.env.OPENAI_API_KEY,
    message: "La route POST /api/youbot-image existe dans ce backend.",
    time: new Date().toISOString()
  });
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
      intent = "general",
      currentDate,
      currentYear
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

Date actuelle : ${currentDate || "inconnue"}
Année actuelle : ${currentYear || "inconnue"}

Règle temporelle :
- tu dois toujours répondre en tenant compte de la date actuelle
- ne parle jamais d’un événement passé comme s’il était futur
- si une question dépend du calendrier, de l’actualité ou d’un événement futur, indique prudemment que la date peut devoir être vérifiée
- vérifie toujours la cohérence temporelle avant de répondre

Thèmes mémoire :
${JSON.stringify(memoryInsights)}

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

app.post("/api/youbot-image", async (req, res) => {
  try {
    const { prompt } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt manquant" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Clé OpenAI manquante côté serveur" });
    }

    const finalPrompt = `
${YOUBOT_VISUAL_BIBLE}

MISSION :
Créer l’image officielle du YouBot demandé ci-dessous.

DONNÉES DU YOUBOT :
${prompt}

CONTRAINTES DE SORTIE :
- image verticale premium
- YouBot visible clairement
- symbole Y visible
- pas de texte parasite illisible
- rendu propre, spectaculaire, cohérent
- pas de personnage existant copié
`;

    const image = await openai.images.generate({
      model: "gpt-image-1",
      prompt: finalPrompt,
      size: "1024x1024"
    });

    const b64 = image.data?.[0]?.b64_json;
    const url = image.data?.[0]?.url;

    if (b64) {
      return res.json({
        imageUrl: `data:image/png;base64,${b64}`
      });
    }

    if (url) {
      return res.json({ imageUrl: url });
    }

    return res.status(500).json({ error: "Image non générée" });
  } catch (error) {
    console.error("YouBot image error:", error);
    res.status(500).json({
      error: "Erreur génération image YouBot",
      details: error?.message || String(error)
    });
  }
});

app.post("/api/youbot-manga", async (req, res) => {
  try {
    const { prompt } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt manquant" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Clé OpenAI manquante côté serveur" });
    }

    const finalPrompt = `
${YOUBOT_VISUAL_BIBLE}

MISSION :
Transformer ou générer ce YouBot en version manga/anime premium.

DONNÉES DU YOUBOT :
${prompt}

STYLE :
- manga / anime shōnen premium
- lignes dynamiques
- pose forte
- énergie visuelle intense
- conserver l’identité, les couleurs, les accessoires et le symbole Y
- pas de copie directe d’un personnage existant
`;

    const image = await openai.images.generate({
      model: "gpt-image-1",
      prompt: finalPrompt,
      size: "1024x1024"
    });

    const b64 = image.data?.[0]?.b64_json;
    const url = image.data?.[0]?.url;

    if (b64) {
      return res.json({
        imageUrl: `data:image/png;base64,${b64}`
      });
    }

    if (url) {
      return res.json({ imageUrl: url });
    }

    return res.status(500).json({ error: "Image manga non générée" });
  } catch (error) {
    console.error("YouBot manga error:", error);
    res.status(500).json({
      error: "Erreur génération manga YouBot",
      details: error?.message || String(error)
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
