# Important: translations

The starter newsletter now includes built-in translations for the seeded October 2026 issue, so the public language menu works immediately after deployment. Albanian, Arabic, Spanish, Fulani/Fulfulde, Bengali, Urdu, and Vietnamese are preloaded.

For future edits, automatic translation still requires `GOOGLE_TRANSLATE_API_KEY` in Netlify. The publish function will refuse to overwrite the working issue if the key is missing, so a failed publish cannot silently replace the translations with English. Fulani/Fulfulde varies by region, so have a fluent speaker review that version before treating it as authoritative.

# Bronxdale — Language in Action

A one-page multilingual family newsletter built for Netlify.

## What it does

- Public one-page newsletter with grade 9–12 sections
- Mobile-friendly layout
- Language dropdown
- Right-to-left layout for Arabic and Urdu
- Simple `/admin` editor
- Write the newsletter once in English
- On publish, selected translations are generated through Google Cloud Translation
- Published English + translations are stored in Netlify Blobs, so they persist across deploys
- Links can point to external resources or files placed in `public/assets/`

## 1. Deploy to Netlify

Push this folder to a GitHub repository and import it into Netlify, or deploy it with the Netlify CLI.

Netlify settings are already in `netlify.toml`:

- Publish directory: `public`
- Functions directory: `netlify/functions`

## 2. Add environment variables in Netlify

In your Netlify project settings, add:

- `ADMIN_PASSWORD` — choose a strong password for the editor
- `GOOGLE_TRANSLATE_API_KEY` — an API key for Google Cloud Translation Basic (v2)

Keep both values server-side. Do not paste them into the HTML or JavaScript files.

## 3. Enable Google Cloud Translation

Create or use a Google Cloud project, enable the Cloud Translation API, create an API key, and add it to Netlify as `GOOGLE_TRANSLATE_API_KEY`.

The site translates only when you publish, not every time a family visits the page. This minimizes translation requests and keeps the public page fast.

## 4. Edit the newsletter

Visit:

`https://YOUR-SITE.netlify.app/admin`

Enter your admin password, update the English copy, choose languages, and click **Publish & translate**.

The public newsletter is at the site root.

## 5. Add images and PDFs

Put files in:

`public/assets/`

Then use paths like:

- `/assets/grade9.jpg`
- `/assets/say-mean-matter.pdf`

in the admin editor.

If you give the project files and your images/resources back to ChatGPT, they can also be wired into the project for you.

## Languages included in the editor

English, Albanian, Arabic, Spanish, Fulani (Fulfulde), Bengali, Urdu, and Vietnamese.

You can add or remove languages in `public/admin.js` and `public/app.js`.

## Important translation note

Machine translation is useful for access but should not be treated as a perfect translation of specialized school terminology. For recurring terms such as “central idea,” “textual evidence,” or “claim,” consider keeping a school-approved glossary and reviewing the first translated issue in each language when possible.

## Privacy

This starter does not use analytics, collect family responses, or store visitor data. The only stored content is the newsletter itself in Netlify Blobs.

## Security scope

The editor uses a single password checked in a server-side Netlify Function. That is appropriate for a small internal publishing workflow, but it is not a full staff account/SSO system. If the site later needs multiple editors or individual staff accounts, replace this with an identity provider or school SSO.



## Current bundled issue
This package is preloaded with the October 2026 family update. Each grade section includes “What we’re learning,” a skill focus, a family conversation prompt, one skill resource, and the NYCPS multilingual-family resource. It also includes an Adult ESL family-resource spotlight with the October 2026 Bronx Adult Learning Center registration flyer.

Because the bundled English copy has changed from the earlier newsletter, the old preloaded translations have been removed rather than leaving outdated translated text on the site. After deploying this version, open `/admin` and click **Publish & translate** once to generate the selected language versions from the new copy.

The admin editor now includes separate fields for the three family-update blurbs and a reusable Family Resource Spotlight section, so future weekly updates and flyers can be changed without editing code.
