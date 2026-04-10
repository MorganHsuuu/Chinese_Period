import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Client } from "@notionhq/client";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Notion
  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const databaseId = process.env.NOTION_DATABASE_ID || "33da7f1b413c8036be02d7229447ea77";

  // API Routes
  app.post("/api/notion/log", async (req, res) => {
    const { time, meridian, feeling, insight } = req.body;

    if (!process.env.NOTION_API_KEY) {
      return res.status(400).json({ error: "尚未設定 Notion API Key" });
    }

    try {
      await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          "時間": {
            title: [
              {
                text: {
                  content: new Date(time).toLocaleString("zh-TW"),
                },
              },
            ],
          },
          "經絡": {
            rich_text: [
              {
                text: {
                  content: meridian,
                },
              },
            ],
          },
          "感受": {
            select: {
              name: feeling,
            },
          },
          "生活玄機": {
            rich_text: [
              {
                text: {
                  content: insight.substring(0, 2000), // Notion limit
                },
              },
            ],
          },
        },
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Notion Error:", error);
      res.status(500).json({ error: "無法同步至 Notion" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      root: __dirname,
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
