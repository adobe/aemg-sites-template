/*
 * Adobe Analytics – Data Layer Enrichment
 *
 * Populates window.adobeDataLayer (Adobe Client Data Layer) with the
 * props, eVars, and page-level dimensions defined in the Global Production
 * analytics SDR for helpx / ColdFusion documentation.
 *
 * The AEM Core Components Data Layer (already enabled via Sling CA-config)
 * pushes base page metadata; this module adds ColdFusion-specific context
 * that Adobe Launch rules map to the final AppMeasurement variables.
 *
 * Mapping reference (SDR → data layer key):
 *   Page Name            → cfPage.pageName
 *   prop1  Page Type     → cfPage.pageType
 *   prop2  Product       → cfPage.product
 *   prop3  Subdomain     → cfPage.subdomain
 *   prop4  Language       → cfPage.language
 *   prop5  Name Granular  → cfPage.pageNameGranular
 *   prop12 Previous Page  → cfPage.previousPage
 *   prop13 % Page Viewed  → (pushed on unload via cf-page-unload event)
 *   prop31 Lang/Loc       → cfPage.language        (same value)
 *   prop32 Lang/Loc Gran. → cfPage.pageNameGranular (same value)
 *   prop44 Tags & Date    → cfPage.contentMeta
 *   eVar16 Prev Page      → D=c12 (set in Launch, mirrors prop12)
 *   eVar28 Page URL       → cfPage.pageURL
 *   eVar83 Product        → cfPage.product          (same value)
 */

const STORAGE_KEY = 'cf_analytics_prev_page';
var CF_DL_LOG = '[CF Analytics]';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip AEM internal prefixes and .html to get a clean page path. */
function getPagePath(): string {
  var path = window.location.pathname;
  path = path.replace(/^\/content\/aemg-docs/, '');
  path = path.replace(/^\/editor\.html/, '');
  path = path.replace(/\.html$/, '');
  path = path.replace(/^\//, '');
  return path || 'home';
}

/** Resolve language from <html lang> or the first URL segment. */
function getLanguage(): string {
  var lang = document.documentElement.lang;
  if (lang) return lang.toLowerCase().replace('-', '_');
  var first = getPagePath().split('/')[0];
  return first || 'en';
}

/** Read product from <meta name="product"> or fall back to ColdFusion. */
function getProduct(): string {
  var meta = document.querySelector('meta[name="product"]') as HTMLMetaElement;
  return (meta && meta.content) ? meta.content : 'ColdFusion';
}

/**
 * Attempt to read the page component resource-type from the Core Components
 * data-layer attribute rendered on <body>.
 */
function getPageType(): string {
  var attr = document.body.getAttribute('data-cmp-data-layer');
  if (!attr) return '';
  try {
    var data = JSON.parse(attr);
    var key = Object.keys(data)[0];
    return key ? (data[key]['@type'] || '') : '';
  } catch (_e) {
    return '';
  }
}

/**
 * Read content tags & publish date from the Core Components data layer
 * attribute (maps to prop44).
 */
function getContentMeta(): string {
  var attr = document.body.getAttribute('data-cmp-data-layer');
  if (!attr) return '';
  try {
    var data = JSON.parse(attr);
    var key = Object.keys(data)[0];
    if (!key) return '';
    var tags = data[key]['cq:tags'] || null;
    var modified = data[key]['repo:modifyDate'] || null;
    var parts: string[] = [];
    parts.push(tags ? (Array.isArray(tags) ? tags.join(',') : tags) : 'null');
    parts.push(modified || 'null');
    parts.push(data[key]['@type'] || 'null');
    return parts.join('|');
  } catch (_e) {
    return '';
  }
}

// ---------------------------------------------------------------------------
// Scroll-depth tracking (prop13 – percentage page viewed)
// ---------------------------------------------------------------------------

function initScrollTracking(): void {
  var maxScroll = 0;

  var onScroll = function () {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) { maxScroll = 100; return; }
    var pct = Math.round((scrollTop / docHeight) * 100);
    if (pct > maxScroll) maxScroll = pct;
  };

  window.addEventListener('scroll', onScroll, { passive: true } as any);

  window.addEventListener('beforeunload', function () {
    (window as any).adobeDataLayer = (window as any).adobeDataLayer || [];
    (window as any).adobeDataLayer.push({
      event: 'cf-page-unload',
      cfScroll: { percentViewed: maxScroll }
    });
    console.log(CF_DL_LOG + ' cf-page-unload  |  scroll depth: ' + maxScroll + '%');
  });
}

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

function initPageAnalytics(): void {
  (window as any).adobeDataLayer = (window as any).adobeDataLayer || [];

  var hostname = window.location.hostname;
  var pagePath = getPagePath();
  var language = getLanguage();
  var pageName = hostname + ':' + pagePath;

  var previousPage = '';
  try { previousPage = sessionStorage.getItem(STORAGE_KEY) || ''; } catch (_e) { /* private mode */ }

  var pageData = {
    pageName:         pageName,
    pageType:         getPageType(),
    product:          getProduct(),
    subdomain:        hostname,
    language:         language,
    pageNameGranular: language + ':' + pagePath + ':' + hostname,
    pageURL:          window.location.href,
    previousPage:     previousPage,
    contentMeta:      getContentMeta()
  };

  (window as any).adobeDataLayer.push({
    event: 'cf-page-loaded',
    cfPage: pageData
  });

  console.groupCollapsed(CF_DL_LOG + ' cf-page-loaded');
  console.table(pageData);
  console.groupEnd();

  try { sessionStorage.setItem(STORAGE_KEY, pageName); } catch (_e) { /* private mode */ }

  initScrollTracking();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPageAnalytics);
} else {
  initPageAnalytics();
}
