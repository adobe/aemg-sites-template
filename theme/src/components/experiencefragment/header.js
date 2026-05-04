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

  // Language switcher configuration — add/remove languages here
  const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'ja', label: 'Japenese' },
  ];

  const globeIconSvg = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="mask0_lang_globe" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
<path d="M10 1.25195C5.1748 1.25195 1.25 5.17676 1.25 10.002C1.25 14.8271 5.1748 18.752 10 18.752C14.8252 18.752 18.75 14.8272 18.75 10.002C18.75 5.17675 14.8252 1.25195 10 1.25195ZM17.2109 9.25195H14.0688C13.9294 6.92163 13.1543 4.72558 11.8772 3.00708C14.7327 3.77441 16.8999 6.23828 17.2109 9.25195ZM10.0125 16.8833C8.52295 15.3462 7.5935 13.1384 7.43042 10.752H12.5696C12.4082 13.1401 11.4885 15.3452 10.0125 16.8833ZM7.43066 9.25195C7.5935 6.8645 8.52246 4.65796 10.012 3.12011C11.4888 4.65771 12.4082 6.86303 12.5696 9.25195H7.43066ZM8.14624 3.00098C6.85645 4.72119 6.07227 6.92017 5.93115 9.25196H2.78906C3.10083 6.22999 5.27929 3.76124 8.14624 3.00098ZM2.78906 10.752H5.93115C6.07226 13.0828 6.85742 15.2822 8.14721 17.0029C5.27953 16.2432 3.10107 13.7742 2.78906 10.752ZM11.8767 16.9968C13.154 15.2776 13.9294 13.0816 14.0691 10.752H17.2109C16.8999 13.7659 14.7324 16.2297 11.8767 16.9968Z" fill="#292929"/>
</mask>
<g mask="url(#mask0_lang_globe)">
<rect width="20" height="20" fill="currentColor"/>
</g>
</svg>`;

  function detectCurrentLang() {
    var pathname = window.location.pathname;
    var codes = LANGUAGES.map(function(l) { return l.code; });
    for (var i = 0; i < codes.length; i++) {
      var c = codes[i];
      if (pathname.match(new RegExp('/' + c + '(/|\\.|$)'))) {
        return c;
      }
    }
    return 'en';
  }

  function buildLangUrl(targetCode) {
    var pathname = window.location.pathname;
    var search = window.location.search;
    var hash = window.location.hash;
    var currentCode = detectCurrentLang();
    if (currentCode === targetCode) return null;

    var newPath = pathname.replace(
      new RegExp('/' + currentCode + '(/|\\.|$)'),
      '/' + targetCode + '$1'
    );
    return newPath + search + hash;
  }

  function buildLangSwitcherHtml() {
    var currentCode = detectCurrentLang();
    var options = LANGUAGES.map(function(lang) {
      var activeClass = lang.code === currentCode ? ' lang-option--active' : '';
      return '<button class="lang-option' + activeClass + '" data-lang="' + lang.code + '">' + lang.label + '</button>';
    }).join('');
    return '<div id="lang-switcher">' +
      '<button id="lang-switcher-btn" class="header-icon" aria-label="Switch language" aria-expanded="false">' + globeIconSvg + '</button>' +
      '<div id="lang-dropdown" class="lang-dropdown">' + options + '</div>' +
    '</div>';
  }

//   const gridIconSvg = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
// <mask id="mask0_2053_37674" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="6" y="6" width="20" height="20">
// <path d="M10.75 8.25H9.25C8.69772 8.25 8.25 8.69772 8.25 9.25V10.75C8.25 11.3023 8.69772 11.75 9.25 11.75H10.75C11.3023 11.75 11.75 11.3023 11.75 10.75V9.25C11.75 8.69772 11.3023 8.25 10.75 8.25Z" fill="#292929"/>
// <path d="M16.75 8.25H15.25C14.6977 8.25 14.25 8.69772 14.25 9.25V10.75C14.25 11.3023 14.6977 11.75 15.25 11.75H16.75C17.3023 11.75 17.75 11.3023 17.75 10.75V9.25C17.75 8.69772 17.3023 8.25 16.75 8.25Z" fill="#292929"/>
// <path d="M22.75 8.25H21.25C20.6977 8.25 20.25 8.69772 20.25 9.25V10.75C20.25 11.3023 20.6977 11.75 21.25 11.75H22.75C23.3023 11.75 23.75 11.3023 23.75 10.75V9.25C23.75 8.69772 23.3023 8.25 22.75 8.25Z" fill="#292929"/>
// <path d="M10.75 14.25H9.25C8.69772 14.25 8.25 14.6977 8.25 15.25V16.75C8.25 17.3023 8.69772 17.75 9.25 17.75H10.75C11.3023 17.75 11.75 17.3023 11.75 16.75V15.25C11.75 14.6977 11.3023 14.25 10.75 14.25Z" fill="#292929"/>
// <path d="M16.75 14.25H15.25C14.6977 14.25 14.25 14.6977 14.25 15.25V16.75C14.25 17.3023 14.6977 17.75 15.25 17.75H16.75C17.3023 17.75 17.75 17.3023 17.75 16.75V15.25C17.75 14.6977 17.3023 14.25 16.75 14.25Z" fill="#292929"/>
// <path d="M22.75 14.25H21.25C20.6977 14.25 20.25 14.6977 20.25 15.25V16.75C20.25 17.3023 20.6977 17.75 21.25 17.75H22.75C23.3023 17.75 23.75 17.3023 23.75 16.75V15.25C23.75 14.6977 23.3023 14.25 22.75 14.25Z" fill="#292929"/>
// <path d="M10.75 20.25H9.25C8.69772 20.25 8.25 20.6977 8.25 21.25V22.75C8.25 23.3023 8.69772 23.75 9.25 23.75H10.75C11.3023 23.75 11.75 23.3023 11.75 22.75V21.25C11.75 20.6977 11.3023 20.25 10.75 20.25Z" fill="#292929"/>
// <path d="M16.75 20.25H15.25C14.6977 20.25 14.25 20.6977 14.25 21.25V22.75C14.25 23.3023 14.6977 23.75 15.25 23.75H16.75C17.3023 23.75 17.75 23.3023 17.75 22.75V21.25C17.75 20.6977 17.3023 20.25 16.75 20.25Z" fill="#292929"/>
// <path d="M22.75 20.25H21.25C20.6977 20.25 20.25 20.6977 20.25 21.25V22.75C20.25 23.3023 20.6977 23.75 21.25 23.75H22.75C23.3023 23.75 23.75 23.3023 23.75 22.75V21.25C23.75 20.6977 23.3023 20.25 22.75 20.25Z" fill="#292929"/>
// </mask>
// <g mask="url(#mask0_2053_37674)">
// <rect x="6" y="6" width="20" height="20" fill="#292929"/>
// </g>
// </svg>
// `;

