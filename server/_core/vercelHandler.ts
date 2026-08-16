import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic } from "./vite";
import { storageGetSignedUrl } from "../storage";
import { getSectionByKey } from "../db";

export function createServerApp() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  registerStorageProxy(app);
  
  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "healthy", timestamp: Date.now() });
  });

  app.get("/api/portrait", async (_req, res) => {
    try {
      const configured = (await getSectionByKey("portrait"))?.imageUrl;
      const storageKey = configured?.startsWith("/manus-storage/") ? configured.slice("/manus-storage/".length) : "emad-portrait-new_81c16977.jpg";
      const upstream = await fetch(await storageGetSignedUrl(storageKey));
      if (!upstream.ok) {
        res.status(404).end();
        return;
      }
      const bytes = Buffer.from(await upstream.arrayBuffer());
      res.status(200).set({ "Content-Type": upstream.headers.get("content-type") || "image/png", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }).end(bytes);
    } catch {
      res.status(404).end();
    }
  });

  registerOAuthRoutes(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  serveStatic(app);
  return app;
}

const app = createServerApp();
export default app;
