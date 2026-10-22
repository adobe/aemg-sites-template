/*
Copyright 2022 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

/**
 * Search Presets – populates the search bar input with a preset question
 * when a user clicks one of the preset pill buttons. Does NOT navigate
 * to the search results page.
 */

const initSearchPresets = (): void => {
  const presetsContainer = document.querySelector("#search-presets");
  if (!presetsContainer) return;

  const searchContainer = document.querySelector("#search-container");
  if (!searchContainer) return;

  const searchInput = searchContainer.querySelector<HTMLInputElement>(
    ".cmp-search-bar__input"
  );
  if (!searchInput) return;

  const presetItems = presetsContainer.querySelectorAll(".text");

  presetItems.forEach((item) => {
    item.addEventListener("click", (e: Event) => {
      e.preventDefault();
      e.stopPropagation();

      const paragraph = item.querySelector("p");
      const presetText = paragraph
        ? paragraph.textContent?.trim() ?? ""
        : (item as HTMLElement).textContent?.trim() ?? "";

      if (presetText) {
        searchInput.value = presetText;
        searchInput.focus();

        // Dispatch input event so the searchbar component picks up the change
        searchInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
  });
};

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSearchPresets);
} else {
  initSearchPresets();
}