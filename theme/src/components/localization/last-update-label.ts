const LAST_UPDATE_LABELS: { [locale: string]: string } = {
  de: "Letzte Aktualisierung:",
  en: "Last update:",
  fr: "Dernière mise à jour:",
  ja: "最終更新日：",
};

function isSupportedLocale(locale: string): boolean {
  return Object.prototype.hasOwnProperty.call(LAST_UPDATE_LABELS, locale);
}

function getPageLocale(): string {
  const pathSegments = window.location.pathname.split("/");

  for (let index = 0; index < pathSegments.length; index += 1) {
    if (isSupportedLocale(pathSegments[index])) {
      return pathSegments[index];
    }
  }

  const documentLocale = document.documentElement.lang
    .toLowerCase()
    .split("-")[0];

  if (isSupportedLocale(documentLocale)) {
    return documentLocale;
  }

  return "en";
}

function updateLastUpdateLabels(): void {
  const label = LAST_UPDATE_LABELS[getPageLocale()];

  ["kb-last-update-label", "lastUpdateLabel"].forEach((id) => {
    const component = document.getElementById(id);
    if (!component) {
      return;
    }

    const text = component.querySelector(".cmp-text__paragraph, p");
    if (text) {
      text.textContent = label;
    } else {
      component.textContent = label;
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", updateLastUpdateLabels);
} else {
  updateLastUpdateLabels();
}
