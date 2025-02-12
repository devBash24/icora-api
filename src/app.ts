import express, { Request, Response } from "express";
import cors from "cors";
import { supabase } from "./services/supabase";
import { formatIconContent } from "./utils/formatContent";
import { createIconFile } from "./utils/iconFile";
import { apiLimiter, strictLimiter } from './middleware/rateLimiter';
import { cacheControl } from './middleware/cache';
import { securityMiddleware } from './middleware/security';
import { validateIconRequest } from './middleware/validation';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(securityMiddleware);
app.use('/api/', apiLimiter);  
app.use('/api/icons/all', strictLimiter); // Strict rate limiting for all icons

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.redirect('https://icora.vercel.app/');
});

app.get("/api/icons", validateIconRequest, cacheControl, async (req: Request, res: Response) => {
  const { library, name } = req.query as { library: string; name: string };
  try {
    if (!library || !name) {
      throw new Error("Library and name are required.");
    }
    const { data, error } = await supabase
      .from("icons")
      .select("*")
      .eq("library", library)
      .eq("name", name);
    if (error) {
      throw new Error("Error fetching icons from database.");
    }
    const content = formatIconContent(data[0].content);
    res.json({ success: true, data: { name: data[0].name, library: data[0].library, content } });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Library and name are required.")) {
        res.status(400).json({ success: false, error: "Library and name are required." });
      } else {
        res.status(500).json({ success: false, error: "Internal server error" });
      }
    } else {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
});

export default app; 