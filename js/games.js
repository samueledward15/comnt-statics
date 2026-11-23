// Comnt Trusses Lab — Stage 4: Games (Zero-Force Hunter · T or C? · Start Here · Stable or Not?)
// Every right answer comes from the solver, so the games can never "lie".
import { solve, svg, key, state, fmt } from './truss.js';
import { MODELS } from './content.js';
import { PM } from './practice.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const FACE = n => `assets/faces/${n}.svg`;
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const clone = o => JSON.parse(JSON.stringify(o));
const ALL = { ...MODELS, ...PM };
const legend = `<div class="legend"><span><i class="lt"></i>Tension (T)</span><span><i class="lc"></i>Compression (C)</span><span><i class="lz"></i>Zero</span></div>`;
let ctx;
const GW = () => (innerWidth < 640 ? 440 : 760), GH = () => (innerWidth < 640 ? 400 : 380);

const GAMES = [
  ['hunter', 'Zero-Force Hunter', 'لاقي كل الـ zero-force members بالنظر بس. 6 مستويات من السهل للصعب.', 'starry'],
  ['tc', 'T or C?', 'member واحد بينوّر: Tension ولا Compression؟ 10 جولات بسرعة. على الموبايل اسحب يمين أو شمال.', 'wow'],
  ['start', 'Start Here', 'دوس على أول joint ينفع تبدأ بيها في الـ Method of Joints. ولو مفيش، اختار «Reactions first».', 'think'],
  ['stable', 'Stable or Not?', 'بص على الـ truss وقول: Stable ولا Unstable ولا Indeterminate؟ وعدّ M و J و R.', 'wink'],
];

export function games(app, arg, c) {
  ctx = c; ctx.S.best = ctx.S.best || {};
  const g = { hunter, tc, start, stable }[arg];
  if (g) return g(app);
  app.innerHTML = `<div class="lhead"><div><div class="kicker">Games</div><h1>Play. Learn. Repeat.</h1><div class="lhead__ar">ألعاب سريعة بتثبّت المعلومة. كل إجابة صح محسوبة بالـ solver، فاللعبة مستحيل تغلط عليك 😉</div></div><img class="lhead__face" src="${FACE('starry')}" alt=""></div>
  <div class="block path">${GAMES.map(([id, t, ar, f]) => `<a class="lcard" href="#/games/${id}"><div class="soon"><img src="${FACE(f)}" alt=""><div><div class="lcard__title">${t}</div><div class="lcard__ar">${ar}</div></div></div><div class="lcard__top" style="margin-top:auto"><span class="mt-btn mt-btn--sm">Play →</span><span class="badge">${ctx.S.best[id] !== undefined ? 'Best: ' + ctx.S.best[id] : 'New'}</span></div></a>`).join('')}</div>`;
}
const crumbs = t => `<nav class="crumbs"><a href="#/games">Games</a><span>›</span><span>${t}</span></nav>`;
const head = (t, ar, f) => `<header class="lhead"><div><div class="kicker">Game</div><h1>${t}</h1><div class="lhead__ar">${ar}</div></div><img class="lhead__face" src="${FACE(f)}" alt=""></header>`;
function best(id, v) { if (ctx.S.best[id] === undefined || v > ctx.S.best[id]) { ctx.S.best[id] = v; ctx.save(); return true; } return false; }
function hud(items) { return `<div class="readout hud">${items.map(([k, v, c]) => `<span class="pill ${c || ''}">${k} <b>${v}</b></span>`).join('')}</div>`; }
function endCard(app, id, score, max, again) {
  const nb = best(id, score), ratio = score / max;
  $('#gbody', app).innerHTML = `<div class="withface"><div class="bubble ${ratio >= .7 ? 'bubble--mint' : 'bubble--soft'}"><h3 style="margin:0 0 6px">${ratio >= .9 ? 'Legend! أسطورة 🏆' : ratio >= .7 ? 'Great job! شغل عالي' : ratio >= .4 ? 'Not bad! كمان مرة وهتقفلها' : 'Keep going! راجع الدرس وارجع'}</h3>Score: <b>${score}</b> / ${max}${nb ? ' · <b>New best!</b>' : ` · Best: ${ctx.S.best[id]}`}<div class="controls"><button class="mt-btn mt-btn--sm" id="gAgain">Play again ↺</button><a class="mt-btn mt-btn--secondary mt-btn--sm" href="#/games">All games</a></div></div><img src="${FACE(ratio >= .7 ? 'starry' : 'sweat')}" alt=""></div>`;
  $('#gAgain', app).onclick = again;
  if (ratio >= .7) ctx.toast('Score ' + score + '/' + max + '!', 'starry');
}

