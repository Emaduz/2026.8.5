import { TRPCError } from "@trpc/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { ENV } from "./_core/env";
import { getDb, getPostById, getProjectById, listPosts, listProjects, listProjectsWithSlides, listSections, saveSection } from "./db";
import { posts, projectSlides, projects } from "../drizzle/schema";
import { storagePut } from "./storage";

const ADMIN_PASSWORD_COOKIE = "admin_panel_access";

export function getAdminAccessToken() {
  const pwd = ENV.adminPanelPassword || "emad-default-secure-pwd-2026";
  return createHash("sha256").update(`emad-admin-token-salt|${pwd}`).digest("hex");
}

function matchesAdminPassword(input: string) {
  const expected = ENV.adminPanelPassword;
  if (!expected || !input) return false;
  const inputBuffer = Buffer.from(input);
  const expectedBuffer = Buffer.from(expected);
  return inputBuffer.length === expectedBuffer.length && timingSafeEqual(inputBuffer, expectedBuffer);
}

function getCookieValue(req: { headers: { cookie?: string | string[] } }, name: string) {
  const header = req.headers.cookie;
  const cookieHeader = Array.isArray(header) ? header.join(";") : header;
  return cookieHeader?.split(";").map(part => part.trim()).find(part => part.startsWith(`${name}=`))?.slice(name.length + 1);
}

const ADMIN_PANEL_USERNAME = "Emadalddine";
const ADMIN_SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const ownerProcedure = publicProcedure.use(({ ctx, next }) => {
  if (getCookieValue(ctx.req, ADMIN_PASSWORD_COOKIE) !== getAdminAccessToken()) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Control panel login required" });
  }
  return next({ ctx });
});

function matchesAdminUsername(input: string) {
  return input.trim().toLowerCase() === ADMIN_PANEL_USERNAME.toLowerCase();
}

const slideSchema = z.object({
  title: z.string().trim().min(1).max(255),
  titleEn: z.string().trim().max(255).nullable().optional(),
  titleAr: z.string().trim().max(255).nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  descriptionEn: z.string().trim().max(2000).nullable().optional(),
  descriptionAr: z.string().trim().max(2000).nullable().optional(),
  imageUrl: z.string().trim().max(1000),
  displayOrder: z.number().int().min(0).default(0),
});

const projectSchema = z.object({
  title: z.string().trim().min(1).max(255),
  titleEn: z.string().trim().max(255).nullable().optional(),
  titleAr: z.string().trim().max(255).nullable().optional(),
  category: z.string().trim().min(1).max(128),
  categoryEn: z.string().trim().max(128).nullable().optional(),
  categoryAr: z.string().trim().max(128).nullable().optional(),
  description: z.string().trim().min(1),
  descriptionEn: z.string().trim().nullable().optional(),
  descriptionAr: z.string().trim().nullable().optional(),
  imageUrl: z.string().trim().max(1000).nullable().optional(),
  clientName: z.string().trim().max(255).nullable().optional(),
  sourceUrl: z.string().trim().max(1000).nullable().optional(),
  sourcePlatform: z.string().trim().max(64).nullable().optional(),
  published: z.boolean().default(true),
  displayOrder: z.number().int().min(0).default(0),
  slides: z.array(slideSchema).optional(),
});

const postSchema = z.object({
  title: z.string().trim().min(1).max(255),
  titleEn: z.string().trim().max(255).nullable().optional(),
  titleAr: z.string().trim().max(255).nullable().optional(),
  slug: z.string().trim().min(1).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers, and hyphens"),
  publishedAt: z.coerce.date(),
  summary: z.string().trim().min(1),
  summaryEn: z.string().trim().nullable().optional(),
  summaryAr: z.string().trim().nullable().optional(),
  content: z.string().trim().min(1),
  contentEn: z.string().trim().nullable().optional(),
  contentAr: z.string().trim().nullable().optional(),
  imageUrl: z.string().trim().max(1000).nullable().optional(),
  published: z.boolean().default(true),
});

