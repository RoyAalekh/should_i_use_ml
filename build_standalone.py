#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parent
html = (ROOT / 'index.html').read_text()
css = (ROOT / 'styles.css').read_text()
model = (ROOT / 'model.js').read_text()
app = (ROOT / 'app.js').read_text()
html = html.replace('<link rel="stylesheet" href="styles.css" />', f'<style>\n{css}\n</style>')
html = html.replace('<script src="model.js"></script>\n  <script src="app.js"></script>', f'<script>\n{model}\n</script>\n  <script>\n{app}\n</script>')
html = html.replace('href="./README.md"', 'href="#" onclick="document.getElementById(\'aboutDialog\').showModal();return false;"')
(ROOT / 'standalone.html').write_text(html)
print(ROOT / 'standalone.html')