// =====================================================================
// 1. ZERO-FORCE HUNTER — levels (all zero members are findable by the two rules)
// =====================================================================
const HLEVELS = [
  { m: 'pratt', name: 'Pratt bridge', tip: 'دوّر على joint في الـ top chord مفيش عليها حمل.' },
  { m: 'ex4', name: 'Example 4 tower', tip: 'بص على الـ joint اللي في نص العمود اليمين.' },
  { m: 'a8', name: 'Problem 5-8 tower', tip: 'دوّر فوق: joint فيها عمود مستقيم و member تالت.' },
  { m: 'ex3', name: 'Example 3 crane', tip: 'فيه سلسلة: كل zero بتلاقيه بيفتحلك اللي بعده.' },
  { m: 'zfm', name: 'The hunter’s bridge', tip: 'فيه joint عليها 2 members بس (rule a).' },
  { m: 'ex6', name: 'Example 6 roof (boss level)', tip: 'ابدأ من B، وبعدين N، وبعدين بص على D و O و L.' },
];
function hunter(app) {
  let lv = 0, score = 0, picks, checked;
  app.innerHTML = `${crumbs('Zero-Force Hunter')}${head('Zero-Force Hunter', 'دوس على كل member شايفه zero-force، وبعدين Check. كل إجابة صح بـ +10، وكل غلطة بـ −5.', 'starry')}<div class="block stage"><div id="ghud"></div><div id="gbody"></div></div>`;
  const level = () => {
    const L = HLEVELS[lv], m = ALL[L.m], sol = solve(m);
    const zeros = new Set(Object.entries(sol.forces).filter(([, f]) => Math.abs(f) < 1e-6).map(([k]) => k));
    picks = new Set(); checked = false;
    const draw = () => {
      $('#ghud', app).innerHTML = hud([['Level', `${lv + 1}/${HLEVELS.length}`], ['Score', score, 'pill--ok'], ['Zero members here', zeros.size, 'pill--info']]);
      $('#gbody', app).innerHTML = `<div class="stage__title" style="margin:6px 0">${L.name}</div><div id="hsv">${svg(m, { tappable: !checked, width: GW(), height: GH(), pad: innerWidth < 640 ? 46 : 70, uid: 'gh' })}</div>
        <div class="controls"><button class="mt-btn mt-btn--sm" id="hC" ${checked ? 'disabled' : ''}>Check</button><button class="mt-btn mt-btn--secondary mt-btn--sm" id="hT">Tip</button>${checked ? `<button class="mt-btn mt-btn--sm" id="hN">${lv < HLEVELS.length - 1 ? 'Next level →' : 'Finish'}</button>` : ''}</div><div id="hout" style="margin-top:10px"></div>`;
      $$('#hsv .mem', app).forEach(g => {
        const k = g.dataset.m;
        if (checked) { g.classList.toggle('is-found', picks.has(k) && zeros.has(k)); g.classList.toggle('is-picked', picks.has(k) && !zeros.has(k)); g.classList.toggle('is-missed', !picks.has(k) && zeros.has(k)); }
        else { g.classList.toggle('is-picked', picks.has(k)); g.onclick = () => { picks.has(k) ? picks.delete(k) : picks.add(k); draw(); }; }
      });
      $('#hT', app).onclick = () => { $('#hout', app).innerHTML = `<div class="bubble bubble--soft ar">${L.tip}</div>`; };
      if (!checked) $('#hC', app).onclick = () => {
        const right = [...picks].filter(k => zeros.has(k)).length, wrong = picks.size - right, missed = zeros.size - right;
        const gained = right * 10 - wrong * 5; score = Math.max(0, score + gained); checked = true; draw();
        $('#hout', app).innerHTML = `<div class="readout"><span class="pill pill--ok">Found ${right}/${zeros.size}</span>${wrong ? `<span class="pill pill--bad">Wrong picks: ${wrong}</span>` : ''}${missed ? `<span class="pill pill--info">Missed (blue): ${missed}</span>` : ''}<span class="pill">${gained >= 0 ? '+' : ''}${gained} pts</span></div>`;
        if (!wrong && !missed) ctx.toast('Perfect level! 🎯', 'laugh');
      };
      if (checked) $('#hN', app).onclick = () => { if (lv < HLEVELS.length - 1) { lv++; level(); } else { $('#ghud', app).innerHTML = ''; endCard(app, 'hunter', score, HLEVELS.reduce((s, L2) => s + 10 * Object.values(solve(ALL[L2.m]).forces).filter(f => Math.abs(f) < 1e-6).length, 0), () => { lv = 0; score = 0; level(); }); } };
    };
    draw();
  };
  level();
}

