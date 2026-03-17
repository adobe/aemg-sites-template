/*
Copyright 2022 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

/* ===== Search-in-header visibility ===== */
var setHeader = () => {
  var header = document.querySelector('.experiencefragment.header');
  if (!header) return;

  var mainSearchRow = document.querySelector('#search-row');

  if (mainSearchRow) {
    var headerHeight = header.getBoundingClientRect().height;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          header.classList.remove('header-search-active');
        } else {
          header.classList.add('header-search-active');
        }
      });
    }, { threshold: 0, rootMargin: '-' + headerHeight + 'px 0px 0px 0px' });
    observer.observe(mainSearchRow);
    return;
  }

  header.classList.add('header-search-active');
};

document.addEventListener('DOMContentLoaded', () => {

  /* ===== SVG icons ===== */

  // Hamburger menu icons
  const hamburgerCloseSvg = `<svg width="1.5rem" height="1.5rem" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
  </svg>`;

  const hamburgerOpenSvg = `<svg width="1.5rem" height="1.5rem" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
  </svg>`;

  // Dropdown chevron for "Adobe Coldfusion Family"
  const chevronDownSvg = `<svg class="header-chevron" width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-left:2px;">
    <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  // Right-side header icons
  const bellIconSvg = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_2053_37663)">
<mask id="mask0_2053_37663" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="6" y="6" width="20" height="20">
<path d="M23.7862 18.6758C23.6177 18.3672 23.4454 18.0684 23.2749 17.7734C22.4483 16.3389 21.7339 15.1006 21.7339 13.1533C21.7339 10.0342 19.1963 7.49609 16.0767 7.49609C12.9571 7.49609 10.4195 10.0342 10.4195 13.1533C10.4195 14.9199 9.66067 16.2022 8.85745 17.5586C8.63724 17.9307 8.41604 18.3047 8.20804 18.6895C7.83206 19.3857 7.85111 20.21 8.25882 20.8936C8.67093 21.584 9.39554 21.9961 10.1973 21.9961H13.2496C13.2496 23.5127 14.483 24.7461 15.9996 24.7461C17.5162 24.7461 18.7496 23.5127 18.7496 21.9961H21.8047C22.608 21.9961 23.3326 21.583 23.7437 20.8906C24.1514 20.2031 24.1675 19.375 23.7862 18.6758ZM15.9996 23.2461C15.3101 23.2461 14.7496 22.6855 14.7496 21.9961H17.2496C17.2496 22.6855 16.689 23.2461 15.9996 23.2461ZM22.4537 20.125C22.3872 20.2363 22.1914 20.4961 21.8047 20.4961H10.1973C9.92876 20.4961 9.68559 20.3574 9.54692 20.125C9.48247 20.0166 9.35161 19.7295 9.52837 19.4023C9.72661 19.0342 9.93804 18.6777 10.148 18.3232C11.0191 16.8525 11.9195 15.3311 11.9195 13.1533C11.9195 10.8994 13.8233 8.99609 16.0767 8.99609C18.3301 8.99609 20.2339 10.8994 20.2339 13.1533C20.2339 15.502 21.1192 17.0371 21.9756 18.5225C22.1402 18.8076 22.3062 19.0957 22.4693 19.3945C22.65 19.7256 22.5186 20.0156 22.4537 20.125Z" fill="#292929"/>
</mask>
<g mask="url(#mask0_2053_37663)">
<rect x="6" y="6" width="20" height="20" fill="#292929"/>
</g>
</g>
<defs>
<clipPath id="clip0_2053_37663">
<rect width="32" height="32" rx="8" fill="white"/>
</clipPath>
</defs>
</svg>
`;

  const gridIconSvg = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="mask0_2053_37674" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="6" y="6" width="20" height="20">
<path d="M10.75 8.25H9.25C8.69772 8.25 8.25 8.69772 8.25 9.25V10.75C8.25 11.3023 8.69772 11.75 9.25 11.75H10.75C11.3023 11.75 11.75 11.3023 11.75 10.75V9.25C11.75 8.69772 11.3023 8.25 10.75 8.25Z" fill="#292929"/>
<path d="M16.75 8.25H15.25C14.6977 8.25 14.25 8.69772 14.25 9.25V10.75C14.25 11.3023 14.6977 11.75 15.25 11.75H16.75C17.3023 11.75 17.75 11.3023 17.75 10.75V9.25C17.75 8.69772 17.3023 8.25 16.75 8.25Z" fill="#292929"/>
<path d="M22.75 8.25H21.25C20.6977 8.25 20.25 8.69772 20.25 9.25V10.75C20.25 11.3023 20.6977 11.75 21.25 11.75H22.75C23.3023 11.75 23.75 11.3023 23.75 10.75V9.25C23.75 8.69772 23.3023 8.25 22.75 8.25Z" fill="#292929"/>
<path d="M10.75 14.25H9.25C8.69772 14.25 8.25 14.6977 8.25 15.25V16.75C8.25 17.3023 8.69772 17.75 9.25 17.75H10.75C11.3023 17.75 11.75 17.3023 11.75 16.75V15.25C11.75 14.6977 11.3023 14.25 10.75 14.25Z" fill="#292929"/>
<path d="M16.75 14.25H15.25C14.6977 14.25 14.25 14.6977 14.25 15.25V16.75C14.25 17.3023 14.6977 17.75 15.25 17.75H16.75C17.3023 17.75 17.75 17.3023 17.75 16.75V15.25C17.75 14.6977 17.3023 14.25 16.75 14.25Z" fill="#292929"/>
<path d="M22.75 14.25H21.25C20.6977 14.25 20.25 14.6977 20.25 15.25V16.75C20.25 17.3023 20.6977 17.75 21.25 17.75H22.75C23.3023 17.75 23.75 17.3023 23.75 16.75V15.25C23.75 14.6977 23.3023 14.25 22.75 14.25Z" fill="#292929"/>
<path d="M10.75 20.25H9.25C8.69772 20.25 8.25 20.6977 8.25 21.25V22.75C8.25 23.3023 8.69772 23.75 9.25 23.75H10.75C11.3023 23.75 11.75 23.3023 11.75 22.75V21.25C11.75 20.6977 11.3023 20.25 10.75 20.25Z" fill="#292929"/>
<path d="M16.75 20.25H15.25C14.6977 20.25 14.25 20.6977 14.25 21.25V22.75C14.25 23.3023 14.6977 23.75 15.25 23.75H16.75C17.3023 23.75 17.75 23.3023 17.75 22.75V21.25C17.75 20.6977 17.3023 20.25 16.75 20.25Z" fill="#292929"/>
<path d="M22.75 20.25H21.25C20.6977 20.25 20.25 20.6977 20.25 21.25V22.75C20.25 23.3023 20.6977 23.75 21.25 23.75H22.75C23.3023 23.75 23.75 23.3023 23.75 22.75V21.25C23.75 20.6977 23.3023 20.25 22.75 20.25Z" fill="#292929"/>
</mask>
<g mask="url(#mask0_2053_37674)">
<rect x="6" y="6" width="20" height="20" fill="#292929"/>
</g>
</svg>
`;

  const avatarSvg = `<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect width="30" height="30" rx="15" fill="url(#pattern0_2053_37691)"/>
<defs>
<pattern id="pattern0_2053_37691" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_2053_37691" transform="scale(0.00833333)"/>
</pattern>
<image id="image0_2053_37691" width="120" height="120" preserveAspectRatio="none" xlink:href="data:image/png;base64,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"/>
</defs>
</svg>
`;

  /* ===== DOM references ===== */
  var header = document.querySelector('.experiencefragment.header');
  if (!header) return;

  const hamburgerButton = document.querySelector('#mobile-hamburger-button');
  const headerIcons = document.querySelector('#header-icons');

  /* ===== Inject hamburger icon ===== */
  if (hamburgerButton) {
    hamburgerButton.innerHTML = hamburgerOpenSvg;
  }

  /* ===== Inject right-side icons into #header-icons ===== */
  if (headerIcons) {
    headerIcons.innerHTML = bellIconSvg + gridIconSvg + avatarSvg;
  }

  /* ===== Desktop / Mobile toggle ===== */
  var toggleMenu = (isDesktop) => {
    if (isDesktop) {
      header.classList.add('desktop');
      header.classList.remove('mobile');
    } else {
      header.classList.remove('desktop');
      header.classList.add('mobile');
    }
  };

  /* ===== Hamburger click handler ===== */
  function openNavigation() {
    const isExpanded = header.getAttribute('data-expanded') === 'true';
    if (isExpanded) {
      header.setAttribute('data-expanded', 'false');
      if (hamburgerButton) hamburgerButton.innerHTML = hamburgerOpenSvg;
    } else {
      if (hamburgerButton) hamburgerButton.innerHTML = hamburgerCloseSvg;
      header.setAttribute('data-expanded', 'true');
    }
  }

  /* ===== Initialize responsive behavior ===== */
  const isDesktop = window.matchMedia('(min-width: 768px)');
  header.setAttribute('data-expanded', 'false');
  toggleMenu(isDesktop.matches);
  isDesktop.addEventListener('change', () => {
    toggleMenu(isDesktop.matches);
    // Close drawer on resize to desktop
    if (isDesktop.matches) {
      header.setAttribute('data-expanded', 'false');
      if (hamburgerButton) hamburgerButton.innerHTML = hamburgerOpenSvg;
    }
  });

  if (hamburgerButton) {
    hamburgerButton.addEventListener('click', () => openNavigation());
  }
});

setTimeout(function () { setHeader(); }, 1000);

/* ===== Search-button handlers ===== */
function triggerSearchFromButton(btn) {
  var parent = btn.closest('.cmp-container') || btn.closest('.cmp-askai__search-row') || btn.parentElement;
  if (!parent) return;

  var searchbar = parent.querySelector('.searchbar') || parent.querySelector('.cmp-askai__search-bar');
  var input = searchbar
    ? (searchbar.querySelector('.cmp-search-bar__input') || searchbar.querySelector('.cmp-askai__search-input'))
    : parent.querySelector('#askai-input');
  if (!input) return;

  var query = input.value.trim();
  if (!query) {
    input.focus();
    return;
  }

  var form = input.closest('form');
  if (form) {
    form.requestSubmit ? form.requestSubmit() : form.submit();
    return;
  }

  input.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true
  }));
}
