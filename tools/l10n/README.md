# RoboHelp site template – localization hand-off (en → ja, fr, de)

This tool takes every translatable string from the RoboHelp **English** site content, packages it for an
external translation vendor, and puts the vendor's translations back to generate the localized content for
**Japanese (`ja`), French (`fr`) and German (`de`)**. Each language is processed independently, so several
languages can be worked on at the same time.
It does no machine translation: every translation comes from the vendor. It needs only Python 3 (standard library)
and `git`.

---

## Languages

The target language is chosen with `--lang` (before the command). Without it, the `targetLang` from `config.json`
(`ja`) is used. Supported languages are listed in `languages` in `config.json`; anything else is rejected.

```bash
python3 tools/l10n/l10n.py --lang fr extract
python3 tools/l10n/l10n.py --lang de report
```

Everything that belongs to one language lives in its own folder, so languages never share or overwrite a file:

```
tools/l10n/data/
├── ja/
│   ├── vendor/                  robohelp-en-ja.xlf / .csv, glossary-do-not-translate.csv
│   ├── units.json               written by extract
│   ├── translations.ja.json     written by import
│   └── mapping.ja.json          written by apply (local report, not committed)
├── fr/   (same layout, robohelp-en-fr.*, translations.fr.json, …)
└── de/   (same layout, robohelp-en-de.*, translations.de.json, …)
```

The generated site content also goes to a per-language tree: `content/aemg-docs/<lang>/…` and
`content/experience-fragments/aemg-docs/<lang>/…`. The English source is shared and never modified.

### Working on several languages at once

- **Different languages in parallel is safe**: import, validate, report and extract only touch that language's folder,
  and apply writes only that language's content tree. Use a separate terminal, branch or Git worktree per language.
- **The same language twice is not safe**: `import` reads and rewrites the whole `translations.<lang>.json`, so two
  concurrent imports for one language can lose updates. Run them one after another.
- Keep the English source stable while the languages are in progress, so every language is packaged from the same
  revision (otherwise string ids differ; see `extract --delta`).
- `apply --dry-run` still rewrites that language's `mapping.<lang>.json` (a local file, see below).

---

## Quick start

Run every command from the repository root. Use the `rh-doc` branch (or a branch from it).
The examples use `ja`; add `--lang fr` or `--lang de` for the other languages.

### 1. Create the package for the vendor

```bash
python3 tools/l10n/l10n.py --lang ja extract
```

This creates `tools/l10n/data/ja/vendor/` with:

| File | Send to vendor? | What it is |
|---|---|---|
| `robohelp-en-ja.xlf` | yes (preferred) | XLIFF 1.2, opens in any translation (CAT) tool |
| `robohelp-en-ja.csv` | yes (alternative) | Same strings as a spreadsheet: `id, source, target, format, context` |
| `glossary-do-not-translate.csv` | yes | Terms to keep as-is (RoboHelp, Adobe, FrameMaker…) |

Send the `.xlf` **or** the `.csv` (not both) plus the glossary. Tell the vendor to:
- fill in only the **target** (`<target>` in XLIFF, `target` column in CSV);
- keep the placeholders such as `<a_1>…</a_1>` (CSV) or `<g id="1">…</g>` (XLIFF). They protect links and
  formatting. They may be reordered to fit the target language's grammar, but none may be removed, added or edited.

The package contains source text only: every target is empty, with no suggested translations.
`extract` overwrites that language's existing package files, so keep a copy of any manual edits made to them.

### 2. Import what the vendor returns

```bash
python3 tools/l10n/l10n.py --lang ja import path/to/returned.xlf        # or returned.csv
```

The translations are stored in `tools/l10n/data/ja/translations.ja.json`. **Commit this file**; it is the
source of truth. You can import several partial batches; rows with an empty target are ignored.
The language comes from `--lang`, **not from the file name**: always pass the `--lang` that matches the returned
file, or the translations end up in the wrong language's store.

### 3. Check them

```bash
python3 tools/l10n/l10n.py --lang ja validate
```

It reports missing translations, broken or missing placeholders, raw HTML in a target, and
do-not-translate terms that disappeared. Fix problems with the vendor and re-import. It exits with code 1 on errors.
While a delivery is partial, use `validate --allow-missing`.

### 4. Generate the localized site

```bash
python3 tools/l10n/l10n.py --lang ja apply --dry-run   # preview: per-file counts only, no content written
python3 tools/l10n/l10n.py --lang ja apply             # write the ja files
git status && git diff                                 # review
```

Any string that has no (or an invalid) translation stays in English, and the summary tells you how many.
So a partial delivery still gives a working site.

### 5. After the English content changes, or a partial delivery

```bash
python3 tools/l10n/l10n.py --lang ja extract --delta   # package only strings that have no translation yet
```

Send `robohelp-en-ja-delta.xlf/.csv`, then repeat from step 2.

### Other commands

