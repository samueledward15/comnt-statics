// Comnt Academy · Trusses Lab — app shell, router, lessons and widgets
import { solve, svg, key, state, fmt, counts } from './truss.js';
import { LESSONS, VIDEOS, MODELS, WALK1, FACTS } from './content.js';
import { labs } from './labs.js';
import { practice } from './practice.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const app = $('#app');
const FACE = n => `assets/faces/${n}.svg`;

// ---------- Saved progress (this device only) ----------
const STORE = 'comnt-trusses-v1';
const S = Object.assign({ done: {}, quiz: {}, comments: {}, visited: {}, theme: null }, JSON.parse(safeGet() || '{}'));
function safeGet() { try { return localStorage.getItem(STORE); } catch { return null; } }
function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch { /* private mode */ } }

// ---------- Theme ----------
function applyTheme() {
  const t = S.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = t;
  $('#logo').src = t === 'dark' ? 'assets/logo/comnt-logo-animated-reverse.svg' : 'assets/logo/comnt-logo-animated.svg';
  $('meta[name="theme-color"]').content = t === 'dark' ? '#22375C' : '#FFFBF3';
}
$('#themeBtn').addEventListener('click', () => {
  S.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; save(); applyTheme(); route();
});

// ---------- Toast ----------
let toastT;
function toast(msg, face = 'laugh') {
  const el = $('#toast'); el.innerHTML = `<img src="${FACE(face)}" alt=""><span>${msg}</span>`;
  el.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('is-on'), 2600);
}

// ---------- Progress ring ----------
function progress() {
  const n = LESSONS.filter(l => S.done[l.id]).length, p = n / LESSONS.length, C = 2 * Math.PI * 17;
  $('#ring').innerHTML = `<svg viewBox="0 0 44 44" width="44" height="44"><circle cx="22" cy="22" r="17" fill="var(--surface-raised)" stroke="var(--outline)" stroke-width="3"/><circle cx="22" cy="22" r="17" fill="none" stroke="var(--mint)" stroke-width="6" stroke-dasharray="${C * p} ${C}" stroke-linecap="round"/></svg><span>${n}/${LESSONS.length}</span>`;
  $('#ring').title = `${n} of ${LESSONS.length} lessons done`;
}

