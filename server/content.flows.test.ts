import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import { projects, posts } from "../drizzle/schema";

process.env.OWNER_OPEN_ID ||= "owner-test";

type Row = Record<string, any> & { id: number };
const state: { projects: Row[]; posts: Row[] } = { projects: [], posts: [] };

const fakeDb = {
  insert(table: unknown) {
    return {
      async values(values: Record<string, any>) {
        const collection = table === projects ? state.projects : state.posts;
        const row = { ...values, id: collection.length + 1 };
        collection.push(row);
        return [{ insertId: row.id }];
      },
    };
  },
  update(table: unknown) {
    return {
      set(values: Record<string, any>) {
        return {
          async where() {
            const collection = table === projects ? state.projects : state.posts;
            if (collection[0]) Object.assign(collection[0], values);
          },
        };
      },
    };
  },
  delete(table: unknown) {
    return {
      async where() {
        const collection = table === projects ? state.projects : state.posts;
        collection.shift();
      },
    };
  },
};

vi.mock("./db", () => ({
  getDb: vi.fn(async () => fakeDb),
  listSections: vi.fn(async () => []),
  listProjects: vi.fn(async (publishedOnly: boolean) => publishedOnly ? state.projects.filter(item => item.published === 1) : state.projects),
  listProjectsWithSlides: vi.fn(async (publishedOnly: boolean) => (publishedOnly ? state.projects.filter(item => item.published === 1) : state.projects).map(project => ({ ...project, slides: [] }))),
  listPosts: vi.fn(async (publishedOnly: boolean) => publishedOnly ? state.posts.filter(item => item.published === 1) : state.posts),
  getProjectById: vi.fn(async (id: number) => state.projects.find(item => item.id === id)),
  getPostById: vi.fn(async (id: number) => state.posts.find(item => item.id === id)),
  saveSection: vi.fn(async (input: any) => input),
}));

const { appRouter, getAdminAccessToken } = await import("./routers");

function ownerContext(cookieHeader = `admin_panel_access=${getAdminAccessToken()}`): TrpcContext {
  return {
    user: { id: 1, openId: process.env.OWNER_OPEN_ID!, email: "owner@example.com", name: "Owner", loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: { cookie: cookieHeader } } as TrpcContext["req"],
    res: { clearCookie: () => undefined, cookie: () => undefined } as TrpcContext["res"],
  };
}

beforeEach(() => { state.projects.length = 0; state.posts.length = 0; });

describe("content publishing flows", () => {
  it("passes the verified password cookie into a protected content request", async () => {
    let cookieHeader = "";
    const authCaller = appRouter.createCaller({ ...ownerContext(""), req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: () => undefined, cookie: (name: string, value: string) => { cookieHeader = `${name}=${value}`; } } as TrpcContext["res"] });
    await authCaller.auth.verifyAdminPassword({ password: process.env.ADMIN_PANEL_PASSWORD! });
    const protectedCaller = appRouter.createCaller(ownerContext(cookieHeader));
    await expect(protectedCaller.content.createProject({ title: "Protected", category: "Branding", description: "A protected project", imageUrl: null, clientName: null, published: true, displayOrder: 1 })).resolves.toMatchObject({ title: "Protected" });
  });

  it("creates, toggles, and deletes a project while publicHome exposes only published rows", async () => {
    const caller = appRouter.createCaller(ownerContext());
    const project = await caller.content.createProject({ title: "Project", category: "Branding", description: "A project", imageUrl: null, clientName: null, published: true, displayOrder: 1 });
    expect(project).toMatchObject({ title: "Project", published: 1 });
    await caller.content.updateProject({ id: 1, title: "Project", category: "Branding", description: "A project", imageUrl: null, clientName: null, published: false, displayOrder: 1 });
    expect((await caller.content.publicHome()).projects).toHaveLength(0);
    await caller.content.deleteProject({ id: 1 });
    expect((await caller.content.adminData()).projects).toHaveLength(0);
  });

  it("creates a dated post and filters drafts out of the public home", async () => {
    const caller = appRouter.createCaller(ownerContext());
    const post = await caller.content.createPost({ title: "A note", slug: "a-note", publishedAt: "2026-08-12", summary: "Summary", content: "Body", imageUrl: null, published: true });
    expect(post).toMatchObject({ title: "A note", published: 1 });
    expect((await caller.content.publicHome()).posts).toHaveLength(1);
    await caller.content.updatePost({ id: 1, title: "A note", slug: "a-note", publishedAt: "2026-08-13", summary: "Summary", content: "Body", imageUrl: null, published: false });
    expect((await caller.content.publicHome()).posts).toHaveLength(0);
    expect((await caller.content.adminData()).posts[0]?.publishedAt).toBeInstanceOf(Date);
  });
});
