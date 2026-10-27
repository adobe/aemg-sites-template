#!/usr/bin/env python3
"""Vendor hand-off tooling for localizing the RoboHelp AEM site template (en -> ja, fr, de).

    extract   -> vendor package (XLIFF/CSV/glossary) + units.json (xpath mapping)
    import    -> merge vendor-returned XLIFF/CSV into translations.<lang>.json
    validate  -> check translations against the current source
    apply     -> generate the target-language content from EN + translations
    report    -> coverage per file

Select the language with --lang (default: config targetLang). Each language works in its own
<dataDir>/<lang>/ directory. No machine translation is performed: every translation comes from the vendor.
See README.md for the workflow.
"""
import argparse
import csv
import hashlib
import html
import json
import re
import sys
import xml.etree.ElementTree as ET
from collections import Counter, OrderedDict
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape

sys.path.insert(0, str(Path(__file__).resolve().parent))
import jcrxml  # noqa: E402

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
XLIFF_NS = "urn:oasis:names:tc:xliff:document:1.2"
XML_LANG = "{http://www.w3.org/XML/1998/namespace}lang"

TAG_RE = re.compile(r"<(/?)([A-Za-z][A-Za-z0-9]*)(?:\s[^<>]*)?(/?)>")
TOKEN_RE = re.compile(r"<(/?)([A-Za-z][A-Za-z0-9]*)_(\d+)(/?)>")
ANY_MARKUP_RE = re.compile(r"<[^<>]+>")
VOID_TAGS = {"br", "hr", "img", "wbr"}
LETTER_RE = re.compile(r"[^\W\d_]")


# --------------------------------------------------------------------------- config

class Ctx:
    """Settings for one target language. Every language has its own data directory
    (<dataDir>/<lang>/), so languages can be processed side by side without sharing any file."""

    def __init__(self, config_path=None, jcr_root=None, data_dir=None, repo=None, lang=None):
        self.config_path = Path(config_path) if config_path else HERE / "config.json"
        self.cfg = json.loads(self.config_path.read_text(encoding="utf-8"))
        self.src_lang = self.cfg["sourceLang"]
        self.tgt_lang = lang or self.cfg["targetLang"]
        languages = self.cfg.get("languages")
        if self.tgt_lang == self.src_lang or (languages and self.tgt_lang not in languages):
            raise ValueError("unsupported target language %r (configured: %s)" %
                             (self.tgt_lang, ", ".join(languages or [self.cfg["targetLang"]])))
        self.repo = Path(repo) if repo else REPO
        self.root = Path(jcr_root) if jcr_root else self.repo / self.cfg["jcrRoot"]
        # --data-dir is used as given; otherwise each language gets <dataDir>/<lang>
        self.data = Path(data_dir) if data_dir else self.repo / self.cfg["dataDir"] / self.tgt_lang
        self.name = self._localize(self.cfg.get("packageName", "l10n"))
        self.path_map = self._localize(self.cfg["pathMap"])
        self.link_rewrites = self._localize(self.cfg.get("linkRewrites", []))
        self.translatable = set(self.cfg["translatableAttrs"])

    def _localize(self, value):
        """Replace the {lang} placeholder in a config string, or in every string of a nested list."""
        if isinstance(value, str):
            return value.replace("{lang}", self.tgt_lang)
        return [self._localize(v) for v in value]

    @property
    def translations_path(self):
        return self.data / ("translations.%s.json" % self.tgt_lang)

    def map_path(self, rel):
        for src, dst in self.path_map:
            if rel.startswith(src):
                return dst + rel[len(src):]
        raise ValueError("no pathMap rule for %s" % rel)

    def rewrite(self, value):
        for src, dst in self.link_rewrites:
            if value.startswith(src):
                return dst + value[len(src):]
        return value


# --------------------------------------------------------------------------- tokenizing

class Tok:
    """A source string split into vendor-facing text and protected markup."""

    def __init__(self, text, tags, prefix, suffix, lead, trail, is_html):
        self.text = text      # translator-facing text with <tag_N> placeholders
        self.tags = tags      # placeholder -> original markup
        self.prefix = prefix  # stripped outer <p>
        self.suffix = suffix
        self.lead = lead      # stripped surrounding whitespace
        self.trail = trail
        self.is_html = is_html

    @property
    def format(self):
        return "html" if self.tags else "text"

    @property
    def id(self):
        return hashlib.sha1((self.format + "\0" + self.text).encode("utf-8")).hexdigest()[:10]