// ---------- Router ----------
const ROUTES = { '': home, learn, lesson, videos, labs: arg => labs(app, arg, { toast }), games: () => soon('games'), practice: arg => practice(app, arg, { toast, S, save }) };
function route() {
  const [, page = '', arg] = location.hash.replace(/^#/, '').split('/');
  const fn = ROUTES[page] || home;
  app.innerHTML = ''; fn(arg);
  $$('[data-nav]').forEach(a => a.toggleAttribute('aria-current', a.dataset.nav === (page === 'lesson' ? 'learn' : page)));
  $$('[data-nav][aria-current]').forEach(a => a.setAttribute('aria-current', 'page'));
  progress(); window.scrollTo({ top: 0 });
  document.title = (page ? cap(page === 'lesson' ? (LESSONS[arg - 1]?.title || 'Lesson') : page) + ' · ' : '') + 'Trusses Lab · Comnt Academy';
}
const cap = s => s[0].toUpperCase() + s.slice(1);
// pages that keep their own titles
addEventListener('hashchange', route);

// ---------- Icons ----------
const ICON = {
  concept: '<svg viewBox="0 0 20 20"><path d="M10 2.5a5.5 5.5 0 0 0-3.2 10v2h6.4v-2A5.5 5.5 0 0 0 10 2.5zM7.5 17.5h5"/></svg>',
  try: '<svg viewBox="0 0 20 20"><path d="M4 16l2-6 8-8 4 4-8 8zM4 16l6-2"/></svg>',
  trap: '<svg viewBox="0 0 20 20"><path d="M10 2.5l8 14.5H2z M10 8v4"/><circle cx="10" cy="14.6" r="1.1" fill="currentColor"/></svg>',
  khamseena: '<svg viewBox="0 0 20 20"><path d="M5 3h10c0 3-2.6 4.5-2.6 7.5S14 15 14 17H6c0-2 1.6-3.5 1.6-6.5S5 6 5 3z M6.6 6.5h6.8"/></svg>',
  tea: '<svg viewBox="0 0 20 20"><path d="M5 7h10l-1.2 9H6.2z M3 17.5h14 M8 5c-1-1.5 1-2 0-3.5 M12 5c-1-1.5 1-2 0-3.5"/></svg>',
  comment: '<svg viewBox="0 0 20 20"><path d="M3 9c0-3.3 3-5.5 7-5.5s7 2.2 7 5.5-3 5.5-7 5.5c-.9 0-1.8-.1-2.6-.3L4 16l.9-3C3.7 12 3 10.6 3 9z"/></svg>',
  video: '<svg viewBox="0 0 20 20"><rect x="2.5" y="4.5" width="15" height="11" rx="3"/><path d="M8.5 8v4l3.5-2z"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z"/></svg>',
};
const CHIP = {
  concept: ['mt-chip--sky', 'Concept'], try: ['mt-chip--try', 'Try this!'], trap: ['mt-chip--trap', 'Exam Trap!'],
  khamseena: ['mt-chip--khamseena', 'In a Khamseena'], tea: ['mt-chip--tea', 'Tea Break'], comment: ['mt-chip--comment', 'Leave a Comment!'], video: ['mt-chip--cream', 'Watch'],
};
const chip = (k, label) => `<span class="mt-chip ${CHIP[k][0]}">${ICON[k] || ''}${label || CHIP[k][1]}</span>`;
const glass = `<svg viewBox="0 0 20 24" aria-hidden="true"><path d="M3 2h14c0 4-3.4 6-3.4 10S16 18.5 16 22H4c0-3.5 2.4-6 2.4-10S3 6 3 2z M5 6.5h10 M7.5 22v-3 M12.5 22v-3"/></svg>`;

// =====================================================================
// HOME
// =====================================================================
function home() {
  const next = LESSONS.find(l => !S.done[l.id]) || LESSONS[0];
  const started = Object.keys(S.visited).length > 0;
  const fact = FACTS[Math.floor(Math.random() * FACTS.length)];
  const r = solve(MODELS.pratt);
  app.innerHTML = `
  <section class="hero">
    <div>
      <div class="kicker">Statics · Chapter 5 · Hibbeler Ch. 6</div>
      <h1 class="hero__title">Trusses <span>Lab</span></h1>
      <p class="hero__ar ar">جهّز الشاي وتعالى نفهم الـ Trusses سوا: نشرح، نجرّب بإيدينا، ونحلّ زي الامتحان.</p>
      <div class="hero__cta">
        <a class="mt-btn" href="#/lesson/${next.id}">${started ? 'Continue' : 'Start learning'} · L${next.id}</a>
        <a class="mt-btn mt-btn--secondary" href="#/learn">All lessons</a>
        <button class="mt-btn mt-btn--secondary install" id="installBtn">Install app</button>
      </div>
    </div>
    <div class="hero__art">${svg(MODELS.pratt, { forces: r.forces, labels: false, hideLoads: true, width: 520, height: 230, pad: 34, uid: 'h', aria: 'A Pratt bridge truss: green members in tension, red in compression' })}
      <img class="hero__face" src="${FACE('tea')}" alt="Dr. Mint with his tea">
    </div>
  </section>

  <section class="block">
    <div class="block__head"><h2>Your path</h2><span class="badge">6 lessons · ~80 min</span></div>
    <div class="path">${LESSONS.map(lcard).join('')}</div>
  </section>

  <section class="block grid2">
    <div class="khamseena">${glass}<div><div class="khamseena__k">في الخمسينة</div><div class="khamseena__t">${fact}</div></div></div>
    <div class="card card--soft stack">
      <h3>Studying on your own?</h3>
      <div class="ar" style="font-size:16px">
        <p style="margin:0">امشي على الدروس بالترتيب. كل درس فيه: شرح ← تجربة بإيدك ← فخ امتحان ← استراحة شاي ← أسئلة ← فيديوهات ← كومنت.</p>
        <p style="margin:8px 0 0">تقدّمك بيتحفظ على الجهاز ده لوحده. ولو ضفت التطبيق للشاشة الرئيسية، هيشتغل حتى من غير نت (ما عدا الفيديوهات).</p>
      </div>
    </div>
  </section>

  <section class="block">
    <div class="block__head"><h2>Labs & what’s next</h2></div>
    <div class="grid3">
      ${soonCard('labs', 'Virtual Labs <span class="badge badge--done">New</span>', 'Truss Builder · Joint Lab · Section Cutter — open now.', 'wow')}
      ${soonCard('practice', 'Examples & Practice <span class="badge badge--done">New</span>', '6 solved examples step by step + Assignment 5 (5-1 to 5-8) with hints.', 'think')}
      ${soonCard('games', 'Games', 'Zero-Force Hunter, T or C?, Start Here and more.', 'starry')}
    </div>
  </section>`;
  bindInstall();
}
function lcard(l) {
  const done = S.done[l.id];
  return `<a class="lcard ${done ? 'is-done' : ''}" href="#/lesson/${l.id}">
    <div class="lcard__top"><span class="lcard__n">${done ? '✓' : l.id}</span><span class="badge ${done ? 'badge--done' : ''}">${done ? 'Done' : l.mins + ' min'}</span></div>
    <div class="lcard__title">${l.title}</div>
    <div class="lcard__ar">${l.ar}</div>
  </a>`;
}
function soonCard(href, title, text, face) {
  return `<a class="lcard" href="#/${href}"><div class="soon"><img src="${FACE(face)}" alt=""><div><div class="lcard__title">${title}</div><div class="muted" style="font-size:15px;margin-top:6px">${text}</div></div></div></a>`;
}

// =====================================================================
// LEARN (list)
// =====================================================================
function learn() {
  app.innerHTML = `<div class="lhead"><div><div class="kicker">Learn</div><h1>Six short lessons</h1><div class="lhead__ar">من «يعني إيه truss» لحد ما تطلّع الـ zero-force members بالنظر.</div></div><img class="lhead__face" src="${FACE('happy')}" alt=""></div>
  <div class="block path">${LESSONS.map(lcard).join('')}</div>`;
}

// =====================================================================
// LESSON
// =====================================================================
function lesson(id) {
  const L = LESSONS[(+id || 1) - 1]; if (!L) return home();
  S.visited[L.id] = 1; save();
  const prev = LESSONS[L.id - 2], next = LESSONS[L.id];
  app.innerHTML = `
  <nav class="crumbs"><a href="#/learn">Learn</a><span>›</span><span>Lesson ${L.id} of ${LESSONS.length}</span></nav>
  <header class="lhead"><div><div class="kicker">Lesson ${L.id} · ${L.mins} min</div><h1>${L.title}</h1><div class="lhead__ar">${L.ar}</div></div><img class="lhead__face" src="${FACE(L.face)}" alt="Dr. Mint"></header>
  <nav class="toc" aria-label="Sections">${L.sections.map(s => `<a href="#/lesson/${L.id}" data-go="${s.id}">${s.title}</a>`).join('')}</nav>
  <section class="block"><div class="card card--cream"><div class="kicker" style="margin-bottom:10px">By the end you can</div><ul class="objectives">${L.objectives.map(o => `<li>${o}</li>`).join('')}</ul></div></section>
  ${L.sections.map(s => `<section class="block" id="s-${s.id}"><div class="block__head" ${s.chip === 'trap' ? 'hidden' : ''}>${chip(s.chip, s.chip === 'concept' || s.chip === 'video' ? s.title : undefined)}${s.chip !== 'concept' && s.chip !== 'video' && CHIP[s.chip][1] !== s.title ? `<h3>${s.title}</h3>` : ''}</div><div class="stack">${s.blocks.map((b, i) => block(b, L, s, i)).join('')}</div></section>`).join('')}
  <div class="lfoot">
    ${prev ? `<a class="mt-btn mt-btn--secondary" href="#/lesson/${prev.id}">← L${prev.id}</a>` : '<span></span>'}
    <button class="mt-btn" id="doneBtn">${S.done[L.id] ? '✓ Done · ' : 'Mark as done'}${S.done[L.id] && next ? 'Next lesson →' : S.done[L.id] ? 'Back home' : ''}</button>
  </div>`;
  // section jump links (keep hash routing intact)
  $$('.toc a').forEach(a => a.addEventListener('click', e => { e.preventDefault(); $('#s-' + a.dataset.go).scrollIntoView({ behavior: 'smooth' }); }));
  const obs = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { $$('.toc a').forEach(a => a.classList.toggle('is-on', 's-' + a.dataset.go === en.target.id)); } }), { rootMargin: '-40% 0px -55% 0px' });
  $$('section[id^="s-"]').forEach(s => obs.observe(s));
  // mount widgets & interactive blocks
  $$('[data-widget]').forEach(el => WIDGETS[el.dataset.widget]?.(el));
  $$('[data-quiz]').forEach(el => mountQuiz(el, L));
  $$('[data-vid]').forEach(mountVideo);
  $$('[data-comment]').forEach(el => mountComment(el, L));
  $('#doneBtn').addEventListener('click', () => {
    if (S.done[L.id]) { location.hash = next ? `#/lesson/${next.id}` : '#/'; return; }
    S.done[L.id] = Date.now(); save(); progress();
    toast(next ? 'You got it! كده إنت فهمتها!' : 'All 6 lessons done! أنت جامد 🎉', next ? 'laugh' : 'starry');
    lesson(L.id);
  });
}

function block(b, L, s, i) {
  switch (b.type) {
    case 'explain': return `<div class="explain ar">${b.ar}</div>`;
    case 'formula': return `<div class="formula">${b.html}</div>`;
    case 'widget': return `<div data-widget="${b.id}"></div>`;
    case 'khamseena': return `<div class="khamseena">${glass}<div><div class="khamseena__k">في الخمسينة</div><div class="khamseena__t">${b.ar}</div></div></div>`;
    case 'trap': return `<div class="trap"><div class="trap__head"><img src="${FACE('glare')}" alt=""><b>Exam Trap!</b><span class="ar" style="margin-inline-start:auto;font-weight:700">فخ امتحان!</span></div><div class="trap__body"><div class="trap__bad"><div class="trap__lbl">✗ Common mistake</div><div class="ar">${b.bad}</div></div><div class="trap__good"><div class="trap__lbl">✓ Do this instead</div><div class="ar">${b.good}</div></div></div></div>`;
    case 'tea': return `<div class="tea"><div class="block__head" style="margin-bottom:10px">${chip('tea')}<span class="ar" style="font-weight:700">استراحة شاي: الخلاصة في ٣٠ ثانية</span></div><ul class="ar">${b.items.map(x => `<li><span>${x}</span></li>`).join('')}</ul></div>`;
    case 'quiz': return `<div data-quiz="${L.id}-${s.id}"></div>`;
    case 'videos': return `<div class="vids">${b.ids.map(id => `<div data-vid="${id}"></div>`).join('')}</div>`;
    case 'comment': return `<div data-comment="${L.id}" data-q="${encodeURIComponent(b.q)}"></div>`;
  }
  return '';
}