// =====================================================================
// 2. T or C? — 10 quick rounds
// =====================================================================
const TC_MODELS = ['ex1', 'ex2', 'pratt', 'howe', 'warren', 'a3', 'a4', 'a6', 'a2', 'ex4', 'a8'];
function tc(app) {
  let round = 0, score = 0, streak = 0, cur, answered;
  const N = 10;
  app.innerHTML = `${crumbs('T or C?')}${head('T or C?', 'الـ member المنوّر ده شغال Tension ولا Compression؟ فكّر في الـ joint: هو بيشدّها ولا بيزقّها؟ على الكمبيوتر ← = C و → = T، وعلى الموبايل اسحب.', 'wow')}<div class="block stage"><div id="ghud"></div><div id="gbody"></div></div>`;
  const next = () => {
    if (round >= N) { $('#ghud', app).innerHTML = ''; return endCard(app, 'tc', score, N, () => { round = score = streak = 0; next(); }); }
    const name = pick(TC_MODELS), m = ALL[name], sol = solve(m);
    const cand = Object.entries(sol.forces).filter(([, f]) => Math.abs(f) > 1e-6);
    const [k, f] = pick(cand); cur = { m, sol, k, ans: f > 0 ? 'T' : 'C' }; answered = false;
    draw();
  };
  const draw = (reveal) => {
    $('#ghud', app).innerHTML = hud([['Round', `${Math.min(round + 1, N)}/${N}`], ['Score', score, 'pill--ok'], ['Streak', streak + (streak >= 3 ? ' 🔥' : '')]]);
    const { m, sol, k } = cur;
    const dim = [];
    $('#gbody', app).innerHTML = `<div class="tc-card" id="tcCard"><div>${svg(m, { forces: reveal ? sol.forces : {}, highlightMembers: [k], dim, memberLabels: !!reveal, dp: 1, showReactions: true, reactions: sol.reactions, width: GW(), height: GH(), pad: innerWidth < 640 ? 46 : 70, uid: 'tc' })}</div></div>
      <div class="stage__title" style="text-align:center;margin:6px 0">Member <span class="term">${k}</span>: Tension or Compression?</div>
      <div class="tc-btns"><button class="mt-btn mt-btn--warm" data-a="C" ${answered ? 'disabled' : ''}>← Compression</button><button class="mt-btn" data-a="T" ${answered ? 'disabled' : ''}>Tension →</button></div><div id="tcfb"></div>`;
    // highlight the asked member in navy until revealed
    if (!reveal) $$('#gbody .mem', app).forEach(g => { if (g.dataset.m === k) g.classList.add('tc-ask'); });
    $$('[data-a]', app).forEach(b => b.onclick = () => answer(b.dataset.a));
    swipe($('#tcCard', app));
  };
  const answer = a => {
    if (answered) return; answered = true;
    const ok = a === cur.ans; if (ok) { score++; streak++; } else streak = 0;
    round++; draw(true);
    const f = cur.sol.forces[cur.k];
    $('#tcfb', app).innerHTML = `<div class="withface" style="margin-top:10px"><div class="bubble ${ok ? 'bubble--mint' : 'bubble--soft'}"><b>${ok ? (streak >= 3 ? `Streak ${streak}! 🔥` : 'Correct!') : 'Oops!'}</b> ${cur.k} = ${fmt(Math.abs(f), 2)} → <b class="tag-${cur.ans}">${cur.ans === 'T' ? 'Tension' : 'Compression'}</b><div class="ar" style="font-size:15px;margin-top:4px">${cur.ans === 'T' ? 'الـ member ده بيشدّ الـ joints ناحيته (بيتمطّ).' : 'الـ member ده بيزقّ الـ joints بعيد عنه (بيتكبس).'} شوف ألوان باقي الـ truss: الـ top chord في الكباري غالبًا C، والـ bottom chord غالبًا T.</div><div class="controls"><button class="mt-btn mt-btn--sm" id="tcN">${round >= N ? 'See score' : 'Next →'}</button></div></div><img src="${FACE(ok ? 'laugh' : 'sweat')}" alt=""></div>`;
    $('#tcN', app).onclick = next; $('#tcN', app).focus();
  };
  function swipe(el) {
    let x0 = null;
    el.onpointerdown = e => { x0 = e.clientX; };
    el.onpointerup = e => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 60) answer(dx > 0 ? 'T' : 'C'); };
  }
  addEventListener('keydown', function onK(e) {
    if (!document.body.contains($('#tcCard', app)) && !document.body.contains($('#gbody', app))) return removeEventListener('keydown', onK);
    if (!location.hash.includes('games/tc')) return removeEventListener('keydown', onK);
    if (e.key === 'ArrowLeft') answer('C'); if (e.key === 'ArrowRight') answer('T');
    if (e.key === 'Enter' && answered) $('#tcN', app)?.click();
  });
  next();
}

