#!/usr/bin/env python3
"""Validate the static site's local pages, assets, anchors and metadata."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import re

ROOT = Path(__file__).resolve().parent

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path, self.refs, self.ids, self.errors = path, [], set(), []
        self.title = self.main = self.canonical = self.description = False
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            if a['id'] in self.ids: self.errors.append(f'duplicate id: {a["id"]}')
            self.ids.add(a['id'])
        self.title |= tag == 'title'
        self.main |= tag == 'main'
        self.canonical |= tag == 'link' and a.get('rel') == 'canonical'
        self.description |= tag == 'meta' and a.get('name') == 'description' and bool(a.get('content'))
        for k in ('href', 'src'):
            if k in a: self.refs.append(a[k])
        if tag == 'img':
            if not a.get('alt'): self.errors.append('image missing meaningful alt')
            if not a.get('width') or not a.get('height'): self.errors.append('image missing dimensions')

def main():
    pages = {}
    for path in ROOT.glob('*.html'):
        page = Page(path)
        page.feed(path.read_text())
        pages[path.resolve()] = page
    errors = []
    for path, page in pages.items():
        for flag in ('title','main','canonical','description'):
            if not getattr(page,flag): page.errors.append('missing '+flag)
        for ref in page.refs:
            url = urlsplit(ref)
            if url.scheme or url.netloc: continue
            target = (path.parent / unquote(url.path)).resolve() if url.path else path
            if target.is_dir(): target /= 'index.html'
            if not target.exists(): page.errors.append('missing local target: '+ref)
            if url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
                page.errors.append('missing anchor: '+ref)
        errors += [f'{path.name}: {e}' for e in page.errors]
    for ref in re.findall(r'url\([\'"]?([^\)\'\"]+)', (ROOT/'styles.css').read_text()):
        if not urlsplit(ref).scheme and not (ROOT/ref).exists(): errors.append('CSS missing asset: '+ref)
    if (ROOT/'CNAME').read_text().strip() != 'sakura.miaowu.org': errors.append('unexpected canonical domain')
    if errors: raise SystemExit('\n'.join(errors))
    print(f'PASS: {len(pages)} HTML pages; local links, anchors, images, CSS assets and metadata.')

if __name__ == '__main__': main()