def tokenize(raw):
    stripped = raw.strip()
    lead = raw[: len(raw) - len(raw.lstrip())]
    trail = raw[len(raw.rstrip()):]
    prefix = suffix = ""
    m = re.fullmatch(r"<p>(.*)</p>", stripped, re.S)
    if m and "<p" not in m.group(1) and "</p>" not in m.group(1):
        prefix, suffix, stripped = "<p>", "</p>", m.group(1)
    is_html = bool(prefix) or bool(TAG_RE.search(stripped))
    if not is_html:
        return Tok(stripped, {}, "", "", lead, trail, False)

    tags, out, stack, n, pos = {}, [], [], 0, 0
    for m in TAG_RE.finditer(stripped):
        out.append(html.unescape(stripped[pos:m.start()]))
        pos = m.end()
        closing, name, selfclose = m.group(1), m.group(2), m.group(3)
        lname = name.lower()
        if closing:
            idx = None
            for i in range(len(stack) - 1, -1, -1):
                if stack[i][0] == lname:
                    idx = stack.pop(i)[1]
                    break
            if idx is None:
                n += 1
                idx = n
            token = "</%s_%d>" % (name, idx)
        elif selfclose or lname in VOID_TAGS:
            n += 1
            token = "<%s_%d/>" % (name, n)
        else:
            n += 1
            stack.append((lname, n))
            token = "<%s_%d>" % (name, n)
        tags[token] = m.group(0)
        out.append(token)
    out.append(html.unescape(stripped[pos:]))
    return Tok("".join(out), tags, prefix, suffix, lead, trail, True)


def restore(text, tok, ctx, rewrite=True):
    """Turn translator text (with placeholders) back into the stored attribute value."""
    if not tok.is_html:
        return tok.lead + text + tok.trail
    out, pos = [], 0
    for m in TOKEN_RE.finditer(text):
        out.append(_html_text(text[pos:m.start()]))
        pos = m.end()
        raw = tok.tags.get(m.group(0))
        if raw is None:
            out.append(_html_text(m.group(0)))
        else:
            out.append(_rewrite_hrefs(raw, ctx) if rewrite else raw)
    out.append(_html_text(text[pos:]))
    return tok.lead + tok.prefix + "".join(out) + tok.suffix + tok.trail


