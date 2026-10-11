// OMOOLA XPERIENCE - backend for completed jobs (images + videos).
// Files live on Cloudinary (handles big videos). The list of jobs lives in Netlify Blobs.
import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

export const config = { path: "/api/*" };

const CATEGORIES = ["Pinterest Frames", "Wall Collages", "Regular Photo Frames"];
const json = (d, s = 200, extra = {}) =>
  new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store", ...extra } });

const secret = () => process.env.ADMIN_PASSWORD || "";
const sign = (v) => crypto.createHmac("sha256", secret()).update(v).digest("hex");
const makeToken = () => { const exp = String(Date.now() + 7 * 864e5); return `${exp}.${sign(exp)}`; };
const safeEq = (a, b) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const authed = (req) => {
  const t = (req.headers.get("authorization") || "").replace("Bearer ", "");
  const [exp, sig] = t.split(".");
  return !!(secret() && exp && sig && Number(exp) > Date.now() && safeEq(sig, sign(exp)));
};
const clean = (s, n) => String(s || "").trim().slice(0, n);

export default async (req) => {
  const url = new URL(req.url);
  const route = url.pathname.replace(/^\/api\/?/, "").replace(/\/$/, "");
  const cloud = process.env.CLOUDINARY_CLOUD_NAME || "";
  const store = getStore("omoola");

  if (route === "config" && req.method === "GET")
    return json({ cloudName: cloud, uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || "" });

  if (route === "login" && req.method === "POST") {
    const { password } = await req.json().catch(() => ({}));
    await new Promise((r) => setTimeout(r, 600));
    if (secret() && typeof password === "string" && safeEq(password, secret())) return json({ token: makeToken() });
    return json({ error: "Wrong password" }, 401);
  }

  if (route === "session" && req.method === "GET") {
    if (!authed(req)) return json({ error: "Session expired" }, 401);
    return json({ ok: true });
  }

  if (route === "works") {
    const works = (await store.get("works", { type: "json" })) || [];

    if (req.method === "GET") return json(works, 200, { "cache-control": "public, max-age=60" });

    if (!authed(req)) return json({ error: "Please log in again" }, 401);

    if (req.method === "POST") {
      const b = await req.json().catch(() => ({}));
      const items = (Array.isArray(b.items) ? b.items : []).slice(0, 20).map((i) => ({
        type: i.type === "video" ? "video" : "image",
        url: String(i.url || ""),
      }));
      const prefix = `https://res.cloudinary.com/${cloud}/`;
      if (!clean(b.title, 120)) return json({ error: "Please add a title" }, 400);
      if (!items.length || items.some((i) => !i.url.startsWith(prefix))) return json({ error: "No valid files" }, 400);
      const work = {
        id: crypto.randomUUID(),
        title: clean(b.title, 120),
        category: CATEGORIES.includes(b.category) ? b.category : CATEGORIES[0],
        caption: clean(b.caption, 500),
        items,
        createdAt: new Date().toISOString(),
      };
      works.unshift(work);
      await store.setJSON("works", works);
      return json(work, 201);
    }

    if (req.method === "DELETE") {
      const id = url.searchParams.get("id");
      await store.setJSON("works", works.filter((w) => w.id !== id));
      return json({ ok: true });
    }
  }
  if (route === "products") {
    const products = (await store.get("products", { type: "json" })) || [];

    if (req.method === "GET") return json(products, 200, { "cache-control": "public, max-age=60" });

    if (!authed(req)) return json({ error: "Please log in again" }, 401);

    if (req.method === "POST") {
      const b = await req.json().catch(() => ({}));
      const prefix = `https://res.cloudinary.com/${cloud}/`;
      const name = clean(b.name, 120);
      if (!name) return json({ error: "Please add a product name" }, 400);
      const variants = (Array.isArray(b.variants) ? b.variants : []).slice(0, 12).map((v) => {
        const n = v.price === null || v.price === "" || v.price === undefined ? null : Number(v.price);
        return { size: clean(v.size, 40), price: n !== null && Number.isFinite(n) && n >= 0 && n <= 1e8 ? Math.round(n) : null };
      });
      if (!variants.length) return json({ error: "Add at least one size or price" }, 400);
      const items = (Array.isArray(b.items) ? b.items : []).slice(0, 8).map((i) => ({
        type: i.type === "video" ? "video" : "image",
        url: String(i.url || ""),
      }));
      if (items.some((i) => !i.url.startsWith(prefix))) return json({ error: "Invalid file" }, 400);
      const old = b.id ? products.find((x) => x.id === b.id) : null;
      const product = {
        id: old ? old.id : crypto.randomUUID(),
        name,
        category: CATEGORIES.includes(b.category) ? b.category : CATEGORIES[0],
        description: clean(b.description, 1500),
        badge: clean(b.badge, 20),
        inStock: b.inStock !== false,
        variants,
        items,
        createdAt: old ? old.createdAt : new Date().toISOString(),
      };
      if (old) products[products.indexOf(old)] = product; else products.unshift(product);
      await store.setJSON("products", products);
      return json(product, old ? 200 : 201);
    }

    if (req.method === "DELETE") {
      const id = url.searchParams.get("id");
      await store.setJSON("products", products.filter((x) => x.id !== id));
      return json({ ok: true });
    }
  }
  return json({ error: "Not found" }, 404);
};
