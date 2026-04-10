import { Client } from "@notionhq/client";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.NOTION_API_KEY) {
    return res.status(400).json({ error: "尚未設定 Notion API Key" });
  }

  const { time, meridian, feeling, fiveElements, acupoint, qiAdvice, timeGanZhi } = req.body;
  const notion = new Client({ auth: process.env.NOTION_API_KEY });
  const databaseId = process.env.NOTION_DATABASE_ID || "";

  try {
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        "timimg": {
          title: [{ text: { content: new Date(time).toLocaleString("zh-TW") } }],
        },
        "Meridian": {
          rich_text: [{ text: { content: meridian || "" } }],
        },
        "feeling": {
          rich_text: [{ text: { content: feeling || "" } }],
        },
        "Five Elements": {
          rich_text: [{ text: { content: fiveElements || "" } }],
        },
        "Recommended Acupoint": {
          rich_text: [{ text: { content: acupoint || "" } }],
        },
        "Suggested Action": {
          rich_text: [{ text: { content: (qiAdvice || "").substring(0, 2000) } }],
        },
        "Two-Hour Period": {
          rich_text: [{ text: { content: timeGanZhi || "" } }],
        },
      },
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Notion Error:", error);
    res.status(500).json({ error: "無法同步至 Notion" });
  }
}
