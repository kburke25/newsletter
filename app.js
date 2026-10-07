const LANGUAGE_NAMES = {
  en: "English",
  sq: "Shqip",
  ar: "العربية",
  es: "Español",
  ff: "Fulani / Fulfulde",
  bn: "বাংলা",
  ur: "اردو",
  vi: "Tiếng Việt"
};
const RTL_LANGS = new Set(["ar", "ur", "fa", "he"]);

let newsletter;
let currentLang = "en";

async function loadContent() {
  const response = await fetch("./data/default-content.json", { cache: "no-store" });
  if (!response.ok) throw new Error("Could not load newsletter content");
  return response.json();
}

function translatedContent(data, lang) {
  if (lang === "en") return data.english || data;
  return data.translations?.[lang] || data.english || data;
}

function languageOptions(data) {
  const english = data.english || data;
  const enabled = english.languages || ["en"];
  const select = document.querySelector("#languageSelect");
  select.innerHTML = "";
  for (const code of enabled) {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = LANGUAGE_NAMES[code] || code;
    select.append(option);
  }
  const saved = localStorage.getItem("newsletter-language");
  if (saved && enabled.includes(saved)) currentLang = saved;
  select.value = currentLang;
}

function resolveLocalPath(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("mailto:") || url.startsWith("#")) return url;
  return url.replace(/^\//, "./");
}

function render(data, lang) {
  const c = translatedContent(data, lang);
  const base = data.english || data;
  document.documentElement.lang = lang;
  document.documentElement.dir = RTL_LANGS.has(lang) ? "rtl" : "ltr";

  setText("schoolName", c.schoolName || base.schoolName);
  setText("tagline", c.tagline || base.tagline);
  setText("issueLabel", c.issueLabel || base.issueLabel);
  setText("siteTitle", c.siteTitle || base.siteTitle);
  setText("subtitle", c.subtitle || base.subtitle);
  setText("intro", c.intro || base.intro);
  setText("translationNotice", c.translationNotice || base.translationNotice);
  setText("languageLabel", c.ui?.languageLabel || base.ui?.languageLabel || "Language");

  const container = document.querySelector("#sections");
  container.innerHTML = "";
  (c.sections || base.sections || []).forEach((section, i) => {
    const baseSection = (base.sections || [])[i] || {};
    const article = document.createElement("article");
    article.className = "grade-card";

    const media = document.createElement("div");
    media.className = "card-image";
    const imageUrl = resolveLocalPath(baseSection.image || section.image);
    if (imageUrl) {
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = section.imageAlt || baseSection.imageAlt || "";
      media.append(img);
    } else {
      media.classList.add("empty");
      media.setAttribute("aria-hidden", "true");
    }

    const body = document.createElement("div");
    body.className = "card-body";
    body.innerHTML = `
      <div class="eyebrow"></div>
      <h2 class="card-title"></h2>
      <div class="learning-blocks"></div>
      <div class="resource-links" aria-label="Resources"></div>
    `;
    body.querySelector(".eyebrow").textContent = section.eyebrow || baseSection.eyebrow || "";
    body.querySelector(".card-title").textContent = section.title || baseSection.title || "";

    const learningBlocks = body.querySelector(".learning-blocks");
    const structuredFields = [
      [c.ui?.whatLearningLabel || base.ui?.whatLearningLabel || "What we're learning", section.whatLearning || baseSection.whatLearning],
      [c.ui?.skillFocusLabel || base.ui?.skillFocusLabel || "Skill focus", section.skillFocus || baseSection.skillFocus],
      [c.ui?.talkAtHomeLabel || base.ui?.talkAtHomeLabel || "Talk about it at home", section.talkAtHome || baseSection.talkAtHome]
    ];
    structuredFields.forEach(([label, value]) => {
      if (!value) return;
      const block = document.createElement("div");
      block.className = "learning-block";
      const heading = document.createElement("h3");
      heading.textContent = label;
      const copy = document.createElement("p");
      copy.textContent = value;
      block.append(heading, copy);
      learningBlocks.append(block);
    });

    const linksEl = body.querySelector(".resource-links");
    (section.links || baseSection.links || []).forEach((link, li) => {
      const baseLink = (baseSection.links || [])[li] || {};
      const url = resolveLocalPath(baseLink.url || link.url || "");
      const label = link.label || baseLink.label || "Resource";
      if (!url) return;
      const a = document.createElement("a");
      a.href = url;
      a.textContent = label;
      if (/^https?:\/\//.test(url)) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      linksEl.append(a);
    });

    article.append(media, body);
    container.append(article);
  });

  const spotlight = c.familySpotlight || base.familySpotlight || {};
  const baseSpotlight = base.familySpotlight || {};
  const spotlightEl = document.querySelector("#familySpotlight");
  if (spotlight.heading || baseSpotlight.heading) {
    spotlightEl.hidden = false;
    setText("familySpotlightEyebrow", spotlight.eyebrow || baseSpotlight.eyebrow || "For Families");
    setText("familySpotlightHeading", spotlight.heading || baseSpotlight.heading || "");
    setText("familySpotlightBody", spotlight.body || baseSpotlight.body || "");
    const spotlightImage = document.querySelector("#familySpotlightImage");
    const spotlightImageUrl = resolveLocalPath(baseSpotlight.image || spotlight.image || "");
    spotlightImage.src = spotlightImageUrl;
    spotlightImage.alt = spotlight.imageAlt || baseSpotlight.imageAlt || "";
    spotlightImage.hidden = !spotlightImageUrl;
    const spotlightLink = document.querySelector("#familySpotlightLink");
    const spotlightLinkUrl = resolveLocalPath(baseSpotlight.linkUrl || spotlight.linkUrl || "");
    spotlightLink.textContent = spotlight.linkLabel || baseSpotlight.linkLabel || "View resource";
    spotlightLink.href = spotlightLinkUrl || "#";
    spotlightLink.hidden = !spotlightLinkUrl;
    if (/^https?:\/\//.test(spotlightLinkUrl)) {
      spotlightLink.target = "_blank";
      spotlightLink.rel = "noopener noreferrer";
    }
    const imageLink = document.querySelector(".family-spotlight-image-link");
    imageLink.href = spotlightLinkUrl || spotlightImageUrl || "#";
  } else {
    spotlightEl.hidden = true;
  }

  const contact = c.contact || base.contact || {};
  setText("contactHeading", contact.heading || "Questions?");
  setText("contactBody", contact.body || "");
  const email = base.contact?.email || "";
  const emailEl = document.querySelector("#contactEmail");
  if (email) {
    emailEl.hidden = false;
    emailEl.href = `mailto:${email}`;
    emailEl.textContent = email;
  } else {
    emailEl.hidden = true;
  }

  document.querySelector("#main").hidden = false;
  document.querySelector("#status").textContent = "";
}

function setText(id, value) {
  document.getElementById(id).textContent = value || "";
}

try {
  newsletter = await loadContent();
  languageOptions(newsletter);
  render(newsletter, currentLang);
} catch (error) {
  document.querySelector("#status").textContent = "The newsletter could not be loaded. Please refresh the page.";
  console.error(error);
}

document.querySelector("#languageSelect").addEventListener("change", (event) => {
  currentLang = event.target.value;
  localStorage.setItem("newsletter-language", currentLang);
  render(newsletter, currentLang);
});
