import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API Initialization
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Routes
  app.post("/api/recommend", async (req, res) => {
    try {
      const { books, userHistory } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a professional librarian at Lumina Archive. 
        Given the user's reading history: [${userHistory.join(', ')}] 
        and our library catalog: [${books.slice(0, 50).map((b: any) => b.title + ' by ' + b.author).join(', ')}], 
        recommend exactly 3 books from the catalog that the user should read next. 
        Helpful context: Recommendations should be relevant to their interests.
        Return ONLY a JSON array of strings containing the titles. No other text.`,
      });

      const text = response.text || "[]";
      // Simple JSON extraction
      const jsonMatch = text.match(/\[.*\]/s);
      const recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      
      res.json({ recommendations });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
