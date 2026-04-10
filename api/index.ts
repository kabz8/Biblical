import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes-runtime";

const app = express();

app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));

let initPromise: Promise<void> | null = null;

function ensureInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const httpServer = createServer(app);
      await registerRoutes(httpServer, app);

      app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        if (res.headersSent) return next(err);
        return res.status(status).json({ message });
      });
    })();
  }
  return initPromise;
}

export default async function handler(req: Request, res: Response) {
  try {
    await ensureInitialized();
    return app(req, res);
  } catch (error: any) {
    const message = String(error?.message || "Server failed to initialize");
    const missingEnv =
      !process.env.DATABASE_URL ||
      !process.env.SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hint = missingEnv
      ? "Check Vercel env vars: DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY."
      : "Check server logs for stack trace.";
    return res.status(500).json({
      message: "API initialization failed",
      detail: message,
      hint,
    });
  }
}
