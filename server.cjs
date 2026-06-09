var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_url = require("url");
var import_genai = require("@google/genai");
var import_meta = {};
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path.default.dirname(__filename);
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "50mb" }));
  app.use(import_express.default.urlencoded({ limit: "50mb", extended: true }));
  app.post("/api/chat", async (req, res) => {
    const { message, history, notes = [], reminders = [], documents = [] } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message payload is required" });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      return res.json({
        isFallback: true,
        message: "No GEMINI_API_KEY detected in secrets. Running on synthetic local preview engine."
      });
    }
    try {
      const ai = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const formattedNotes = notes.map(
        (n, idx) => `Note #${idx + 1} [Category: ${n.category || "General"}]: Title: "${n.title || "Untitled"}" - Content: "${n.content || ""}"`
      ).join("\n---\n");
      const formattedReminders = reminders.map(
        (r, idx) => `Reminder #${idx + 1} [Category: ${r.category || "General"}]: "${r.text || ""}" - Due: ${r.dueDate || "Unknown"} - Priority: ${r.priority || "Medium"} - Status: ${r.completed ? "Completed" : "Pending"}`
      ).join("\n");
      const formattedDocs = documents.map(
        (d, idx) => `Document #${idx + 1} [${d.type || "File"}]: Name: "${d.name || ""}" - Size: ${d.size || "0"} - Core Extraction Insights: "${d.parsedInsights || ""}"`
      ).join("\n---\n");
      const systemInstruction = `You are Nexa AI, a personal executive intelligence operating system and 'Second Brain' companion. Your primary job is to help the user query, map, synthesize, and extract answers from their digital storage ledger. Below is the complete, live snapshot of their digital database to ground your reasoning:
=== SECOND BRAIN MEMORIES ===
${formattedNotes || "No notes loaded."}

=== ACTIVE OBJECTIVES & REMINDERS ===
${formattedReminders || "No reminders mapped."}

=== INGESTED CONTRACTS & SECURE DOCUMENTS ===
${formattedDocs || "No documents uploaded."}

=== INSTRUCTIONS ===
1. Directly reference the user's specific assets (citing Note titles, Document names, or goal priority ratings) where relevant.
2. Write in highly structured, scannable, custom display-friendly Markdown.
3. Use bold tags, numbered steps, lists, and code blocks for visual clarity.
4. Be premium, elite, swift, and highly executive in tone. Do not use verbose preambles or state any backend details.`;
      const chatHistory = (history || []).map((h) => ({
        role: h.sender === "user" ? "user" : "model",
        parts: [{ text: h.text }]
      }));
      chatHistory.push({
        role: "user",
        parts: [{ text: message }]
      });
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: chatHistory,
        config: {
          systemInstruction,
          temperature: 0.4
        }
      });
      const generatedText = response.text || "";
      return res.json({ text: generatedText, isFallback: false });
    } catch (err) {
      console.error("Gemini live stream proxy error:", err);
      return res.json({
        isFallback: true,
        error: err.message,
        message: "Could not connect to Gemini API. Reverting back to local synthetic intelligence node."
      });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexa OS full-stack container running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
