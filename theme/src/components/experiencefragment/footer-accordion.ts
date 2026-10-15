/*
Copyright 2022 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

const MOBILE_QUERY = '(max-width: 390px)';
const EXPANDED_CLASS = 'footer-accordion-expanded';
const HIDDEN_CLASS = 'footer-accordion-hidden';

interface AccordionGroup {
  heading: HTMLElement;
  content: HTMLElement[];
}

let cleanupFns: (() => void)[] = [];

/**
 * Groups the direct children of a column container into accordion sections.
 * Each `.text` child starts a new group; subsequent non-text siblings
 * become its collapsible content. This naturally splits col-resources
 * into "Resources" and "Adobe Account" groups.
 */
function getAccordionGroups(column: HTMLElement): AccordionGroup[] {
  const children = Array.from(column.children) as HTMLElement[];
  const groups: AccordionGroup[] = [];
  let current: AccordionGroup | null = null;

  for (const child of children) {
    if (child.classList.contains('text')) {
      if (current) groups.push(current);
      current = { heading: child, content: [] };
    } else if (current) {
      current.content.push(child);
    }
  }

  if (current) groups.push(current);
  return groups;
}

function enableAccordion() {
  const footerLinks = document.getElementById('footer-links');
  if (!footerLinks) return;

  const columns = footerLinks.querySelectorAll<HTMLElement>('[id^="col-"]');

  columns.forEach((column) => {
    const groups = getAccordionGroups(column);

    groups.forEach((group) => {
      group.content.forEach((el) => el.classList.add(HIDDEN_CLASS));

      const handler = () => {
        const isExpanded = group.heading.classList.toggle(EXPANDED_CLASS);
        group.content.forEach((el) =>
          el.classList.toggle(HIDDEN_CLASS, !isExpanded)
        );
      };

      group.heading.addEventListener('click', handler);
      cleanupFns.push(() => {
        group.heading.removeEventListener('click', handler);
        group.heading.classList.remove(EXPANDED_CLASS);
        group.content.forEach((el) => el.classList.remove(HIDDEN_CLASS));
      });
    });
  });
}

function disableAccordion() {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
}

function initFooterAccordion() {
  const mq = window.matchMedia(MOBILE_QUERY);

  const handleChange = (e: MediaQueryList | MediaQueryListEvent) => {
    disableAccordion();
    if (e.matches) enableAccordion();
  };

  handleChange(mq);
  mq.addEventListener('change', handleChange);
}

document.addEventListener('DOMContentLoaded', initFooterAccordion);
