import { asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, Post, Project, ProjectSlide, SiteSection, posts, projectSlides, projects, siteSections, users } from "../drizzle/schema";

type UserInsert = InsertUser;
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
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

function requireDb(db: ReturnType<typeof drizzle> | null) {
  if (!db) throw new Error("Database is not available");
  return db;
}

function localOnlySlides(project: Project, slides: ProjectSlide[]) {
  const localCover = typeof project.imageUrl === "string" && project.imageUrl.startsWith("/manus-storage/") ? project.imageUrl : null;
  return slides.map(slide => ({ ...slide, imageUrl: typeof slide.imageUrl === "string" && slide.imageUrl.startsWith("/manus-storage/") ? slide.imageUrl : localCover }));
}

export async function upsertUser(user: UserInsert): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];

  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listSections(): Promise<SiteSection[]> {
  const db = requireDb(await getDb());
  return db.select().from(siteSections).orderBy(asc(siteSections.id));
}

export async function listProjects(publishedOnly = false): Promise<Project[]> {
  const db = requireDb(await getDb());
  const query = publishedOnly
    ? db.select().from(projects).where(eq(projects.published, 1))
    : db.select().from(projects);
  return query.orderBy(asc(projects.displayOrder), desc(projects.createdAt));
}

export async function listPosts(publishedOnly = false): Promise<Post[]> {
  const db = requireDb(await getDb());
  const query = publishedOnly
    ? db.select().from(posts).where(eq(posts.published, 1))
    : db.select().from(posts);
  return query.orderBy(desc(posts.publishedAt));
}

export async function getProjectById(id: number) {
  const db = requireDb(await getDb());
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  const project = result[0];
  if (!project) return undefined;
  const slides = await db.select().from(projectSlides).where(eq(projectSlides.projectId, id)).orderBy(asc(projectSlides.displayOrder), asc(projectSlides.id));
  return { ...project, slides: localOnlySlides(project, slides) };
}

export async function listProjectsWithSlides(publishedOnly = false) {
  const list = await listProjects(publishedOnly);
  const db = requireDb(await getDb());
  const detailed = [];
  for (const p of list) {
    const slides = await db.select().from(projectSlides).where(eq(projectSlides.projectId, p.id)).orderBy(asc(projectSlides.displayOrder), asc(projectSlides.id));
    detailed.push({ ...p, slides: localOnlySlides(p, slides) });
  }
  return detailed;
}

export async function getPostById(id: number) {
  const db = requireDb(await getDb());
  const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return result[0];
}

export async function getSectionByKey(key: string) {
  const db = requireDb(await getDb());
  const result = await db.select().from(siteSections).where(eq(siteSections.key, key)).limit(1);
  return result[0];
}

export async function saveSection(input: { key: string; title?: string | null; titleEn?: string | null; titleAr?: string | null; subtitle?: string | null; subtitleEn?: string | null; subtitleAr?: string | null; content?: string | null; contentEn?: string | null; contentAr?: string | null; imageUrl?: string | null }) {
  const db = requireDb(await getDb());
  const values = {
    ...input,
    title: input.titleEn ?? input.title ?? null,
    titleEn: input.titleEn ?? input.title ?? null,
    subtitle: input.subtitleEn ?? input.subtitle ?? null,
    subtitleEn: input.subtitleEn ?? input.subtitle ?? null,
    content: input.contentEn ?? input.content ?? null,
    contentEn: input.contentEn ?? input.content ?? null,
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
      updatedAt: new Date(),
    },
  });
  return getSectionByKey(input.key);
}

export const contentTables = { posts, projects, siteSections };