// =====================================================================
// 3. START HERE — which joint can you solve first?
// =====================================================================
const SH_MODELS = ['ex1', 'ex2', 'pratt', 'warren', 'a3', 'a4', 'a8', 'zfm', 'a2', 'ex4'];
function start(app) {
  let round = 0, score = 0, cur;
  const N = 8;
  app.innerHTML = `${crumbs('Start Here')}${head('Start Here', 'أول خطوة في الـ Method of Joints: لاقي joint فيها مجهولين أو أقل. عدّ الـ members المتوصّلة، وزوّد عليهم الـ reactions اللي لسه مش معروفة.', 'think')}<div class="block stage"><div id="ghud"></div><div id="gbody"></div></div>`;
  const next = () => {
    if (round >= N) { $('#ghud', app).innerHTML = ''; return endCard(app, 'start', score, N, () => { round = score = 0; next(); }); }
    const name = pick(SH_MODELS), m = ALL[name], sol = solve(m);
    const known = Math.random() < 0.6;       // reactions already found?
    const unk = {};
    Object.keys(m.joints).forEach(j => {
      let u = m.members.filter(([a, b]) => a === j || b === j).length;
      if (!known) { const s = m.supports[j]; if (s) u += (s === 'pin' || s.type === 'pin') ? 2 : 1; }
      unk[j] = u;
    });
    const good = Object.keys(unk).filter(j => unk[j] <= 2);
    cur = { m, sol, known, unk, good, done: false };
    draw();
  };
  const draw = () => {
    const { m, sol, known, good } = cur;
    $('#ghud', app).innerHTML = hud([['Round', `${round + 1}/${N}`], ['Score', score, 'pill--ok'], [known ? 'Reactions: known ✓' : 'Reactions: NOT known yet', '', known ? 'pill--info' : 'pill--bad']]);
    $('#gbody', app).innerHTML = `<div id="ssv">${svg(m, { showReactions: known, reactions: sol.reactions, width: GW(), height: GH(), pad: innerWidth < 640 ? 50 : 76, uid: 'sh' })}</div>
      <div class="controls" style="justify-content:center"><span class="stage__note">Tap a joint</span><button class="mt-btn mt-btn--secondary mt-btn--sm" id="shR" ${cur.done ? 'disabled' : ''}>None — find the reactions first</button></div><div id="shfb"></div>`;
    $$('#ssv .jnt', app).forEach(g => { g.style.cursor = 'pointer'; g.onclick = () => answer(g.dataset.j); });
    $('#shR', app).onclick = () => answer(null);
    void good;
  };
  const answer = j => {
    if (cur.done) return; cur.done = true;
    const { good, unk } = cur, ok = j === null ? good.length === 0 : good.includes(j);
    if (ok) score++;
    round++;
    $$('#ssv .jnt', app).forEach(g => { const id = g.dataset.j; if (good.includes(id)) g.classList.add('is-on'); g.insertAdjacentHTML('beforeend', ''); });
    $('#shR', app).disabled = true;
    const list = Object.entries(unk).map(([id, u]) => `${id}: ${u}`).join(' · ');
    $('#shfb', app).innerHTML = `<div class="withface" style="margin-top:10px"><div class="bubble ${ok ? 'bubble--mint' : 'bubble--soft'}"><b>${ok ? 'Correct!' : 'Not this one.'}</b> ${good.length ? `ينفع تبدأ بـ: <b>${good.join(' أو ')}</b> (منوّرين بالأخضر).` : 'مفيش ولا joint فيها مجهولين بس، فلازم تطلّع الـ reactions من الـ truss كله الأول.'}<div class="en" style="font-size:13.5px;margin-top:6px;color:var(--ink-muted)">Unknowns per joint → ${list}</div><div class="controls"><button class="mt-btn mt-btn--sm" id="shN">${round >= N ? 'See score' : 'Next →'}</button></div></div><img src="${FACE(ok ? 'laugh' : 'think')}" alt=""></div>`;
    $('#shN', app).onclick = next;
  };
  next();
}

