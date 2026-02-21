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

  // AskDoc sparkle icon
  const askdocSparkle = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="mask0_824_17682" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
<g clip-path="url(#clip0_824_17682)">
<path d="M9.75 12.25C10.1642 12.25 10.5 11.9142 10.5 11.5C10.5 11.0858 10.1642 10.75 9.75 10.75C9.33579 10.75 9 11.0858 9 11.5C9 11.9142 9.33579 12.25 9.75 12.25Z" fill="#292929"/>
<path d="M7.25 12.25C7.66421 12.25 8 11.9142 8 11.5C8 11.0858 7.66421 10.75 7.25 10.75C6.83579 10.75 6.5 11.0858 6.5 11.5C6.5 11.9142 6.83579 12.25 7.25 12.25Z" fill="#292929"/>
<path d="M4.75 12.25C5.16421 12.25 5.5 11.9142 5.5 11.5C5.5 11.0858 5.16421 10.75 4.75 10.75C4.33579 10.75 4 11.0858 4 11.5C4 11.9142 4.33579 12.25 4.75 12.25Z" fill="#292929"/>
<path d="M10.5496 4.38247L9.50414 3.22915L9.83324 1.70767C9.92455 1.28384 9.73314 0.852196 9.35765 0.635396C8.98314 0.420556 8.51341 0.467426 8.19017 0.759416L7.03734 1.80532L5.51683 1.4772C5.09056 1.38443 4.66038 1.57486 4.4431 1.95181C4.22533 2.32876 4.27562 2.79751 4.56761 3.1188L5.61302 4.27212L5.28392 5.7936C5.19261 6.2184 5.38402 6.64907 5.75999 6.86587C5.91575 6.95669 6.08763 7.00064 6.25853 7.00064C6.49925 7.00064 6.73802 6.91275 6.9265 6.74185L8.07982 5.69595L9.60033 6.02407C10.0281 6.1188 10.4568 5.92641 10.6741 5.54946C10.8918 5.17251 10.8411 4.70376 10.5496 4.38247ZM8.26976 4.20278C7.87865 4.11587 7.46751 4.22622 7.17064 4.49575L7.08177 4.57583L7.10765 4.45767C7.19115 4.06705 7.08128 3.65787 6.8137 3.36294L6.73265 3.27407L6.84691 3.29848C7.23607 3.38344 7.6472 3.27504 7.94652 3.00551L8.03539 2.92446L8.01 3.04165C7.92504 3.43227 8.0349 3.84243 8.30346 4.13833L8.38451 4.2272L8.26976 4.20278Z" fill="#292929"/>
<path d="M4.09373 7.52733L4.29637 6.58788C4.36522 6.26952 4.22069 5.94335 3.93846 5.78026C3.65721 5.61717 3.30125 5.65526 3.05955 5.87401L2.34764 6.51952L1.40868 6.31542C1.0913 6.25194 0.763169 6.39159 0.60057 6.67382C0.437479 6.95605 0.47557 7.31054 0.69432 7.55273L1.33983 8.26464L1.13719 9.20409C1.06834 9.52245 1.21287 9.84862 1.4951 10.0117C1.6118 10.0791 1.74119 10.1123 1.8701 10.1123C2.05174 10.1123 2.2324 10.0459 2.37401 9.91796L3.08592 9.27245L4.02488 9.47655C4.34031 9.54198 4.67039 9.40038 4.83299 9.11815C4.99608 8.83592 4.95799 8.48143 4.73924 8.23924L4.09373 7.52733Z" fill="#292929"/>
<path d="M17.0044 12.8857C16.8726 12.8857 16.7412 12.8515 16.6235 12.7822L15.3618 12.039C15.0054 11.8281 14.8862 11.3691 15.0967 11.0117C15.3066 10.6553 15.7666 10.5371 16.1235 10.7461L16.2544 10.8232V9.61523C16.2544 9.22949 16.5469 8.90722 16.9307 8.86914C17.5361 8.80859 17.9932 8.30273 17.9932 7.69238V5.18164C17.9932 4.53027 17.4629 4 16.8115 4H12.5078C12.0938 4 11.7578 3.66406 11.7578 3.25C11.7578 2.83594 12.0938 2.5 12.5078 2.5H16.8115C18.29 2.5 19.4932 3.70312 19.4932 5.18164V7.69238C19.4932 8.83984 18.7813 9.82422 17.7544 10.2061V12.1357C17.7544 12.4053 17.6104 12.6533 17.3765 12.7871C17.2612 12.8525 17.1328 12.8857 17.0044 12.8857Z" fill="#292929"/>
<path d="M3.99316 19.4997C3.89648 19.4997 3.79882 19.4812 3.70605 19.4431C3.42578 19.3269 3.24316 19.0535 3.24316 18.7497V16.0945C1.92285 15.6726 0.993164 14.4421 0.993164 12.9997V12.3454C0.993164 11.9314 1.3291 11.5954 1.74316 11.5954C2.15722 11.5954 2.49316 11.9314 2.49316 12.3454V12.9997C2.49316 13.9031 3.16992 14.6521 4.06689 14.741C4.45068 14.779 4.74316 15.1013 4.74316 15.487V16.9392L6.71289 14.9695C6.85351 14.8288 7.04443 14.7497 7.24316 14.7497H10.2432C11.208 14.7497 11.9932 13.9646 11.9932 12.9997V9.74973C11.9932 9.18137 11.7124 8.64524 11.2422 8.31614C10.9028 8.07884 10.8198 7.61106 11.0571 7.27219C11.2944 6.93235 11.7622 6.84836 12.1016 7.08762C12.9731 7.697 13.4932 8.69211 13.4932 9.74973V12.9997C13.4932 14.7917 12.0351 16.2497 10.2432 16.2497H7.5537L4.52343 19.28C4.37988 19.4236 4.18798 19.4997 3.99316 19.4997Z" fill="#292929"/>
</g>
</mask>
<g mask="url(#mask0_824_17682)">
<rect width="20" height="20" fill="black"/>
</g>
<defs>
<clipPath id="clip0_824_17682">
<rect width="20" height="20" fill="white"/>
</clipPath>
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

  /* ===== Inject AskDoc sparkle icon + click handler ===== */
  const askdocBtn = document.querySelector('#askdoc-header-btn');
  if (askdocBtn) {
    askdocBtn.insertAdjacentHTML('afterbegin', askdocSparkle);
    askdocBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('askdoc:open', {
        detail: { query: '' }
      }));
    });
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
      const cfFamilyBtn = buttons[0]; // 0 = brand "AEMG", 1 = "Adobe Coldfusion Family"
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
