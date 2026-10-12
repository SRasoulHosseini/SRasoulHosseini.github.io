"""Check deployment files, local links, IDs, and generated assets without dependencies."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re

ROOT = Path(__file__).resolve().parent.parent


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids, self.refs, self.aria, self.errors = [], [], [], []
        self.h1 = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get('id'):
            self.ids.append(a['id'])
        self.h1 += tag == 'h1'
        for key in ['href', 'src']:
            if a.get(key):
                self.refs.append(a[key])
        for key in ['aria-labelledby', 'aria-describedby']:
            self.aria.extend(a.get(key, '').split())
        if tag == 'img' and 'alt' not in a:
            self.errors.append('Image without an alt attribute')
        if tag == 'a' and a.get('target') == '_blank' and 'noopener' not in a.get('rel', ''):
            self.errors.append('New-tab link without noopener')


def validate():
    page = (ROOT / 'index.html').read_text(encoding='utf-8')
    parser = Page()
    parser.feed(page)
    errors = parser.errors
    errors.extend(f'Duplicate ID: {key}' for key, n in Counter(parser.ids).items() if n > 1)
    if parser.h1 != 1:
        errors.append('Expected exactly one h1')
    for ref in parser.refs:
        url = urlsplit(ref)
        if url.scheme or url.netloc:
            continue
        if url.path:
            path = (ROOT / unquote(url.path)).resolve()
            if ROOT not in path.parents or not path.is_file():
                errors.append(f'Missing local file: {ref}')
        elif url.fragment and unquote(url.fragment) not in parser.ids:
            errors.append(f'Missing anchor: {ref}')
    errors.extend(f'Missing ARIA target: {ref}' for ref in parser.aria if ref not in parser.ids)
    for tag, identity, filename in [('style', 'notebook-styles', 'styles.css'), ('script', 'notebook-script', 'script.js')]:
        match = re.search(rf'<{tag} id="{identity}">(.*?)</{tag}>', page, re.S)
        expected = (ROOT / filename).read_text(encoding='utf-8').strip()
        if not match or match.group(1).strip() != expected:
            errors.append(f'Embedded {filename} is stale; run python3 tools/build.py')
    if 'href="styles.css"' in page or 'src="script.js"' in page:
        errors.append('Page still depends on separately loaded CSS or JavaScript')
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'PASS: {len(parser.refs)} references checked; IDs, ARIA, local files, and embedded sources are valid.')


if __name__ == '__main__':
    validate()