```bash
python3 tools/l10n/l10n.py --lang ja report  # strings and translation coverage per file
python3 tools/l10n/l10n.py --help            # all options
python3 -m unittest discover -s tools/l10n/tests   # run the tests
```


---

## Details

### What is extracted

Attributes `jcr:title`, `jcr:description`, `pageTitle`, `text` (plain or rich HTML), `alt`, `placeholder`,
`accessibilityLabel`, `sortTitle`, `productTitle` and `appLinkText`, in the files listed in `config.json`:

- `apply` mode: `content/aemg-docs/en/{docs,docs/product1,search,signin,support}` and the experience fragments
  `en/site/{header,footer}/master`. They are written to the matching `.../<lang>/...` path (`pathMap`).
- `extract-only` mode: templates `kb-content` and `topic-content`. They are shared by all languages, so their strings go
  to the vendor but are not applied.

Skipped automatically: empty values, URLs, `#`, and `$placeholder$` values. `extract` also prints any prose-like
attribute that is *not* in `translatableAttrs`, so nothing user-facing is silently missed.

Strings are de-duplicated: text used in several places is sent once. The id is a hash of the (tokenized) text, so a
changed EN string automatically becomes "new", and its old translation is reported as unused by `validate`.

### The mapping ("xpath")

An address is `file` + JCR node-name path + `@attribute`, for example:

```
content/aemg-docs/en/docs/.content.xml
/jcr:root/jcr:content/root/container/.../search_row/searchbar  @placeholder
```

Files in `tools/l10n/data/<lang>/` (one folder per language):

| File | Content | Sent to vendor |
|---|---|---|
| `units.json` | every location (file, xpath, attr, applyMode, src, stringId); written by `extract` | no |
| `translations.<lang>.json` | `stringId` → `{src, tgt, status, batch}`; written by `import` | no |
| `mapping.<lang>.json` | location → src → tgt for what was applied; written by `apply`. **Local report: git-ignored, not committed.** It describes one branch's content (so it differs between branches and would conflict on merge), nothing reads it, and `apply` regenerates it | no |
| `vendor/*` | the packages above | yes |

### Rich text

FAQ answers, the announcement and footer legal links contain HTML. The vendor sees only the text with numbered
placeholders around links and formatting. The real tags, including their `href`s, stay in the source and are put back
by `apply`. `validate` checks that all placeholders are still present, and `apply` ignores translations that fail
this check (the English text is kept instead).

### What `apply` also does

- Rewrites locale paths in link-like values and in rich-text `href`s per `linkRewrites` (`/content/aemg-docs/en` →
  `/<lang>`, `/content/robohelp-docs/en/` → `/<lang>/`, experience-fragment paths). External URLs are untouched.
  Remove the `robohelp-docs` rule if that site will not have a tree for the language.
- Sets `jcr:language` to the target language, and adds the missing child pages (`signin`, `support`) to
  `content/aemg-docs/<lang>/.content.xml`. That parent page must already exist: `ja` does; for `fr` and `de` create
  `content/aemg-docs/<lang>/.content.xml` first, otherwise the child pages are not registered.
- Overwrites the existing stale ColdFusion-era `ja` pages and fragments (and any existing page of the target language).
- Writes files in FileVault format (one attribute per line), like AEM does.

### Configuration (`config.json`)

| Key | Purpose |
|---|---|
| `targetLang` | language used when `--lang` is omitted |
| `languages` | supported target languages for `--lang` |
| `packageName` | vendor package name; `{lang}` is replaced by the language (`robohelp-en-{lang}`) |
| `dataDir` | parent of the per-language data folders (`<dataDir>/<lang>/`) |
| `files` | in-scope files and their `applyMode` (`apply` / `extract-only`) |
| `pathMap` | EN → target path prefixes for generated files; use `{lang}` in the target |
| `translatableAttrs` | attributes sent for translation |
| `linkRewrites` | locale rewrites for paths and hrefs; use `{lang}` in the target |
| `doNotTranslate` | glossary terms, checked by `validate` |
| `unclassifiedIgnoreXpaths` | xpath fragments ignored by the "missed attributes" report |

To add a language, append its code to `languages`; `pathMap`, `linkRewrites` and `packageName` already adapt through
`{lang}`. `--data-dir` overrides the data folder and is used exactly as given (no language sub-folder is added).

### Code layout

- `l10n.py`: CLI (`extract`, `import`, `validate`, `apply`, `report`), language handling (`Ctx`), tokenizer, XLIFF/CSV I/O.
- `jcrxml.py`: small reader/writer for `.content.xml` that keeps attribute order and comments.
- `tests/test_l10n.py`: unit tests, an export → import → apply round-trip, and an identity check on the real content
  (every extracted value is restored byte-identically).

### Not covered (by design)

- Hard-coded strings in `theme/src/components/experiencefragment/header.js` (language names, "Switch language", WAP dropdown labels).
- Binary page thumbnails (`_jcr_content/image/file`) and DAM assets (no translatable metadata).
- Templates are not applied (strings are in the package for a later i18n/dictionary approach).
