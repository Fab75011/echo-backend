import express from "express";

const app = express();
app.use(express.json());

// Route test
app.get("/", (req, res) => {
  res.send("Echo backend is running");
});

// Route santé
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 🔥 ROUTE IA
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `Tu es Echo.

Tu n’es pas un chatbot.
Tu es un compagnon réflexif.

Tu dois :
- être court
- être humain
- poser des questions intelligentes
- éviter les réponses longues
- éviter les conseils directs
- aider à clarifier

Style :
calme, posé, précis`
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      })
    });

    const data = await response.json();

    const reply = data.choices?.[0]?.message?.content || "Erreur IA";

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
