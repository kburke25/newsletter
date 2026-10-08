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

const newsletter = window.NEWSLETTER;
let currentLang = localStorage.getItem("newsletter-language") || "en";

function translatedContent(data, lang) {
  if (lang === "en") return data.english || data;
  return data.translations?.[lang] || data.english || data;
}

function setText(id, value) {
  document.getElementById(id).textContent = value || "";
}

function resolveLocalPath(url) {
  if (!url) return "";
  if (/^(https?:\/\/|mailto:|sms:|tel:|#)/i.test(url)) return url;
  return "./" + url.replace(/^\.\//, "").replace(/^\//, "");
}

function languageOptions(data) {
  const english = data.english || data;
  const enabled = english.languages || ["en"];
  if (!enabled.includes(currentLang)) currentLang = "en";
  const select = document.getElementById("languageSelect");
  select.innerHTML = "";
  enabled.forEach(code => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = LANGUAGE_NAMES[code] || code;
    select.append(option);
  });
  select.value = currentLang;
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

  const container = document.getElementById("sections");
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

    const fields = [
      [c.ui?.whatLearningLabel || base.ui?.whatLearningLabel || "What we're learning", section.whatLearning || baseSection.whatLearning],
      [c.ui?.skillFocusLabel || base.ui?.skillFocusLabel || "Skill focus", section.skillFocus || baseSection.skillFocus],
      [c.ui?.talkAtHomeLabel || base.ui?.talkAtHomeLabel || "Talk about it at home", section.talkAtHome || baseSection.talkAtHome]
    ];
    const blocks = body.querySelector(".learning-blocks");
    fields.forEach(([label, value]) => {
      if (!value) return;
      const block = document.createElement("div");
      block.className = "learning-block";
      const h = document.createElement("h3");
      h.textContent = label;
      const p = document.createElement("p");
      p.textContent = value;
      block.append(h, p);
      blocks.append(block);
    });

    const links = body.querySelector(".resource-links");
    (section.links || baseSection.links || []).forEach((link, li) => {
      const baseLink = (baseSection.links || [])[li] || {};
      const href = resolveLocalPath(baseLink.url || link.url || "");
      if (!href) return;
      const a = document.createElement("a");
      a.href = href;
      a.textContent = link.label || baseLink.label || "Resource";
      if (/^https?:\/\//i.test(href)) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      links.append(a);
    });

    article.append(media, body);
    container.append(article);
  });

  const spotlight = c.familySpotlight || base.familySpotlight || {};
  const baseSpotlight = base.familySpotlight || {};
  const spotlightEl = document.getElementById("familySpotlight");
  if (spotlight.heading || baseSpotlight.heading) {
    spotlightEl.hidden = false;
    setText("familySpotlightEyebrow", spotlight.eyebrow || baseSpotlight.eyebrow || "For Families");
    setText("familySpotlightHeading", spotlight.heading || baseSpotlight.heading || "");
    setText("familySpotlightBody", spotlight.body || baseSpotlight.body || "");

    const flyerSrc = resolveLocalPath(baseSpotlight.image || spotlight.image || "");
    const flyerImage = document.getElementById("familySpotlightImage");
    flyerImage.src = flyerSrc;
    flyerImage.alt = spotlight.imageAlt || baseSpotlight.imageAlt || "";
    flyerImage.hidden = !flyerSrc;

    const flyerButton = document.getElementById("familySpotlightLink");
    flyerButton.textContent = spotlight.linkLabel || baseSpotlight.linkLabel || "Open Registration Flyer";
    flyerButton.hidden = !flyerSrc;
    flyerButton.dataset.flyerImage = flyerSrc;
    document.getElementById("familySpotlightImageButton").dataset.flyerImage = flyerSrc;
  } else {
    spotlightEl.hidden = true;
  }

  const contact = c.contact || base.contact || {};
  setText("contactHeading", contact.heading || "Questions?");
  setText("contactBody", contact.body || "");

  const email = base.contact?.email || "kburke25@schools.nyc.gov";
  const phone = base.contact?.phone || "347-640-3806";
  const emailEl = document.getElementById("contactEmail");
  emailEl.hidden = false;
  emailEl.href = `mailto:${email}`;
  emailEl.textContent = `✉ ${email}`;
  const phoneEl = document.getElementById("contactPhone");
  phoneEl.hidden = false;
  phoneEl.href = `sms:+1${phone.replace(/\D/g, "")}`;
  phoneEl.textContent = `💬 ${phone}`;
}

function openFlyer(source) {
  if (!source) return;
  const modal = document.getElementById("flyerModal");
  document.getElementById("flyerModalImage").src = source;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  document.getElementById("flyerModalClose").focus();
}

function closeFlyer() {
  const modal = document.getElementById("flyerModal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

if (!newsletter) {
  document.getElementById("main").innerHTML = "<p>Newsletter content could not be loaded.</p>";
} else {
  languageOptions(newsletter);
  render(newsletter, currentLang);
}

document.getElementById("languageSelect").addEventListener("change", event => {
  currentLang = event.target.value;
  localStorage.setItem("newsletter-language", currentLang);
  render(newsletter, currentLang);
});

document.getElementById("familySpotlightLink").addEventListener("click", event => openFlyer(event.currentTarget.dataset.flyerImage));
document.getElementById("familySpotlightImageButton").addEventListener("click", event => openFlyer(event.currentTarget.dataset.flyerImage));
document.getElementById("flyerModalClose").addEventListener("click", closeFlyer);
document.getElementById("flyerModal").addEventListener("click", event => {
  if (event.target.id === "flyerModal") closeFlyer();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeFlyer();
});