// =====================================================================
// 4. STABLE OR NOT? — random edits on real trusses, judged by the solver
// =====================================================================
const ST_BASE = ['pratt', 'warren', 'ex2', 'a3', 'a6', 'ex1', 'howe'];
function variant() {
  const base = pick(ST_BASE), m = clone(ALL[base]); m.loads = (m.loads || []).map(L => ({ ...L, label: '' }));
  const ids = Object.keys(m.joints), have = new Set(m.members.map(([a, b]) => key(a, b)));
  const r = Math.random(); let what = 'original';
  if (r < 0.25) { /* keep */ }
  else if (r < 0.5) { m.members.splice(Math.floor(Math.random() * m.members.length), 1); what = 'removed a member'; }
  else if (r < 0.7) {
    const pairs = []; ids.forEach(a => ids.forEach(b => { if (a < b && !have.has(key(a, b))) { const d = Math.hypot(m.joints[a][0] - m.joints[b][0], m.joints[a][1] - m.joints[b][1]); if (d < 3.2) pairs.push([a, b, d]); } }));
    const p = pick(pairs.length ? pairs : [[ids[0], ids[2]]]); m.members.push([p[0], p[1]]); what = 'added a member';
  } else if (r < 0.85) {
    const roller = Object.keys(m.supports).find(j => m.supports[j] !== 'pin'); if (roller) { m.supports[roller] = 'pin'; what = 'roller → pin'; } else { m.members.pop(); what = 'removed a member'; }
  } else {
    // swap a diagonal between panels: count stays the same, shape may become a mechanism
    const diag = m.members.findIndex(([a, b]) => m.joints[a][0] !== m.joints[b][0] && m.joints[a][1] !== m.joints[b][1]);
    if (diag >= 0) { const [a, b] = m.members[diag]; m.members.splice(diag, 1); const pairs = []; ids.forEach(x => ids.forEach(y => { if (x < y && !have.has(key(x, y)) && key(x, y) !== key(a, b) && m.joints[x][0] !== m.joints[y][0] && m.joints[x][1] !== m.joints[y][1]) { const d = Math.hypot(m.joints[x][0] - m.joints[y][0], m.joints[x][1] - m.joints[y][1]); if (d < 3.2) pairs.push([x, y]); } })); const p = pick(pairs.length ? pairs : [[a, b]]); m.members.push(p); what = 'moved a diagonal'; }
  }
  const sol = solve(m);
  const verdict = !sol.ok ? (sol.reason === 'indeterminate' ? 'I' : 'U') : sol.warn ? 'U' : 'S';
  return { m, sol, verdict, what, base };
}
function stable(app) {
  let round = 0, score = 0, cur;
  const N = 8;
  app.innerHTML = `${crumbs('Stable or Not?')}${head('Stable or Not?', 'عدّ J و M و R وقارن M + R بـ 2J. ومتنساش تبص على الشكل نفسه: ممكن العدد يبقى صح والشكل يتحرك!', 'wink')}<div class="block stage"><div id="ghud"></div><div id="gbody"></div></div>`;
  const LBL = { S: ['Stable & determinate', 'mt-btn'], U: ['Unstable', 'mt-btn mt-btn--warm'], I: ['Indeterminate', 'mt-btn mt-btn--secondary'] };
  const next = () => {
    if (round >= N) { $('#ghud', app).innerHTML = ''; return endCard(app, 'stable', score, N, () => { round = score = 0; next(); }); }
    cur = variant(); cur.done = false; draw();
  };
  const draw = () => {
    $('#ghud', app).innerHTML = hud([['Round', `${round + 1}/${N}`], ['Score', score, 'pill--ok']]);
    $('#gbody', app).innerHTML = `<div>${svg(cur.m, { width: GW(), height: GH(), pad: innerWidth < 640 ? 46 : 70, uid: 'st' })}</div>
      <div class="tc-btns">${Object.entries(LBL).map(([k, [t, c]]) => `<button class="${c}" data-v="${k}">${t}</button>`).join('')}</div><div id="stfb"></div>`;
    $$('[data-v]', app).forEach(b => b.onclick = () => answer(b.dataset.v));
  };
  const answer = v => {
    if (cur.done) return; cur.done = true; round++;
    const ok = v === cur.verdict; if (ok) score++;
    $$('[data-v]', app).forEach(b => { b.disabled = true; if (b.dataset.v === cur.verdict) b.style.outline = '4px solid var(--mint-deep)'; });
    const { m, sol } = cur, M = m.members.length, J = Object.keys(m.joints).length, R = Object.values(m.supports).reduce((s, x) => s + ((x === 'pin' || x.type === 'pin') ? 2 : 1), 0);
    const why = { S: 'العدد مظبوط والشكل كله مثلثات، فالـ truss stable و statically determinate.', U: M + R < 2 * J ? 'المجاهيل أقل من المعادلات: ناقصه member أو support، فهيتحرك.' : 'العدد مظبوط بس الشكل نفسه بيتحرك (فيه panel من غير diagonal). العدّ لوحده مش كفاية!', I: 'المجاهيل أكتر من المعادلات: فيه member أو reaction زيادة، والـ statics لوحدها مش كفاية.' }[cur.verdict];
    $('#stfb', app).innerHTML = `<div class="withface" style="margin-top:10px"><div class="bubble ${ok ? 'bubble--mint' : 'bubble--soft'}"><b>${ok ? 'Correct!' : 'Not quite.'}</b> It’s <b>${LBL[cur.verdict][0]}</b>.<div class="readout" style="margin:6px 0"><span class="pill">J ${J}</span><span class="pill">M ${M}</span><span class="pill">R ${R}</span><span class="pill pill--info">M + R = ${M + R} ${M + R === 2 * J ? '=' : M + R < 2 * J ? '<' : '>'} 2J = ${2 * J}</span></div><div class="ar" style="font-size:15px">${why}</div><div class="controls"><button class="mt-btn mt-btn--sm" id="stN">${round >= N ? 'See score' : 'Next →'}</button></div></div><img src="${FACE(ok ? 'laugh' : 'sweat')}" alt=""></div>`;
    void sol; $('#stN', app).onclick = next;
  };
  next();
}
