import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
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
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const siteSections = mysqlTable("site_sections", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const projects = mysqlTable("projects", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const projectSlides = mysqlTable("project_slides", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const posts = mysqlTable("posts", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSection = typeof siteSections.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ProjectSlide = typeof projectSlides.$inferSelect;
export type Post = typeof posts.$inferSelect;

export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientNameEn: varchar("clientNameEn", { length: 255 }),
  clientNameAr: varchar("clientNameAr", { length: 255 }),
  role: varchar("role", { length: 255 }).notNull(),
  roleEn: varchar("roleEn", { length: 255 }),
  roleAr: varchar("roleAr", { length: 255 }),
  quote: text("quote").notNull(),
  quoteEn: text("quoteEn"),
  quoteAr: text("quoteAr"),
  avatarUrl: text("avatarUrl"),
  published: int("published").default(1).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect;

export const adminCredentials = mysqlTable("admin_credentials", {
  id: int("id").autoincrement().primaryKey(),
  passwordHash: text("passwordHash").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const adminPasswordResetTokens = mysqlTable("admin_password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  tokenHash: varchar("tokenHash", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminCredential = typeof adminCredentials.$inferSelect;
export type AdminPasswordResetToken = typeof adminPasswordResetTokens.$inferSelect;
