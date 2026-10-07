import { getStore } from "@netlify/blobs";

export default async () => {
  try {
    const store = getStore("language-in-action");
    const content = await store.get("current", { type: "json" });
    if (!content) {
      return Response.json({ error: "No published content" }, { status: 404 });
    }
    return Response.json(content, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    return Response.json({ error: "Content unavailable" }, { status: 500 });
  }
};

export const config = { path: "/.netlify/functions/content" };
