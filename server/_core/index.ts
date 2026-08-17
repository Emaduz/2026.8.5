import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import fs from "fs";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { storageGetSignedUrl } from "../storage";
import { getSectionByKey, ensureDatabaseInitialized } from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  try {
    await ensureDatabaseInitialized();
  } catch (e) {
    console.warn("[Database] Initialization failed:", e);
  }
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
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
      const signedUrl = await storageGetSignedUrl(storageKey).catch(() => null);
      if (signedUrl) {
        const upstream = await fetch(signedUrl);
        if (upstream.ok) {
          const bytes = Buffer.from(await upstream.arrayBuffer());
          res.status(200).set({ "Content-Type": upstream.headers.get("content-type") || "image/jpeg", "Cache-Control": "public, max-age=86400", "X-Content-Type-Options": "nosniff" }).end(bytes);
          return;
        }
      }
      const localFallback = path.resolve(process.cwd(), "client/public/assets/portrait.jpg");
      if (fs.existsSync(localFallback)) {
        res.sendFile(localFallback);
        return;
      }
      res.status(404).end();
    } catch {
      res.status(404).end();
    }
  });

  app.get("/api/logo", async (_req, res) => {
    try {
      const localLogo = path.resolve(process.cwd(), "client/public/assets/logo.png");
      if (fs.existsSync(localLogo)) {
        res.status(200).set({ "Content-Type": "image/png", "Cache-Control": "public, max-age=86400", "X-Content-Type-Options": "nosniff" }).sendFile(localLogo);
        return;
      }
      res.status(404).end();
    } catch {
      res.status(404).end();
    }
  });
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
