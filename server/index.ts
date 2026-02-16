import express from "express";
import type { Request, Response } from "express";
import { registerRoutes } from "./routes.js";

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

registerRoutes(app);

const isVercel = !!process.env.VERCEL;
if (!isVercel) {
  const port = Number(process.env.PORT || 5001);
  app.listen(port, "0.0.0.0", () => {
    // eslint-disable-next-line no-console
    console.log(`[api] listening on http://localhost:${port}`);
  });
}

export default function handler(req: any, res: any) {
  return app(req as Request, res as Response);
}
