# Site Theme

This is the theme of the basic site template for Adobe Experience Manager (AEM).

This theme can be modified to customize the visual appearance of sites created from the basic site template.

## Structure

* `src/main.ts`: This is the main entry point of your JS & CSS theme.
* `src/site`: Files that are generic to the entire site.
* `src/components`: Files that are specific to components.
* `src/resources`: Associated files, like icons, logos, fonts.

## Build

1. Initialize the project with following command executed at the theme root:

```
npm install
```

2. To compile the theme for production:

```
npm run build
```

## Live Preview (Local Development)

Preview CSS and JS changes in real time against a local AEM author instance without rebuilding or redeploying.

### 1. Configure `.env`

Create a `.env` file in this directory (see `env_template`):

```
AEM_URL=http://localhost:4502/content/<your-site>/en.html
AEM_SITE=<your-site>
AEM_PROXY_PORT=7000
```

Replace `<your-site>` with the site name created from the template on your AEM instance (e.g. `245`).

### 2. Start live preview

```
npm run live
```

This runs three processes in parallel:

| Process | What it does |
|---|---|
| `webpack --watch` | Watches `src/` and rebuilds `dist/` on changes |
| `aem-site-theme-builder live` | Proxies AEM on **port 7000**, injects local `dist/css/theme.css` and `dist/js/theme.js` |
| `browser-sync` | Wraps port 7000 with auto-reload (port 3000 or 3001) |

### 3. Open in browser

Navigate to `http://localhost:7000/content/<your-site>/en.html`. Log in with your AEM credentials when prompted (`admin`/`admin` for local instances).

Edit any file under `src/` — the browser reloads automatically within seconds.

### 4. Content sync (optional)

To also sync `.content.xml` changes from `site/` to your live AEM site, run this in a second terminal from the project root:

```
node sync-content.js <your-site>
```

See the [root README](../README.md#live-development-local-sync) for full details.

## Deployment

Once your work is completed, check your changes into GitHub and execute the deployment action on GitHub.
