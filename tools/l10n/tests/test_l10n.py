import csv
import json
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
import jcrxml  # noqa: E402
import l10n  # noqa: E402

EN_PAGE = """<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
    jcr:primaryType="cq:Page">
    <jcr:content
        jcr:description="Find answers &amp; tutorials."
        jcr:language="en"
        jcr:primaryType="cq:PageContent"
        jcr:title="Docs">
        <root jcr:primaryType="nt:unstructured">
            <title
                jcr:primaryType="nt:unstructured"
                id="t1"
                text="Learn and Support"/>
            <rich
                jcr:primaryType="nt:unstructured"
                text="&lt;p>See the &lt;a href='/content/robohelp-docs/en/docs/a.html'>guide&lt;/a> &amp;amp; more &amp;gt;&lt;/p>"
                textIsRich="true"/>
            <search
                jcr:primaryType="nt:unstructured"
                placeholder="Ask anything"
                resultpage="/content/aemg-docs/en/search"/>
            <ph jcr:primaryType="nt:unstructured" text="$category.html$"/>
            <empty jcr:primaryType="nt:unstructured" text=""/>
            <dup jcr:primaryType="nt:unstructured" text="Learn and Support"/>
        </root>
    </jcr:content>
</jcr:root>
"""

CONFIG = {
    "sourceLang": "en", "targetLang": "ja", "packageName": "t", "jcrRoot": "jcr_root", "dataDir": "data",
    "files": [{"path": "content/aemg-docs/en/docs/.content.xml", "applyMode": "apply"}],
    "pathMap": [["content/aemg-docs/en/", "content/aemg-docs/ja/"]],
    "translatableAttrs": ["jcr:title", "jcr:description", "text", "placeholder"],
    "linkRewrites": [["/content/aemg-docs/en", "/content/aemg-docs/ja"],
                     ["/content/robohelp-docs/en/", "/content/robohelp-docs/ja/"]],
    "languageAttrs": ["jcr:language"], "doNotTranslate": ["RoboHelp"],
}


