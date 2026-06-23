async function render() {
  const [{ topics }, config] = await Promise.all([
    fetch('./articles.json').then(r => r.json()),
    fetch('./site.json').then(r => r.json()),
  ]);

  const get = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);
  document.querySelectorAll('[data-config]').forEach(el => {
    el.textContent = get(config, el.dataset.config) ?? '';
  });
  document.querySelectorAll('[data-config-href]').forEach(el => {
    el.href = get(config, el.dataset.configHref) ?? '';
  });
  document.querySelectorAll('[data-config-bg]').forEach(el => {
    el.style.backgroundImage = `url('${get(config, el.dataset.configBg) ?? ''}')`;
  });

  const socialsEl = document.getElementById('footer-socials');
  if (socialsEl && config.socials) {
    socialsEl.innerHTML = config.socials.map(s =>
      `<a class="text-surface-variant hover:underline decoration-primary underline-offset-4 transition-all" href="${s.url}">${s.label}</a>`
    ).join('');
  }

  const navLinks = document.querySelectorAll('nav a[data-section]');
  const activeOn = ['text-primary', 'font-bold', 'border-b-2', 'border-primary', 'pb-1'];
  const activeOff = ['text-on-surface-variant'];
  const setActive = id => navLinks.forEach(a => {
    const on = a.dataset.section === id;
    activeOn.forEach(c => a.classList.toggle(c, on));
    activeOff.forEach(c => a.classList.toggle(c, !on));
  });
  setActive('hero');
  const observer = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
    { rootMargin: '-40% 0px -40% 0px' }
  );
  ['hero', 'articles-section', 'epilogue'].forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  const root = document.getElementById('articles-root');
  const corners = ['grid-plus-tl', 'grid-plus-tr', 'grid-plus-bl', 'grid-plus-br', 'grid-plus-tl', 'grid-plus-tr'];
  const allArticles = [];

  topics.forEach((topic, ti) => {
    const { topicName, main, subs } = topic;
    const toRaw = url => url?.replace(/github\.com\/(.*?)\/tree\//, 'raw.githubusercontent.com/$1/') || `https://picsum.photos/seed/${encodeURIComponent(topicName)}/800/600`;

    allArticles.push({ ...main, topicName });
    subs.forEach(s => allArticles.push({ ...s, topicName }));

    root.insertAdjacentHTML('beforeend', `
      <div class="${ti > 0 ? 'border-t border-surface-variant pt-section-gap' : ''} mb-8">
        <span class="text-primary font-label-md text-label-md uppercase tracking-widest font-bold">${topicName}</span>
        <div class="w-16 h-0.5 bg-primary mt-2"></div>
      </div>`);

    root.insertAdjacentHTML('beforeend', `
      <article data-path="${main.articlePath}" class="mb-16 border border-surface-variant group cursor-pointer hover:border-primary transition-colors duration-300 relative" onclick="location.href='reading.html?path=${encodeURIComponent(main.articlePath)}'">
        <div class="absolute -top-3 -left-3 text-surface-variant">+</div>
        <div class="absolute -top-3 -right-3 text-surface-variant">+</div>
        <div class="absolute -bottom-3 -left-3 text-surface-variant">+</div>
        <div class="absolute -bottom-3 -right-3 text-surface-variant">+</div>
        <div class="grid grid-cols-1 lg:grid-cols-2">
          <div class="h-96 lg:h-auto border-b lg:border-b-0 lg:border-r border-surface-variant relative overflow-hidden">
            <img class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" src="${toRaw(main.coverUrl)}" />
          </div>
          <div class="p-12 flex flex-col justify-center">
            <div class="flex items-center gap-4 mb-6">
              <span class="text-primary font-label-md text-label-md uppercase tracking-widest font-bold">${topicName}</span>
            </div>
            <h3 class="text-headline-lg font-headline-lg mb-6 group-hover:text-primary transition-colors duration-300">${main.name}</h3>
            <p class="text-body-lg font-body-lg text-on-surface-variant mb-8 line-clamp-3">${main.abstract}</p>
            <div class="mt-auto flex items-center gap-2 text-on-surface font-label-md text-label-md uppercase tracking-widest group-hover:text-primary transition-colors">
              Read Insight <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>
        </div>
      </article>`);

    const subCard = (sub, si) => `
      <article data-path="${sub.articlePath}" class="border border-surface-variant group cursor-pointer hover:border-primary transition-colors duration-300 flex flex-col relative grid-plus ${corners[si % corners.length]}" onclick="location.href='reading.html?path=${encodeURIComponent(sub.articlePath)}'">
        <div class="h-64 border-b border-surface-variant overflow-hidden">
          <img class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" src="${toRaw(sub.coverUrl)}" />
        </div>
        <div class="p-8 flex flex-col flex-grow">
          <span class="text-primary font-label-md text-label-md uppercase tracking-widest font-bold mb-4">${topicName}</span>
          <h3 class="text-headline-md font-headline-md mb-4 group-hover:text-primary transition-colors duration-300 line-clamp-2">${sub.name}</h3>
          <p class="text-body-md font-body-md text-on-surface-variant line-clamp-2 mt-auto">${sub.abstract}</p>
        </div>
      </article>`;

    const visible = subs.slice(0, 6);
    const hidden = subs.slice(6);
    const hasMore = hidden.length > 0;

    let html = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter ${hasMore ? 'mb-4' : 'mb-section-gap'}">${visible.map(subCard).join('')}</div>`;

    if (hasMore) {
      html += `
        <div id="subs-hidden-${ti}" class="subs-hidden hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter mb-4">${hidden.map((s, i) => subCard(s, i + 6)).join('')}</div>
        <div id="subs-btn-${ti}" class="flex justify-center mb-section-gap">
          <button onclick="expandSubs(${ti})" class="border border-primary text-primary font-label-md text-label-md uppercase tracking-widest px-8 py-3 hover:bg-primary hover:text-on-primary transition-colors">
            EXPAND TO READ MORE
          </button>
        </div>`;
    }

    root.insertAdjacentHTML('beforeend', html);
  });

  setupSearch(allArticles);
}

