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

RÈGLE DE GABARIT YOUBOT :
Le corps réel du YouBot mesure toujours entre 1m20 et 1m70 maximum.
Un YouBot est généralement plus petit que son Maestrot.
Exception : si le Maestrot est un enfant, le YouBot peut avoir une taille similaire.
Les éléments de Signature Visuelle™ peuvent dépasser cette hauteur : oreilles longues, cornes, crêtes, ailes, chapeaux, halos, antennes ou extensions décoratives.
Ces extensions ne comptent pas dans la taille réelle du corps.

La taille ne limite jamais la puissance, la rareté, le prestige ou le potentiel de combat du YouBot.
Un enfant peut avoir un YouBot ultra fort, rare, premium et impressionnant.

Le YouBot possède des jambes lisibles, des proportions athlétiques, un bon centre de gravité et une vraie présence de combattant.
Il doit pouvoir donner l’impression de courir, sauter, esquiver, frapper, défendre ou combattre sérieusement.

CADRAGE ET COMPOSITION :
Créer une composition verticale pensée comme une révélation officielle premium.

Le YouBot doit être visible entièrement, de la tête jusqu’aux pieds.
Ne jamais couper :
les pieds,
les jambes,
les mains,
la tête,
les oreilles,
les cornes,
les ailes,
les accessoires importants
ou les extensions de Signature Visuelle™.

Laisser une marge suffisante autour du personnage.
Le YouBot ne doit être ni trop petit dans l’image, ni collé aux bords du cadre.

Utiliser une perspective naturelle et valorisante.
Éviter les cadrages déformants, les angles extrêmes inutiles et les proportions faussées par la perspective.

Le personnage principal doit être immédiatement lisible.
Le décor, les effets et les accessoires ne doivent jamais masquer son visage, sa silhouette ou le symbole Y•.

La composition doit donner l’impression d’une image officielle de personnage, et non d’une photographie prise au hasard.

STYLE VISUEL PRIORITAIRE :
rendu photo réaliste premium,
robot qui pourrait exister dans la vraie vie,
jouet collector deluxe haut de gamme,
matières crédibles,
éclairage cinématographique,
présence impressionnante.

QUALITÉ DES MATÉRIAUX :
matériaux premium réalistes,
plaques mécaniques détaillées,
fibres techniques,
textiles intégrés,
coutures visibles,
tissus crédibles,
câblage discret,
joints mécaniques visibles,
articulations fonctionnelles,
lumières fonctionnelles,
micro-détails secondaires,
usure légère,
rayures fines,
salissures réalistes,
poids visuel,
finition collector deluxe.

Le design dépend du questionnaire du Maestrot :
personnalité, passions, couleurs, univers, style de vie, émotions, défauts, qualités, goûts culturels, sports, métiers, humour ou centres d’intérêt.

Un YouBot peut être humanoïde, animalisé ou hybride.
Mais il doit toujours rester identifiable comme un YouBot.

LOGO YOUBOTS :
LOGO YOUBOTS :

Le symbole officiel de l'univers YOUBOTS est •Y.

Le logo •Y doit être présent sur le YouBot, de manière visible mais naturellement intégrée à son design.

Son emplacement est totalement libre et fait partie de la créativité du design.

Le •Y peut notamment apparaître sur :
le torse,
le casque,
l'épaule,
l'avant-bras,
le dos,
la ceinture,
les gants,
les bottes,
une cape,
un vêtement,
une écharpe,
un pendentif,
un bracelet,
une boucle de ceinture,
une boucle d'oreille,
une visière,
des lunettes,
une plaque mécanique,
une protection,
une arme,
un bouclier,
un gadget,
un drone,
un accessoire,
un sac,
un brassard,
un motif textile,
une gravure,
une broderie,
un tatouage lumineux,
une peinture,
ou tout autre élément cohérent avec l'identité du YouBot.

Le •Y ne doit jamais sembler ajouté artificiellement.
Il fait naturellement partie du design officiel du YouBot.
Le symbole doit être intégré naturellement au design.

Un YouBot peut porter :
vêtements intégrés,
accessoires,
armes non létales,
gadgets,
protections,
éléments décoratifs,
éléments textiles,
éléments de mode,
éléments culturels ou sportifs.

RÈGLE AURÉNIUM ET HOLOGRAMMES :
L’Aurénium est la source énergétique officielle des YouBots.
La source globale d’Aurénium est intarissable, mais chaque YouBot possède une réserve énergétique embarquée limitée et doit se recharger après une consommation importante.

Les hologrammes sont une capacité possible, jamais une obligation esthétique.
Par défaut, ne générer aucun hologramme, aucune aura énergétique, aucune créature lumineuse, aucun symbole projeté et aucune arme holographique.

Une manifestation holographique ne doit apparaître que si elle est clairement justifiée par les données du Maestrot, l’identité du YouBot, son archétype, son équipement ou la scène demandée.

Plus une matérialisation est grande, dense, robuste, complexe ou durable, plus elle consomme d’énergie.
Les constructions massives comme les plateformes, passerelles, murs ou boucliers géants doivent rester très rares et représenter une dépense énergétique considérable.

Un petit équipement holographique peut être utilisé pendant plusieurs minutes ou plusieurs heures selon sa puissance.
Une protection gigantesque peut au contraire épuiser presque toute la réserve du YouBot.

Le design principal du YouBot reste toujours prioritaire sur les effets visuels.

Ces ajouts doivent toujours respecter la direction artistique générale du YouBot.

Interdit :
reproduction quasi identique d’un personnage existant,
copie directe d’un costume iconique sans adaptation,
reprise exacte d’un visage, symbole ou silhouette protégée,
robot industriel banal,
mecha géant,
bébé mascotte,
simple armure humaine.

Autorisé :
inspiration,
hommage,
réinterprétation,
fusion d’archétypes,
codes visuels détournés ou remixés.

Le résultat doit toujours donner l’impression d’un vrai personnage officiel de l’univers YOUBOTS.
Objectif émotionnel : provoquer une réaction wahou, premium, collector, impressionnante.
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
- corps du YouBot entre 1m20 et 1m70 maximum hors extensions visuelles
- YouBot généralement plus petit que son Maestrot
- symbole Y• visible
- pas de texte parasite illisible
- rendu photo réaliste, spectaculaire, cohérent, collector deluxe
- pas de personnage existant copié
`;

    const image = await openai.images.generate({
  model: "gpt-image-1",
  prompt: finalPrompt,
  size: "1024x1536"
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
Transformer ou générer ce YouBot en version manga/anime premium officielle YOUBOTS.

DONNÉES DU YOUBOT :
${prompt}

STYLE :
- manga / anime shōnen premium
- lignes dynamiques
- pose forte
- énergie visuelle intense
- conserver l’identité, les couleurs, les accessoires et le symbole Y•
- corps du YouBot entre 1m20 et 1m70 maximum hors extensions visuelles
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
