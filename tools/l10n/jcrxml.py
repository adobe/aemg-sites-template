"""Minimal FileVault ``.content.xml`` reader/writer.

Raw (prefixed) names are kept as-is and attribute order is preserved, so output
matches the formatting AEM/FileVault produces (one attribute per line).
"""
import xml.parsers.expat as expat

INDENT = "    "


class Node:
    __slots__ = ("name", "attrs", "children", "comment")

    def __init__(self, name, attrs=None, comment=None):
        self.name = name
        self.attrs = attrs if attrs is not None else []  # ordered [name, value]
        self.children = []
        self.comment = comment  # set only for comment nodes (name is None)

    def get(self, key, default=None):
        for k, v in self.attrs:
            if k == key:
                return v
        return default

    def set(self, key, value):
        for pair in self.attrs:
            if pair[0] == key:
                pair[1] = value
                return
        self.attrs.append([key, value])

    def child(self, name):
        for c in self.children:
            if c.name == name:
                return c
        return None


def parse(text):
    root = None
    stack = []
    parser = expat.ParserCreate()
    parser.ordered_attributes = True
    parser.buffer_text = True

    def start(name, attrs):
        nonlocal root
        node = Node(name, [[attrs[i], attrs[i + 1]] for i in range(0, len(attrs), 2)])
        if stack:
            stack[-1].children.append(node)
        else:
            root = node
        stack.append(node)

    def end(_name):
        stack.pop()

    def chars(data):
        if data.strip():
            raise ValueError("unexpected text content: %r" % data[:40])

    def comment(data):
        if stack:
            stack[-1].children.append(Node(None, comment=data))

    parser.StartElementHandler = start
    parser.EndElementHandler = end
    parser.CharacterDataHandler = chars
    parser.CommentHandler = comment
    parser.Parse(text, True)
    return root


def _esc(value):
    return (value.replace("&", "&amp;").replace("<", "&lt;").replace('"', "&quot;")
            .replace("\n", "&#xa;").replace("\r", "&#xd;").replace("\t", "&#x9;"))


def serialize(root):
    out = ['<?xml version="1.0" encoding="UTF-8"?>\n']

    def write(node, depth, is_root):
        pad = INDENT * depth
        if node.name is None:
            out.append("%s<!--%s-->\n" % (pad, node.comment))
            return
        ns = [a for a in node.attrs if a[0].startswith("xmlns")]
        rest = [a for a in node.attrs if not a[0].startswith("xmlns")]
        head = "%s<%s" % (pad, node.name)
        if is_root and ns:
            head += "".join(' %s="%s"' % (k, _esc(v)) for k, v in ns)
            lines = [head] + ['%s%s="%s"' % (pad + INDENT, k, _esc(v)) for k, v in rest]
        elif len(node.attrs) == 1:
            lines = [head + ' %s="%s"' % (node.attrs[0][0], _esc(node.attrs[0][1]))]
        else:
            lines = [head] + ['%s%s="%s"' % (pad + INDENT, k, _esc(v)) for k, v in node.attrs]
        close = ">" if node.children else "/>"
        out.append("\n".join(lines) + close + "\n")
        if node.children:
            for c in node.children:
                write(c, depth + 1, False)
            out.append("%s</%s>\n" % (pad, node.name))

    write(root, 0, True)
    return "".join(out)


def walk(node, path=""):
    """Yield (xpath, node) for every element; xpath is the JCR node-name path."""
    if node.name is None:
        return
    here = "%s/%s" % (path, node.name)
    yield here, node
    for c in node.children:
        yield from walk(c, here)
