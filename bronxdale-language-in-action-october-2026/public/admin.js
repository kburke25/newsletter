const LANGUAGES = [
  ["en", "English"],
  ["sq", "Albanian / Shqip"],
  ["ar", "Arabic / العربية"],
  ["es", "Spanish / Español"],
  ["ff", "Fulani / Fulfulde"],
  ["bn", "Bengali / বাংলা"],
  ["ur", "Urdu / اردو"],
  ["vi", "Vietnamese / Tiếng Việt"]
];

const form = document.querySelector("#editorForm");
const message = document.querySelector("#adminMessage");
let model;

function setMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? "#9f1d20" : "#2c5b3f";
}

async function loadContent() {
  setMessage("Loading…");
  try {
    const fallback = await fetch("/data/default-content.json", { cache: "no-store" });
    const seeded = await fallback.json();
    const seededEnglish = seeded.english || seeded;

    const response = await fetch("/.netlify/functions/content", { cache: "no-store" });
    if (!response.ok) throw new Error();
    const published = await response.json();
    const publishedEnglish = published.english || published;

    model = structuredClone(
      seededEnglish.contentVersion && publishedEnglish.contentVersion !== seededEnglish.contentVersion
        ? seededEnglish
        : publishedEnglish
    );
  } catch {
    const fallback = await fetch("/data/default-content.json", { cache: "no-store" });
    const seeded = await fallback.json();
    model = structuredClone(seeded.english || seeded);
  }
  renderForm(model);
  setMessage("Ready.");
}

function renderForm(data) {
  const fields = ["schoolName", "issueLabel", "siteTitle", "subtitle", "tagline", "intro", "translationNotice"];
  for (const key of fields) form.elements[key].value = data[key] || "";
  form.elements.contactHeading.value = data.contact?.heading || "";
  form.elements.contactBody.value = data.contact?.body || "";
  form.elements.contactEmail.value = data.contact?.email || "";

  const checks = document.querySelector("#languageChecks");
  checks.innerHTML = "";
  for (const [code, labelText] of LANGUAGES) {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "languages";
    input.value = code;
    input.checked = code === "en" || (data.languages || []).includes(code);
    input.disabled = code === "en";
    label.append(input, document.createTextNode(labelText));
    checks.append(label);
  }

  const editors = document.querySelector("#sectionEditors");
  editors.innerHTML = "";
  (data.sections || []).forEach((section, index) => {
    const panel = document.createElement("section");
    panel.className = "admin-panel";
    panel.innerHTML = `
      <h2>${escapeHTML(section.eyebrow || `Section ${index + 1}`)}</h2>
      <div class="form-grid">
        <div class="field"><label>Grade / label<input data-section="${index}" data-key="eyebrow"></label></div>
        <div class="field"><label>Section title<input data-section="${index}" data-key="title"></label></div>
        <div class="field full"><label>What we're learning<textarea data-section="${index}" data-key="whatLearning"></textarea></label></div>
        <div class="field full"><label>Skill focus<textarea data-section="${index}" data-key="skillFocus"></textarea></label></div>
        <div class="field full"><label>Talk about it at home<textarea data-section="${index}" data-key="talkAtHome"></textarea></label></div>
        <div class="field full"><label>Legacy body (optional)<textarea data-section="${index}" data-key="body"></textarea></label></div>
        <div class="field"><label>Image URL or /assets/filename.jpg<input data-section="${index}" data-key="image"></label></div>
        <div class="field"><label>Image alt text<input data-section="${index}" data-key="imageAlt"></label></div>
        <div class="field full">
          <label>Resource links</label>
          <div class="section-links" data-links-for="${index}"></div>
        </div>
      </div>`;
    editors.append(panel);
    for (const key of ["eyebrow", "title", "whatLearning", "skillFocus", "talkAtHome", "body", "image", "imageAlt"]) {
      panel.querySelector(`[data-key="${key}"]`).value = section[key] || "";
    }
    const links = panel.querySelector(`[data-links-for="${index}"]`);
    const sectionLinks = section.links?.length ? section.links : [{label:"",url:""},{label:"",url:""},{label:"",url:""}];
    sectionLinks.forEach((link, li) => {
      const row = document.createElement("div");
      row.className = "link-row";
      row.innerHTML = `
        <input aria-label="Link ${li + 1} label" placeholder="Button label" data-section-link="${index}" data-link-index="${li}" data-link-key="label">
        <input aria-label="Link ${li + 1} URL" placeholder="https://… or /assets/file.pdf" data-section-link="${index}" data-link-index="${li}" data-link-key="url">`;
      row.querySelector('[data-link-key="label"]').value = link.label || "";
      row.querySelector('[data-link-key="url"]').value = link.url || "";
      links.append(row);
    });
  });

  const spotlight = data.familySpotlight || {};
  for (const key of ["eyebrow", "heading", "body", "image", "imageAlt", "linkLabel", "linkUrl"]) {
    const input = form.querySelector(`[name="familySpotlight_${key}"]`);
    if (input) input.value = spotlight[key] || "";
  }
}

function collectData() {
  const data = structuredClone(model);
  for (const key of ["schoolName", "issueLabel", "siteTitle", "subtitle", "tagline", "intro", "translationNotice"]) {
    data[key] = form.elements[key].value.trim();
  }
  data.languages = ["en", ...[...document.querySelectorAll('input[name="languages"]:checked')]
    .map(x => x.value)
    .filter(code => code !== "en")];

  document.querySelectorAll("[data-section][data-key]").forEach((input) => {
    data.sections[Number(input.dataset.section)][input.dataset.key] = input.value.trim();
  });
  document.querySelectorAll("[data-section-link]").forEach((input) => {
    const s = Number(input.dataset.sectionLink);
    const li = Number(input.dataset.linkIndex);
    data.sections[s].links ||= [];
    data.sections[s].links[li] ||= { label: "", url: "" };
    data.sections[s].links[li][input.dataset.linkKey] = input.value.trim();
  });
  data.sections.forEach(section => {
    section.links = (section.links || []).filter(link => link.label || link.url);
  });

  data.familySpotlight = {
    eyebrow: form.elements.familySpotlight_eyebrow?.value.trim() || "",
    heading: form.elements.familySpotlight_heading?.value.trim() || "",
    body: form.elements.familySpotlight_body?.value.trim() || "",
    image: form.elements.familySpotlight_image?.value.trim() || "",
    imageAlt: form.elements.familySpotlight_imageAlt?.value.trim() || "",
    linkLabel: form.elements.familySpotlight_linkLabel?.value.trim() || "",
    linkUrl: form.elements.familySpotlight_linkUrl?.value.trim() || ""
  };

  data.contact = {
    heading: form.elements.contactHeading.value.trim(),
    body: form.elements.contactBody.value.trim(),
    email: form.elements.contactEmail.value.trim()
  };
  return data;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = document.querySelector("#adminPassword").value;
  if (!password) return setMessage("Enter the admin password first.", true);

  const payload = collectData();
  setMessage("Publishing and translating… this can take a few seconds.");
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;

  try {
    const response = await fetch("/.netlify/functions/publish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${password}`
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Publish failed");
    model = payload;
    const translated = (result.translatedLanguages || []).join(", ") || "English only";
    setMessage(`Published. Translations saved for: ${translated}.`);
  } catch (error) {
    setMessage(error.message || "Publish failed.", true);
  } finally {
    submit.disabled = false;
  }
});

document.querySelector("#reloadButton").addEventListener("click", loadContent);

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
}

await loadContent();
