/*
Copyright 2022 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/
// postcss.config.js
const generateGrid = require('./src/mixins/grid');

module.exports = {
  plugins: {
    'postcss-easy-import': {
      prefix: '_'
    },
    'postcss-nested': {},
    'postcss-mixins': {
      mixins: {
        'generate-grid': generateGrid,
      }
    },
    'postcss-at-rules-variables': {},
    tailwindcss: {},
    autoprefixer: {},
    cssnano: {
      preset: 'default',
      // autoprefixer: false,
      // cssDeclarationSorter: false,
      // rawCache:false,
      // calc: false,
      // colormin: false,
      // convertValues: false,
      // discardComments: false,
      // discardDuplicates: false,
      // discardEmpty: false,
      // discardOverridden: false,
      // discardUnused: false,
      // mergeIdents: false,
      // mergeLonghand: false,
      // mergeRules: false,
      // minifyFontValues: false,
      // minifyGradients: false,
      // minifyParams: false,
      // minifySelectors: false,
      // normalizeCharset: false,
      // normalizeDisplayValues: false,
      // normalizePositions: false,
      // normalizeRepeatStyle: false,
      // normalizeString: false,
      // normalizeTimingFunctions: false,
      // normalizeUnicode: false,
      // normalizeUrl: false,
      // normalizeWhitespace: false,
      // orderedValues: false,
      // reduceIdents: false,
      // reduceInitial: false,
      // reduceTransforms: false,
      // svgo: false,
      // uniqueSelectors: false,
      // zindex:false 
    }
  }
};