import { getStore } from "@netlify/blobs";

const NON_TRANSLATED_KEYS = new Set(["id", "image", "url", "email", "contentVersion"]);

export default async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) {
    return Response.json({ error: "ADMIN_PASSWORD is not configured in Netlify." }, { status: 500 });
  }
  const auth = req.headers.get("authorization") || "";
  const supplied = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!safeEqual(supplied, expectedPassword)) {
    return Response.json({ error: "Incorrect admin password." }, { status: 401 });
  }

  let english;
  try {
    english = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!english?.siteTitle || !Array.isArray(english?.sections)) {
    return Response.json({ error: "Newsletter content is incomplete." }, { status: 400 });
  }

  const requestedLanguages = [...new Set(english.languages || ["en"])].filter(Boolean);
  if (!requestedLanguages.includes("en")) requestedLanguages.unshift("en");
  english.languages = requestedLanguages;

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  const targetLanguages = requestedLanguages.filter(code => code !== "en");
  const translations = {};
  const translatedLanguages = [];
  const warnings = [];

  if (targetLanguages.length && !apiKey) {
    return Response.json({ error: "GOOGLE_TRANSLATE_API_KEY is not configured. Nothing was published, so the existing translations were kept." }, { status: 500 });
  } else {
    const outcomes = await Promise.allSettled(
      targetLanguages.map(async (lang) => [lang, await translateObject(english, lang, apiKey)])
    );
    for (const outcome of outcomes) {
      if (outcome.status === "fulfilled") {
        const [lang, translated] = outcome.value;
        translations[lang] = translated;
        translatedLanguages.push(lang);
      } else {
        warnings.push(outcome.reason?.message || "A translation failed.");
      }
    }
  }

  const payload = {
    english,
    translations,
    publishedAt: new Date().toISOString()
  };

  try {
    const store = getStore("language-in-action");
    await store.setJSON("current", payload);
  } catch (error) {
    return Response.json({ error: "Could not save the newsletter to Netlify Blobs." }, { status: 500 });
  }

  return Response.json({ ok: true, translatedLanguages, warnings });
};

async function translateObject(source, target, apiKey) {
  const clone = structuredClone(source);
  clone.languages = source.languages;

  const paths = [];
  const strings = [];
  collectStrings(source, [], paths, strings);
  if (!strings.length) return clone;

  const translated = await googleTranslate(strings, target, apiKey);
  translated.forEach((value, index) => setAtPath(clone, paths[index], value));
  return clone;
}

function collectStrings(value, path, paths, strings) {
  if (typeof value === "string") {
    const key = String(path.at(-1) ?? "");
    if (!value.trim() || NON_TRANSLATED_KEYS.has(key)) return;
    paths.push(path);
    strings.push(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectStrings(item, [...path, index], paths, strings));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, item]) => {
      if (key === "languages") return;
      collectStrings(item, [...path, key], paths, strings);
    });
  }
}

function setAtPath(root, path, value) {
  let cursor = root;
  for (let i = 0; i < path.length - 1; i++) cursor = cursor[path[i]];
  cursor[path.at(-1)] = value;
}

async function googleTranslate(strings, target, apiKey) {
  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: strings,
      source: "en",
      target,
      format: "text"
    })
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = body?.error?.message || `Google Translation failed for ${target}.`;
    throw new Error(detail);
  }
  const results = body?.data?.translations || [];
  if (results.length !== strings.length) {
    throw new Error(`Translation response for ${target} was incomplete.`);
  }
  return results.map(item => decodeEntities(item.translatedText || ""));
}

function decodeEntities(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export const config = { path: "/.netlify/functions/publish" };