// ---------- Quiz ----------
function mountQuiz(el, L) {
  const [lid, sid] = el.dataset.quiz.split('-');
  const qs = L.sections.find(s => s.id === sid).blocks.find(b => b.type === 'quiz').qs;
  el.innerHTML = qs.map((q, qi) => `<div class="quiz" data-qi="${qi}" style="margin-top:${qi ? 14 : 0}px">
    <div class="quiz__count">Question ${qi + 1} of ${qs.length}</div>
    <p class="quiz__q">${q.q}</p>
    ${q.img ? `<div class="stage" style="margin-bottom:12px;max-width:520px">${svg(MODELS[q.img], { width: 520, height: 280, uid: 'q' + qi })}</div>` : ''}
    <div class="quiz__opts">${q.opts.map((o, oi) => `<button class="opt" data-oi="${oi}"><span class="opt__l">${'ABCD'[oi]}</span><span>${o}</span></button>`).join('')}</div>
    <div class="quiz__fb"></div></div>`).join('');
  $$('.quiz', el).forEach(box => {
    const qi = +box.dataset.qi, q = qs[qi], k = `${lid}-${sid}-${qi}`;
    const show = (oi, silent) => {
      $$('.opt', box).forEach((b, j) => { b.disabled = true; b.classList.toggle('is-right', j === q.a); b.classList.toggle('is-wrong', j === oi && oi !== q.a); });
      const ok = oi === q.a, fb = $('.quiz__fb', box);
      fb.innerHTML = `<img src="${FACE(ok ? 'laugh' : 'sweat')}" alt=""><div class="bubble ${ok ? 'bubble--mint' : 'bubble--soft'}"><b>${ok ? 'You got it! · كده إنت فهمتها!' : 'Not quite — here’s why:'}</b><div class="ar" style="margin-top:4px">${q.why}</div><button class="mt-btn mt-btn--ghost mt-btn--sm" data-retry style="padding:0;min-height:30px;margin-top:4px">Try again</button></div>`;
      fb.classList.add('is-on');
      $('[data-retry]', fb).onclick = () => { delete S.quiz[k]; save(); $$('.opt', box).forEach(b => { b.disabled = false; b.className = 'opt'; }); fb.classList.remove('is-on'); };
      if (!silent && ok) box.animate?.([{ transform: 'rotate(-0.6deg)' }, { transform: 'rotate(0.6deg)' }, { transform: 'none' }], { duration: 300 });
    };
    $$('.opt', box).forEach(b => b.addEventListener('click', () => { const oi = +b.dataset.oi; S.quiz[k] = oi; save(); show(oi); }));
    if (S.quiz[k] !== undefined) show(S.quiz[k], true);
  });
}

// ---------- Video (lite embed: loads YouTube only when tapped) ----------
function mountVideo(el) {
  const id = el.dataset.vid, v = VIDEOS[id];
  el.className = 'vid';
  el.innerHTML = `<div class="vid__frame"><img loading="lazy" src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt=""><button aria-label="Play: ${v.t}"><span>${ICON.play}</span></button></div>
  <div class="vid__body"><div class="vid__t">${v.t}</div><div class="vid__m"><span class="badge badge--lang">${v.lang === 'AR' ? 'عربي' : 'English'}</span><span>${v.ch}</span><span>· ${v.dur}</span></div><div class="vid__why">${v.why}</div></div>`;
  $('button', el).addEventListener('click', () => {
    $('.vid__frame', el).innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="${v.t}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  });
}

// ---------- Leave a Comment ----------
function mountComment(el, L) {
  const q = decodeURIComponent(el.dataset.q);
  el.innerHTML = `<div class="withface"><div class="cbox"><div class="cbox__q">${q}</div>
    <textarea dir="auto" placeholder="اكتب رأيك أو سؤالك هنا… / Write your answer…">${S.comments[L.id] || ''}</textarea>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;gap:8px;flex-wrap:wrap"><span class="ar" style="font-size:14px">بيتحفظ على جهازك. اسأل بيه المدرس في الحصة الجاية!</span><span class="saved">Saved ✓</span></div></div>
    <img src="${FACE('think')}" alt=""></div>`;
  let t; const ta = $('textarea', el), sv = $('.saved', el);
  ta.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { S.comments[L.id] = ta.value; save(); sv.classList.add('is-on'); setTimeout(() => sv.classList.remove('is-on'), 1200); }, 400); });
}

// =====================================================================
// VIDEOS page
// =====================================================================
function videos() {
  app.innerHTML = `<div class="lhead"><div><div class="kicker">Videos</div><h1>Watch & learn</h1><div class="lhead__ar">فيديوهات مختارة لكل درس، إنجليزي وعربي. الفيديو بيشتغل لما تدوس عليه بس، عشان يوفّر الباقة.</div></div><img class="lhead__face" src="${FACE('wow')}" alt=""></div>
  <div class="filters" role="group" aria-label="Language"><div class="seg"><button aria-pressed="true" data-f="all">All</button><button aria-pressed="false" data-f="EN">English</button><button aria-pressed="false" data-f="AR">عربي</button></div></div>
  <div id="vlist"></div>`;
  const draw = f => {
    $('#vlist').innerHTML = LESSONS.map(l => {
      const ids = Object.keys(VIDEOS).filter(id => VIDEOS[id].lesson === l.id && (f === 'all' || VIDEOS[id].lang === f));
      return ids.length ? `<section class="block"><div class="block__head"><span class="lcard__n">${l.id}</span><h3><a href="#/lesson/${l.id}" style="color:inherit;text-decoration:none">${l.title}</a></h3></div><div class="vids">${ids.map(id => `<div data-vid="${id}"></div>`).join('')}</div></section>` : '';
    }).join('');
    $$('[data-vid]').forEach(mountVideo);
  };
  $$('[data-f]').forEach(b => b.addEventListener('click', () => { $$('[data-f]').forEach(x => x.setAttribute('aria-pressed', x === b)); draw(b.dataset.f); }));
  draw('all');
}