const sectionSchema = z.object({
  key: z.string().trim().min(1).max(64),
  title: z.string().max(1000).nullable().optional(),
  titleEn: z.string().max(1000).nullable().optional(),
  titleAr: z.string().max(1000).nullable().optional(),
  subtitle: z.string().max(1000).nullable().optional(),
  subtitleEn: z.string().max(1000).nullable().optional(),
  subtitleAr: z.string().max(1000).nullable().optional(),
  content: z.string().max(20000).nullable().optional(),
  contentEn: z.string().max(20000).nullable().optional(),
  contentAr: z.string().max(20000).nullable().optional(),
  imageUrl: z.string().max(1000).nullable().optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    verifyAdminPassword: publicProcedure.input(z.object({ password: z.string().min(1).max(256) })).mutation(({ input, ctx }) => {
      if (!matchesAdminPassword(input.password)) throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect admin password" });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(ADMIN_PASSWORD_COOKIE, getAdminAccessToken(), { ...cookieOptions, sameSite: "lax", maxAge: ADMIN_SESSION_MAX_AGE_MS });
      return { success: true } as const;
    }),
    verifyAdminCredentials: publicProcedure.input(z.object({ username: z.string().min(1).max(128), password: z.string().min(1).max(256) })).mutation(({ input, ctx }) => {
      if (!matchesAdminUsername(input.username) || !matchesAdminPassword(input.password)) throw new TRPCError({ code: "UNAUTHORIZED", message: "Incorrect username or password" });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(ADMIN_PASSWORD_COOKIE, getAdminAccessToken(), { ...cookieOptions, sameSite: "lax", maxAge: ADMIN_SESSION_MAX_AGE_MS });
      return { success: true } as const;
    }),
    adminPasswordStatus: publicProcedure.query(({ ctx }) => ({ authenticated: getCookieValue(ctx.req, ADMIN_PASSWORD_COOKIE) === getAdminAccessToken() })),
    refreshAdminSession: publicProcedure.mutation(({ ctx }) => {
      if (getCookieValue(ctx.req, ADMIN_PASSWORD_COOKIE) !== getAdminAccessToken()) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Control panel session expired" });
      }
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(ADMIN_PASSWORD_COOKIE, getAdminAccessToken(), { ...cookieOptions, maxAge: ADMIN_SESSION_MAX_AGE_MS });
      return { success: true, maxAgeMs: ADMIN_SESSION_MAX_AGE_MS } as const;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      ctx.res.clearCookie(ADMIN_PASSWORD_COOKIE, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  content: router({
    publicHome: publicProcedure.query(async () => ({
      sections: await listSections(),
      projects: await listProjectsWithSlides(true),
      posts: await listPosts(true),
    })),
    publicProjects: publicProcedure.query(() => listProjectsWithSlides(true)),
    publicProject: publicProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
      const project = await getProjectById(input.id);
      if (!project || project.published !== 1) return null;
      return project;
    }),
    publicPosts: publicProcedure.query(() => listPosts(true)),
    adminData: ownerProcedure.query(async () => ({
      sections: await listSections(),
      projects: await listProjectsWithSlides(false),
      posts: await listPosts(false),
    })),
    saveSection: ownerProcedure.input(sectionSchema).mutation(({ input }) => saveSection(input)),
    createProject: ownerProcedure.input(projectSchema).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
      const { slides, ...projValues } = input;
      const projectValues = {
        ...projValues,
        title: projValues.titleEn ?? projValues.title,
        titleEn: projValues.titleEn ?? projValues.title,
        category: projValues.categoryEn ?? projValues.category,
        categoryEn: projValues.categoryEn ?? projValues.category,
        description: projValues.descriptionEn ?? projValues.description,
        descriptionEn: projValues.descriptionEn ?? projValues.description,
        published: projValues.published ? 1 : 0,
      };
      const result = await db.insert(projects).values(projectValues);
      const id = Number((result as any)[0]?.insertId ?? 0);
      if (id && slides && slides.length > 0) {
        for (const s of slides) {
          await db.insert(projectSlides).values({ projectId: id, title: s.titleEn ?? s.title, titleEn: s.titleEn ?? s.title, titleAr: s.titleAr ?? null, description: s.descriptionEn ?? s.description ?? null, descriptionEn: s.descriptionEn ?? s.description ?? null, descriptionAr: s.descriptionAr ?? null, imageUrl: s.imageUrl, displayOrder: s.displayOrder });
        }
      }
      return id ? getProjectById(id) : { success: true };
    }),
    updateProject: ownerProcedure.input(projectSchema.extend({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
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
        updatedAt: new Date(),
      };
      await db.update(projects).set(projectValues).where(eq(projects.id, id));
      if (slides !== undefined) {
        await db.delete(projectSlides).where(eq(projectSlides.projectId, id));
        for (const s of slides) {
          await db.insert(projectSlides).values({ projectId: id, title: s.titleEn ?? s.title, titleEn: s.titleEn ?? s.title, titleAr: s.titleAr ?? null, description: s.descriptionEn ?? s.description ?? null, descriptionEn: s.descriptionEn ?? s.description ?? null, descriptionAr: s.descriptionAr ?? null, imageUrl: s.imageUrl, displayOrder: s.displayOrder });
        }
      }
      return getProjectById(id);
    }),
    deleteProject: ownerProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
      await db.delete(projects).where(eq(projects.id, input.id));
      return { success: true } as const;
    }),
    createPost: ownerProcedure.input(postSchema).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
      const postValues = {
        ...input,
        title: input.titleEn ?? input.title,
        titleEn: input.titleEn ?? input.title,
        summary: input.summaryEn ?? input.summary,
        summaryEn: input.summaryEn ?? input.summary,
        content: input.contentEn ?? input.content,
        contentEn: input.contentEn ?? input.content,
        published: input.published ? 1 : 0,
      };
      const result = await db.insert(posts).values(postValues);
      const id = Number((result as any)[0]?.insertId ?? 0);
      return id ? getPostById(id) : { success: true };
    }),
    updatePost: ownerProcedure.input(postSchema.extend({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
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
        updatedAt: new Date(),
      };
      await db.update(posts).set(postValues).where(eq(posts.id, id));
      return getPostById(id);
    }),
    deletePost: ownerProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is not available" });
      await db.delete(posts).where(eq(posts.id, input.id));
      return { success: true } as const;
    }),
    uploadImage: ownerProcedure.input(z.object({
      filename: z.string().trim().min(1).max(200),
      mimeType: z.string().regex(/^image\/(jpeg|png|webp|gif|svg\+xml)$/),
      base64: z.string().min(1).max(12_000_000),
    })).mutation(async ({ input }) => {
      const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "-");
      const bytes = Buffer.from(input.base64, "base64");
      if (bytes.byteLength > 8 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Image must be 8 MB or smaller" });
      return storagePut(`emadalddine/${Date.now()}-${safeName}`, bytes, input.mimeType);
    }),
    uploadResume: ownerProcedure.input(z.object({
      filename: z.string().trim().min(1).max(200),
      mimeType: z.literal("application/pdf"),
      base64: z.string().min(1).max(20_000_000),
    })).mutation(async ({ input }) => {
      const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "-");
      const bytes = Buffer.from(input.base64, "base64");
      if (bytes.byteLength > 12 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "PDF must be 12 MB or smaller" });
      return storagePut(`emadalddine/resume-${Date.now()}-${safeName}`, bytes, "application/pdf");
    }),
  }),
});

export type AppRouter = typeof appRouter;

