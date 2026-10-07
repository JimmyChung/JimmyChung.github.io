# 武陵觀星（Grok 版）原始碼

這是 Grok 做的「武陵觀星」，從 Grok 的工作區（TanStack Start）抽出星空 App 本身，
改成一般的 Vite + React 靜態網站，才能放在 GitHub Pages。
登入、資料庫等 Grok 平台功能本來就沒有啟用，所以沒有搬過來。

網址：https://jimmychung.github.io/wuling-grok/

## 重新建置

```sh
cd sources/wuling-grok
npm install
npm run build          # 產生 dist/（含離線用的 sw.js）
rm -rf ../../wuling-grok && cp -r dist ../../wuling-grok
```

- `src/components/sky-app.tsx`、`sky-view.tsx`、`src/lib/astro/*`：Grok 原本的程式，未修改
- `src/main.tsx`、`index.html`、`vite.config.ts`、`tools/write-sw.mjs`、`public/manifest.webmanifest`：為了靜態網站新增