def _html_text(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _rewrite_hrefs(tag, ctx):
    return re.sub(r"""(href\s*=\s*)(['"])(.*?)\2""",
                  lambda m: "%s%s%s%s" % (m.group(1), m.group(2), ctx.rewrite(m.group(3)), m.group(2)), tag)


def is_translatable_value(value):
    stripped = value.strip()
    plain = TAG_RE.sub("", stripped)
    if not LETTER_RE.search(plain):
        return False
    if re.fullmatch(r"\$[^$\s]+\$", stripped):
        return False
    if not TAG_RE.search(stripped) and re.match(r"(https?:)?//\S+$|/content/\S*$|#\S*$", stripped):
        return False
    return True


# --------------------------------------------------------------------------- extraction

def read_tree(path):
    return jcrxml.parse(Path(path).read_bytes())


def iter_units(ctx, files=None):
    """Yield one dict per translatable (file, xpath, attr) location."""
    for entry in ctx.cfg["files"]:
        if files and entry["path"] not in files:
            continue
        tree = read_tree(ctx.root / entry["path"])
        seen = set()
        for xpath, node in jcrxml.walk(tree):
            if xpath in seen:
                raise ValueError("duplicate node path %s in %s" % (xpath, entry["path"]))
            seen.add(xpath)
            for attr, value in node.attrs:
                if attr in ctx.translatable and is_translatable_value(value):
                    tok = tokenize(value)
                    yield {
                        "file": entry["path"], "xpath": xpath, "attr": attr,
                        "applyMode": entry["applyMode"], "format": tok.format,
                        "stringId": tok.id, "src": value, "_tok": tok,
                        "component": (node.get("sling:resourceType") or "").rsplit("/", 1)[-1],
                    }


def group_strings(units):
    strings = OrderedDict()
    for u in units:
        s = strings.setdefault(u["stringId"], {"id": u["stringId"], "text": u["_tok"].text,
                                               "format": u["format"], "units": []})
        s["units"].append(u)
    return strings


def find_unclassified(ctx):
    """Prose-like attributes that are not in translatableAttrs (guards against misses)."""
    found = []
    for entry in ctx.cfg["files"]:
        tree = read_tree(ctx.root / entry["path"])
        for xpath, node in jcrxml.walk(tree):
            for attr, value in node.attrs:
                if attr in ctx.translatable or attr.startswith("xmlns"):
                    continue
                v = value.strip()
                if any(x in xpath for x in ctx.cfg.get("unclassifiedIgnoreXpaths", [])):
                    continue
                if (re.search(r"[^\W\d_]{2,}\s+[^\W\d_]{2,}", v) and not v.startswith(("/", "{", "[", "http"))
                        and not attr.startswith(("cq:", "sling:")) and attr != "jcr:primaryType"):
                    found.append((entry["path"], xpath, attr, v[:80]))
    return found


def context_note(s, limit=3):
    parts = []
    for u in s["units"][:limit]:
        parts.append("%s :: %s @%s%s" % (u["file"].replace("/.content.xml", ""), u["xpath"], u["attr"],
                                          " [%s]" % u["component"] if u["component"] else ""))
    if len(s["units"]) > limit:
        parts.append("(+%d more)" % (len(s["units"]) - limit))
    return " | ".join(parts)


# --------------------------------------------------------------------------- translations store

def load_translations(ctx):
    if ctx.translations_path.exists():
        return json.loads(ctx.translations_path.read_text(encoding="utf-8"))
    return {"sourceLang": ctx.src_lang, "targetLang": ctx.tgt_lang, "strings": {}}


def save_translations(ctx, data):
    ctx.data.mkdir(parents=True, exist_ok=True)
    ctx.translations_path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def check_target(src_text, tgt_text, dnt):
    """Return list of (level, message) for a translation entry."""
    problems = []
    src_tokens = Counter(m.group(0) for m in TOKEN_RE.finditer(src_text))
    tgt_tokens = Counter(m.group(0) for m in TOKEN_RE.finditer(tgt_text))
    if src_tokens != tgt_tokens:
        missing = sorted((src_tokens - tgt_tokens).elements())
        extra = sorted((tgt_tokens - src_tokens).elements())
        problems.append(("error", "markup placeholders differ (missing %s, unexpected %s)" % (missing, extra)))
    leftover = ANY_MARKUP_RE.sub(lambda m: "" if TOKEN_RE.fullmatch(m.group(0)) else m.group(0), tgt_text)
    if ANY_MARKUP_RE.search(leftover):
        problems.append(("error", "target contains raw markup that is not a placeholder"))
    for term in dnt:
        if term in src_text and term not in tgt_text:
            problems.append(("warning", "do-not-translate term %r missing in target" % term))
    return problems


# --------------------------------------------------------------------------- vendor formats

def tokens_to_xliff(text):
    out, pos = [], 0
    for m in TOKEN_RE.finditer(text):
        out.append(xml_escape(text[pos:m.start()]))
        pos = m.end()
        closing, name, idx, selfclose = m.groups()
        ctype = "x-html-" + name
        if closing:
            out.append("</g>")
        elif selfclose:
            out.append('<x id="%s" ctype="%s"/>' % (idx, ctype))
        else:
            out.append('<g id="%s" ctype="%s">' % (idx, ctype))
    out.append(xml_escape(text[pos:]))
    return "".join(out)


def xliff_to_tokens(elem):
    def inner(e):
        s = e.text or ""
        for c in e:
            tag = c.tag.split("}")[-1]
            ctype = c.get("ctype", "")
            name = ctype[len("x-html-"):] if ctype.startswith("x-html-") else "tag"
            idx = c.get("id")
            if tag == "g":
                s += "<%s_%s>%s</%s_%s>" % (name, idx, inner(c), name, idx)
            elif tag == "x":
                s += "<%s_%s/>" % (name, idx)
            else:
                s += inner(c)
            s += c.tail or ""
        return s
    return inner(elem)


def write_xliff(ctx, path, strings):
    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<xliff version="1.2" xmlns="%s">' % XLIFF_NS,
             '  <file original="%s" source-language="%s" target-language="%s" datatype="plaintext">'
             % (ctx.name, ctx.src_lang, ctx.tgt_lang),
             "    <header><note>Placeholders such as &lt;g&gt;/&lt;x/&gt; (CSV: &lt;a_1&gt;...&lt;/a_1&gt;) protect "
             "links and formatting: keep them, reorder as the target grammar requires. See the glossary "
             "for terms that must not be translated.</note></header>",
             "    <body>"]
    for s in strings:
        lines.append('      <trans-unit id="%s" datatype="%s">' % (s["id"], s["format"]))
        lines.append('        <source xml:lang="%s">%s</source>' % (ctx.src_lang, tokens_to_xliff(s["text"])))
        lines.append('        <target xml:lang="%s"></target>' % ctx.tgt_lang)
        lines.append("        <note>%s</note>" % xml_escape(context_note(s)))
        lines.append("      </trans-unit>")
    lines += ["    </body>", "  </file>", "</xliff>", ""]
    Path(path).write_text("\n".join(lines), encoding="utf-8")