// =====================================================================
// Coming-soon pages
// =====================================================================
function soon(kind) {
  const P = {
    labs: ['Virtual Labs', 'wow', 'Stage 2', 'هتبني أي truss بإيدك، تحط الأحمال والـ supports، وتشوف القوة في كل member بتتحسب على طول وهي بتتلوّن T أو C.', [['Truss Builder', 'ارسم، حمّل، وحلّ'], ['Joint Lab', 'وازن الأسهم لحد ΣF = 0'], ['Section Cutter', 'اقطع في أي حتة']], [5, 'cutter', 'Try the Section Cutter in Lesson 5']],
    practice: ['Examples & Practice', 'think', 'Stage 3', 'الأمثلة الـ 6 اللي في الملزمة متحلولة خطوة بخطوة على الرسمة، والـ assignments من 5-1 لـ 5-8 بنفس شكل الامتحان، فيها hint وحل كامل.', [['6 Solved Examples', 'Joints + Sections'], ['8 Assignments', 'MCQ زي الامتحان'], ['Hints & full solutions', 'مش هتتزنق']], [4, 'walk', 'Try Example 1 step by step in Lesson 4']],
    games: ['Games', 'starry', 'Stage 4', 'ألعاب سريعة تثبّت المعلومة: تلاقي الـ zero-force members، تخمّن T ولا C، وتختار أول joint تبدأ بيها.', [['Zero-Force Hunter', 'بالنظر وبس'], ['T or C?', 'اسحب يمين أو شمال'], ['Start Here', 'أنهي joint الأول؟']], [6, 'hunt', 'Play Zero-Force Hunter in Lesson 6']],
  }[kind];
  app.innerHTML = `<div class="lhead"><div><div class="kicker">${P[2]} · coming soon</div><h1>${P[0]}</h1><div class="lhead__ar">${P[3]}</div></div><img class="lhead__face" src="${FACE(P[1])}" alt=""></div>
  <div class="block grid3">${P[4].map(([a, b]) => `<div class="card"><h3>${a}</h3><div class="ar muted" style="margin-top:6px">${b}</div><span class="badge badge--soon" style="display:inline-block;margin-top:12px">Soon</span></div>`).join('')}</div>
  <div class="block withface"><div class="bubble bubble--soft"><b>Can’t wait?</b> A first taste is already inside the lessons.<div style="margin-top:12px"><a class="mt-btn mt-btn--sm" href="#/lesson/${P[5][0]}">${P[5][2]} →</a></div></div><img src="${FACE('wink')}" alt=""></div>`;
}

// =====================================================================
// WIDGETS
// =====================================================================
const WIDGETS = {};
const stage = (title, note, body, controls = '') => `<div class="stage"><div class="stage__bar"><div><div class="stage__title">${title}</div>${note ? `<div class="stage__note">${note}</div>` : ''}</div></div>${body}${controls}</div>`;
const legend = `<div class="legend"><span><i class="lt"></i>Tension (T)</span><span><i class="lc"></i>Compression (C)</span><span><i class="lz"></i>Zero</span></div>`;

// ----- 1. Anatomy of a truss (tap hotspots) -----
WIDGETS.anatomy = el => {
  const model = { joints: { A: [0, 0], B: [3, 0], C: [6, 0], D: [1.5, 1.2], E: [3, 2.4], F: [4.5, 1.2] },
    members: [['A', 'B'], ['B', 'C'], ['A', 'D'], ['D', 'E'], ['E', 'F'], ['F', 'C'], ['D', 'B'], ['E', 'B'], ['F', 'B']],
    supports: { A: 'pin', C: { dir: [0, 1] } }, loads: [{ at: 'E', f: [0, -1], label: 'P' }] };
  const INFO = {
    member: ['Member', 'قضيب مستقيم ورفيع. بيوصّل بين joint واحدة من كل ناحية، ويا إمّا مشدود (T) يا مكبوس (C).'],
    joint: ['Joint (pin)', 'نقطة التقاء الـ members. بنعاملها كأنها particle في equilibrium.'],
    pin: ['Pin support', 'بيمنع الحركة في x و y ← بيدي reaction-ين: X و Y.'],
    roller: ['Roller support', 'بيمنع الحركة عمودي على السطح بس ← بيدي reaction واحد.'],
    load: ['External load', 'الحمل الخارجي، ودايمًا بيبقى واقع على joint (افتراض مهم هنشوفه في درس 3).'],
  };
  const hot = (k, x, y, n) => `<g class="hot" data-k="${k}" tabindex="0" role="button" aria-label="${INFO[k][0]}"><circle class="pulse" cx="${x}" cy="${y}" r="15"/><text x="${x}" y="${y + 5}">${n}</text></g>`;
  el.innerHTML = stage('Anatomy of a truss', 'Tap the numbered dots · دوس على الأرقام', `<div class="grid2" style="align-items:center">
    <div>${svg(model, { labels: false, width: 560, height: 330, uid: 'an', overlay: (X, Y) =>
      hot('member', X(2.25) + 2, Y(1.8) - 2, 1) + hot('joint', X(3), Y(0) - 26, 2) + hot('pin', X(0) - 34, Y(0) + 24, 3) + hot('roller', X(6) + 34, Y(0) + 24, 4) + hot('load', X(3) + 24, Y(2.4) - 44, 5) })}</div>
    <div class="bubble bubble--soft ar" id="anInfo" aria-live="polite"><div class="bubble__who"><img src="${FACE('talk')}" alt="">Dr. Mint</div>دوس على أي رقم وأنا أقولك ده إيه 👆</div></div>`);
  $$('.hot', el).forEach(h => {
    const go = () => { $$('.hot', el).forEach(x => x.classList.toggle('is-on', x === h)); const [n, d] = INFO[h.dataset.k]; $('#anInfo', el).innerHTML = `<div class="bubble__who"><img src="${FACE('talk')}" alt="">${n}</div>${d}`; };
    h.addEventListener('click', go); h.addEventListener('keydown', e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), go()));
  });
};

// ----- 2. Square vs triangle -----
WIDGETS.squareTriangle = el => {
  el.innerHTML = stage('Push it!', 'Same push, two shapes · نفس الزقّة على الشكلين', `<div class="grid2"><div id="sq"></div><div id="tr"></div></div>`,
    `<div class="controls"><label class="range"><span>Push</span><input type="range" min="0" max="100" value="0" id="push" aria-label="Push force"><b id="pv">0</b></label>
     <button class="mt-btn mt-btn--secondary mt-btn--sm" id="brace" aria-pressed="false">+ Add a diagonal to the square</button></div><div class="readout" id="stro"></div>`);
  let braced = false;
  const draw = () => {
    const p = +$('#push', el).value / 100;
    $('#pv', el).textContent = Math.round(p * 100);
    const W = 300, H = 260, s = 150, x0 = 75, yb = 215;
    const phi = braced ? 0 : p * 0.62;
    const dx = s * Math.sin(phi), h = s * Math.cos(phi);
    const sqPts = [[x0, yb], [x0 + s, yb], [x0 + s + dx, yb - h], [x0 + dx, yb - h]];
    const bars = [[0, 1], [1, 2], [2, 3], [3, 0]];
    const col = st => st === 'T' ? 'var(--t-color)' : st === 'C' ? 'var(--c-color)' : 'var(--n-color)';
    const line = (a, b, c = 'var(--n-color)', w = 7) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
    const pins = pts => pts.map(q => `<circle cx="${q[0]}" cy="${q[1]}" r="7" fill="var(--surface-raised)" stroke="var(--outline)" stroke-width="3"/>`).join('');
    const ground = `<line x1="20" y1="${yb + 18}" x2="${W - 20}" y2="${yb + 18}" stroke="var(--n-color)" stroke-width="3"/>` + [x0, x0 + s].map(x => `<path d="M${x} ${yb} l-12 18 h24z" fill="var(--cream)" stroke="var(--outline)" stroke-width="3"/>`).join('');
    const pushArrow = (q) => p > 0.02 ? `<line x1="${q[0] - 30 - 40 * p}" y1="${q[1]}" x2="${q[0] - 12}" y2="${q[1]}" stroke="var(--cinnamon)" stroke-width="5" stroke-linecap="round" marker-end="url(#pa)"/>` : '';
    const defs = `<defs><marker id="pa" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="var(--cinnamon)"/></marker></defs>`;
    let sq = `<svg class="truss-svg" viewBox="0 0 ${W} ${H}">${defs}${ground}${bars.map(([a, b]) => line(sqPts[a], sqPts[b])).join('')}`;
    if (braced) sq += line(sqPts[0], sqPts[2], p > .02 ? col('T') : 'var(--n-color)');
    sq += pins(sqPts) + pushArrow(sqPts[3]) + `<text x="${W / 2}" y="28" text-anchor="middle" style="font:800 18px var(--font-brand);fill:var(--ink)">${braced ? 'Square + diagonal' : 'Square'}</text></svg>`;
    const tp = [[x0, yb], [x0 + s, yb], [x0 + s / 2, yb - 130]];
    let tr = `<svg class="truss-svg" viewBox="0 0 ${W} ${H}">${defs}${ground}${line(tp[0], tp[1], p > .02 ? col('T') : undefined)}${line(tp[0], tp[2], p > .02 ? col('T') : undefined)}${line(tp[1], tp[2], p > .02 ? col('C') : undefined)}${pins(tp)}${pushArrow(tp[2])}<text x="${W / 2}" y="28" text-anchor="middle" style="font:800 18px var(--font-brand);fill:var(--ink)">Triangle</text></svg>`;
    $('#sq', el).innerHTML = sq; $('#tr', el).innerHTML = tr;
    $('#stro', el).innerHTML = p < 0.02 ? `<span class="pill pill--info">Drag the slider to push both shapes</span>` :
      `<span class="pill ${braced ? 'pill--ok' : 'pill--bad'}">${braced ? 'Square + diagonal: rigid ✓' : 'Square: it folds! ✗'}</span><span class="pill pill--ok">Triangle: rigid ✓</span>${p > .02 ? legend : ''}`;
  };
  $('#push', el).addEventListener('input', draw);
  $('#brace', el).addEventListener('click', e => { braced = !braced; e.currentTarget.setAttribute('aria-pressed', braced); e.currentTarget.textContent = braced ? '− Remove the diagonal' : '+ Add a diagonal to the square'; draw(); if (braced) toast('Two triangles = rigid!', 'wow'); });
  draw();
};

