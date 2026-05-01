# Deployment Guide

gflow-assistant is a fully static Single Page Application (SPA). The production build produces a `dist/` folder that can be hosted on any static file server.

---

## Build

```bash
npm install
npm run build
```

The output is in `dist/`. There is no server-side code.

---

## Hosting options

### Netlify

1. Connect your repository to Netlify.
2. Set **Build command**: `npm run build`
3. Set **Publish directory**: `dist`
4. Add a `_redirects` file inside `public/` for SPA routing:

```
/*  /index.html  200
```

### Vercel

1. Connect your repository to Vercel.
2. Vercel auto-detects Vite — no extra configuration needed.
3. SPA routing is handled automatically.

### GitHub Pages

1. Build locally or via CI: `npm run build`
2. Push the `dist/` contents to the `gh-pages` branch (use `gh-pages` npm package or a GitHub Actions workflow).
3. Add a `404.html` that redirects to `index.html` for SPA routing:

```html
<!doctype html>
<meta charset="utf-8">
<script>sessionStorage.redirect = location.href;</script>
<meta http-equiv="refresh" content="0;URL='/'">
```

And in `index.html`, add a script at the top of `<body>` to restore the redirect:

```html
<script>
  (function(){var r=sessionStorage.redirect;delete sessionStorage.redirect;if(r&&r!==location.href)history.replaceState(null,null,r);})();
</script>
```

### S3 + CloudFront

1. Upload `dist/` to an S3 bucket with static website hosting enabled.
2. Set the **Error document** to `index.html` to support SPA routing.
3. Use a CloudFront distribution in front of S3.

---

## Environment variables

No environment variables are required by default. The app reads catalogue data from the static file `public/data/catalogue.json`.

If you need to override the catalogue URL at build time, you can add a Vite env variable:

```
# .env.production
VITE_CATALOGUE_URL=https://cdn.example.com/catalogue.json
```

Then update `BrowsePage.tsx` and other pages to use `import.meta.env.VITE_CATALOGUE_URL`.

---

## Static asset notes

- `public/data/catalogue.json` — Required. Contains the sound catalogue.
- `public/previews/` — Optional. Short audio preview clips referenced by `preview_path` in catalogue entries.
- `public/waveforms/` — Optional. Waveform images referenced by `waveform_path`.

Large audio and waveform files should be stored on a CDN and referenced via absolute URLs in the catalogue JSON rather than committed to the repository.

---

## CI/CD example (GitHub Actions)

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```
