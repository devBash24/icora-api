import express, { Request, Response } from "express";
import cors from "cors";
import { and, asc, eq, ilike, sql } from "drizzle-orm";
import { db } from "./db";
import { icons } from "./db/schema";
const app = express();
import { formatIconContent } from "./utils/formatContent";
import { createIconFile } from "./utils/iconFile";
import { apiLimiter, strictLimiter } from "./middleware/rateLimiter";
import { cacheControl } from "./middleware/cache";
import { securityMiddleware } from "./middleware/security";
import { validateIconRequest } from "./middleware/validation";

// Middleware
app.use(cors());
app.use(express.json());
app.use(securityMiddleware);
app.use("/api/", apiLimiter);
app.use("/api/icons/all", strictLimiter); // Strict rate limiting for all icons

app.get("/", (_req: Request, res: Response) => {
  res.redirect(process.env.REDIRECT_URL!!);
});

app.get(
  "/api/icons",
  validateIconRequest,
  cacheControl,
  async (req: Request, res: Response): Promise<void> => {
    const { library, name } = req.query as { library: string; name: string };
    try {
      if (!library || !name) {
        throw new Error("Library and name are required.");
      }
      const data = await db
        .select()
        .from(icons)
        .where(and(eq(icons.library, library), eq(icons.name, name)))
        .limit(1);
      if (data.length === 0) {
        throw new Error("Error fetching icons from database.");
      }
      const content = formatIconContent(data[0].content);
      res.json({
        success: true,
        data: {
          name: data[0].name,
          library: data[0].library,
          content: content,
        },
      });
      return;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Library and name are required.")) {
          res
            .status(400)
            .json({ success: false, error: "Library and name are required." });
          return;
        } else {
          res
            .status(500)
            .json({ success: false, error: "Internal server error" });
          return;
        }
      } else {
        res
          .status(500)
          .json({ success: false, error: "Internal server error" });
        return;
      }
    }
  },
);

app.get(
  "/api/icons/:library",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { library } = req.params;
      const data = await db
        .select({
          id: icons.id,
          name: icons.name,
          library: icons.library,
          content: icons.content,
        })
        .from(icons)
        .where(eq(icons.library, library));

      if (data.length === 0) {
        res.status(404).json({
          success: false,
          error: "No icons found for this icon library",
        });
        return;
      }

      res.json({
        success: true,
        data: { name: library, content: createIconFile(data) },
      });
      return;
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
      return;
    }
  },
);

app.get(
  "/api/icons/all/libraries",
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const data = await db
        .selectDistinct({ library: icons.library })
        .from(icons)
        .orderBy(asc(icons.library));

      res.json({ success: true, data: data.map((item) => item.library) });
      return;
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
      return;
    }
  },
);

app.get(
  "/api/icons/all/libraries/:library",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { library } = req.params;
      const data = await db
        .select()
        .from(icons)
        .where(eq(icons.library, library));

      if (data.length === 0) {
        res.status(404).json({
          success: false,
          error: "No icons found for this icon library",
        });
        return;
      }

      res.json({ success: true, data: data });
      return;
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
      return;
    }
  },
);

app.get(
  "/api/search",
  cacheControl,
  async (req: Request, res: Response): Promise<void> => {
    const {
      q = "",
      page = 1,
      limit = 50,
    } = req.query as { q: string; page: string; limit: string };
    const pageNumber = parseInt(page as string);
    const itemsPerPage = parseInt(limit as string);
    const offset = (pageNumber - 1) * itemsPerPage;
    try {
      const filter = ilike(icons.name, `%${q}%`);
      const [data, countResult] = await Promise.all([
        db
          .select()
          .from(icons)
          .where(filter)
          .limit(itemsPerPage)
          .offset(offset),
        db
          .select({ count: sql<string>`count(*)::text` })
          .from(icons)
          .where(filter),
      ]);
      const totalCount = Number(countResult[0]?.count ?? "0");

      res.json({
        data: data,
        hasMore: offset + itemsPerPage < totalCount,
      });
      return;
    } catch (error) {
      res.status(500).json({ success: false, error: "Internal server error" });
      return;
    }
  },
);

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  },
);

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

export default app;
