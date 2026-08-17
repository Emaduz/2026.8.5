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
  const isValidUrl = (url: unknown) => typeof url === "string" && url.length > 0 && (url.startsWith("/manus-storage/") || url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/api/"));
  const cover = isValidUrl(project.imageUrl) ? project.imageUrl : null;
  return slides.map(slide => ({ ...slide, imageUrl: isValidUrl(slide.imageUrl) ? slide.imageUrl : cover }));
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



import mysql from "mysql2/promise";

export async function ensureDatabaseInitialized() {
  const db = await getDb();
  if (!db) return;
  try {
    if (process.env.DATABASE_URL) {
      const connection = await mysql.createConnection(process.env.DATABASE_URL);
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          openId VARCHAR(255) NOT NULL UNIQUE,
          name VARCHAR(255),
          email VARCHAR(255),
          loginMethod VARCHAR(64),
          role VARCHAR(32) DEFAULT 'user',
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await connection.query(`
        CREATE TABLE IF NOT EXISTS site_sections (
          id INT AUTO_INCREMENT PRIMARY KEY,
          \`key\` VARCHAR(64) NOT NULL UNIQUE,
          title TEXT,
          titleEn TEXT,
          titleAr TEXT,
          subtitle TEXT,
          subtitleEn TEXT,
          subtitleAr TEXT,
          content TEXT,
          contentEn TEXT,
          contentAr TEXT,
          imageUrl VARCHAR(1000),
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `);
      await connection.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          titleEn VARCHAR(255),
          titleAr VARCHAR(255),
          category VARCHAR(128) NOT NULL,
          categoryEn VARCHAR(128),
          categoryAr VARCHAR(128),
          description TEXT NOT NULL,
          descriptionEn TEXT,
          descriptionAr TEXT,
          imageUrl VARCHAR(1000),
          clientName VARCHAR(255),
          sourceUrl VARCHAR(1000),
          sourcePlatform VARCHAR(64),
          published TINYINT DEFAULT 1,
          displayOrder INT DEFAULT 0,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `);
      await connection.query(`
        CREATE TABLE IF NOT EXISTS project_slides (
          id INT AUTO_INCREMENT PRIMARY KEY,
          projectId INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          titleEn VARCHAR(255),
          titleAr VARCHAR(255),
          description TEXT,
          descriptionEn TEXT,
          descriptionAr TEXT,
          imageUrl VARCHAR(1000) NOT NULL,
          displayOrder INT DEFAULT 0,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `);
      await connection.query(`
        CREATE TABLE IF NOT EXISTS posts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          titleEn VARCHAR(255),
          titleAr VARCHAR(255),
          slug VARCHAR(255) NOT NULL UNIQUE,
          publishedAt DATETIME NOT NULL,
          summary TEXT NOT NULL,
          summaryEn TEXT,
          summaryAr TEXT,
          content TEXT NOT NULL,
          contentEn TEXT,
          contentAr TEXT,
          imageUrl VARCHAR(1000),
          published TINYINT DEFAULT 1,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `);
      await connection.end();
    }

    const existingProjects = await db.select().from(projects).limit(1);
    if (existingProjects.length === 0) {
      const defaultProjects = [
        { title: "ERA Shopping Logo & Brand", category: "Branding", description: "Comprehensive shopping brand identity and visual system.", imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80", sourceUrl: "https://www.behance.net/gallery/240072049/ERA-shopping-Logo-Brand", sourcePlatform: "Behance", published: 1, displayOrder: 1 },
        { title: "Jenan Yemeni Honey", category: "Packaging & Branding", description: "Authentic Yemeni honey packaging and brand identity design.", imageUrl: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=800&auto=format&fit=crop&q=80", sourceUrl: "https://www.behance.net/gallery/154753213/Jenan-Yemeni-Honey-Logo-Branding", sourcePlatform: "Behance", published: 1, displayOrder: 2 },
        { title: "Ekleel Alenayah Medical Company", category: "Corporate Identity", description: "Medical company branding, visual system, and corporate stationery.", imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80", sourceUrl: "https://www.behance.net/gallery/210092607/Ekleel-Alenayah-Medical-Company-Logo-Brand", sourcePlatform: "Behance", published: 1, displayOrder: 3 },
        { title: "Caesar Logo & Brand", category: "Brand Identity", description: "Distinctive brand identity design with modern typography.", imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80", sourceUrl: "https://www.behance.net/gallery/199510245/Caesar-logo-Brand", sourcePlatform: "Behance", published: 1, displayOrder: 4 },
        { title: "Al-Khattabi Press Logo & Identity", category: "Printing & Press Identity", description: "Corporate visual identity for a prominent press establishment.", imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop&q=80", sourceUrl: "https://www.behance.net/gallery/192992769/AL-KHATTABI-PRESS-LOGO-IDENTITY", sourcePlatform: "Behance", published: 1, displayOrder: 5 },
        { title: "Balsam Taibah Medical Co.", category: "Healthcare Branding", description: "Comprehensive branding and medical collateral design.", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80", sourceUrl: "https://www.behance.net/gallery/156295027/Balsam-Taibah-Medical-Co-Logo-Branding", sourcePlatform: "Behance", published: 1, displayOrder: 6 },
        { title: "Al-Bakeli Dental Clinic", category: "Clinical Branding", description: "Visual identity and clinic branding for dental care excellence.", imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80", sourceUrl: "https://www.behance.net/gallery/159472965/Al-Bakeli-Dental-Clinic", sourcePlatform: "Behance", published: 1, displayOrder: 7 },
        { title: "Bahaa Silver Logo Typography", category: "Luxury Logo & Typography", description: "Custom typography and brand identity for luxury silver.", imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80", sourceUrl: "https://www.behance.net/gallery/212641103/Bahaa-Silver-Logo-typography", sourcePlatform: "Behance", published: 1, displayOrder: 8 },
      ];
      for (const p of defaultProjects) {
        await db.insert(projects).values(p);
      }
    }
  } catch (err) {
    console.warn("[Database] Auto-bootstrap warning:", err);
  }
}
