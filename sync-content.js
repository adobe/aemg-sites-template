const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');
const os = require('os');

const SITE_NAME = process.argv[2];
if (!SITE_NAME) {
  console.error('Usage: node sync-content.js <site-name>');
  console.error('Example: node sync-content.js 245');
  process.exit(1);
}

const TEMPLATE_NAME = 'aemg-docs';
const AEM_HOST = 'localhost';
const AEM_PORT = 4502;
const AEM_AUTH = Buffer.from('admin:admin').toString('base64');
const JCR_ROOT = path.join(__dirname, 'site/src/main/content/jcr_root');
const DEBOUNCE_MS = 500;

let debounceTimer = null;
const pendingFiles = new Set();

console.log(`\nContent sync: ${TEMPLATE_NAME} → ${SITE_NAME}`);
console.log(`  Watching: ${JCR_ROOT}`);
console.log(`  Target:   http://${AEM_HOST}:${AEM_PORT}/content/${SITE_NAME}/...`);
console.log('  Waiting for changes...\n');

function watchRecursive(dir) {
  fs.watch(dir, { recursive: true }, (eventType, filename) => {
    if (!filename || !filename.endsWith('.xml')) return;
    if (filename.includes('.DS_Store') || filename.includes('target')) return;

    const fullPath = path.join(dir, filename);
    if (!fs.existsSync(fullPath)) return;

    pendingFiles.add(fullPath);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => syncPending(), DEBOUNCE_MS);
  });
}

function syncPending() {
  const files = [...pendingFiles];
  pendingFiles.clear();
  files.forEach(f => syncFile(f));
}

function buildPackage(jcrPath, xmlContent, tmpDir) {
  const jcrRoot = path.join(tmpDir, 'jcr_root');
  const metaInf = path.join(tmpDir, 'META-INF', 'vault');

  const contentDir = path.join(jcrRoot, jcrPath);
  fs.mkdirSync(contentDir, { recursive: true });
  fs.writeFileSync(path.join(contentDir, '.content.xml'), xmlContent);

  fs.mkdirSync(metaInf, { recursive: true });

  fs.writeFileSync(path.join(metaInf, 'filter.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<workspaceFilter version="1.0">
  <filter root="${jcrPath}"/>
</workspaceFilter>`);

  fs.writeFileSync(path.join(metaInf, 'properties.xml'),
`<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
  <entry key="name">content-sync</entry>
  <entry key="group">content-sync</entry>
  <entry key="version">1.0</entry>
  <entry key="packageType">content</entry>
</properties>`);

  const zipPath = path.join(tmpDir, 'package.zip');
  execSync(`cd "${tmpDir}" && zip -qr "${zipPath}" jcr_root/ META-INF/`);
  return zipPath;
}

function syncFile(filePath) {
  const relPath = path.relative(JCR_ROOT, filePath);

  const remappedRel = relPath.replace(
    `content/${TEMPLATE_NAME}`,
    `content/${SITE_NAME}`
  );
  const jcrPath = '/' + path.dirname(remappedRel);

  let xmlContent = fs.readFileSync(filePath, 'utf8');
  xmlContent = xmlContent.replace(
    new RegExp(`/conf/${TEMPLATE_NAME}/`, 'g'),
    `/conf/${SITE_NAME}/`
  );

  const now = new Date().toLocaleTimeString();
  console.log(`[${now}] Changed: ${relPath}`);
  console.log(`         Target:  ${jcrPath}`);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aem-sync-'));

  try {
    const zipPath = buildPackage(jcrPath, xmlContent, tmpDir);
    uploadAndInstall(zipPath, tmpDir);
  } catch (e) {
    console.error(`  -> ERROR: ${e.message}\n`);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

function uploadAndInstall(zipPath, tmpDir) {
  const zipData = fs.readFileSync(zipPath);
  const boundary = '----AEMSync' + Date.now();

  const parts = [
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="content-sync.zip"\r\nContent-Type: application/zip\r\n\r\n`,
    `\r\n--${boundary}\r\nContent-Disposition: form-data; name="name"\r\n\r\ncontent-sync`,
    `\r\n--${boundary}\r\nContent-Disposition: form-data; name="force"\r\n\r\ntrue`,
    `\r\n--${boundary}\r\nContent-Disposition: form-data; name="install"\r\n\r\ntrue`,
    `\r\n--${boundary}--\r\n`
  ];

  const body = Buffer.concat([
    Buffer.from(parts[0]),
    zipData,
    Buffer.from(parts.slice(1).join(''))
  ]);

  const req = http.request({
    hostname: AEM_HOST,
    port: AEM_PORT,
    path: '/crx/packmgr/service.jsp',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': body.length,
      'Authorization': `Basic ${AEM_AUTH}`
    }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        if (data.includes('PackageException') || data.includes('Error')) {
          console.error(`  -> FAILED: ${extractMessage(data)}\n`);
        } else {
          console.log(`  -> OK (synced to /content/${SITE_NAME}/...)\n`);
        }
      } else {
        console.error(`  -> FAILED (HTTP ${res.statusCode})\n`);
      }
      fs.rmSync(tmpDir, { recursive: true, force: true });
    });
  });

  req.on('error', (e) => {
    console.error(`  -> ERROR: ${e.message}\n`);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  req.write(body);
  req.end();
}

function extractMessage(xml) {
  const match = xml.match(/<msg>(.*?)<\/msg>/);
  return match ? match[1] : xml.substring(0, 200);
}

watchRecursive(JCR_ROOT);

process.on('SIGINT', () => {
  console.log('\nStopping content sync.');
  process.exit(0);
});
