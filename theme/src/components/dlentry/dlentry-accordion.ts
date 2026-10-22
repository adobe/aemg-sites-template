/*
Copyright 2022 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

const DL_ENTRY_EXPANDED_CLASS = 'dlentry--expanded';
const SCOPE_SELECTOR = '#topic-container .cmp-dita-topic-content';
const DLENTRY_SELECTOR = '.dlentry';
const DT_SELECTOR = ':scope > .dt';

function initDlentryAccordion() {
  const scope = document.querySelector(SCOPE_SELECTOR);
  if (!scope) return;

  const dlentries = scope.querySelectorAll<HTMLElement>(DLENTRY_SELECTOR);
  if (dlentries.length === 0) return;

  dlentries.forEach((dlentry) => {
    const dt = dlentry.querySelector<HTMLElement>(DT_SELECTOR);
    if (!dt) return;

    dt.addEventListener('click', () => {
      dlentry.classList.toggle(DL_ENTRY_EXPANDED_CLASS);
    });
  });
}

document.addEventListener('DOMContentLoaded', initDlentryAccordion);
