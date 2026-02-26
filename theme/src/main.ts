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

// Flameback feedback widget
const flamebackScript = document.createElement('script');
flamebackScript.src = 'https://flameback.adobe.io/widget/flameback-widget-loader.js?siteId=46b038a7-9878-4c69-ac4c-001e290cb88a';
flamebackScript.defer = true;
document.head.appendChild(flamebackScript);
