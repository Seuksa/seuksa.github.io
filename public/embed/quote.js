/*!
 * Seuksa Quote embed v1 – https://seuksa.com/quotes/embed/
 * Free to use on any website, as long as the link back to seuksa.com stays visible.
 *
 *   <div class="seuksa-quote" data-quote="daily"><a href="https://seuksa.com/quotes/">Quotes by Seuksa</a></div>
 *   <script src="https://seuksa.com/embed/quote.js" async></script>
 *
 * data-quote     "daily" (default, same quote for everyone today) | "random" | a quote id
 * data-category  limit daily/random to a category, e.g. "Inspiration"
 * data-lang      "both" (default) | "en" | "km"
 * data-theme     "light" (default) | "dark" | "auto"
 * data-accent    accent colour, e.g. "#4f46e5"
 * data-shuffle   "true" adds a "another quote" button (daily/random only)
 *
 * JS API: SeuksaQuote.render(element), SeuksaQuote.renderAll()
 */
(function () {
  'use strict';

  if (window.SeuksaQuote) {
    window.SeuksaQuote.renderAll();
    return;
  }

  var script = document.currentScript;
  var BASE = 'https://seuksa.com';
  try {
    if (script && script.src) BASE = new URL(script.src).origin;
  } catch (e) {}

  var SELECTOR = '.seuksa-quote, [data-seuksa-quote]';
  var listPromise = null;

  function getJSON(path) {
    return fetch(BASE + path, { credentials: 'omit' }).then(function (r) {
      if (!r.ok) throw new Error('Seuksa Quote: HTTP ' + r.status);
      return r.json();
    });
  }

  function loadList() {
    if (!listPromise) {
      listPromise = getJSON('/api/quotes.json').then(function (d) {
        return d.quotes || [];
      });
      listPromise.catch(function () {
        listPromise = null; // allow a retry later
      });
    }
    return listPromise;
  }

  function pick(list, mode, category, exclude) {
    var pool = category
      ? list.filter(function (q) {
          return q.categories.some(function (c) {
            return c.toLowerCase() === category.toLowerCase();
          });
        })
      : list;
    if (!pool.length) pool = list;
    if (mode === 'daily') return pool[Math.floor(Date.now() / 864e5) % pool.length];
    var q;
    do q = pool[Math.floor(Math.random() * pool.length)];
    while (pool.length > 1 && exclude && q.id === exclude);
    return q;
  }

  function loadQuote(opts, exclude) {
    if (opts.mode === 'daily' || opts.mode === 'random') {
      return loadList().then(function (list) {
        if (!list.length) throw new Error('Seuksa Quote: no quotes');
        return pick(list, exclude ? 'random' : opts.mode, opts.category, exclude);
      });
    }
    return getJSON('/api/quotes/' + encodeURIComponent(opts.mode) + '.json').then(function (d) {
      return d.quote;
    });
  }

  /* Fonts: @font-face does not work inside shadow roots, so register uniquely named faces once on the page. */
  function ensureFonts() {
    if (document.getElementById('seuksa-quote-fonts')) return;
    var style = document.createElement('style');
    style.id = 'seuksa-quote-fonts';
    style.textContent =
      "@font-face{font-family:'Seuksa Quote';font-style:normal;font-weight:100 900;font-display:swap;" +
      "src:url('" + BASE + "/embed/fonts/kantumruy-pro-khmer.woff2') format('woff2');" +
      'unicode-range:U+1780-17FF,U+19E0-19FF,U+200C-200D,U+25CC}' +
      "@font-face{font-family:'Seuksa Quote';font-style:normal;font-weight:100 900;font-display:swap;" +
      "src:url('" + BASE + "/embed/fonts/kantumruy-pro-latin.woff2') format('woff2');" +
      'unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2212}';
    (document.head || document.documentElement).appendChild(style);
  }

  var CSS =
    ':host{all:initial;display:block;max-width:36rem;' +
    '--sq-bg:#fff;--sq-fg:#1e293b;--sq-muted:#64748b;--sq-border:#e2e8f0;--sq-soft:#eef2ff;--sq-accent:#4f46e5}' +
    ':host([data-theme=dark]){--sq-bg:#0f172a;--sq-fg:#e2e8f0;--sq-muted:#94a3b8;--sq-border:#1e293b;--sq-soft:#1e1b4b;--sq-accent:#818cf8}' +
    '@media (prefers-color-scheme:dark){:host([data-theme=auto]){--sq-bg:#0f172a;--sq-fg:#e2e8f0;--sq-muted:#94a3b8;--sq-border:#1e293b;--sq-soft:#1e1b4b;--sq-accent:#818cf8}}' +
    '*{box-sizing:border-box}' +
    '.card{position:relative;margin:0;padding:1.5rem 1.5rem 1rem;border:1px solid var(--sq-border);border-radius:1rem;' +
    'background:var(--sq-bg);color:var(--sq-fg);font:400 16px/1.6 "Seuksa Quote","Kantumruy Pro","Noto Sans Khmer","Khmer OS",system-ui,sans-serif;' +
    'box-shadow:0 1px 2px rgba(15,23,42,.06)}' +
    '.mark{display:block;width:2rem;height:2rem;color:var(--sq-accent);opacity:.85}' +
    'blockquote{margin:.75rem 0 0;padding:0}' +
    'p{margin:0 0 .6rem;white-space:pre-line;overflow-wrap:anywhere}' +
    'p.en{font-size:1.125rem;font-weight:500}' +
    'p.km{line-height:1.9}' +
    'p.en+p.km,p.km+p.en{padding-left:.875rem;border-left:3px solid var(--sq-accent);color:var(--sq-muted);font-size:1rem}' +
    '.meta{display:flex;align-items:center;justify-content:space-between;gap:.75rem;margin-top:.75rem;' +
    'padding-top:.75rem;border-top:1px solid var(--sq-border);font-size:.8125rem;color:var(--sq-muted)}' +
    '.author{font-weight:600;color:var(--sq-fg)}' +
    'a.brand{display:inline-flex;align-items:center;gap:.4rem;color:var(--sq-accent);text-decoration:none;font-weight:600;white-space:nowrap}' +
    'a.brand:hover,a.brand:focus-visible{text-decoration:underline}' +
    'a.brand svg{width:1.1rem;height:1.1rem;flex:none}' +
    'button{all:unset;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;width:1.9rem;height:1.9rem;' +
    'border-radius:999px;color:var(--sq-muted)}' +
    'button:hover,button:focus-visible{background:var(--sq-soft);color:var(--sq-accent)}' +
    'button svg{width:1rem;height:1rem}' +
    '.right{display:inline-flex;align-items:center;gap:.25rem}' +
    '.state{color:var(--sq-muted);font-size:.9rem;margin:.75rem 0}' +
    ':host([data-fill]) .card{height:100%;overflow:auto}';

  var ICON_MARK =
    '<svg class="mark" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M4.6 17.3C3.5 16.1 3 14.8 3 12.7c0-3.7 2.6-7 6.3-8.6l.9 1.4C6.7 7.4 6 9.9 5.7 11.5c.6-.3 1.4-.4 2.1-.4 2 .2 3.5 1.8 3.5 3.8a3.8 3.8 0 0 1-3.8 3.8c-1.2 0-2.3-.5-2.9-1.4Zm10 0c-1.1-1.2-1.6-2.5-1.6-4.6 0-3.7 2.6-7 6.3-8.6l.9 1.4c-3.5 1.9-4.2 4.4-4.5 6 .6-.3 1.4-.4 2.1-.4 2 .2 3.5 1.8 3.5 3.8a3.8 3.8 0 0 1-3.8 3.8c-1.2 0-2.3-.5-2.9-1.4Z"/></svg>';
  var ICON_LOGO =
    '<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="16" fill="currentColor"/><path d="M32 14 8 25l24 11 20-9.2V40h4V25L32 14Z" fill="#fff"/><path d="M18 33v9c0 4 6.3 8 14 8s14-4 14-8v-9l-14 6.4L18 33Z" fill="#fff" opacity=".7"/></svg>';
  var ICON_SHUFFLE =
    '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>';

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text; // data is always inserted as text, never as HTML
    return n;
  }

  function trackUrl(url) {
    try {
      var u = new URL(url);
      u.searchParams.set('utm_source', location.hostname || 'embed');
      u.searchParams.set('utm_medium', 'quote-embed');
      return u.href;
    } catch (e) {
      return BASE + '/quotes/';
    }
  }

  function options(host) {
    var d = host.dataset;
    var lang = (d.lang || 'both').toLowerCase();
    return {
      mode: (d.quote || 'daily').trim() || 'daily',
      category: (d.category || '').trim(),
      lang: lang === 'en' || lang === 'km' ? lang : 'both',
      shuffle: d.shuffle === 'true' || d.shuffle === '',
    };
  }

  function draw(root, host, quote, opts) {
    var card = el('figure', 'card');
    card.setAttribute('part', 'card');
    card.insertAdjacentHTML('afterbegin', ICON_MARK);

    var bq = el('blockquote');
    bq.cite = quote.url;
    var lines = quote.lines.filter(function (l) {
      return opts.lang === 'both' || l.lang === opts.lang;
    });
    if (!lines.length) lines = quote.lines; // e.g. Khmer-only quote with data-lang="en"
    lines.forEach(function (l) {
      var p = el('p', l.lang, l.text);
      p.lang = l.lang;
      bq.appendChild(p);
    });
    card.appendChild(bq);

    var meta = el('figcaption', 'meta');
    meta.appendChild(el('span', 'author', quote.author ? '— ' + quote.author : ''));
    var right = el('span', 'right');
    if (opts.shuffle && (opts.mode === 'daily' || opts.mode === 'random')) {
      var b = el('button');
      b.type = 'button';
      b.title = 'Another quote';
      b.setAttribute('aria-label', 'Show another quote');
      b.innerHTML = ICON_SHUFFLE;
      b.addEventListener('click', function () {
        loadQuote(opts, quote.id).then(function (q) {
          draw(root, host, q, opts);
        });
      });
      right.appendChild(b);
    }
    var a = el('a', 'brand');
    a.href = trackUrl(quote.url);
    a.target = '_blank';
    a.rel = 'noopener';
    a.title = 'Read this quote on Seuksa – ' + quote.title;
    a.innerHTML = ICON_LOGO;
    a.appendChild(document.createTextNode('Seuksa Quotes'));
    right.appendChild(a);
    meta.appendChild(right);
    card.appendChild(meta);

    var style = el('style', null, CSS);
    root.textContent = '';
    root.appendChild(style);
    root.appendChild(card);
  }

  function render(host) {
    if (!host || host.nodeType !== 1) return;
    var opts = options(host);
    var accent = host.dataset.accent;
    if (accent && /^#[0-9a-f]{3,8}$/i.test(accent)) host.style.setProperty('--sq-accent', accent);
    if (!host.dataset.theme) host.dataset.theme = 'light';

    ensureFonts();
    var root = host.shadowRoot || (host.attachShadow ? host.attachShadow({ mode: 'open' }) : host);
    host.setAttribute('data-sq-rendered', '');

    return loadQuote(opts).then(
      function (q) {
        if (!q) throw new Error('Seuksa Quote: quote "' + opts.mode + '" not found');
        draw(root, host, q, opts);
      },
      function (err) {
        // Keep the fallback link the author put inside the element (visible without shadow DOM).
        if (root !== host) {
          root.innerHTML = '<style>' + CSS + '</style><div class="card"><p class="state"></p></div>';
          var p = root.querySelector('.state');
          var a = el('a', 'brand', 'Read quotes on Seuksa');
          a.href = BASE + '/quotes/';
          a.target = '_blank';
          a.rel = 'noopener';
          p.appendChild(a);
        }
        if (window.console) console.warn(err);
      },
    );
  }

  function renderAll() {
    var nodes = document.querySelectorAll(SELECTOR);
    for (var i = 0; i < nodes.length; i++) if (!nodes[i].hasAttribute('data-sq-rendered')) render(nodes[i]);
  }

  window.SeuksaQuote = { render: render, renderAll: renderAll, version: 1 };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderAll);
  else renderAll();
})();
