/*
Copyright 2022 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  purge: {
    enabled: true,
    content: [
      '../site/src/main/content/jcr_root/conf/aemg-docs/settings/wcm/policies/core/wcm/components/**/.content.xml'
    ],
    css: ['./src/**/**/*.css'],
    options: {
      fontFace: true,
      keyframes: true,
    },
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
    fontFamily: {
      'sans': ['Adobe Clean']
    },
    screens: {
      ...defaultTheme.screens,
      'sm': '768px',
    }
  },
  variants: {
    extend: {},
  },
  plugins: [
    // require('@tailwindcss/typography'),
  ],
  corePlugins: {
    container: false,
  }
};
