/*
Copyright 2022 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

// Stylesheets
import "./main.css";

// Javascript or Typescript
import "./**/*.js";
import "./**/*.ts";

declare const FlamebackWidget: { open(): void; close(): void; toggle(): void };

// Adobe Launch (Experience Platform Tags) – analytics & tag management
const launchScript = document.createElement('script');
launchScript.src = 'https://assets.adobedtm.com/d4d114c60e50/a0e989131fd5/launch-5dd5dd2177e6.min.js';
launchScript.async = true;
document.head.appendChild(launchScript);

// Flameback feedback widget
const flamebackScript = document.createElement('script');
flamebackScript.src = 'https://guidesai.adobe.io/widget/flameback-widget-loader.js?siteId=46b038a7-9878-4c69-ac4c-001e290cb88a';
flamebackScript.defer = true;
document.head.appendChild(flamebackScript);

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;

  if (target.closest('#askdoc-header-btn')) {
    FlamebackWidget.open();
    return;
  }

  const widgetRoot = document.getElementById('fb-widget-loader-root');
  if (!widgetRoot || widgetRoot.contains(target)) return;

  const iframe = widgetRoot.querySelector('iframe');
  if (iframe && iframe.style.display !== 'none') {
    FlamebackWidget.close();
  }
});