// ----- 3. Trusses in real life (original flat illustrations) -----
WIDGETS.irl = el => {
  const sky = 'var(--comnt-sky)', nv = '#22375C', gr = '#7BB526';
  const ill = {
    bridge: `<svg viewBox="0 0 240 150"><rect width="240" height="150" fill="${sky}"/><rect y="118" width="240" height="32" fill="#4F84C4"/><rect x="0" y="100" width="34" height="50" fill="${gr}"/><rect x="206" y="100" width="34" height="50" fill="${gr}"/><g stroke="${nv}" stroke-width="4" stroke-linecap="round" fill="none"><path d="M24 100H216M44 60H196M24 100L44 60M216 100L196 60"/>${[44, 72, 100, 128, 156, 184].map((x, i) => `<path d="M${x + 28 * (i < 3 ? 0 : 1) - (i < 3 ? 0 : 28)} 60V100"/>`).join('')}<path d="M44 60L72 100M72 60L100 100M100 60L128 100M156 60L128 100M184 60L156 100M196 60L184 100M44 100V60"/></g><rect x="20" y="98" width="200" height="6" fill="${nv}"/></svg>`,
    roof: `<svg viewBox="0 0 240 150"><rect width="240" height="150" fill="${sky}"/><rect x="34" y="96" width="172" height="54" fill="#F3EAD7" stroke="${nv}" stroke-width="3"/><rect x="104" y="112" width="32" height="38" fill="${nv}"/><g stroke="${nv}" stroke-width="4" stroke-linecap="round" fill="none"><path d="M22 96H218L120 34Z"/><path d="M120 34V96M71 65L95 96L120 70L145 96L169 65"/></g><path d="M16 98L120 30L224 98" stroke="#E0604E" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    crane: `<svg viewBox="0 0 240 150"><rect width="240" height="150" fill="${sky}"/><rect y="132" width="240" height="18" fill="${gr}"/><g stroke="${nv}" stroke-width="3.5" stroke-linecap="round" fill="none"><path d="M86 132V36M104 132V36"/>${[132, 116, 100, 84, 68, 52].map(y => `<path d="M86 ${y}L104 ${y - 16}M86 ${y - 16}H104"/>`).join('')}<path d="M40 36H222M40 24H190M40 24V36M190 24L222 36"/>${[58, 76, 94, 112, 130, 148, 166, 184].map(x => `<path d="M${x - 18} 36L${x} 24L${x + 18} 36"/>`).join('')}<path d="M95 36V8M95 8L40 24M95 8L190 24"/><path d="M200 36V84"/></g><rect x="40" y="36" width="22" height="16" fill="#7B4B2A"/><rect x="190" y="84" width="20" height="14" rx="3" fill="#EF8575" stroke="${nv}" stroke-width="3"/></svg>`,
    pylon: `<svg viewBox="0 0 240 150"><rect width="240" height="150" fill="${sky}"/><rect y="134" width="240" height="16" fill="#C9A86B"/><g stroke="${nv}" stroke-width="3.5" stroke-linecap="round" fill="none"><path d="M92 134L112 20M148 134L128 20M112 20H128"/>${[[96, 114, 144, 114], [100, 92, 140, 92], [104, 70, 136, 70], [108, 48, 132, 48]].map(([a, b, c, d]) => `<path d="M${a} ${b}H${c}M${a} ${b}L${c - 4} ${b - 22}M${c} ${b}L${a + 4} ${b - 22}"/>`).join('')}<path d="M92 134L144 114M148 134L96 114"/><path d="M60 52H180M70 32H170M60 52L104 70M180 52L136 70M70 32L110 48M170 32L130 48"/></g><g fill="${nv}">${[60, 180, 70, 170].map((x, i) => `<circle cx="${x}" cy="${i < 2 ? 58 : 38}" r="4"/>`).join('')}</g><path d="M0 64Q30 74 60 58M180 58Q210 74 240 64M0 44Q35 52 70 38M170 38Q205 52 240 44" stroke="${nv}" stroke-width="1.5" fill="none"/></svg>`,
  };
  const cards = [['bridge', 'Bridges', 'كباري الحديد زي كوبري إمبابة: Pratt / Warren trusses'], ['roof', 'Roofs', 'سقف المخازن والمصانع والصالات: roof trusses'], ['crane', 'Tower cranes', 'ذراع ونش البرج في أي موقع إنشاء'], ['pylon', 'Power pylons', 'أبراج الكهربا الضغط العالي: space truss']];
  el.innerHTML = `<div class="irl">${cards.map(([k, n, a]) => `<figure>${ill[k]}<figcaption>${n}<span>${a}</span></figcaption></figure>`).join('')}</div>`;
};

// ----- 4. Grow a simple truss -----
function growModel(step) {
  const J = { A: [0, 0], B: [2, 0], C: [1, 1.6], D: [3, 1.6], E: [4, 0], F: [5, 1.6], G: [6, 0] };
  const order = [['D', ['B', 'D'], ['C', 'D']], ['E', ['B', 'E'], ['D', 'E']], ['F', ['D', 'F'], ['E', 'F']], ['G', ['E', 'G'], ['F', 'G']]];
  const joints = { A: J.A, B: J.B, C: J.C }; const members = [['A', 'B'], ['B', 'C'], ['A', 'C']];
  for (let i = 0; i < step; i++) { const [j, m1, m2] = order[i]; joints[j] = J[j]; members.push(m1, m2); }
  return { joints, members, supports: {}, loads: [] };
}
WIDGETS.grow = el => {
  let step = 0;
  el.innerHTML = stage('Grow a simple truss', 'Start: one triangle · كل خطوة: 2 members + 1 joint', `<div id="gsv"></div>`,
    `<div class="controls"><button class="mt-btn mt-btn--sm" id="gAdd">+ Add 2 members & 1 joint</button><button class="mt-btn mt-btn--secondary mt-btn--sm" id="gBack">Undo</button><button class="mt-btn mt-btn--ghost mt-btn--sm" id="gReset">Reset</button></div><div class="readout" id="gro"></div>`);
  const draw = () => {
    const mdl = growModel(step), { M, J } = counts(mdl);
    const newM = step ? mdl.members.slice(-2).map(([a, b]) => key(a, b)) : mdl.members.map(([a, b]) => key(a, b));
    $('#gsv', el).innerHTML = svg({ ...mdl, joints: { ...mdl.joints, _: [6, 0], __: [0, 1.6] } }, { highlightMembers: newM, width: 620, height: 250, pad: 40, uid: 'g' }).replace(/<g class="jnt[^"]*" data-j="_{1,2}">.*?<\/g>/g, '');
    $('#gro', el).innerHTML = `<span class="pill">J = <b>${J}</b></span><span class="pill">M = <b>${M}</b></span><span class="pill">2J − 3 = <b>${2 * J - 3}</b></span><span class="pill pill--ok">M = 2J − 3 ✓</span>`;
    $('#gAdd', el).disabled = step >= 4; $('#gBack', el).disabled = step === 0;
  };
  $('#gAdd', el).onclick = () => { step++; draw(); if (step === 4) toast('A Warren truss! Still simple ✓', 'wow'); };
  $('#gBack', el).onclick = () => { step--; draw(); };
  $('#gReset', el).onclick = () => { step = 0; draw(); };
  draw();
};

// ----- 5. Classify: unstable / simple / redundant -----
WIDGETS.countCheck = el => {
  const base = { A: [0, 0], B: [2, 0], C: [2, 2], D: [0, 2] }, sq = [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']];
  const items = [
    { m: { joints: base, members: [...sq, ['A', 'C']] }, a: 1 },
    { m: { joints: base, members: sq }, a: 0 },
    { m: { joints: base, members: [...sq, ['A', 'C'], ['B', 'D']] }, a: 2 },
  ];
  const L = ['Unstable', 'Simple', 'Redundant'];
  el.innerHTML = stage('Count & classify', 'Count J and M, then pick · عدّ وبعدين اختار', `<div class="grid3">${items.map((it, i) => `<div class="card" data-i="${i}" style="padding:12px">
    ${svg(it.m, { width: 240, height: 200, pad: 34, uid: 'cc' + i })}
    <div class="seg" style="display:flex;margin-top:8px">${L.map((l, j) => `<button style="flex:1;padding:10px 4px;font-size:13px" data-j="${j}" aria-pressed="false">${l}</button>`).join('')}</div>
    <div class="ar" data-fb style="margin-top:8px;font-size:14.5px;min-height:24px"></div></div>`).join('')}</div>`);
  $$('[data-i]', el).forEach(card => {
    const it = items[card.dataset.i], { M, J } = counts(it.m);
    $$('button', card).forEach(b => b.onclick = () => {
      const j = +b.dataset.j; $$('button', card).forEach(x => x.setAttribute('aria-pressed', x === b));
      const ok = j === it.a;
      $('[data-fb]', card).innerHTML = `<b>${ok ? '✓' : '✗'}</b> J = ${J} ، M = ${M} ، و 2J − 3 = ${2 * J - 3} ← ${['M أقل: الشكل هيتطبق', 'M = 2J − 3: simple و stable', 'M أكبر: فيه member زيادة (redundant)'][it.a]}`;
      b.style.background = ok ? 'var(--mint)' : 'var(--salmon)';
    });
  });
};

// ----- 6. Tension vs compression on a member and on the pins -----
WIDGETS.tension = el => {
  let view = 'pin';
  el.innerHTML = stage('Pull or push?', 'Slide right = pull (T), left = push (C)', `<div id="tsv"></div>`,
    `<div class="controls"><label class="range"><span>C</span><input type="range" min="-100" max="100" value="60" id="tf" aria-label="Member force"><span>T</span></label>
     <div class="seg"><button data-v="pin" aria-pressed="true">Forces on the pins</button><button data-v="mem" aria-pressed="false">Forces on the member</button></div></div><div class="readout" id="tro"></div>`);
  const draw = () => {
    const f = +$('#tf', el).value, st = state(f / 100 || 0), W = 640, H = 200, cy = 110;
    const stretch = f / 100 * 18, xA = 150 - stretch, xB = 490 + stretch;
    const c = st === 'T' ? 'var(--t-color)' : st === 'C' ? 'var(--c-color)' : 'var(--z-color)';
    const L = 16 + Math.abs(f) * 0.55;
    const arr = (x, dir) => Math.abs(f) < 3 ? '' : `<line x1="${dir > 0 ? x : x}" y1="${cy - 44}" x2="${x + dir * L}" y2="${cy - 44}" stroke="${c}" stroke-width="6" stroke-linecap="round" marker-end="url(#tm)"/>`;
    // on pins: T pulls pin toward member (A → right, B → left). On member: T pulls member ends outward.
    const s = st === 'T' ? 1 : -1;
    const arrows = view === 'pin' ? arr(xA, s) + arr(xB, -s) : arr(xA + 40, -s) + arr(xB - 40, s);
    $('#tsv', el).innerHTML = `<svg class="truss-svg" viewBox="0 0 ${W} ${H}"><defs><marker id="tm" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${c}"/></marker></defs>
      <rect x="${xA}" y="${cy - 9}" width="${xB - xA}" height="18" rx="9" fill="${c}" stroke="var(--outline)" stroke-width="3" opacity="${view === 'pin' ? .35 : 1}"/>
      ${[xA, xB].map(x => `<circle cx="${x}" cy="${cy}" r="${view === 'pin' ? 16 : 11}" fill="var(--surface-raised)" stroke="var(--outline)" stroke-width="4"/>`).join('')}
      ${arrows}
      <text x="${xA}" y="${cy + 46}" text-anchor="middle" style="font:800 18px var(--font-brand);fill:var(--ink)">Joint A</text><text x="${xB}" y="${cy + 46}" text-anchor="middle" style="font:800 18px var(--font-brand);fill:var(--ink)">Joint B</text>
      </svg><p class="stage__note" style="text-align:center;margin:0">${view === 'pin' ? 'Arrows = what the member does to each pin' : 'Arrows = what the pins do to the member'}</p>`;
    $('#tro', el).innerHTML = st === 'Z' ? `<span class="pill">F = 0 → zero-force member</span>` :
      `<span class="pill ${st === 'T' ? 'pill--ok' : 'pill--bad'}">F = ${f > 0 ? '+' : '−'}${Math.abs(f)} N → ${st === 'T' ? 'Tension' : 'Compression'}</span><span class="pill">${view === 'pin' ? (st === 'T' ? 'It PULLS the pins (arrows leave the joints)' : 'It PUSHES the pins (arrows point at the joints)') : (st === 'T' ? 'The member is being stretched' : 'The member is being squeezed')}</span>`;
  };
  $('#tf', el).addEventListener('input', draw);
  $$('[data-v]', el).forEach(b => b.onclick = () => { view = b.dataset.v; $$('[data-v]', el).forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
  draw();
};

// ----- 7. Example 1 walkthrough (method of joints) -----
WIDGETS.walk1 = el => {
  const mdl = MODELS.ex1, sol = solve(mdl); let i = 0;
  el.innerHTML = `<div class="steps"><div class="stage"><div class="stage__bar"><div class="stage__title">Example 1 · notes p.71</div>${legend}</div><div id="wsv"></div></div>
    <div><div class="stepnav">${WALK1.map((_, k) => `<button data-k="${k}" aria-label="Step ${k}">${k}</button>`).join('')}</div><div class="steppanel" aria-live="polite" id="wpanel"></div>
    <div class="controls"><button class="mt-btn mt-btn--secondary mt-btn--sm" id="wPrev">← Back</button><button class="mt-btn mt-btn--sm" id="wNext">Next →</button></div></div></div>`;
  const seen = new Set();
  const draw = () => {
    const s = WALK1[i]; seen.add(i);
    const shown = Object.fromEntries(s.show.map(k => [k, sol.forces[k]]));
    $('#wsv', el).innerHTML = svg(mdl, { forces: shown, memberLabels: true, dp: 0, highlightJoint: s.joint, showReactions: !!s.reactions, reactions: sol.reactions, unit: ' N', width: 560, height: 480, pad: 90, uid: 'w' });
    const rows = s.show.map(k => `<tr><td>F<sub>${k}</sub></td><td>${fmt(Math.abs(sol.forces[k]), 0)} N</td><td class="tag-${state(sol.forces[k])}">${state(sol.forces[k])}</td></tr>`).join('');
    $('#wpanel', el).innerHTML = `<h4>${s.title}</h4><div class="ar">${s.ar}</div>${s.eq.length ? `<div class="eq">${s.eq.map(e => `<div>${e}</div>`).join('')}</div>` : ''}${rows ? `<table class="results"><thead><tr><th>Member</th><th>Force</th><th>T/C</th></tr></thead><tbody>${rows}</tbody></table>` : ''}`;
    $$('.stepnav button', el).forEach((b, k) => { b.toggleAttribute('aria-current', k === i); if (k === i) b.setAttribute('aria-current', 'step'); b.classList.toggle('is-seen', seen.has(k) && k !== i); });
    $('#wPrev', el).disabled = i === 0;
    $('#wNext', el).textContent = i === WALK1.length - 1 ? 'Start over ↺' : 'Next →';
  };
  $('#wNext', el).onclick = () => { if (i === WALK1.length - 1) { i = 0; } else { i++; if (i === WALK1.length - 1) toast('Check = 0 ✓ The whole solution is right!', 'starry'); } draw(); };
  $('#wPrev', el).onclick = () => { i = Math.max(0, i - 1); draw(); };
  $$('.stepnav button', el).forEach(b => b.onclick = () => { i = +b.dataset.k; draw(); });
  draw();
};

// ----- 8. Section cutter (method of sections) -----
WIDGETS.cutter = el => {
  const mdl = MODELS.pratt, sol = solve(mdl); let panel = 3, side = 'left';
  el.innerHTML = stage('Section Cutter', 'Pratt bridge · 6 panels × 2 m · 10 kN on each bottom joint', `<div id="csv"></div>`,
    `<div class="controls"><label class="range"><span>Panel</span><input type="range" min="1" max="6" value="3" id="cp" aria-label="Panel to cut"><b id="cpv">3</b></label>
     <div class="seg"><button data-s="left" aria-pressed="true">Keep left part</button><button data-s="right" aria-pressed="false">Keep right part</button></div>${legend}</div><div id="cinfo" style="margin-top:12px"></div>`);
  const draw = () => {
    const x = 2 * panel - 1;
    const cut = mdl.members.filter(([a, b]) => (mdl.joints[a][0] - x) * (mdl.joints[b][0] - x) < 0);
    const cutK = cut.map(([a, b]) => key(a, b));
    const keepSide = ([a, b]) => side === 'left' ? Math.max(mdl.joints[a][0], mdl.joints[b][0]) < x : Math.min(mdl.joints[a][0], mdl.joints[b][0]) > x;
    const dim = mdl.members.filter(m => !keepSide(m) && !cutK.includes(key(...m))).map(m => key(...m));
    const forces = Object.fromEntries(cutK.map(k => [k, sol.forces[k]]));
    $('#csv', el).innerHTML = svg(mdl, { forces, highlightMembers: cutK, dim, cut: { x }, tagSide: side, showReactions: true, unit: ' kN', keepJoint: j => side === 'left' ? mdl.joints[j][0] < x : mdl.joints[j][0] > x, reactions: sol.reactions, width: 760, height: 330, pad: 64, uid: 'c' });
    // how to get each cut member: moment about the intersection of the other two, or ΣFy if they are parallel
    const how = cut.map((m, i) => {
      const others = cut.filter((_, j) => j !== i);
      if (others.length < 2) return [m, others.length ? `ΣF along ⊥ ${others[0].join('')}` : 'ΣF'];
      const P = intersect(others[0], others[1]);
      if (!P) return [m, 'ΣF<sub>y</sub> = 0 (the other two are parallel)'];
      const jn = Object.entries(mdl.joints).find(([, q]) => Math.hypot(q[0] - P[0], q[1] - P[1]) < 1e-6);
      return [m, `ΣM<sub>${jn ? jn[0] : `(${fmt(P[0])}, ${fmt(P[1])})`}</sub> = 0`];
    });
    $('#cpv', el).textContent = panel;
    $('#cinfo', el).innerHTML = `<div class="readout"><span class="pill ${cut.length <= 3 ? 'pill--ok' : 'pill--bad'}">Members cut: <b>${cut.length}</b> ${cut.length <= 3 ? '≤ 3 ✓' : '> 3 ✗'}</span><span class="pill pill--info">Reactions: Y<sub>L0</sub> = 25 kN, N<sub>L6</sub> = 25 kN</span></div>
    <table class="results"><thead><tr><th>Cut member</th><th>Use</th><th>Force</th><th>T/C</th></tr></thead><tbody>${how.map(([m, h]) => { const f = sol.forces[key(...m)]; return `<tr><td>${m[0]}${m[1]}</td><td>${h}</td><td>${fmt(Math.abs(f), 2)} kN</td><td class="tag-${state(f)}">${state(f) === 'Z' ? '0' : state(f)}</td></tr>`; }).join('')}</tbody></table>
    <p class="ar muted" style="margin:10px 0 0;font-size:15px">لاحظ: الإجابة واحدة سواء أخدت الحتة اليمين أو الشمال. اختار الحتة اللي قواها أقل عشان حساباتك تبقى أسهل.${panel === 3 || panel === 4 ? ' وفي النص، الـ top chord أكبر قوة Compression في الكوبري كله.' : ''}</p>`;
  };
  function intersect([a, b], [c, d]) {
    const p = mdl.joints[a], r = [mdl.joints[b][0] - p[0], mdl.joints[b][1] - p[1]], q = mdl.joints[c], s = [mdl.joints[d][0] - q[0], mdl.joints[d][1] - q[1]];
    const den = r[0] * s[1] - r[1] * s[0]; if (Math.abs(den) < 1e-9) return null;
    const t = ((q[0] - p[0]) * s[1] - (q[1] - p[1]) * s[0]) / den; return [p[0] + t * r[0], p[1] + t * r[1]];
  }
  $('#cp', el).addEventListener('input', e => { panel = +e.target.value; draw(); });
  $$('[data-s]', el).forEach(b => b.onclick = () => { side = b.dataset.s; $$('[data-s]', el).forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
  draw();
};

// ----- 9. Zero-force rules (two mini diagrams) -----
WIDGETS.zfmRules = el => {
  const dg = (rule) => {
    const W = 280, H = 200, c = [140, 120];
    const ln = (x2, y2, z, lbl, lx, ly) => `<line x1="${c[0]}" y1="${c[1]}" x2="${x2}" y2="${y2}" stroke="${z ? 'var(--z-color)' : 'var(--n-color)'}" stroke-width="${z ? 6 : 7}" stroke-linecap="round" ${z ? 'stroke-dasharray="2 13"' : ''}/><text x="${lx}" y="${ly}" style="font:800 16px var(--font-body);fill:var(--ink)">${lbl}</text>`;
    const body = rule === 'a'
      ? ln(40, 120, 1, 'T₁ = 0', 24, 106) + ln(200, 30, 1, 'T₂ = 0', 206, 40)
      : ln(30, 120, 0, 'T₁', 30, 106) + ln(250, 120, 0, 'T₂', 236, 106) + ln(190, 30, 1, 'T₃ = 0', 196, 38);
    return `<svg class="truss-svg" viewBox="0 0 ${W} ${H}" style="max-height:220px">${body}<circle cx="${c[0]}" cy="${c[1]}" r="10" fill="var(--surface-raised)" stroke="var(--outline)" stroke-width="3.5"/><text x="${c[0]}" y="${H - 12}" text-anchor="middle" style="font:700 14px var(--font-body);fill:var(--ink-muted)">no load · no reaction</text></svg>`;
  };
  el.innerHTML = `<div class="grid2">
    <div class="stage"><div class="stage__title">Rule (a) · two members</div>${dg('a')}<div class="explain ar" style="font-size:16px;padding:14px 16px">joint فيها <b>2 members بس</b> مش على خط واحد <span class="math">(0° &lt; θ &lt; 180°)</span> ← <b>الاتنين = صفر</b>.<br><span class="muted">ليه؟ خُد المحور العمودي على <span class="math">T₁</span>: مفيش غير <span class="math">T₂</span> ليها مركّبة عليه، يبقى <span class="math">T₂ = 0</span>، وبعدها <span class="math">T₁ = 0</span>.</span></div></div>
    <div class="stage"><div class="stage__title">Rule (b) · three members</div>${dg('b')}<div class="explain ar" style="font-size:16px;padding:14px 16px">joint فيها <b>3 members</b>، اتنين منهم <b>على خط واحد</b> ← <b>التالت = صفر</b>.<br><span class="muted">ليه؟ خُد المحور العمودي على خط <span class="math">T₁</span> و <span class="math">T₂</span>: مفيش غير <span class="math">T₃</span> عليه، يبقى <span class="math">T₃ = 0</span>.</span></div></div></div>`;
};

// ----- 10. Zero-force hunter -----
WIDGETS.hunter = el => {
  const mdl = MODELS.zfm, sol = solve(mdl);
  const zeros = new Set(Object.entries(sol.forces).filter(([, f]) => Math.abs(f) < 1e-6).map(([k]) => k));
  const WHY = { BF: 'joint B: AB و BC على خط واحد ← BF = 0 (rule b)', DH: 'joint D: CD و DE على خط واحد ← DH = 0 (rule b)', CG: 'joint G: FG و GH على خط واحد ← CG = 0 (rule b)', HI: 'joint I: فيها 2 members بس ← HI = 0 (rule a)', EI: 'joint I: فيها 2 members بس ← EI = 0 (rule a)' };
  const picks = new Set(); let checked = false;
  el.innerHTML = stage('Zero-Force Hunter', `Find all ${zeros.size} zero-force members · tap to pick`, `<div id="hsv"></div>`,
    `<div class="controls"><button class="mt-btn mt-btn--sm" id="hCheck">Check</button><button class="mt-btn mt-btn--secondary mt-btn--sm" id="hShow">Show all forces</button><button class="mt-btn mt-btn--ghost mt-btn--sm" id="hReset">Reset</button></div><div id="hout" style="margin-top:12px"></div>`);
  let showAll = false;
  const draw = () => {
    $('#hsv', el).innerHTML = svg(mdl, { forces: showAll ? sol.forces : {}, memberLabels: showAll, dp: 2, tappable: !checked, width: 760, height: 320, pad: 64, uid: 'z' });
    $$('#hsv .mem', el).forEach(g => {
      const k = g.dataset.m;
      if (checked) { g.classList.toggle('is-found', picks.has(k) && zeros.has(k)); g.classList.toggle('is-picked', picks.has(k) && !zeros.has(k)); g.classList.toggle('is-missed', !picks.has(k) && zeros.has(k)); }
      else g.classList.toggle('is-picked', picks.has(k));
      g.addEventListener('click', () => { if (checked) return; picks.has(k) ? picks.delete(k) : picks.add(k); draw(); });
    });
  };
  $('#hCheck', el).onclick = () => {
    checked = true; draw();
    const right = [...picks].filter(k => zeros.has(k)), wrong = [...picks].filter(k => !zeros.has(k)), missed = [...zeros].filter(k => !picks.has(k));
    const perfect = !wrong.length && !missed.length;
    $('#hout', el).innerHTML = `<div class="readout"><span class="pill pill--ok">Found: <b>${right.length}/${zeros.size}</b></span>${wrong.length ? `<span class="pill pill--bad">Not zero: ${wrong.join(', ')}</span>` : ''}${missed.length ? `<span class="pill pill--info">Missed (blue): ${missed.join(', ')}</span>` : ''}</div>
      <div class="withface" style="margin-top:14px"><div class="bubble ${perfect ? 'bubble--mint' : 'bubble--soft'}"><b>${perfect ? 'Perfect hunt! صيّاد محترف 🎯' : 'Here’s the logic:'}</b><ul class="ar" style="margin:6px 0 0;padding-inline-start:20px">${[...zeros].map(k => `<li>${WHY[k] || k}</li>`).join('')}</ul></div><img src="${FACE(perfect ? 'starry' : 'think')}" alt=""></div>`;
    if (perfect) toast('All zero-force members found!', 'starry');
  };
  $('#hShow', el).onclick = e => { showAll = !showAll; e.currentTarget.textContent = showAll ? 'Hide forces' : 'Show all forces'; draw(); };
  $('#hReset', el).onclick = () => { picks.clear(); checked = false; showAll = false; $('#hShow', el).textContent = 'Show all forces'; $('#hout', el).innerHTML = ''; draw(); };
  draw();
};

// =====================================================================
// PWA: install + offline
// =====================================================================
let deferred;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; bindInstall(); });
function bindInstall() {
  const b = $('#installBtn'); if (!b || !deferred) return;
  b.classList.add('is-on');
  b.onclick = async () => { deferred.prompt(); await deferred.userChoice; deferred = null; b.classList.remove('is-on'); };
}
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js');

applyTheme(); route();