def write_csv(path, strings):
    with open(path, "w", encoding="utf-8-sig", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["id", "source", "target", "format", "context"])
        for s in strings:
            w.writerow([s["id"], s["text"], "", s["format"], context_note(s)])


def write_glossary(ctx, path):
    with open(path, "w", encoding="utf-8-sig", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["term", "rule"])
        for term in ctx.cfg.get("doNotTranslate", []):
            w.writerow([term, "Do not translate"])


def read_vendor_file(path):
    """Return {id: (src_text|None, tgt_text, status)} from a returned .xlf/.xliff/.csv."""
    path = Path(path)
    out = {}
    if path.suffix.lower() in (".xlf", ".xliff"):
        root = ET.parse(path).getroot()
        for tu in root.iter("{%s}trans-unit" % XLIFF_NS):
            tgt = tu.find("{%s}target" % XLIFF_NS)
            src = tu.find("{%s}source" % XLIFF_NS)
            if tgt is None:
                continue
            text = xliff_to_tokens(tgt)
            if not text.strip():
                continue
            state = tgt.get("state", "")
            status = "needs-review" if state in ("needs-review-translation", "needs-adaptation", "new") \
                else "translated"
            out[tu.get("id")] = (xliff_to_tokens(src) if src is not None else None, text, status)
    elif path.suffix.lower() == ".csv":
        with open(path, encoding="utf-8-sig", newline="") as fh:
            for row in csv.DictReader(fh):
                tgt = (row.get("target") or "")
                if not tgt.strip() or not row.get("id"):
                    continue
                out[row["id"].strip()] = (row.get("source"), tgt, "translated")
    else:
        raise ValueError("unsupported vendor file type: %s" % path)
    return out


# --------------------------------------------------------------------------- commands

