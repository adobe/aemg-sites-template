# Basic Site Template

This is the basic site template for Adobe Experience Manager as a Cloud Service (AEMaaCS).

<img src="previews/site.png?raw=true" alt="Basic site preview" width="50%">

It can serve as a most basic starting point for creating a new site, or as a staring point for creating custom site templates.

## Structure

* `files`: Folder with the UI kit XD file and possibly other files.
* `previews`: Folder with screenshots of the site template.
* `site`: Content package of the content that will be copied for each site created from this template (templates, pages, etc.).
* `theme`: Sources of the template theme to modify how the site looks (CSS, JS, etc.).

## Install on AEMaaCS

* Go to <https://github.com/adobe/aemg-sites-template/releases/latest> and download `aemg-docs-{version}.zip`
* Upload `aemg-docs-{version}.zip` in AEMaaCS's site creation wizard to create a new site from that template.

## Build locally

Alternatively you can build `aemg-docs-{version}.zip` locally.

1. Install Maven (to be able to use the packaging script).
2. Install node version 16.15.1.
1. Initialize the project with following command executed at the template root:

   ```bash
   npm install
   ```

1. To build the site template, run following command executed at the template root:

   ```bash
   npm run build
   ```

1. The site template ZIP file is now located below the template root: `aemg-docs-{version}.zip`.
1. Upload to an AEMaaCS site creation wizard. For installing on a local cloudready development instance use `npm run deploy`.

## Live Development (Local Sync)

Preview all changes — CSS, JS, and content XML — in real time against your local AEM instance without rebuilding or redeploying the full site template.

### Prerequisites

- A local AEM author instance running on `localhost:4502`
- A site already created from this template (e.g. a site named `245`)
- Node.js installed (v16+ recommended)

### Step 1: Install theme dependencies

```bash
cd theme
npm install
```

### Step 2: Configure the `.env` file

Create a `theme/.env` file (use `theme/env_template` as reference):

```
AEM_URL=http://localhost:4502/content/<your-site>/en.html
AEM_SITE=<your-site>
AEM_PROXY_PORT=7000
```

Replace `<your-site>` with the site name you used when creating the site from the template (e.g. `245`).

### Step 3: Start the theme live sync (CSS / JS)

From the `theme/` directory:

```bash
npm run live
```

This starts three processes in parallel:

| Process | What it does |
|---|---|
| `webpack --watch` | Watches `theme/src/` and rebuilds `dist/` on every CSS/JS/TS change |
| `aem-site-theme-builder live` | Proxies your AEM site on **port 7000**, replacing the deployed theme with your local `dist/css/theme.css` and `dist/js/theme.js` |
| `browser-sync` | Wraps port 7000 with auto-reload (typically on port 3000 or 3001) |

### Step 4: Start the content live sync (.content.xml)

The source content lives under `site/src/main/content/jcr_root/content/aemg-docs/...` but your site is at `/content/<your-site>/...`. The `sync-content.js` script watches for `.content.xml` changes, remaps the path from `aemg-docs` to your site name, and pushes the content to AEM automatically.

Open a **second terminal** at the project root and run:

```bash
node sync-content.js <your-site>
```

For example:

```bash
node sync-content.js 245
```

### Step 5: Open in browser

Navigate to **`http://localhost:7000/content/<your-site>/en.html`** and log in with your AEM credentials (`admin`/`admin` for local instances).

You can browse any page on your site through the proxy:
- `http://localhost:7000/content/<your-site>/en.html`
- `http://localhost:7000/content/<your-site>/en/docs.html`

### How changes appear

| What you changed | Where | How it shows up |
|---|---|---|
| CSS / JS / TS | `theme/src/` | Auto-rebuilds and browser reloads within seconds |
| Content XML | `site/src/main/content/jcr_root/` | Pushed to AEM within ~1 second; refresh the page to see changes |
| Templates / XF | `site/src/main/content/jcr_root/conf/` or `.../experience-fragments/` | Same as content XML — auto-pushed, refresh to see |

### Stopping the sync

- Press `Ctrl+C` in each terminal to stop the theme proxy and content sync.
- To stop all background processes: check for any lingering `webpack`, `browser-sync`, or `node sync-content` processes with `ps aux | grep -E "webpack|browser-sync|sync-content"` and kill them.

## Contributing

Contributions are welcomed! Read the [Contributing Guide](.github/CONTRIBUTING.md) for more information.

## Licensing

This project is licensed under the MIT License. See [LICENSE](LICENSE.md) for more information.
