import { readFileSync, writeFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { fileURLToPath } from 'node:url';

// Run with the final public base URL as the argument if the domain changes.
const publicBase = new URL(process.argv[2] || 'https://gargallobellesalex-arch.github.io/tetra/');
if (publicBase.protocol !== 'https:' || !publicBase.pathname.endsWith('/')) {
  throw Error('Expected an HTTPS base URL ending in /');
}
process.chdir(fileURLToPath(new URL('./', import.meta.url)));
const template = readFileSync('page-template.tmpl', 'utf8');
const locales = runInNewContext(readFileSync('locales.js', 'utf8') + '; copy');
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const routes = Object.keys(locales);
const pageUrl = code => new URL(code ? code + '.html' : '', publicBase).href;
const alternateTags = routes.map(code =>
  '<link rel="alternate" hreflang="' + code + '" href="' + pageUrl(code) + '">');
alternateTags.push('<link rel="alternate" hreflang="x-default" href="' + pageUrl('') + '">');

for (const route of ['', ...routes]) {
  const lang = route || 'ca';
  const locale = locales[lang];
  const description = locale.board + '. ' + locale.instructions;
  const dir = ['ar', 'arz', 'ur'].includes(lang) ? 'rtl' : 'ltr';
  const headings = locale.titles.map((heading, i) =>
    '<article class="quadrant" data-q="' + i + '"><div class="q-header"><h2>' +
    escape(heading) + '</h2></div><p class="static-hint">' + escape(locale.hints[i]) + '</p></article>'
  ).join('\n');
  const head = [
    '<base href="./">',
    '<link rel="canonical" href="' + pageUrl(route) + '">',
    ...(route ? [] : ['<meta name="google-site-verification" content="fMETkllVJP-d9Le5Ye0FPk5g2zSJz3v-hhYTK5YD_P4">']),
    ...alternateTags
  ].join('\n');
  let html = template.replace('<html lang="ca">', '<html lang="' + lang + '" dir="' + dir + '" data-route="' + route + '">')
    .replace('<head>', '<head>\n' + head)
    .replace(/(<meta name="description" content=")[^"]+/, '$1' + escape(description))
    .replace('aria-label="Matriu de prioritats"></section>', 'aria-label="' + escape(locale.board) + '">' + headings + '</section>')
    .replace(/(data-i18n="([^"]+)"[^>]*>)[^<]*/g, (match, prefix, key) => prefix + escape(locale[key]))
    .replace('id="example">Exemple', 'id="example">' + escape(locale.example))
    .replace('aria-label="Idioma"', 'aria-label="' + escape(locale.language) + '"')
    .replace('aria-label="Ajuda"', 'aria-label="' + escape(locale.help) + '"')
    .replace('aria-label="Descarrega"', 'aria-label="' + escape(locale.export) + '"')
    .replaceAll('aria-label="Tanca"', 'aria-label="' + escape(locale.close) + '"')
    .replace('aria-label="Tasques"', 'aria-label="' + escape(locale.task) + '"');
  writeFileSync((route || 'index') + '.html', html);
}
writeFileSync('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  ['', ...routes].map(code => '  <url><loc>' + escape(pageUrl(code)) + '</loc></url>').join('\n') + '\n</urlset>\n');
