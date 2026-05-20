(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const home = $('#home');
  const results = $('#results');
  const input1 = $('#search-input');
  const input2 = $('#search-input-2');
  const form1 = $('#search-form');
  const form2 = $('#search-form-2');
  const suggestions = $('#suggestions');
  const statsEl = $('#results-stats');

  /* ============== SUGGESTIONS ============== */
  const SUGGESTION_POOL = [
    { text: 'wladimir cantú data scientist', icon: '🔍' },
    { text: 'wladimir proyectos machine learning', icon: '📊' },
    { text: 'wladimir cantú linkedin', icon: '💼' },
    { text: 'wladimir python pandas xgboost', icon: '🐍' },
    { text: 'wladimir solana foundation developer', icon: '◎' },
    { text: 'wladimir cantú gps-i telemetría', icon: '📡' },
    { text: 'wladimir cantú a/b testing experimentos', icon: '🧪' },
    { text: 'wladimir llm openai anthropic', icon: '🤖' },
    { text: 'wladimir tableau power bi dashboards', icon: '📈' },
    { text: 'wladimir contacto email', icon: '✉️' }
  ];

  function renderSuggestions(query) {
    const q = query.toLowerCase().trim();
    const list = q
      ? SUGGESTION_POOL.filter(s => s.text.includes(q)).slice(0, 7)
      : SUGGESTION_POOL.slice(0, 7);
    if (!list.length) { suggestions.classList.remove('open'); return; }
    suggestions.innerHTML = list.map(s => `
      <div class="suggestion" data-text="${s.text}">
        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#9aa0a6" d="M15.5,14h-0.79l-0.28,-0.27C15.41,12.59 16,11.11 16,9.5 16,5.91 13.09,3 9.5,3S3,5.91 3,9.5 5.91,16 9.5,16c1.61,0 3.09,-0.59 4.23,-1.57l0.27,0.28v0.79l5,4.99L20.49,19l-4.99,-5zm-6,0C7.01,14 5,11.99 5,9.5S7.01,5 9.5,5 14,7.01 14,9.5 11.99,14 9.5,14z"/></svg>
        <span>${s.text}</span>
      </div>
    `).join('');
    suggestions.classList.add('open');
  }

  input1.addEventListener('focus', () => renderSuggestions(input1.value));
  input1.addEventListener('input', () => renderSuggestions(input1.value));
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#search-form')) suggestions.classList.remove('open');
  });
  suggestions.addEventListener('click', (e) => {
    const item = e.target.closest('.suggestion');
    if (!item) return;
    input1.value = item.dataset.text;
    suggestions.classList.remove('open');
    goToResults(input1.value);
  });

  /* ============== NAVIGATION ============== */
  function goToResults(query) {
    const q = (query || '').trim() || 'wladimir cantú';
    input2.value = q;
    home.classList.remove('active');
    results.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'instant' });
    updateStats(q);
    highlightMatches(q);
  }

  function goHome() {
    results.classList.remove('active');
    home.classList.add('active');
    input1.value = '';
    suggestions.classList.remove('open');
    closeAllExpansions();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  form1.addEventListener('submit', (e) => {
    e.preventDefault();
    goToResults(input1.value);
  });
  form2.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input2.value.trim();
    updateStats(q);
    highlightMatches(q);
    filterBySearch(q);
  });

  $('#lucky-btn').addEventListener('click', () => {
    goToResults('wladimir cantú data scientist');
    setTimeout(() => {
      const card = $('#card-sobre-mi');
      const link = card.querySelector('.expand-link');
      toggleExpansion(link);
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  });

  $('#logo-home').addEventListener('click', (e) => { e.preventDefault(); goHome(); });
  $('#clear-btn').addEventListener('click', () => {
    input2.value = '';
    input2.focus();
    clearHighlights();
    showAllCards();
    updateStats('');
  });

  // Nav links on home jump to results page + open section
  $$('.nav-link, .paa-item, .related-item').forEach(el => {
    el.addEventListener('click', (e) => {
      const target = el.dataset.jump;
      if (!target) return;
      e.preventDefault();
      if (!results.classList.contains('active')) goToResults('wladimir cantú');
      setTimeout(() => jumpToSection(target), 200);
    });
  });

  function jumpToSection(section) {
    const card = $(`#card-${section}`);
    if (!card) return;
    // Activate corresponding tab
    $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.filter === section));
    showAllCards();
    const link = card.querySelector('.expand-link');
    if (link && !$(link.dataset && '#' + link.dataset.target)?.classList.contains('open')) {
      toggleExpansion(link, true);
    }
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ============== EXPANSION ============== */
  function closeAllExpansions() {
    $$('.expansion.open').forEach(e => e.classList.remove('open'));
  }

  function toggleExpansion(linkEl, forceOpen = false) {
    const targetId = linkEl.dataset.target;
    const exp = $('#' + targetId);
    if (!exp) return;
    if (forceOpen) {
      exp.classList.add('open');
    } else {
      exp.classList.toggle('open');
    }
  }

  $$('.expand-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      toggleExpansion(link);
    });
  });

  /* ============== TABS / FILTER ============== */
  $$('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('tab--more')) return;
      $$('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      filterBySection(filter);
    });
  });

  function filterBySection(filter) {
    $$('.result-card[data-section]').forEach(card => {
      const show = filter === 'todo' || card.dataset.section === filter;
      card.style.display = show ? '' : 'none';
    });
    // Always show PAA and related on "todo"
    const paa = $('.paa-card');
    const related = $('.related-card');
    if (paa) paa.style.display = filter === 'todo' ? '' : 'none';
    if (related) related.style.display = filter === 'todo' ? '' : 'none';
  }

  function showAllCards() {
    $$('.result-card, .related-card').forEach(c => c.style.display = '');
    $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.filter === 'todo'));
  }

  function filterBySearch(query) {
    const q = query.toLowerCase().trim();
    if (!q) { showAllCards(); return; }
    $$('.result-card[data-section]').forEach(card => {
      const txt = card.innerText.toLowerCase();
      card.style.display = txt.includes(q) ? '' : 'none';
    });
  }

  /* ============== STATS ============== */
  function randInt(min, max) { return Math.floor(Math.random() * (max - min) + min); }
  function updateStats(query) {
    const q = (query || 'wladimir cantú').trim();
    const count = (randInt(120, 9800) * 100000).toLocaleString('en-US');
    const time = (Math.random() * 0.6 + 0.18).toFixed(2);
    statsEl.textContent = `Aproximadamente ${count} resultados para "${q}" (${time} segundos)`;
  }

  /* ============== HIGHLIGHT ============== */
  function clearHighlights() {
    $$('.highlight').forEach(h => {
      const parent = h.parentNode;
      parent.replaceChild(document.createTextNode(h.textContent), h);
      parent.normalize();
    });
  }

  function highlightMatches(query) {
    clearHighlights();
    const q = (query || '').trim();
    if (!q || q.length < 3) return;
    const terms = q.toLowerCase().split(/\s+/).filter(t => t.length >= 3);
    if (!terms.length) return;

    $$('.result-snippet, .result-title a').forEach(node => {
      walkAndHighlight(node, terms);
    });
  }

  function walkAndHighlight(root, terms) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach(node => {
      const text = node.textContent;
      const lower = text.toLowerCase();
      let matchedIdx = -1;
      let matchedTerm = '';
      for (const t of terms) {
        const i = lower.indexOf(t);
        if (i !== -1 && (matchedIdx === -1 || i < matchedIdx)) {
          matchedIdx = i;
          matchedTerm = t;
        }
      }
      if (matchedIdx === -1) return;
      const before = text.slice(0, matchedIdx);
      const match = text.slice(matchedIdx, matchedIdx + matchedTerm.length);
      const after = text.slice(matchedIdx + matchedTerm.length);
      const frag = document.createDocumentFragment();
      if (before) frag.appendChild(document.createTextNode(before));
      const span = document.createElement('span');
      span.className = 'highlight';
      span.textContent = match;
      frag.appendChild(span);
      if (after) frag.appendChild(document.createTextNode(after));
      node.parentNode.replaceChild(frag, node);
    });
  }

  /* ============== VOICE STUB ============== */
  $('#voice-btn').addEventListener('click', () => {
    const phrases = ['wladimir cantú data scientist', 'proyectos de wladimir', 'soft skills de wladimir'];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    input1.value = '';
    let i = 0;
    const interval = setInterval(() => {
      input1.value += phrase[i];
      i++;
      if (i >= phrase.length) {
        clearInterval(interval);
        setTimeout(() => goToResults(phrase), 400);
      }
    }, 60);
  });

  /* ============== KEYBOARD ============== */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      suggestions.classList.remove('open');
      if (results.classList.contains('active')) goHome();
    }
    if (e.key === '/' && document.activeElement === document.body) {
      e.preventDefault();
      if (home.classList.contains('active')) input1.focus();
      else input2.focus();
    }
  });
})();
