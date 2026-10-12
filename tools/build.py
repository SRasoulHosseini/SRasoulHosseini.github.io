"""Embed the stylesheet and script into index.html. Uses only Python's standard library."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent


def build():
    path = ROOT / 'index.html'
    page = path.read_text(encoding='utf-8')
    css = (ROOT / 'styles.css').read_text(encoding='utf-8').strip()
    js = (ROOT / 'script.js').read_text(encoding='utf-8').strip()
    assert '</style' not in css.lower() and '</script' not in js.lower()
    style = f'<style id="notebook-styles">\n{css}\n  </style>'
    script = f'<script id="notebook-script">\n{js}\n  </script>'
    if '<style id="notebook-styles">' in page:
        page, count = re.subn(r'<style id="notebook-styles">.*?</style>', lambda _: style, page, flags=re.S)
        assert count == 1
    else:
        old = '<link rel="stylesheet" href="styles.css">'
        assert page.count(old) == 1
        page = page.replace(old, style)
    page = page.replace('  <script src="script.js" defer></script>\n', '')
    if '<script id="notebook-script">' in page:
        page, count = re.subn(r'<script id="notebook-script">.*?</script>', lambda _: script, page, flags=re.S)
        assert count == 1
    else:
        assert page.count('</body>') == 1
        page = page.replace('</body>', f'  {script}\n</body>')
    path.write_text(page, encoding='utf-8')
    print('Built index.html with embedded CSS and JavaScript.')


if __name__ == '__main__':
    build()