def cmd_extract(ctx, args):
    units = list(iter_units(ctx))
    strings = group_strings(units)
    trans = load_translations(ctx)["strings"]

    selected = [s for s in strings.values()
                if not (args.delta and trans.get(s["id"], {}).get("tgt"))]

    vendor = ctx.data / "vendor"
    vendor.mkdir(parents=True, exist_ok=True)
    name = ctx.name + ("-delta" if args.delta else "")
    write_xliff(ctx, vendor / (name + ".xlf"), selected)
    write_csv(vendor / (name + ".csv"), selected)
    write_glossary(ctx, vendor / "glossary-do-not-translate.csv")

    public = [{k: v for k, v in u.items() if not k.startswith("_")} for u in units]
    (ctx.data / "units.json").write_text(json.dumps(
        {"sourceLang": ctx.src_lang, "targetLang": ctx.tgt_lang, "units": public},
        ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    words = sum(len(re.findall(r"\w+", TOKEN_RE.sub(" ", s["text"]))) for s in selected)
    print("units (locations):      %d in %d files" % (len(units), len(ctx.cfg["files"])))
    print("unique strings:         %d  (sent to vendor: %d, ~%d words)" % (len(strings), len(selected), words))
    print("vendor package:         %s/{%s.xlf,%s.csv,glossary-do-not-translate.csv}" % (vendor, name, name))
    print("mapping:                %s" % (ctx.data / "units.json"))
    unclassified = find_unclassified(ctx)
    if unclassified:
        print("\nREVIEW: prose-like attributes not in translatableAttrs (add to config if they are user-facing):")
        for f, x, a, v in unclassified:
            print("  %s :: %s @%s = %r" % (f, x, a, v))
    return 0


def cmd_import(ctx, args):
    data = load_translations(ctx)
    current = group_strings(iter_units(ctx))
    added = updated = 0
    problems = 0
    for f in args.files:
        batch = Path(f).name
        for sid, (src, tgt, status) in read_vendor_file(f).items():
            if sid not in current:
                print("  skip %s: id not in current source (source changed since export?)" % sid)
                problems += 1
                continue
            errs = [m for lvl, m in check_target(current[sid]["text"], tgt, []) if lvl == "error"]
            if errs:
                print("  WARNING %s: %s" % (sid, "; ".join(errs)))
                problems += 1
            entry = {"src": current[sid]["text"], "tgt": tgt, "status": status, "batch": batch}
            if sid in data["strings"]:
                updated += 1
            else:
                added += 1
            data["strings"][sid] = entry
    save_translations(ctx, data)
    print("imported: %d new, %d updated, %d problems -> %s" % (added, updated, problems, ctx.translations_path))
    return 0


def cmd_validate(ctx, args):
    current = group_strings(iter_units(ctx))
    trans = load_translations(ctx)["strings"]
    dnt = ctx.cfg.get("doNotTranslate", [])
    errors = warnings = 0
    missing = []
    review = 0
    for sid, s in current.items():
        entry = trans.get(sid)
        if not entry or not entry.get("tgt", "").strip():
            missing.append(sid)
            continue
        if entry["status"] == "needs-review":
            review += 1
        for lvl, msg in check_target(s["text"], entry["tgt"], dnt):
            print("%s %s: %s\n    src: %s\n    tgt: %s" % (lvl.upper(), sid, msg, s["text"][:100], entry["tgt"][:100]))
            errors += lvl == "error"
            warnings += lvl == "warning"
    unused = [sid for sid in trans if sid not in current]
    for sid in unused:
        print("WARNING %s: translation no longer matches any source string (source changed?)" % sid)
    warnings += len(unused)
    if missing:
        print("%s: %d of %d strings have no translation" %
              ("WARNING" if args.allow_missing else "ERROR", len(missing), len(current)))
        for sid in missing[:20]:
            print("    %s  %s" % (sid, current[sid]["text"][:80]))
        if len(missing) > 20:
            print("    ... (+%d more)" % (len(missing) - 20))
        if args.allow_missing:
            warnings += 1
        else:
            errors += 1
    print("\nsummary: %d strings, %d translated, %d missing, %d needs-review, %d errors, %d warnings" %
          (len(current), len(current) - len(missing), len(missing), review, errors, warnings))
    return 1 if errors else 0


def cmd_apply(ctx, args):
    trans = load_translations(ctx)["strings"]
    dnt = ctx.cfg.get("doNotTranslate", [])
    mapping, stats = [], []
    written = []

    for entry in ctx.cfg["files"]:
        if entry["applyMode"] != "apply":
            continue
        src_path = ctx.root / entry["path"]
        dst_rel = ctx.map_path(entry["path"])
        tree = read_tree(src_path)
        counts = Counter()
        for xpath, node in jcrxml.walk(tree):
            for pair in node.attrs:
                attr, value = pair
                if attr in ctx.translatable and is_translatable_value(value):
                    tok = tokenize(value)
                    t = trans.get(tok.id)
                    ok = bool(t and t.get("tgt", "").strip()) and not any(
                        lvl == "error" for lvl, _ in check_target(tok.text, t["tgt"], []))
                    if t and t.get("tgt", "").strip() and not ok:
                        counts["invalid"] += 1
                    pair[1] = restore(t["tgt"] if ok else tok.text, tok, ctx)
                    counts["translated" if ok else "fallback"] += 1
                    mapping.append({"file": entry["path"], "targetFile": dst_rel, "xpath": xpath, "attr": attr,
                                    "src": value, "tgt": pair[1] if ok else None, "stringId": tok.id})
                elif attr in ctx.cfg.get("languageAttrs", []) and value == ctx.src_lang:
                    pair[1] = ctx.tgt_lang
                elif value.startswith("/content/"):
                    pair[1] = ctx.rewrite(value)
        stats.append((entry["path"], dst_rel, counts))
        if not args.dry_run:
            dst = ctx.root / dst_rel
            dst.parent.mkdir(parents=True, exist_ok=True)
            dst.write_text(jcrxml.serialize(tree), encoding="utf-8")
            written.append(dst_rel)

    if not args.dry_run:
        for rel in written:
            ensure_parent_stub(ctx, rel)

    ctx.data.mkdir(parents=True, exist_ok=True)
    (ctx.data / ("mapping.%s.json" % ctx.tgt_lang)).write_text(
        json.dumps(mapping, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    total = Counter()
    for src, dst, c in stats:
        total.update(c)
        print("%-95s -> %s  translated=%d fallback(EN)=%d%s" %
              (src, "(dry-run)" if args.dry_run else "written", c["translated"], c["fallback"],
               " INVALID=%d" % c["invalid"] if c["invalid"] else ""))
    print("\n%s %d files; %d attribute values translated, %d left in %s (no/invalid translation)" %
          ("would write" if args.dry_run else "wrote", len(stats), total["translated"], total["fallback"],
           ctx.src_lang))
    print("mapping written to %s" % (ctx.data / ("mapping.%s.json" % ctx.tgt_lang)))
    return 0


def ensure_parent_stub(ctx, rel):
    """Make sure the parent page lists the generated page as a child node."""
    parts = rel.split("/")
    if len(parts) < 3 or parts[-1] != ".content.xml":
        return
    child, parent_file = parts[-2], ctx.root.joinpath(*parts[:-2], ".content.xml")
    if not parent_file.exists():
        return
    tree = read_tree(parent_file)
    if tree.child(child) is None:
        tree.children.append(jcrxml.Node(child))
        parent_file.write_text(jcrxml.serialize(tree), encoding="utf-8")


def cmd_report(ctx, args):
    units = list(iter_units(ctx))
    trans = load_translations(ctx)["strings"]
    per_file = OrderedDict()
    for u in units:
        d = per_file.setdefault(u["file"], Counter())
        d["units"] += 1
        d["done"] += bool(trans.get(u["stringId"], {}).get("tgt", "").strip())
    strings = group_strings(units)
    print("%-95s %6s %6s %s" % ("file", "units", "done", "mode"))
    mode = {e["path"]: e["applyMode"] for e in ctx.cfg["files"]}
    for f, c in per_file.items():
        print("%-95s %6d %6d %s" % (f, c["units"], c["done"], mode[f]))
    done = sum(1 for sid in strings if trans.get(sid, {}).get("tgt", "").strip())
    print("\nunique strings: %d, translated: %d, missing: %d" % (len(strings), done, len(strings) - done))
    return 0


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--config")
    p.add_argument("--lang", help="target language, one of config 'languages' (default: config 'targetLang')")
    p.add_argument("--jcr-root", help="override jcr_root directory")
    p.add_argument("--data-dir", help="override the data directory (default: <dataDir>/<lang>)")
    sub = p.add_subparsers(dest="cmd", required=True)

    e = sub.add_parser("extract", help="create the vendor package and units.json")
    e.add_argument("--delta", action="store_true", help="only strings without a translation yet")
    i = sub.add_parser("import", help="merge vendor-returned .xlf/.csv files")
    i.add_argument("files", nargs="+")
    v = sub.add_parser("validate", help="check translations against current source")
    v.add_argument("--allow-missing", action="store_true")
    a = sub.add_parser("apply", help="generate target-language content")
    a.add_argument("--dry-run", action="store_true")
    sub.add_parser("report", help="coverage per file")

    args = p.parse_args(argv)
    try:
        ctx = Ctx(args.config, args.jcr_root, args.data_dir, lang=args.lang)
    except ValueError as exc:
        p.error(str(exc))
    return {"extract": cmd_extract, "import": cmd_import, "validate": cmd_validate,
            "apply": cmd_apply, "report": cmd_report}[args.cmd](ctx, args)


if __name__ == "__main__":
    sys.exit(main())
