async function render() {
  const [{ topics }, config] = await Promise.all([
    fetch('articles.json').then(r => r.json()),
    fetch('site.json').then(r => r.json()),
  ]);

  // Populate data-config elements
  const get = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);
  document.querySelectorAll('[data-config]').forEach(el => {
    el.textContent = get(config, el.dataset.config) ?? '';
  });

  // Render social links in footer
  const socialsEl = document.getElementById('footer-socials');
  if (socialsEl && config.socials) {
    socialsEl.innerHTML = config.socials.map(s =>
      `<a class="text-surface-variant hover:underline decoration-primary underline-offset-4 transition-all" href="${s.url}">${s.label}</a>`
    ).join('');
  }

  // Scroll-spy: highlight active nav item
  const navLinks = document.querySelectorAll('nav a[data-section]');
  const activeOn  = ['text-primary', 'font-bold', 'border-b-2', 'border-primary', 'pb-1'];
  const activeOff = ['text-on-surface-variant'];

  const setActive = id => navLinks.forEach(a => {
    const on = a.dataset.section === id;
    activeOn.forEach(c  => a.classList.toggle(c, on));
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

  // Render articles
  const root = document.getElementById('articles-root');
  const corners = ['grid-plus-tl', 'grid-plus-tr', 'grid-plus-bl', 'grid-plus-br', 'grid-plus-tl', 'grid-plus-tr'];

  topics.forEach((topic, ti) => {
    const { topicName, main, subs } = topic;
    const imgSeed = s => encodeURIComponent(s);

    root.insertAdjacentHTML('beforeend', `
      <div class="${ti > 0 ? 'border-t border-surface-variant pt-section-gap' : ''} mb-8">
        <span class="text-primary font-label-md text-label-md uppercase tracking-widest font-bold">${topicName}</span>
        <div class="w-16 h-0.5 bg-primary mt-2"></div>
      </div>`);

    root.insertAdjacentHTML('beforeend', `
      <article class="mb-16 border border-surface-variant group cursor-pointer hover:border-primary transition-colors duration-300 relative" onclick="location.href='reading.html?path=${encodeURIComponent(main.articlePath)}'" >
        <div class="absolute -top-3 -left-3 text-surface-variant">+</div>
        <div class="absolute -top-3 -right-3 text-surface-variant">+</div>
        <div class="absolute -bottom-3 -left-3 text-surface-variant">+</div>
        <div class="absolute -bottom-3 -right-3 text-surface-variant">+</div>
        <div class="grid grid-cols-1 lg:grid-cols-2">
          <div class="h-96 lg:h-auto border-b lg:border-b-0 lg:border-r border-surface-variant relative overflow-hidden">
            <img class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
              src="https://picsum.photos/seed/${imgSeed(topicName + '-main')}/800/600" />
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

    const subsHtml = subs.map((sub, si) => `
      <article class="border border-surface-variant group cursor-pointer hover:border-primary transition-colors duration-300 flex flex-col relative grid-plus ${corners[si % corners.length]}" onclick="location.href='reading.html?path=${encodeURIComponent(sub.articlePath)}'" >
        <div class="h-64 border-b border-surface-variant overflow-hidden">
          <img class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            src="https://picsum.photos/seed/${imgSeed(topicName + '-sub' + si)}/400/300" />
        </div>
        <div class="p-8 flex flex-col flex-grow">
          <span class="text-primary font-label-md text-label-md uppercase tracking-widest font-bold mb-4">${topicName}</span>
          <h3 class="text-headline-md font-headline-md mb-4 group-hover:text-primary transition-colors duration-300 line-clamp-2">${sub.name}</h3>
          <p class="text-body-md font-body-md text-on-surface-variant line-clamp-2 mt-auto">${sub.abstract}</p>
        </div>
      </article>`).join('');

    root.insertAdjacentHTML('beforeend', `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter mb-section-gap">${subsHtml}</div>`);
  });
}

render();
