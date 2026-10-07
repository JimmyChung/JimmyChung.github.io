# JimmyChung.github.io — 作品總站

This repo is a GitHub Pages user site. Everything on `master` is published at
https://jimmychung.github.io/ automatically.

## Adding a new project
1. Put each project in its own folder: `<project-name>/` (lowercase, hyphens).
   It will be served at `https://jimmychung.github.io/<project-name>/`.
2. Keep it static (HTML/CSS/JS). If a build step is needed, commit the built
   output inside the folder; Pages here does not run a build. Keep the source
   that produces it in `sources/<project-name>/` with a README on how to rebuild
   (see `sources/wuling-grok/`).
3. Use relative paths only (`app.js`, not `/app.js`), since the site lives in a subfolder.
4. Add a card for the project to the root `index.html` (see the comment there).
5. Test locally (`python3 -m http.server`, then a headless browser screenshot at
   phone width) before pushing.

## Publishing
The user has asked that finished projects go live without extra steps. When the user's request says
to publish (e.g. 「做好後直接合併到 master 並發佈」), merge the work into `master`
and push, then give the user the final URL. Pages takes 1–2 minutes to update.

The user is Traditional Chinese speaking (Taiwan); write UI text and replies in 繁體中文.
