# Language in Action — Bronxdale family newsletter

This folder is a complete static website. It can be hosted free on GitHub Pages.

## Files
- `index.html` — page structure. You normally do **not** edit this.
- `styles.css` — visual design. You normally do **not** edit this.
- `app.js` — language switching and page rendering. You normally do **not** edit this.
- `content.js` — **this is the weekly content file**.
- `assets/` — images taken from the supplied newsletter PDF.

## Weekly update workflow
1. Update the English text in `content.js`.
2. Update the translated text in the same file before publishing.
3. Change each language's `week` line.
4. Commit the file to GitHub. GitHub Pages republishes the same website URL.

You do not spend Netlify build credits because this version is intended for GitHub Pages.

## Important translation note
The site stores translations directly so families see the intended language immediately. Changing English alone does **not** automatically rewrite the other languages. The translation step happens before you upload/commit the updated `content.js` file.

## GitHub Pages setup
1. Create a new public GitHub repository.
2. Upload every file and the `assets` folder from this package.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder, then Save.
6. GitHub will provide the public URL. Keep using that same URL each week.

## Languages included
English, French, Spanish, Arabic, Urdu, Vietnamese, Guyanese Creole, Albanian, Bengali.

Arabic and Urdu automatically use right-to-left page direction.

## Source links preserved from the original newsletter
The buttons retain the links embedded in the supplied PDF, including the reading texts, Say/Mean/Matter resource, SOAPSTone strategy, rhetoric resource, Obama speech, and Colorín Colorado family resource.