class Base(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        d = Path(self.tmp.name)
        self.root = d / "jcr_root"
        page = self.root / "content/aemg-docs/en/docs/.content.xml"
        page.parent.mkdir(parents=True)
        page.write_text(EN_PAGE, encoding="utf-8")
        parent = self.root / "content/aemg-docs/ja/.content.xml"
        parent.parent.mkdir(parents=True)
        parent.write_text(EN_PAGE.split("<jcr:content")[0] + "</jcr:root>\n", encoding="utf-8")
        self.cfg = dict(CONFIG)
        (d / "config.json").write_text(json.dumps(self.cfg), encoding="utf-8")
        self.ctx = l10n.Ctx(d / "config.json", self.root, d / "data", d)

    def run_cmd(self, *argv):
        return l10n.main(["--config", str(self.ctx.config_path), "--jcr-root", str(self.ctx.root),
                          "--data-dir", str(self.ctx.data)] + list(argv))


class TokenizeTests(unittest.TestCase):
    def test_plain_text(self):
        t = l10n.tokenize("Hello world")
        self.assertEqual((t.text, t.format), ("Hello world", "text"))

    def test_rich_text_protects_markup_and_unwraps_p(self):
        raw = "<p>See <a href='/x'>this</a> &amp; more &gt;</p>"
        t = l10n.tokenize(raw)
        self.assertEqual(t.text, "See <a_1>this</a_1> & more >")
        self.assertEqual(t.format, "html")
        ctx = l10n.Ctx()
        self.assertEqual(l10n.restore(t.text, t, ctx, rewrite=False), raw)

    def test_same_text_different_href_share_id(self):
        a = l10n.tokenize("<p>Go <a href='/a'>here</a></p>")
        b = l10n.tokenize("<p>Go <a href='/b'>here</a></p>")
        self.assertEqual(a.id, b.id)

    def test_p_wrapper_without_tags_dedupes_with_plain(self):
        self.assertEqual(l10n.tokenize("<p>Support</p>").id, l10n.tokenize("Support").id)

    def test_reordering_in_target_is_restored(self):
        t = l10n.tokenize("Click <a href='/x'>here</a> now<br/>")
        out = l10n.restore("今すぐ<a_1>こちら</a_1>をクリック<br_2/>", t, l10n.Ctx(), rewrite=False)
        self.assertEqual(out, "今すぐ<a href='/x'>こちら</a>をクリック<br/>")

    def test_translatable_filter(self):
        for v in ["", "  ", "#", "$category.html$", "/content/aemg-docs/en/search", "https://adobe.com", "123"]:
            self.assertFalse(l10n.is_translatable_value(v), v)
        for v in ["Home", "<p>Hi</p>", "All levels"]:
            self.assertTrue(l10n.is_translatable_value(v), v)


class ExtractTests(Base):
    def test_units_and_dedupe(self):
        units = list(l10n.iter_units(self.ctx))
        locations = {(u["xpath"].split("/")[-1], u["attr"]) for u in units}
        self.assertIn(("title", "text"), locations)
        self.assertNotIn(("ph", "text"), locations)
        self.assertNotIn(("empty", "text"), locations)
        self.assertEqual(len(group_ids(units)), len(units) - 1)  # 'Learn and Support' twice

    def test_extract_writes_vendor_package(self):
        self.assertEqual(self.run_cmd("extract"), 0)
        vendor = self.ctx.data / "vendor"
        self.assertTrue((vendor / "t.xlf").exists())
        rows = list(csv.DictReader(open(vendor / "t.csv", encoding="utf-8-sig")))
        self.assertEqual(len(rows), 5)
        units = json.loads((self.ctx.data / "units.json").read_text(encoding="utf-8"))["units"]
        self.assertTrue(all("xpath" in u and "stringId" in u for u in units))


def group_ids(units):
    return {u["stringId"] for u in units}


class RoundTripTests(Base):
    def test_identity_apply_equals_source(self):
        """translation == source (no rewrites) must reproduce EN semantically."""
        self.ctx.link_rewrites = []
        units = l10n.group_strings(l10n.iter_units(self.ctx))
        l10n.save_translations(self.ctx, {"strings": {
            sid: {"src": s["text"], "tgt": s["text"], "status": "translated"} for sid, s in units.items()}})
        args = type("A", (), {"dry_run": False})()
        l10n.cmd_apply(self.ctx, args)

        def norm(n):
            attrs = [tuple(a) for a in n.attrs if a[0] != "jcr:language"]
            return (n.name, attrs, [norm(c) for c in n.children])
        en = jcrxml.parse((self.root / "content/aemg-docs/en/docs/.content.xml").read_bytes())
        ja = jcrxml.parse((self.root / "content/aemg-docs/ja/docs/.content.xml").read_bytes())
        self.assertEqual(norm(en), norm(ja))

    def test_vendor_roundtrip_xlf_and_csv(self):
        self.run_cmd("extract")
        vendor = self.ctx.data / "vendor"
        # xliff: fill all targets
        text = (vendor / "t.xlf").read_text(encoding="utf-8")
        text = text.replace('<target xml:lang="ja"></target>', '<target xml:lang="ja">訳</target>', 1)
        returned = self.ctx.data / "r.xlf"
        returned.write_text(text, encoding="utf-8")
        self.assertEqual(self.run_cmd("import", str(returned)), 0)
        self.assertEqual(len(l10n.load_translations(self.ctx)["strings"]), 1)
        # csv: fill the rich string with reordered markup
        rows = list(csv.DictReader(open(vendor / "t.csv", encoding="utf-8-sig")))
        rich = next(r for r in rows if r["format"] == "html")
        rich["target"] = "<a_1>ガイド</a_1>を参照 & もっと >"
        returned_csv = self.ctx.data / "r.csv"
        with open(returned_csv, "w", encoding="utf-8-sig", newline="") as fh:
            w = csv.DictWriter(fh, fieldnames=rows[0].keys())
            w.writeheader()
            w.writerow(rich)
        self.run_cmd("import", str(returned_csv))
        self.run_cmd("apply")
        ja = (self.root / "content/aemg-docs/ja/docs/.content.xml").read_text(encoding="utf-8")
        self.assertIn("&lt;p>&lt;a href='/content/robohelp-docs/ja/docs/a.html'>ガイド&lt;/a>を参照 &amp;amp; もっと &amp;gt;&lt;/p>", ja)
        self.assertIn('jcr:language="ja"', ja)
        self.assertIn('resultpage="/content/aemg-docs/ja/search"', ja)
        self.assertIn('text="Learn and Support"', ja)  # untranslated falls back to EN

    def test_parent_gets_child_stub(self):
        self.run_cmd("apply")
        parent = jcrxml.parse((self.root / "content/aemg-docs/ja/.content.xml").read_bytes())
        self.assertIsNotNone(parent.child("docs"))


class ValidateTests(Base):
    def _import(self, tgt_by_text):
        units = l10n.group_strings(l10n.iter_units(self.ctx))
        strings = {sid: {"src": s["text"], "tgt": tgt_by_text.get(s["text"], s["text"]), "status": "translated"}
                   for sid, s in units.items()}
        l10n.save_translations(self.ctx, {"strings": strings})

    def test_ok(self):
        self._import({})
        self.assertEqual(self.run_cmd("validate"), 0)

    def test_missing_is_error_unless_allowed(self):
        l10n.save_translations(self.ctx, {"strings": {}})
        self.assertEqual(self.run_cmd("validate"), 1)
        self.assertEqual(self.run_cmd("validate", "--allow-missing"), 0)

    def test_broken_placeholders_are_errors_and_not_applied(self):
        self._import({"See the <a_1>guide</a_1> & more >": "ガイドを参照"})
        self.assertEqual(self.run_cmd("validate"), 1)
        self.run_cmd("apply")
        ja = (self.root / "content/aemg-docs/ja/docs/.content.xml").read_text(encoding="utf-8")
        self.assertNotIn("ガイドを参照", ja)

    def test_raw_markup_is_error(self):
        self.assertTrue(any(l == "error" for l, _ in l10n.check_target("Hi", "<b>Hi</b>", [])))

    def test_dnt_warning(self):
        probs = l10n.check_target("About RoboHelp", "ロボヘルプについて", ["RoboHelp"])
        self.assertEqual([l for l, _ in probs], ["warning"])


class LanguageHierarchyTests(unittest.TestCase):
    """Each target language is configured via {lang} and works in its own <dataDir>/<lang>/ directory."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        d = Path(self.tmp.name)
        self.root = d / "jcr_root"
        page = self.root / "content/aemg-docs/en/docs/.content.xml"
        page.parent.mkdir(parents=True)
        page.write_text(EN_PAGE, encoding="utf-8")
        cfg = dict(CONFIG, languages=["ja", "fr", "de"], packageName="robohelp-en-{lang}",
                   dataDir=str(d / "data"),
                   pathMap=[["content/aemg-docs/en/", "content/aemg-docs/{lang}/"]],
                   linkRewrites=[["/content/aemg-docs/en", "/content/aemg-docs/{lang}"]])
        self.config = d / "config.json"
        self.config.write_text(json.dumps(cfg), encoding="utf-8")
        self.base = d

    def ctx(self, lang=None):
        return l10n.Ctx(self.config, self.root, None, self.base, lang=lang)

    def run_cmd(self, lang, *argv):
        return l10n.main(["--config", str(self.config), "--jcr-root", str(self.root), "--lang", lang] + list(argv))

    def test_placeholders_and_data_dir_follow_language(self):
        fr = self.ctx("fr")
        self.assertEqual(fr.tgt_lang, "fr")
        self.assertEqual(fr.name, "robohelp-en-fr")
        self.assertEqual(fr.data, self.base / "data" / "fr")
        self.assertEqual(fr.map_path("content/aemg-docs/en/docs/.content.xml"), "content/aemg-docs/fr/docs/.content.xml")
        self.assertEqual(fr.rewrite("/content/aemg-docs/en/search"), "/content/aemg-docs/fr/search")

    def test_default_language_is_config_target(self):
        self.assertEqual(self.ctx().tgt_lang, "ja")
        self.assertEqual(self.ctx().data, self.base / "data" / "ja")

    def test_unknown_or_source_language_is_rejected(self):
        for lang in ("es", "en"):
            with self.assertRaises(ValueError):
                self.ctx(lang)

    def test_explicit_data_dir_is_used_as_given(self):
        ctx = l10n.Ctx(self.config, self.root, self.base / "custom", self.base, lang="de")
        self.assertEqual(ctx.data, self.base / "custom")

    def test_languages_use_separate_packages_and_stores(self):
        for lang in ("ja", "fr", "de"):
            self.assertEqual(self.run_cmd(lang, "extract"), 0)
            self.assertTrue((self.base / "data" / lang / "vendor" / ("robohelp-en-%s.csv" % lang)).exists())
        fr, de = self.ctx("fr"), self.ctx("de")
        strings = l10n.group_strings(l10n.iter_units(fr))
        l10n.save_translations(fr, {"strings": {sid: {"src": s["text"], "tgt": "FR " + s["text"], "status": "translated"}
                                                for sid, s in strings.items()}})
        self.assertEqual(self.run_cmd("fr", "apply"), 0)
        self.assertEqual(l10n.load_translations(de)["strings"], {})
        fr_page = (self.root / "content/aemg-docs/fr/docs/.content.xml").read_text(encoding="utf-8")
        self.assertIn('jcr:language="fr"', fr_page)
        self.assertIn('text="FR Learn and Support"', fr_page)
        self.assertFalse((self.root / "content/aemg-docs/de").exists())
        self.assertTrue((self.base / "data" / "fr" / "mapping.fr.json").exists())
        self.assertFalse((self.base / "data" / "de" / "mapping.de.json").exists())

    def test_cli_rejects_unsupported_language(self):
        with self.assertRaises(SystemExit):
            self.run_cmd("es", "report")


class SerializerTests(unittest.TestCase):
    def test_serialize_parse_roundtrip(self):
        a = jcrxml.parse(EN_PAGE.encode())
        b = jcrxml.parse(jcrxml.serialize(a).encode())
        dump = lambda n: (n.name, [tuple(x) for x in n.attrs], [dump(c) for c in n.children])  # noqa: E731
        self.assertEqual(dump(a), dump(b))


@unittest.skipUnless((l10n.REPO / "site/src/main/content/jcr_root/content/aemg-docs/en/docs").exists(),
                     "repo content not available")
class RealContentTests(unittest.TestCase):
    def test_every_in_scope_file_extracts_and_restores_byte_identically(self):
        ctx = l10n.Ctx()
        units = list(l10n.iter_units(ctx))
        self.assertGreater(len(units), 100)
        self.assertEqual({u["file"] for u in units}, {e["path"] for e in ctx.cfg["files"]})
        for u in units:
            tok = u["_tok"]
            self.assertEqual(l10n.restore(tok.text, tok, ctx, rewrite=False), u["src"], u["xpath"])


if __name__ == "__main__":
    unittest.main()
