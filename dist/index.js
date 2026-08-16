// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import path3 from "path";
import fs3 from "fs";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var OAUTH_STATE_COOKIE = "__Host-oauth_state";
var decodeOAuthState = (state) => {
  let decoded;
  try {
    decoded = atob(state);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
  }
  return { redirectUri: decoded };
};

// server/_core/oauth.ts
import { parse as parseCookieHeader2 } from "cookie";

// server/db.ts
import { asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var siteSections = mysqlTable("site_sections", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(),
  title: text("title"),
  titleEn: text("titleEn"),
  titleAr: text("titleAr"),
  subtitle: text("subtitle"),
  subtitleEn: text("subtitleEn"),
  subtitleAr: text("subtitleAr"),
  content: text("content"),
  contentEn: text("contentEn"),
  contentAr: text("contentAr"),
  imageUrl: text("imageUrl"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  titleEn: varchar("titleEn", { length: 255 }),
  titleAr: varchar("titleAr", { length: 255 }),
  category: varchar("category", { length: 128 }).notNull(),
  categoryEn: varchar("categoryEn", { length: 128 }),
  categoryAr: varchar("categoryAr", { length: 128 }),
  description: text("description").notNull(),
  descriptionEn: text("descriptionEn"),
  descriptionAr: text("descriptionAr"),
  imageUrl: text("imageUrl"),
  clientName: varchar("clientName", { length: 255 }),
  sourceUrl: text("sourceUrl"),
  sourcePlatform: varchar("sourcePlatform", { length: 64 }),
  published: int("published").default(1).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var projectSlides = mysqlTable("project_slides", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleEn: varchar("titleEn", { length: 255 }),
  titleAr: varchar("titleAr", { length: 255 }),
  description: text("description"),
  descriptionEn: text("descriptionEn"),
  descriptionAr: text("descriptionAr"),
  imageUrl: text("imageUrl").notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var posts = mysqlTable("posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  titleEn: varchar("titleEn", { length: 255 }),
  titleAr: varchar("titleAr", { length: 255 }),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  summary: text("summary").notNull(),
  summaryEn: text("summaryEn"),
  summaryAr: text("summaryAr"),
  content: text("content").notNull(),
  contentEn: text("contentEn"),
  contentAr: text("contentAr"),
  imageUrl: text("imageUrl"),
  published: int("published").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  adminPanelPassword: process.env.ADMIN_PANEL_PASSWORD ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
function requireDb(db) {
  if (!db) throw new Error("Database is not available");
  return db;
}
function localOnlySlides(project, slides) {
  const localCover = typeof project.imageUrl === "string" && project.imageUrl.startsWith("/manus-storage/") ? project.imageUrl : null;
  return slides.map((slide) => ({ ...slide, imageUrl: typeof slide.imageUrl === "string" && slide.imageUrl.startsWith("/manus-storage/") ? slide.imageUrl : localCover }));
}
async function upsertUser(user) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  const values = { openId: user.openId };
  const updateSet = {};
  const textFields = ["name", "email", "loginMethod"];
  for (const field of textFields) {
    if (user[field] !== void 0) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== void 0) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== void 0) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= /* @__PURE__ */ new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = /* @__PURE__ */ new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}
async function listSections() {
  const db = requireDb(await getDb());
  return db.select().from(siteSections).orderBy(asc(siteSections.id));
}
async function listProjects(publishedOnly = false) {
  const db = requireDb(await getDb());
  const query = publishedOnly ? db.select().from(projects).where(eq(projects.published, 1)) : db.select().from(projects);
  return query.orderBy(asc(projects.displayOrder), desc(projects.createdAt));
}
async function listPosts(publishedOnly = false) {
  const db = requireDb(await getDb());
  const query = publishedOnly ? db.select().from(posts).where(eq(posts.published, 1)) : db.select().from(posts);
  return query.orderBy(desc(posts.publishedAt));
}
async function getProjectById(id) {
  const db = requireDb(await getDb());
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  const project = result[0];
  if (!project) return void 0;
  const slides = await db.select().from(projectSlides).where(eq(projectSlides.projectId, id)).orderBy(asc(projectSlides.displayOrder), asc(projectSlides.id));
  return { ...project, slides: localOnlySlides(project, slides) };
}
async function listProjectsWithSlides(publishedOnly = false) {
  const list = await listProjects(publishedOnly);
  const db = requireDb(await getDb());
  const detailed = [];
  for (const p of list) {
    const slides = await db.select().from(projectSlides).where(eq(projectSlides.projectId, p.id)).orderBy(asc(projectSlides.displayOrder), asc(projectSlides.id));
    detailed.push({ ...p, slides: localOnlySlides(p, slides) });
  }
  return detailed;
}
async function getPostById(id) {
  const db = requireDb(await getDb());
  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return result[0];
}
async function getSectionByKey(key) {
  const db = requireDb(await getDb());
  const result = await db.select().from(siteSections).where(eq(siteSections.key, key)).limit(1);
  return result[0];
}
async function saveSection(input) {
  const db = requireDb(await getDb());
  const values = {
    ...input,
    title: input.titleEn ?? input.title ?? null,
    titleEn: input.titleEn ?? input.title ?? null,
    subtitle: input.subtitleEn ?? input.subtitle ?? null,
    subtitleEn: input.subtitleEn ?? input.subtitle ?? null,
    content: input.contentEn ?? input.content ?? null,
    contentEn: input.contentEn ?? input.content ?? null
  };
  await db.insert(siteSections).values(values).onDuplicateKeyUpdate({
    set: {
      title: values.title,
      titleEn: values.titleEn,
      titleAr: input.titleAr ?? null,
      subtitle: values.subtitle,
      subtitleEn: values.subtitleEn,
      subtitleAr: input.subtitleAr ?? null,
      content: values.content,
      contentEn: values.contentEn,
      contentAr: input.contentAr ?? null,
      imageUrl: input.imageUrl ?? null,
      updatedAt: /* @__PURE__ */ new Date()
    }
  });
  return getSectionByKey(input.key);
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    return decodeOAuthState(state).redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }
    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader2(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/storageProxy.ts
function registerStorageProxy(app) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// server/routers.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { eq as eq2 } from "drizzle-orm";
import { z as z2 } from "zod";

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/storage.ts
function getForgeConfig() {
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;
  if (!forgeUrl || !forgeKey) {
    throw new Error(
      "Storage config missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { forgeUrl: forgeUrl.replace(/\/+$/, ""), forgeKey };
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function appendHashSuffix(relKey) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { forgeUrl, forgeKey } = getForgeConfig();
  const key = appendHashSuffix(normalizeKey(relKey));
  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", key);
  const presignResp = await fetch(presignUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` }
  });
  if (!presignResp.ok) {
    const msg = await presignResp.text().catch(() => presignResp.statusText);
    throw new Error(`Storage presign failed (${presignResp.status}): ${msg}`);
  }
  const { url: s3Url } = await presignResp.json();
  if (!s3Url) throw new Error("Forge returned empty presign URL");
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const uploadResp = await fetch(s3Url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob
  });
  if (!uploadResp.ok) {
    throw new Error(`Storage upload to S3 failed (${uploadResp.status})`);
  }
  return { key, url: `/manus-storage/${key}` };
}
async function storageGetSignedUrl(relKey) {
  const { forgeUrl, forgeKey } = getForgeConfig();
  const key = normalizeKey(relKey);
  const getUrl = new URL("v1/storage/presign/get", forgeUrl + "/");
  getUrl.searchParams.set("path", key);
  const resp = await fetch(getUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` }
  });
  if (!resp.ok) {
    const msg = await resp.text().catch(() => resp.statusText);
    throw new Error(`Storage signed URL failed (${resp.status}): ${msg}`);
  }
  const { url } = await resp.json();
  return url;
}

// server/routers.ts
var ADMIN_PASSWORD_COOKIE = "admin_panel_access";
function getAdminAccessToken() {
  const pwd = ENV.adminPanelPassword || "emad-default-secure-pwd-2026";
  return createHash("sha256").update(`emad-admin-token-salt|${pwd}`).digest("hex");
}
function matchesAdminPassword(input) {
  const expected = ENV.adminPanelPassword;
  if (!expected || !input) return false;
  const inputBuffer = Buffer.from(input);
  const expectedBuffer = Buffer.from(expected);
  return inputBuffer.length === expectedBuffer.length && timingSafeEqual(inputBuffer, expectedBuffer);
}
function getCookieValue(req, name) {
  const header = req.headers.cookie;
  const cookieHeader = Array.isArray(header) ? header.join(";") : header;
  return cookieHeader?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
}
var ADMIN_PANEL_USERNAME = "Emadalddine";
var ADMIN_SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1e3;
var ownerProcedure = publicProcedure.use(({ ctx, next }) => {
  if (getCookieValue(ctx.req, ADMIN_PASSWORD_COOKIE) !== getAdminAccessToken()) {
    throw new TRPCError3({ code: "UNAUTHORIZED", message: "Control panel login required" });
  }
  return next({ ctx });
});
function matchesAdminUsername(input) {
  return input.trim().toLowerCase() === ADMIN_PANEL_USERNAME.toLowerCase();
}
var slideSchema = z2.object({
  title: z2.string().trim().min(1).max(255),
  titleEn: z2.string().trim().max(255).nullable().optional(),
  titleAr: z2.string().trim().max(255).nullable().optional(),
  description: z2.string().trim().max(2e3).nullable().optional(),
  descriptionEn: z2.string().trim().max(2e3).nullable().optional(),
  descriptionAr: z2.string().trim().max(2e3).nullable().optional(),
  imageUrl: z2.string().trim().max(1e3),
  displayOrder: z2.number().int().min(0).default(0)
});
var projectSchema = z2.object({
  title: z2.string().trim().min(1).max(255),
  titleEn: z2.string().trim().max(255).nullable().optional(),
  titleAr: z2.string().trim().max(255).nullable().optional(),
  category: z2.string().trim().min(1).max(128),
  categoryEn: z2.string().trim().max(128).nullable().optional(),
  categoryAr: z2.string().trim().max(128).nullable().optional(),
  description: z2.string().trim().min(1),
  descriptionEn: z2.string().trim().nullable().optional(),
  descriptionAr: z2.string().trim().nullable().optional(),
  imageUrl: z2.string().trim().max(1e3).nullable().optional(),
  clientName: z2.string().trim().max(255).nullable().optional(),
  sourceUrl: z2.string().trim().max(1e3).nullable().optional(),
  sourcePlatform: z2.string().trim().max(64).nullable().optional(),
  published: z2.boolean().default(true),
  displayOrder: z2.number().int().min(0).default(0),
  slides: z2.array(slideSchema).optional()
});
var postSchema = z2.object({
  title: z2.string().trim().min(1).max(255),
  titleEn: z2.string().trim().max(255).nullable().optional(),
  titleAr: z2.string().trim().max(255).nullable().optional(),
  slug: z2.string().trim().min(1).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers, and hyphens"),
  publishedAt: z2.coerce.date(),
  summary: z2.string().trim().min(1),
  summaryEn: z2.string().trim().nullable().optional(),
  summaryAr: z2.string().trim().nullable().optional(),
  content: z2.string().trim().min(1),
  contentEn: z2.string().trim().nullable().optional(),
  contentAr: z2.string().trim().nullable().optional(),
  imageUrl: z2.string().trim().max(1e3).nullable().optional(),
  published: z2.boolean().default(true)
});
var sectionSchema = z2.object({
  key: z2.string().trim().min(1).max(64),
  title: z2.string().max(1e3).nullable().optional(),
  titleEn: z2.string().max(1e3).nullable().optional(),
  titleAr: z2.string().max(1e3).nullable().optional(),
  subtitle: z2.string().max(1e3).nullable().optional(),
  subtitleEn: z2.string().max(1e3).nullable().optional(),
  subtitleAr: z2.string().max(1e3).nullable().optional(),
  content: z2.string().max(2e4).nullable().optional(),
  contentEn: z2.string().max(2e4).nullable().optional(),
  contentAr: z2.string().max(2e4).nullable().optional(),
  imageUrl: z2.string().max(1e3).nullable().optional()
});
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    verifyAdminPassword: publicProcedure.input(z2.object({ password: z2.string().min(1).max(256) })).mutation(({ input, ctx }) => {
      if (!matchesAdminPassword(input.password)) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Incorrect admin password" });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(ADMIN_PASSWORD_COOKIE, getAdminAccessToken(), { ...cookieOptions, sameSite: "lax", maxAge: ADMIN_SESSION_MAX_AGE_MS });
      return { success: true };
    }),
    verifyAdminCredentials: publicProcedure.input(z2.object({ username: z2.string().min(1).max(128), password: z2.string().min(1).max(256) })).mutation(({ input, ctx }) => {
      if (!matchesAdminUsername(input.username) || !matchesAdminPassword(input.password)) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Incorrect username or password" });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(ADMIN_PASSWORD_COOKIE, getAdminAccessToken(), { ...cookieOptions, sameSite: "lax", maxAge: ADMIN_SESSION_MAX_AGE_MS });
      return { success: true };
    }),
    adminPasswordStatus: publicProcedure.query(({ ctx }) => ({ authenticated: getCookieValue(ctx.req, ADMIN_PASSWORD_COOKIE) === getAdminAccessToken() })),
    refreshAdminSession: publicProcedure.mutation(({ ctx }) => {
      if (getCookieValue(ctx.req, ADMIN_PASSWORD_COOKIE) !== getAdminAccessToken()) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Control panel session expired" });
      }
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(ADMIN_PASSWORD_COOKIE, getAdminAccessToken(), { ...cookieOptions, maxAge: ADMIN_SESSION_MAX_AGE_MS });
      return { success: true, maxAgeMs: ADMIN_SESSION_MAX_AGE_MS };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie(ADMIN_PASSWORD_COOKIE, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  content: router({
    publicHome: publicProcedure.query(async () => ({
      sections: await listSections(),
      projects: await listProjectsWithSlides(true),
      posts: await listPosts(true)
    })),
    publicProjects: publicProcedure.query(() => listProjectsWithSlides(true)),
    publicProject: publicProcedure.input(z2.object({ id: z2.number().int().positive() })).query(async ({ input }) => {
      const project = await getProjectById(input.id);
      if (!project || project.published !== 1) return null;
      return project;
    }),
    publicPosts: publicProcedure.query(() => listPosts(true)),
    adminData: ownerProcedure.query(async () => ({
      sections: await listSections(),
      projects: await listProjectsWithSlides(false),
      posts: await listPosts(false)
    })),
    saveSection: ownerProcedure.input(sectionSchema).mutation(({ input }) => saveSection(input)),
    createProject: ownerProcedure.input(projectSchema).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
      const { slides, ...projValues } = input;
      const projectValues = {
        ...projValues,
        title: projValues.titleEn ?? projValues.title,
        titleEn: projValues.titleEn ?? projValues.title,
        category: projValues.categoryEn ?? projValues.category,
        categoryEn: projValues.categoryEn ?? projValues.category,
        description: projValues.descriptionEn ?? projValues.description,
        descriptionEn: projValues.descriptionEn ?? projValues.description,
        published: projValues.published ? 1 : 0
      };
      const result = await db.insert(projects).values(projectValues);
      const id = Number(result[0]?.insertId ?? 0);
      if (id && slides && slides.length > 0) {
        for (const s of slides) {
          await db.insert(projectSlides).values({ projectId: id, title: s.titleEn ?? s.title, titleEn: s.titleEn ?? s.title, titleAr: s.titleAr ?? null, description: s.descriptionEn ?? s.description ?? null, descriptionEn: s.descriptionEn ?? s.description ?? null, descriptionAr: s.descriptionAr ?? null, imageUrl: s.imageUrl, displayOrder: s.displayOrder });
        }
      }
      return id ? getProjectById(id) : { success: true };
    }),
    updateProject: ownerProcedure.input(projectSchema.extend({ id: z2.number().int().positive() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
      const { id, slides, ...values } = input;
      const projectValues = {
        ...values,
        title: values.titleEn ?? values.title,
        titleEn: values.titleEn ?? values.title,
        category: values.categoryEn ?? values.category,
        categoryEn: values.categoryEn ?? values.category,
        description: values.descriptionEn ?? values.description,
        descriptionEn: values.descriptionEn ?? values.description,
        published: values.published ? 1 : 0,
        updatedAt: /* @__PURE__ */ new Date()
      };
      await db.update(projects).set(projectValues).where(eq2(projects.id, id));
      if (slides !== void 0) {
        await db.delete(projectSlides).where(eq2(projectSlides.projectId, id));
        for (const s of slides) {
          await db.insert(projectSlides).values({ projectId: id, title: s.titleEn ?? s.title, titleEn: s.titleEn ?? s.title, titleAr: s.titleAr ?? null, description: s.descriptionEn ?? s.description ?? null, descriptionEn: s.descriptionEn ?? s.description ?? null, descriptionAr: s.descriptionAr ?? null, imageUrl: s.imageUrl, displayOrder: s.displayOrder });
        }
      }
      return getProjectById(id);
    }),
    deleteProject: ownerProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
      await db.delete(projects).where(eq2(projects.id, input.id));
      return { success: true };
    }),
    createPost: ownerProcedure.input(postSchema).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
      const postValues = {
        ...input,
        title: input.titleEn ?? input.title,
        titleEn: input.titleEn ?? input.title,
        summary: input.summaryEn ?? input.summary,
        summaryEn: input.summaryEn ?? input.summary,
        content: input.contentEn ?? input.content,
        contentEn: input.contentEn ?? input.content,
        published: input.published ? 1 : 0
      };
      const result = await db.insert(posts).values(postValues);
      const id = Number(result[0]?.insertId ?? 0);
      return id ? getPostById(id) : { success: true };
    }),
    updatePost: ownerProcedure.input(postSchema.extend({ id: z2.number().int().positive() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
      const { id, ...values } = input;
      const postValues = {
        ...values,
        title: values.titleEn ?? values.title,
        titleEn: values.titleEn ?? values.title,
        summary: values.summaryEn ?? values.summary,
        summaryEn: values.summaryEn ?? values.summary,
        content: values.contentEn ?? values.content,
        contentEn: values.contentEn ?? values.content,
        published: values.published ? 1 : 0,
        updatedAt: /* @__PURE__ */ new Date()
      };
      await db.update(posts).set(postValues).where(eq2(posts.id, id));
      return getPostById(id);
    }),
    deletePost: ownerProcedure.input(z2.object({ id: z2.number().int().positive() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
      await db.delete(posts).where(eq2(posts.id, input.id));
      return { success: true };
    }),
    uploadImage: ownerProcedure.input(z2.object({
      filename: z2.string().trim().min(1).max(200),
      mimeType: z2.string().regex(/^image\/(jpeg|png|webp|gif|svg\+xml)$/),
      base64: z2.string().min(1).max(12e6)
    })).mutation(async ({ input }) => {
      const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "-");
      const bytes = Buffer.from(input.base64, "base64");
      if (bytes.byteLength > 8 * 1024 * 1024) throw new TRPCError3({ code: "PAYLOAD_TOO_LARGE", message: "Image must be 8 MB or smaller" });
      return storagePut(`emadalddine/${Date.now()}-${safeName}`, bytes, input.mimeType);
    }),
    uploadResume: ownerProcedure.input(z2.object({
      filename: z2.string().trim().min(1).max(200),
      mimeType: z2.literal("application/pdf"),
      base64: z2.string().min(1).max(2e7)
    })).mutation(async ({ input }) => {
      const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "-");
      const bytes = Buffer.from(input.base64, "base64");
      if (bytes.byteLength > 12 * 1024 * 1024) throw new TRPCError3({ code: "PAYLOAD_TOO_LARGE", message: "PDF must be 12 MB or smaller" });
      return storagePut(`emadalddine/resume-${Date.now()}-${safeName}`, bytes, "application/pdf");
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const candidates = [
    path2.resolve(import.meta.dirname, "public"),
    path2.resolve(import.meta.dirname, "../dist/public"),
    path2.resolve(import.meta.dirname, "../../dist/public"),
    path2.resolve(process.cwd(), "dist/public"),
    path2.resolve(process.cwd(), "public")
  ];
  let distPath = candidates.find((p) => fs2.existsSync(p)) || candidates[0];
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    const indexPath = path2.resolve(distPath, "index.html");
    if (fs2.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("SPA index.html not found");
    }
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
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
      const localFallback = path3.resolve(process.cwd(), "client/public/assets/portrait.jpg");
      if (fs3.existsSync(localFallback)) {
        res.sendFile(localFallback);
        return;
      }
      res.status(404).end();
    } catch {
      res.status(404).end();
    }
  });
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
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