window.expandSubs = function (ti) {
  document.getElementById(`subs-hidden-${ti}`)?.classList.remove('hidden', 'subs-hidden');
  const btn = document.getElementById(`subs-btn-${ti}`);
  if (btn) btn.innerHTML = `
    <button onclick="collapseSubs(${ti})" class="border border-outline text-on-surface-variant font-label-md text-label-md uppercase tracking-widest px-8 py-3 hover:border-primary hover:text-primary transition-colors">
      COLLAPSE
    </button>`;
};

window.collapseSubs = function (ti) {
  const grid = document.getElementById(`subs-hidden-${ti}`);
  if (grid) { grid.classList.add('hidden', 'subs-hidden'); }
  const btn = document.getElementById(`subs-btn-${ti}`);
  if (btn) btn.innerHTML = `
    <button onclick="expandSubs(${ti})" class="border border-primary text-primary font-label-md text-label-md uppercase tracking-widest px-8 py-3 hover:bg-primary hover:text-on-primary transition-colors">
      EXPAND TO READ MORE
    </button>`;
};

function setupSearch(allArticles) {
  const icon = document.querySelector('[data-icon="search"]');
  if (!icon) return;

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'SEARCH';
  input.className = 'hidden border-b border-on-surface bg-transparent font-label-md text-label-md uppercase tracking-widest outline-none w-40 py-1 text-on-surface placeholder:text-on-surface-variant';
  icon.insertAdjacentElement('afterend', input);

  icon.addEventListener('click', () => {
    input.classList.toggle('hidden');
    if (!input.classList.contains('hidden')) input.focus();
  });

  function doSearch() {
    const q = input.value.trim().toLowerCase();
    if (!q) return;

    const matches = allArticles.filter(a =>
      a.name.toLowerCase().includes(q) || a.abstract.toLowerCase().includes(q)
    );
    if (!matches.length) return;

    // Expand hidden sections containing matches
    matches.forEach(m => {
      const el = document.querySelector(`article[data-path="${m.articlePath}"]`);
      const hiddenGrid = el?.closest('.subs-hidden');
      if (hiddenGrid) expandSubs(Number(hiddenGrid.id.replace('subs-hidden-', '')));
    });

    // Scroll to nearest match relative to current viewport center
    const vy = window.scrollY + window.innerHeight / 2;
    let nearest = null, minDist = Infinity;
    matches.forEach(m => {
      const el = document.querySelector(`article[data-path="${m.articlePath}"]`);
      if (!el) return;
      const center = window.scrollY + el.getBoundingClientRect().top + el.offsetHeight / 2;
      const dist = Math.abs(center - vy);
      if (dist < minDist) { minDist = dist; nearest = el; }
    });

    nearest?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input.classList.add('hidden');
    input.value = '';
  }

  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
}

render();
