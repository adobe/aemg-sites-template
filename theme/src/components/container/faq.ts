/*
Copyright 2022 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

/**
 * FAQ Section - Tab switching and Accordion toggle
 *
 * Convention:
 *   Tab ID:   faq-tab-{key}    -> maps to panel ID: faq-panel-{key}
 *   FAQ Item: faq-item-{id}    -> contains .cmp-title (question) and .cmp-text (answer)
 */

const FAQ_SECTION_ID = '#faq-section';
const TAB_PREFIX = 'faq-tab-';
const PANEL_PREFIX = 'faq-panel-';
const ITEM_PREFIX = 'faq-item-';

const TAB_ACTIVE_CLASS = 'faq-tab--active';
const PANEL_ACTIVE_CLASS = 'faq-panel--active';
const ITEM_EXPANDED_CLASS = 'faq-item--expanded';

/** Extract the category key from an element's ID by stripping a known prefix. */
const extractKey = (id: string, prefix: string): string => id.replace(prefix, '');

/** Activate a tab and show its corresponding panel; deactivate everything else. */
const activateTab = (tabEl: Element, tabs: Element[], panels: Element[]) => {
  const key = extractKey(tabEl.id, TAB_PREFIX);

  // Toggle tab active states
  tabs.forEach((t) => t.classList.remove(TAB_ACTIVE_CLASS));
  tabEl.classList.add(TAB_ACTIVE_CLASS);

  // Toggle panel visibility – also hide the parent .aem-GridColumn wrapper
  // so that inactive panels don't occupy any space in the layout.
  panels.forEach((p) => {
    p.classList.remove(PANEL_ACTIVE_CLASS);
    const parentCol = p.closest('.aem-GridColumn');
    if (parentCol) {
      (parentCol as HTMLElement).style.display = 'none';
    }
  });

  const targetPanel = document.getElementById(`${PANEL_PREFIX}${key}`);
  if (targetPanel) {
    targetPanel.classList.add(PANEL_ACTIVE_CLASS);
    const parentCol = targetPanel.closest('.aem-GridColumn');
    if (parentCol) {
      (parentCol as HTMLElement).style.display = '';
    }
  }
};

/** Toggle a single FAQ item open/closed. */
const toggleFaqItem = (itemEl: Element) => {
  itemEl.classList.toggle(ITEM_EXPANDED_CLASS);
};

/** Initialize the FAQ section behaviour. */
const initFaq = () => {
  const section = document.querySelector(FAQ_SECTION_ID);
  if (!section) return; // FAQ section not on this page

  // Gather all tab buttons and panels
  const tabs: Element[] = Array.from(section.querySelectorAll(`[id^="${TAB_PREFIX}"]`));
  const panels: Element[] = Array.from(section.querySelectorAll(`[id^="${PANEL_PREFIX}"]`));
  const items: Element[] = Array.from(section.querySelectorAll(`[id^="${ITEM_PREFIX}"]`));

  if (tabs.length === 0 || panels.length === 0) return;

  // --- Tab click handlers ---
  tabs.forEach((tab) => {
    // Listen on the wrapper and any clickable descendants
    const clickTargets = [tab, ...Array.from(tab.querySelectorAll('a, button, .cmp-button'))];
    clickTargets.forEach((target) => {
      target.addEventListener('click', (e: Event) => {
        e.preventDefault();
        activateTab(tab, tabs, panels);
      });
    });
  });

  // --- Accordion click handlers ---
  items.forEach((item) => {
    const questionTitle = item.querySelector('.cmp-title');
    if (questionTitle) {
      questionTitle.addEventListener('click', (e: Event) => {
        e.preventDefault();
        toggleFaqItem(item);
      });
    }
  });

  // --- Default state: activate first tab (all items collapsed) ---
  if (tabs[0]) {
    activateTab(tabs[0], tabs, panels);
  }
};

document.addEventListener('DOMContentLoaded', initFaq);
