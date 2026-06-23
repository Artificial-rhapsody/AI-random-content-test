async function init() {
  const params = new URLSearchParams(location.search);
  const articlePath = params.get('path');
  if (!articlePath) return;

  const dir = articlePath.replace(/\/article\.md$/, '');
  const config = await fetch('site.json').then(r => r.json());
  const GITHUB_RAW = config.githubRaw;

  const [{ topics }, md, addition] = await Promise.all([
    fetch('./articles.json').then(r => r.json()),
    fetch(`${GITHUB_RAW}/${articlePath}`).then(r => r.text()),
    fetch(`${GITHUB_RAW}/${dir}/addition.json`).then(r => r.json()).catch(() => ({})),
  ]);

  // Populate brand
  document.querySelectorAll('[data-brand]').forEach(el => el.textContent = config.brand);

  // Find article metadata + topic + related
  let topic = '', article = null, related = [];
  for (const t of topics) {
    if (t.main.articlePath === articlePath) {
      topic = t.topicName; article = t.main;
      related = t.subs.slice(0, 3);
      break;
    }
    for (const s of t.subs) {
      if (s.articlePath === articlePath) {
        topic = t.topicName; article = s;
        related = [t.main, ...t.subs.filter(x => x !== s)].slice(0, 3);
        break;
      }
    }
    if (article) break;
  }

  const title = extractTitle(md);
  document.title = `${title} — ${config.brand}`;
  document.getElementById('bc-topic').textContent = topic;
  document.getElementById('bc-article').textContent = title;
  document.getElementById('article-title').textContent = title;
  const rawCover = article?.coverUrl?.replace(/github\.com\/(.*?)\/tree\//, 'raw.githubusercontent.com/$1/')
    || `https://picsum.photos/seed/${encodeURIComponent(articlePath)}/1920/800`;
  document.getElementById('hero-img').src = rawCover;

  // Authors
  const authors = addition.author || [];
  document.getElementById('article-meta').innerHTML =
    `<span class="mr-4 text-brand-navy">${authors.length ? 'By ' + authors.join(', ') : ''}</span>`;

  // Article body
  document.getElementById('article-body').innerHTML = parseMd(md, `${GITHUB_RAW}/${dir}`);

  // Key Takeaways from keyTerms
  const entries = Object.entries(addition.keyTerms || {});
  document.getElementById('key-takeaways').innerHTML = entries.map(([term, def], i) => `
    <div class="pb-4 border-b border-outline/20">
      <h4 class="font-label-md text-label-md text-accent uppercase mb-2">${String(i + 1).padStart(2, '0')}. ${term}</h4>
      <p class="font-body-md text-body-md text-on-surface-variant text-sm">${def}</p>
    </div>`).join('');

  // Related articles — fetch H1 titles in parallel
  const relatedTitles = await Promise.all(
    related.map(r => fetch(`${GITHUB_RAW}/${r.articlePath}`).then(res => res.text()).then(extractTitle).catch(() => r.name))
  );
  document.getElementById('related-articles').innerHTML = related.map((r, i) => `
    <div class="border border-outline/30 p-6 hover:bg-surface-container-low transition-colors group cursor-pointer relative"
         onclick="location.href='reading.html?path=${encodeURIComponent(r.articlePath)}'">
      <div class="grid-intersection"></div>
      <div class="font-caption text-caption text-on-surface-variant uppercase mb-4 tracking-widest">${topic}</div>
      <h3 class="font-headline-md text-headline-md text-on-surface mb-4 group-hover:text-primary transition-colors">${relatedTitles[i]}</h3>
      <p class="font-body-md text-body-md text-on-surface-variant mb-6 text-sm line-clamp-3">${r.abstract}</p>
      <div class="font-label-md text-label-md text-accent uppercase flex items-center">
        Read Report <span class="material-symbols-outlined ml-2 text-[18px] group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
      </div>
    </div>`).join('');
}

function extractTitle(md) {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : 'Article';
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s, imgBase) {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
      const url = /^https?:\/\//.test(src) ? src : `${imgBase}/${src}`;
      return `<img src="${url}" alt="${alt}" class="max-w-full my-4" />`;
    })
    .replace(/\[(.+?)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-primary underline underline-offset-2 hover:opacity-70">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/`([^`]+)`/g, '<code class="bg-surface-container-low px-1 font-mono text-sm">$1</code>');
}

function parseMd(md, imgBase) {
  const sep = md.indexOf('\n---\n');
  const body = sep !== -1 ? md.slice(sep + 5) : md;
  const lines = body.split('\n');
  let html = '', i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block → left-border block
    if (line.startsWith('```')) {
      let code = '';
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) code += lines[i++] + '\n';
      html += `<div class="pl-6 border-l-4 border-accent my-6 font-mono text-sm text-on-surface-variant whitespace-pre-wrap">${esc(code.trim())}</div>`;
      i++; continue;
    }

    // Unordered list (-, *, +)
    if (/^[-*+] /.test(line)) {
      let items = '';
      while (i < lines.length && /^[-*+] /.test(lines[i]))
        items += `<li class="flex items-start"><span class="material-symbols-outlined text-accent mr-3 mt-1">arrow_forward</span><span class="font-body-md text-body-md">${inline(lines[i++].slice(2), imgBase)}</span></li>`;
      html += `<ul class="space-y-4 mb-8 border-t border-b border-outline/20 py-6">${items}</ul>`;
      continue;
    }

    // Ordered list
    if (/^\d+\. /.test(line)) {
      let items = '', n = 1;
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        const text = lines[i++].replace(/^\d+\. /, '');
        items += `<li class="flex items-start gap-3"><span class="font-label-md text-label-md text-accent min-w-[1.5rem]">${n++}.</span><span class="font-body-md text-body-md">${inline(text, imgBase)}</span></li>`;
      }
      html += `<ol class="space-y-4 mb-8 border-t border-b border-outline/20 py-6">${items}</ol>`;
      continue;
    }

    if      (line.startsWith('#### ')) html += `<h4 class="font-headline-sm text-headline-sm text-brand-navy mt-8 mb-3">${inline(line.slice(5), imgBase)}</h4>`;
    else if (line.startsWith('### '))  html += `<h3 class="font-headline-md text-headline-md text-brand-navy mt-10 mb-4">${inline(line.slice(4), imgBase)}</h3>`;
    else if (line.startsWith('## '))   html += `<h2 class="font-headline-lg text-headline-lg text-brand-navy mt-12 mb-6 border-b border-outline/20 pb-4">${inline(line.slice(3), imgBase)}</h2>`;
    else if (line.startsWith('# '))    { /* title already in header */ }
    else if (line.startsWith('> '))    html += `<blockquote class="my-12 pl-6 border-l-[4px] border-accent py-2"><p class="font-headline-md text-headline-md text-brand-navy italic">${inline(line.slice(2), imgBase)}</p></blockquote>`;
    else if (/^-{3,}$/.test(line.trim())) html += `<hr class="border-t border-outline/20 my-8" />`;
    else if (line.trim() === '')       { /* skip */ }
    else html += `<p class="font-body-md text-body-md mb-6 leading-relaxed">${inline(line, imgBase)}</p>`;

    i++;
  }

  return html;
}

init();