//   const avatarSvg = `<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
// <rect width="30" height="30" rx="15" fill="url(#pattern0_2053_37691)"/>
// <defs>
// <pattern id="pattern0_2053_37691" patternContentUnits="objectBoundingBox" width="1" height="1">
// <use xlink:href="#image0_2053_37691" transform="scale(0.00833333)"/>
// </pattern>
// <image id="image0_2053_37691" width="120" height="120" preserveAspectRatio="none" xlink:href="data:image/png;base64,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"/>
// </defs>
// </svg>
// `;

  /* ===== DOM references ===== */
  var header = document.querySelector('.experiencefragment.header');
  if (!header) return;

  const hamburgerButton = document.querySelector('#mobile-hamburger-button');
  const headerIcons = document.querySelector('#header-icons');

  /* ===== Inject hamburger icon ===== */
  if (hamburgerButton) {
    hamburgerButton.innerHTML = hamburgerOpenSvg;
  }

  /* ===== Make Adobe logo clickable ===== */
  const adobeLogo = document.querySelector('#adobe-logo');
  if (adobeLogo) {
    adobeLogo.style.cursor = 'pointer';
    adobeLogo.setAttribute('role', 'link');
    adobeLogo.setAttribute('aria-label', 'Adobe');
    adobeLogo.addEventListener('click', function () {
      window.open('https://www.adobe.com/', '_blank', 'noopener');
    });
  }

  /* ===== Inject right-side icons into #header-icons ===== */
  if (headerIcons) {
    headerIcons.innerHTML = buildLangSwitcherHtml();

    var langBtn = document.querySelector('#lang-switcher-btn');
    var langDropdown = document.querySelector('#lang-dropdown');

    if (langBtn && langDropdown) {
      langBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = langDropdown.classList.toggle('lang-dropdown--open');
        langBtn.setAttribute('aria-expanded', String(isOpen));
      });

      langDropdown.querySelectorAll('.lang-option').forEach(function (opt) {
        opt.addEventListener('click', function () {
          var target = this.getAttribute('data-lang');
          var url = buildLangUrl(target);
          if (url) window.location.href = url;
        });
      });

      document.addEventListener('click', function (e) {
        if (!e.target.closest('#lang-switcher')) {
          langDropdown.classList.remove('lang-dropdown--open');
          langBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  /* ===== Inject language switcher into side drawer for mobile ===== */
  var sideDrawer = document.querySelector('#side-drawer');
  if (sideDrawer) {
    var currentCode = detectCurrentLang();
    var drawerLangHtml = '<div id="side-drawer-lang" class="side-drawer-lang">' +
      '<span class="side-drawer-lang__label">' + globeIconSvg + '</span>' +
      LANGUAGES.map(function (lang) {
        var activeClass = lang.code === currentCode ? ' side-drawer-lang__option--active' : '';
        return '<button class="side-drawer-lang__option' + activeClass + '" data-lang="' + lang.code + '">' + lang.label + '</button>';
      }).join('') +
      '</div>';
    sideDrawer.insertAdjacentHTML('beforeend', drawerLangHtml);

    sideDrawer.querySelectorAll('.side-drawer-lang__option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        var target = this.getAttribute('data-lang');
        var url = buildLangUrl(target);
        if (url) window.location.href = url;
      });
    });
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
  const isDesktop = window.matchMedia('(min-width: 1501px)');
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
