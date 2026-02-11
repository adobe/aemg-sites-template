/*
Copyright 2022 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

/* ===== Search-in-header visibility ===== */
var setHeader = () => {
  var domEl = document.querySelector("#page-with-search-in-header");
  if (domEl) {
    var searchEl = document.querySelector("#page-content .cmp-experiencefragment--header .searchbar");
    if (searchEl) {
      searchEl.style.visibility = 'visible';
    }
  }
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
  const bellIconSvg = `<svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9ZM13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  const gridIconSvg = `<svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="1.5"/>
  </svg>`;

  const avatarSvg = `<div class="header-avatar" title="User profile">
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5Zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5Z" fill="currentColor"/>
    </svg>
  </div>`;

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

  /* ===== Inject chevron after "Adobe Coldfusion Family" button ===== */
  const headerLeft = document.querySelector('#header-left');
  if (headerLeft) {
    // The second .button in #header-left is "Adobe Coldfusion Family"
    const buttons = headerLeft.querySelectorAll(':scope > .button');
    if (buttons.length >= 2) {
      const cfFamilyBtn = buttons[1]; // 0 = brand "AEMG", 1 = "Adobe Coldfusion Family"
      const btnLink = cfFamilyBtn.querySelector('.cmp-button');
      if (btnLink) {
        btnLink.insertAdjacentHTML('beforeend', chevronDownSvg);
      }
    }
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
