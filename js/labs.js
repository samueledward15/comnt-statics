// Comnt Trusses Lab — Stage 2: Virtual Labs (Truss Builder · Joint Lab · Section Cutter)
import { solve, svg, key, state, fmt, norm, frame } from './truss.js';
import { MODELS } from './content.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const FACE = n => `assets/faces/${n}.svg`;
const clone = o => JSON.parse(JSON.stringify(o));
const legend = `<div class="legend"><span><i class="lt"></i>Tension (T)</span><span><i class="lc"></i>Compression (C)</span><span><i class="lz"></i>Zero</span></div>`;
const LS = 'comnt-trusses-builder-v1';
let toast = () => {};

// ---------- shared helpers ----------
const toWorldFromEvent = (svgEl, ev, inv) => {
  const pt = svgEl.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
  const p = pt.matrixTransform(svgEl.getScreenCTM().inverse());
  return inv(p.x, p.y);
};
const distSeg = (p, a, b) => {
  const vx = b[0] - a[0], vy = b[1] - a[1], L2 = vx * vx + vy * vy || 1;
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / L2));
  return Math.hypot(p[0] - a[0] - t * vx, p[1] - a[1] - t * vy);
};
function lineX(m, [a, b], [c, d]) {        // intersection of the infinite lines of two members (or null if parallel)
  const p = m.joints[a], r = [m.joints[b][0] - p[0], m.joints[b][1] - p[1]], q = m.joints[c], s = [m.joints[d][0] - q[0], m.joints[d][1] - q[1]];
  const den = r[0] * s[1] - r[1] * s[0]; if (Math.abs(den) < 1e-9) return null;
  const t = ((q[0] - p[0]) * s[1] - (q[1] - p[1]) * s[0]) / den; return [p[0] + t * r[0], p[1] + t * r[1]];
}
function momentHow(m, cut) {               // how to get each cut member in one equation
  return cut.map((mm, i) => {
    const others = cut.filter((_, j) => j !== i);
    if (others.length === 0) return [mm, 'ΣF along the member'];
    if (others.length === 1) return [mm, `ΣF ⊥ ${others[0].join('')}`];
    if (others.length > 2) return [mm, '—'];
    const P = lineX(m, others[0], others[1]);
    if (!P) return [mm, `ΣF ⊥ ${others[0].join('')} (the other two are parallel)`];
    const jn = Object.entries(m.joints).find(([, q]) => Math.hypot(q[0] - P[0], q[1] - P[1]) < 1e-6);
    return [mm, `ΣM<sub>${jn ? jn[0] : `(${fmt(P[0], 2)}, ${fmt(P[1], 2)})`}</sub> = 0`];
  });
}

// drag that survives re-rendering the SVG: listen on window until the pointer is released
function dragLoop(getSvg, inv, onMove) {
  const mv = ev => { const el = getSvg(); if (el) onMove(toWorldFromEvent(el, ev, inv)); };
  const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); };
  addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);
}
const subName = n => `${n[0]}<tspan font-size="72%" dy="5">${n.slice(1)}</tspan><tspan dy="-5"></tspan>`;

// =====================================================================
// LABS HOME
// =====================================================================
export function labs(app, arg, ctx) {
  toast = ctx.toast;
  if (arg === 'builder') return builder(app);
  if (arg === 'joint') return jointLab(app);
  if (arg === 'cutter') return cutterLab(app);
  const card = (href, t, ar, face, art) => `<a class="lcard" href="#/labs/${href}"><div class="lcard__mini">${art}</div><div class="lcard__title">${t}</div><div class="lcard__ar">${ar}</div><div class="soon" style="margin-top:auto"><span class="mt-btn mt-btn--sm">Open lab →</span><img src="${FACE(face)}" alt="" style="width:54px;margin-inline-start:auto"></div></a>`;
  const r = solve(MODELS.warren);
  app.innerHTML = `<div class="lhead"><div><div class="kicker">Virtual Labs</div><h1>Build. Load. Break. Learn.</h1><div class="lhead__ar">تلات معامل تجرّب فيها بإيدك: ابني أي truss وشوف القوى بتتحسب على طول، وازن الـ joint بنفسك، واقطع الكوبري في أي حتة.</div></div><img class="lhead__face" src="${FACE('wow')}" alt=""></div>
  <div class="block grid3">
    ${card('builder', 'Truss Builder', 'ارسم joints وmembers، حط supports وأحمال، والـ solver يحلّ ويلوّن كل member على طول.', 'starry', svg(r.ok ? MODELS.warren : MODELS.warren, { forces: r.forces, labels: false, hideLoads: true, width: 300, height: 120, pad: 22, uid: 'l1' }))}
    ${card('joint', 'Joint Lab', 'وازن القوى على الـ pin بإيدك. لما ΣF = 0، مضلع القوى بيقفل.', 'think', jointThumb())}
    ${card('cutter', 'Section Cutter', 'اسحب خط القطع في أي اتجاه، وشوف الـ members المقطوعة ونقطة الـ moment الذهبية.', 'wink', svg(MODELS.pratt, { labels: false, hideLoads: true, width: 300, height: 120, pad: 22, uid: 'l3', cut: { x: 5 }, dim: ['L3L4', 'L4L5', 'L5L6', 'U3U4', 'U4U5', 'L6U5', 'L4U4', 'L5U5', 'L3U4', 'L4U5', 'L3U3'] }))}
  </div>
  <div class="block withface"><div class="bubble bubble--soft ar"><b>نصيحة Dr. Mint:</b> حل المسألة على الورق الأول، وبعدين ابنيها في الـ Builder واتأكد من إجابتك. لو الإجابتين اختلفوا، ارجع للـ FBD بتاعك.</div><img src="${FACE('talk')}" alt=""></div>`;
}
function jointThumb() {
  return `<svg viewBox="0 0 300 120"><g stroke-linecap="round" stroke-width="6"><line x1="150" y1="64" x2="80" y2="64" stroke="var(--t-color)"/><line x1="150" y1="64" x2="200" y2="24" stroke="var(--c-color)"/><line x1="150" y1="64" x2="150" y2="112" stroke="var(--cinnamon)"/></g><circle cx="150" cy="64" r="10" fill="var(--surface-raised)" stroke="var(--outline)" stroke-width="3.5"/><path d="M220 96 L262 96 L240 60 Z" fill="none" stroke="var(--outline)" stroke-width="3" stroke-linejoin="round"/></svg>`;
}
const crumbs = t => `<nav class="crumbs"><a href="#/labs">Labs</a><span>›</span><span>${t}</span></nav>`;

// =====================================================================
// 1. TRUSS BUILDER
// =====================================================================
const PRESETS = {
  warren: ['Warren bridge', () => MODELS.warren, 'kN'],
  pratt: ['Pratt bridge', () => MODELS.pratt, 'kN'],
  howe: ['Howe bridge', () => MODELS.howe, 'kN'],
  ex1: ['Example 1 (notes)', () => MODELS.ex1, 'N'],
  ex2: ['Example 2 (notes)', () => MODELS.ex2, 'N'],
  zfm: ['Zero-force demo', () => MODELS.zfm, 'kN'],
  empty: ['Empty — start from scratch', () => ({ joints: {}, members: [], supports: {}, loads: [] }), 'kN'],
};
const BOUNDS = { minX: -1, maxX: 13, minY: -1.5, maxY: 5.5 };
const TOOLS = [
  ['joint', 'Joint', '<circle cx="12" cy="12" r="5"/>'],
  ['member', 'Member', '<circle cx="5" cy="18" r="3"/><circle cx="19" cy="6" r="3"/><path d="M7.5 16.5L16.5 7.5"/>'],
  ['support', 'Support', '<path d="M12 6L5 18h14z"/><path d="M3 21h18"/>'],
  ['load', 'Load', '<path d="M12 3v15M6 12l6 6 6-6"/>'],
  ['move', 'Move', '<path d="M12 3v18M3 12h18M8 7l4-4 4 4M8 17l4 4 4-4M7 8l-4 4 4 4M17 8l4 4-4 4"/>'],
  ['delete', 'Delete', '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'],
];
const HINT = {
  joint: 'دوس في أي مكان فاضي على الشبكة عشان تحط joint.',
  member: 'دوس على joint وبعدين joint تانية عشان توصّلهم. تقدر تكمّل على طول من آخر joint، ولو دوست على نفس الـ joint تاني بتقف.',
  support: 'دوس على joint عشان تقلّب بين: Pin، بعده Roller رأسي، بعده Roller أفقي، وبعدين تشيل الـ support.',
  load: 'دوس على joint وحط الحمل بالـ kN (موجب = يمين / فوق).',
  move: 'اسحب أي joint لمكان جديد، والقوى بتتحسب وإنت بتسحب.',
  delete: 'دوس على joint أو member عشان تمسحه.',
};

function builder(app) {
  let saved = null; try { saved = JSON.parse(localStorage.getItem(LS)); } catch { }
  let M = saved?.model || clone(MODELS.warren), unit = saved?.unit || 'kN';
  let tool = 'member', pending = null, selJ = null, selM = null, labels = true, drag = null;
  const undo = [];
  const W = 900, PAD = 30;
  let H = 520, VB = { ...BOUNDS }, F;
  // fit the view to the model (with room to build around it); taller canvas on phones
  const fit = () => {
    H = innerWidth < 640 ? 760 : 520;
    const xs = Object.values(M.joints).map(p => p[0]), ys = Object.values(M.joints).map(p => p[1]);
    if (!xs.length) VB = { minX: -1, maxX: innerWidth < 640 ? 7 : 13, minY: -1.5, maxY: innerWidth < 640 ? 6.5 : 5.5 };
    else {
      const ar = (W - 2 * PAD) / (H - 2 * PAD);
      let x0 = Math.min(...xs) - 1.5, x1 = Math.max(...xs) + 1.5, y0 = Math.min(...ys) - 1.5, y1 = Math.max(...ys) + 1.5;
      if (x1 - x0 < 6) { const c = (x0 + x1) / 2; x0 = c - 3; x1 = c + 3; }
      if ((x1 - x0) / (y1 - y0) > ar) { const c = (y0 + y1) / 2, h = (x1 - x0) / ar; y0 = c - h / 2; y1 = c + h / 2; } else { const c = (x0 + x1) / 2, w = (y1 - y0) * ar; x0 = c - w / 2; x1 = c + w / 2; }
      VB = { minX: x0, maxX: x1, minY: y0, maxY: y1 };
    }
    F = frame(VB, W, H, PAD);
  };

  app.innerHTML = `${crumbs('Truss Builder')}
  <header class="lhead"><div><div class="kicker">Lab 1</div><h1>Truss Builder</h1><div class="lhead__ar">ابني، حمّل، وشوف كل member بيعمل إيه. الـ solver بيحل بالـ Method of Joints على كل الـ joints مرة واحدة.</div></div><img class="lhead__face" src="${FACE('starry')}" alt=""></header>
  <div class="block builder">
    <div class="stage builder__stage">
      <div class="toolbar" role="toolbar" aria-label="Tools">${TOOLS.map(([k, n, ic]) => `<button data-tool="${k}" aria-pressed="${k === tool}"><svg viewBox="0 0 24 24">${ic}</svg><span>${n}</span></button>`).join('')}</div>
      <div class="builder__hint ar" id="bHint"></div>
      <div id="bsv" class="builder__canvas"></div>
      <div class="controls">
        <label class="select"><span class="sr">Preset</span><select id="bPreset" aria-label="Load a preset"><option value="">Load a preset…</option>${Object.entries(PRESETS).map(([k, [n]]) => `<option value="${k}">${n}</option>`).join('')}</select></label>
        <button class="mt-btn mt-btn--secondary mt-btn--sm" id="bUndo">↶ Undo</button>
        <button class="mt-btn mt-btn--secondary mt-btn--sm" id="bFit">⤢ Fit view</button>
        <button class="mt-btn mt-btn--secondary mt-btn--sm" id="bLabels" aria-pressed="true">Force labels: on</button>
        <label class="select"><span class="sr">Units</span><select id="bUnit" aria-label="Units"><option>kN</option><option>N</option></select></label>
        ${legend}
      </div>
      <div id="bLoad"></div>
    </div>
    <aside class="builder__side">
      <div class="card" id="bStatus" aria-live="polite"></div>
      <div class="card" id="bTable" style="padding:14px"></div>
    </aside>
  </div>`;
  $('#bUnit', app).value = unit;

  const ids = () => Object.keys(M.joints);
  const nextId = () => { for (const c of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') if (!M.joints[c]) return c; return null; };
  const snap = p => [Math.round(p[0] * 2) / 2, Math.round(p[1] * 2) / 2];
  const near = p => { let best = null, d = Math.max(0.3, 26 / F.s); for (const [id, q] of Object.entries(M.joints)) { const dd = Math.hypot(q[0] - p[0], q[1] - p[1]); if (dd < d) { d = dd; best = id; } } return best; };
  const nearMember = p => { let best = null, d = Math.max(0.2, 18 / F.s); M.members.forEach(([a, b], i) => { const dd = distSeg(p, M.joints[a], M.joints[b]); if (dd < d) { d = dd; best = i; } }); return best; };
  const snapshot = () => { undo.push(JSON.stringify(M)); if (undo.length > 60) undo.shift(); };
  const persist = () => { try { localStorage.setItem(LS, JSON.stringify({ model: M, unit })); } catch { } };
  const labelLoads = () => M.loads.forEach(L => { L.label = `${fmt(Math.hypot(...L.f), 2)} ${unit}`; });

  function render() {
    labelLoads();
    const sol = Object.keys(M.joints).length ? solve(M) : { ok: false, reason: 'empty', m: 0, j: 0, r: 0 };
    // grid
    let grid = '';
    for (let x = Math.ceil(VB.minX); x <= VB.maxX; x++) grid += `<line x1="${F.X(x)}" y1="${F.Y(VB.minY)}" x2="${F.X(x)}" y2="${F.Y(VB.maxY)}" class="g${x === 0 ? ' g0' : ''}"/>${x % 2 === 0 ? `<text x="${F.X(x)}" y="${F.Y(VB.minY) - 6}" class="gt">${x}</text>` : ''}`;
    for (let y = Math.ceil(VB.minY); y <= VB.maxY; y++) grid += `<line x1="${F.X(VB.minX)}" y1="${F.Y(y)}" x2="${F.X(VB.maxX)}" y2="${F.Y(y)}" class="g${y === 0 ? ' g0' : ''}"/>${y % 2 === 0 ? `<text x="${F.X(VB.minX) + 6}" y="${F.Y(y) - 5}" class="gt">${y}</text>` : ''}`;
    const out = svg(M, {
      bounds: VB, width: W, height: H, pad: PAD, uid: 'b',
      forces: sol.ok ? sol.forces : {}, memberLabels: sol.ok && labels, dp: 2,
      showReactions: sol.ok, reactions: sol.reactions, unit: ' ' + unit,
      highlightJoint: pending || selJ, highlightMembers: selM ? [selM] : [],
      overlay: () => '',
    }).replace('<defs>', `<g class="bgrid">${grid}</g><defs>`).replace('class="truss-svg"', 'class="truss-svg truss-svg--edit" data-tool="' + tool + '"');
    $('#bsv', app).innerHTML = out;
    $('#bHint', app).innerHTML = HINT[tool];
    status(sol); table(sol); loadPanel();
    $('#bUndo', app).disabled = !undo.length;
    persist();
    bindCanvas();
  }

  function status(sol) {
    const J = sol.j ?? ids().length, Mm = M.members.length, R = sol.r ?? 0;
    const ok = sol.ok, msg = {
      empty: ['Start building', 'ابدأ بـ 3 joints ومثلث.', 'happy'],
      unstable: ['Unstable', `المجاهيل (${Mm} + ${R} = ${Mm + R}) أقل من المعادلات (2J = ${2 * J}). الـ truss هيتحرك، فزوّد member أو support.`, 'sweat'],
      indeterminate: ['Statically indeterminate', `المجاهيل (${Mm + R}) أكتر من المعادلات (${2 * J}). الـ statics لوحدها مش كفاية، فشيل member أو support زيادة.`, 'think'],
      geometry: ['Unstable shape', 'العدد مظبوط بس الشكل نفسه بيتحرك: فيه panel من غير diagonal، أو supports كلها في نفس الاتجاه.', 'sweat'],
    }[sol.reason] || ['Solved ✓', `<span class="math">M + R = ${Mm} + ${R} = ${2 * J} = 2J</span> والشكل ثابت، يعني الـ truss <b>stable</b> و <b>statically determinate</b>.`, 'laugh'];
    const noLoad = ok && !M.loads.length;
    $('#bStatus', app).innerHTML = `<div class="soon"><img src="${FACE(msg[2])}" alt="" style="width:58px"><div><div class="stage__title">${msg[0]}</div><div class="readout" style="margin-top:6px"><span class="pill">J <b>${J}</b></span><span class="pill">M <b>${Mm}</b></span><span class="pill">R <b>${R}</b></span><span class="pill ${ok ? 'pill--ok' : 'pill--bad'}">M+R ${Mm + R === 2 * J ? '=' : Mm + R < 2 * J ? '<' : '>'} 2J</span></div></div></div><p class="ar" style="margin:10px 0 0;font-size:15px">${noLoad ? 'الـ truss stable بس مفيش أحمال. اختار أداة Load وحط حمل.' : msg[1]}</p>`;
  }

  function table(sol) {
    if (!sol.ok) { $('#bTable', app).innerHTML = `<div class="stage__note">Member forces will appear here once the truss is stable.</div>`; return; }
    const rows = Object.entries(sol.forces).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    const re = Object.entries(sol.reactions).filter(([, r]) => Math.abs(r.value) > 1e-9);
    $('#bTable', app).innerHTML = `<div class="stage__title" style="margin-bottom:6px">Member forces</div>
      <div class="tablewrap"><table class="results"><thead><tr><th>Member</th><th>Force (${unit})</th><th>T/C</th></tr></thead><tbody>${rows.map(([k, f]) => `<tr data-m="${k}" class="${k === selM ? 'is-sel' : ''}"><td>${k}</td><td>${fmt(Math.abs(f), 2)}</td><td class="tag-${state(f)}">${state(f) === 'Z' ? '0' : state(f)}</td></tr>`).join('')}</tbody></table></div>
      <div class="stage__title" style="margin:12px 0 6px">Reactions</div><div class="readout">${re.map(([n, r]) => `<span class="pill pill--info">${n[0]}<sub>${n.slice(1)}</sub> = ${fmt(r.value, 2)} ${unit}</span>`).join('') || '<span class="pill">all zero</span>'}</div>`;
    $$('tr[data-m]', app).forEach(tr => tr.onclick = () => { selM = selM === tr.dataset.m ? null : tr.dataset.m; render(); });
  }

  function loadPanel() {
    const box = $('#bLoad', app);
    if (tool !== 'load' || !selJ || !M.joints[selJ]) { box.innerHTML = ''; return; }
    const L = M.loads.find(l => l.at === selJ), f = L ? L.f : [0, 0];
    box.innerHTML = `<div class="loadbox"><b>Load at joint ${selJ}</b>
      <label>F<sub>x</sub> <input type="number" step="any" id="lfx" value="${f[0]}" inputmode="decimal"></label>
      <label>F<sub>y</sub> <input type="number" step="any" id="lfy" value="${f[1]}" inputmode="decimal"></label><span class="muted">${unit}</span>
      <span class="loadbox__q">${[['↓ 10', [0, -10]], ['← 10', [-10, 0]], ['→ 10', [10, 0]], ['↑ 10', [0, 10]]].map(([t, v]) => `<button class="mt-btn mt-btn--secondary mt-btn--sm" data-q="${v}">${t}</button>`).join('')}<button class="mt-btn mt-btn--ghost mt-btn--sm" data-q="0,0">Clear</button></span></div>`;
    const apply = v => { snapshot(); M.loads = M.loads.filter(l => l.at !== selJ); if (v[0] || v[1]) M.loads.push({ at: selJ, f: v }); render(); };
    $$('[data-q]', box).forEach(b => b.onclick = () => apply(b.dataset.q.split(',').map(Number)));
    const onIn = () => { const v = [+$('#lfx', box).value || 0, +$('#lfy', box).value || 0]; M.loads = M.loads.filter(l => l.at !== selJ); if (v[0] || v[1]) M.loads.push({ at: selJ, f: v }); const fx = document.activeElement?.id; render(); const el = $('#' + fx, app); if (el) { el.focus(); const n = el.value.length; try { el.setSelectionRange(n, n); } catch { } } };
    $('#lfx', box).oninput = onIn; $('#lfy', box).oninput = onIn;
  }

  function bindCanvas() {
    const svgEl = $('#bsv svg', app);
    svgEl.onpointerdown = ev => {
      const p = toWorldFromEvent(svgEl, ev, F.inv), j = near(p);
      if (tool === 'joint') { if (!j) { const id = nextId(); if (!id) return toast('Max 26 joints', 'sweat'); snapshot(); M.joints[id] = snap(p); render(); } else { selJ = j; render(); } }
      else if (tool === 'member') {
        let tgt = j;
        if (!tgt) { const id = nextId(); if (!id) return; snapshot(); M.joints[id] = snap(p); tgt = id; }
        if (pending && tgt === pending) { pending = null; }
        else if (pending) {
          const k = key(pending, tgt);
          if (!M.members.some(([a, b]) => key(a, b) === k)) { if (j) snapshot(); M.members.push([pending, tgt]); }
          pending = tgt;
        } else pending = tgt;
        render();
      }
      else if (tool === 'support' && j) {
        snapshot(); const s = M.supports[j];
        const cyc = !s ? 'pin' : s === 'pin' ? { dir: [0, 1] } : (s.dir && s.dir[1] === 1) ? { dir: [1, 0] } : null;
        if (cyc) M.supports[j] = cyc; else delete M.supports[j];
        render();
      }
      else if (tool === 'load') { selJ = j || null; render(); setTimeout(() => $('#lfy', app)?.focus(), 30); }
      else if (tool === 'move' && j) {
        snapshot(); drag = j; ev.preventDefault();
        dragLoop(() => $('#bsv svg', app), F.inv, q => {
          const p = snap(q); p[0] = Math.max(VB.minX, Math.min(VB.maxX, p[0])); p[1] = Math.max(VB.minY, Math.min(VB.maxY, p[1]));
          const cur = M.joints[drag]; if (!cur || (cur[0] === p[0] && cur[1] === p[1])) return;
          if (Object.entries(M.joints).some(([id, r]) => id !== drag && r[0] === p[0] && r[1] === p[1])) return;
          M.joints[drag] = p; render();
        });
      }
      else if (tool === 'delete') {
        if (j) { snapshot(); delete M.joints[j]; M.members = M.members.filter(([a, b]) => a !== j && b !== j); delete M.supports[j]; M.loads = M.loads.filter(l => l.at !== j); render(); }
        else { const i = nearMember(p); if (i !== null) { snapshot(); M.members.splice(i, 1); render(); } }
      }
    };
  }

  $$('[data-tool]', app).forEach(b => b.onclick = () => { tool = b.dataset.tool; pending = null; if (tool !== 'load') selJ = null; $$('[data-tool]', app).forEach(x => x.setAttribute('aria-pressed', x === b)); render(); });
  $('#bUndo', app).onclick = () => { if (!undo.length) return; M = JSON.parse(undo.pop()); pending = null; render(); };
  $('#bLabels', app).onclick = e => { labels = !labels; e.currentTarget.setAttribute('aria-pressed', labels); e.currentTarget.textContent = 'Force labels: ' + (labels ? 'on' : 'off'); render(); };
  $('#bUnit', app).onchange = e => { unit = e.target.value; render(); };
  $('#bPreset', app).onchange = e => {
    const p = PRESETS[e.target.value]; if (!p) return;
    snapshot(); M = clone(p[1]()); unit = p[2]; $('#bUnit', app).value = unit; pending = selJ = selM = null;
    if (e.target.value === 'empty') { tool = 'joint'; $$('[data-tool]', app).forEach(x => x.setAttribute('aria-pressed', x.dataset.tool === 'joint')); }
    e.target.value = ''; fit(); render();
  };
  $('#bFit', app).onclick = () => { fit(); render(); };
  addEventListener('keydown', function onKey(e) {
    if (!document.body.contains($('#bsv', app))) return removeEventListener('keydown', onKey);
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); $('#bUndo', app).click(); }
    if (e.key === 'Escape') { pending = null; render(); }
  });
  fit(); render();
}

// =====================================================================
// 2. JOINT LAB — balance the pin, close the force polygon
// =====================================================================
const JOINT_CASES = [
  { model: 'ex1', joint: 'A', unk: ['AB', 'AD'], title: 'Example 1 · Joint A', unit: 'N' },
  { model: 'ex1', joint: 'B', unk: ['BD', 'BC'], title: 'Example 1 · Joint B', unit: 'N' },
  { model: 'ex1', joint: 'C', unk: ['CD'], title: 'Example 1 · Joint C', unit: 'N' },
  { model: 'ex2', joint: 'D', unk: ['DE', 'BD'], title: 'Example 2 · Joint D', unit: 'N' },
  { model: 'ex2', joint: 'E', unk: ['AE', 'BE'], title: 'Example 2 · Joint E', unit: 'N' },
  { model: 'warren', joint: 'L1', unk: ['L1L2', 'L1U2'], title: 'Warren bridge · Joint L1', unit: 'kN' },
];

function buildCase(c) {
  const m = MODELS[c.model], sol = solve(m), P = m.joints[c.joint];
  const forces = [];   // {name, dir:[x,y], value, kind:'known'|'unk'|'load'|'react', answer}
  m.members.forEach(([a, b]) => {
    if (a !== c.joint && b !== c.joint) return;
    const other = a === c.joint ? b : a, k = key(a, b), e = norm([m.joints[other][0] - P[0], m.joints[other][1] - P[1]]);
    forces.push({ name: 'F' + k, k, dir: e, value: sol.forces[k], answer: sol.forces[k], kind: c.unk.includes(k) ? 'unk' : 'known' });
  });
  (m.loads || []).filter(L => L.at === c.joint).forEach(L => forces.push({ name: 'P', dir: norm(L.f), value: Math.hypot(...L.f), kind: 'load' }));
  Object.entries(sol.reactions).filter(([, r]) => r.at === c.joint && Math.abs(r.value) > 1e-9).forEach(([n, r]) => forces.push({ name: n, dir: r.dir, value: r.value, kind: 'react' }));
  return { ...c, forces, max: Math.max(...forces.map(f => Math.abs(f.value))) };
}

function jointLab(app) {
  let ci = 0, C = buildCase(JOINT_CASES[0]), vals = {};
  app.innerHTML = `${crumbs('Joint Lab')}
  <header class="lhead"><div><div class="kicker">Lab 2</div><h1>Joint Lab</h1><div class="lhead__ar">الـ pin لازم يبقى في equilibrium. حرّك الـ sliders بتاعة القوى المجهولة لحد ما المحصّلة تبقى صفر ومضلع القوى يقفل. افتكر: افترض Tension، والسالب يبقى Compression.</div></div><img class="lhead__face" src="${FACE('think')}" alt=""></header>
  <div class="block"><div class="seg seg--wrap" id="jCases">${JOINT_CASES.map((c, i) => `<button data-i="${i}" aria-pressed="${i === 0}">${c.title}</button>`).join('')}</div></div>
  <div class="block grid2" style="align-items:start">
    <div class="stage"><div class="stage__bar"><div class="stage__title">Free-body diagram of the pin</div>${legend}</div><div id="jFbd"></div></div>
    <div class="stage"><div class="stage__bar"><div class="stage__title">Force polygon (tip-to-tail)</div><div class="stage__note">Closed polygon = equilibrium</div></div><div id="jPoly"></div></div>
  </div>
  <div class="block card" id="jCtrl"></div>`;

  const reset = () => { C = buildCase(JOINT_CASES[ci]); vals = Object.fromEntries(C.forces.filter(f => f.kind === 'unk').map(f => [f.k, 0])); drawCtrl(); draw(); };
  const val = f => f.kind === 'unk' ? vals[f.k] : f.value;
  const sum = () => C.forces.reduce((s, f) => [s[0] + f.dir[0] * val(f), s[1] + f.dir[1] * val(f)], [0, 0]);
  const tol = () => Math.max(0.005 * C.max, 0.01);

  function arrowSvg(x0, y0, x1, y1, color, w = 6, dash = '') {
    return `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${color}" stroke-width="${w}" stroke-linecap="round" ${dash ? `stroke-dasharray="${dash}"` : ''} marker-end="url(#jm-${color.replace(/[^a-z]/gi, '')})"/>`;
  }
  const markers = cols => `<defs>${cols.map(c => `<marker id="jm-${c.replace(/[^a-z]/gi, '')}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10z" fill="${c}"/></marker>`).join('')}</defs>`;
  const colorOf = f => f.kind === 'load' ? 'var(--cinnamon)' : f.kind === 'react' ? '#4F84C4' : Math.abs(val(f)) < 1e-9 ? 'var(--z-color)' : val(f) > 0 ? 'var(--t-color)' : 'var(--c-color)';
  const COLS = ['var(--cinnamon)', '#4F84C4', 'var(--t-color)', 'var(--c-color)', 'var(--z-color)', 'var(--salmon)'];

  function draw() {
    // FBD: every force drawn as an arrow from the pin (tension pulls the pin toward the member)
    const W = 420, H = 360, cx = W / 2, cy = H / 2, L = 120, sc = 120 / C.max;
    let g = markers(COLS);
    C.forces.forEach(f => {
      const v = val(f), d = [f.dir[0], -f.dir[1]];
      if (f.kind === 'known' || f.kind === 'unk') g += `<line x1="${cx}" y1="${cy}" x2="${cx + d[0] * 170}" y2="${cy + d[1] * 170}" stroke="var(--n-color)" stroke-width="3" opacity=".25"/>`;
      const len = Math.max(Math.abs(v) * sc, 0), s = Math.sign(v) || 1;
      if (len > 2) {
        // tension: arrow leaves the pin along the member; compression: arrow points into the pin
        const tip = s > 0 ? [cx + d[0] * (14 + len), cy + d[1] * (14 + len)] : [cx + d[0] * 14, cy + d[1] * 14];
        const tail = s > 0 ? [cx + d[0] * 14, cy + d[1] * 14] : [cx + d[0] * (14 + len), cy + d[1] * (14 + len)];
        if (f.kind === 'load' || f.kind === 'react') { tip[0] = cx + s * d[0] * (14 + len); tip[1] = cy + s * d[1] * (14 + len); tail[0] = cx + s * d[0] * 14; tail[1] = cy + s * d[1] * 14; }
        g += arrowSvg(...tail, ...tip, colorOf(f), f.kind === 'unk' ? 7 : 5);
      }
      const ls = (f.kind === 'load' || f.kind === 'react') ? (Math.sign(v) || 1) : 1;
      const lx = cx + ls * d[0] * (40 + Math.max(len, 50)), ly = cy + ls * d[1] * (40 + Math.max(len, 50));
      g += `<text x="${lx}" y="${ly + 5}" text-anchor="middle" class="jlbl${f.kind === 'unk' ? ' is-unk' : ''}">${f.name === 'P' ? 'P' : subName(f.name)}${f.kind === 'unk' ? '' : ` = ${fmt(Math.abs(val(f)), 1)}`}</text>`;
    });
    const R = sum(), rl = Math.hypot(...R) * sc;
    if (Math.hypot(...R) > tol()) g += arrowSvg(cx, cy, cx + R[0] * sc, cy - R[1] * sc, 'var(--salmon)', 4, '8 6');
    g += `<circle cx="${cx}" cy="${cy}" r="12" fill="var(--surface-raised)" stroke="var(--outline)" stroke-width="3.5"/><text x="${cx + 16}" y="${cy - 16}" class="jlbl">${C.joint}</text>`;
    $('#jFbd', app).innerHTML = `<svg class="truss-svg" viewBox="0 0 ${W} ${H}">${g}</svg>`;

    // polygon: chain the force vectors tip to tail
    let pts = [[0, 0]];
    const order = [...C.forces.filter(f => f.kind !== 'unk'), ...C.forces.filter(f => f.kind === 'unk')];
    order.forEach(f => { const v = val(f), last = pts[pts.length - 1]; pts.push([last[0] + f.dir[0] * v, last[1] + f.dir[1] * v]); });
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const PW = 420, PH = 360, span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), C.max * 0.5);
    const ps = (PW - 120) / span, mx = (Math.max(...xs) + Math.min(...xs)) / 2, my = (Math.max(...ys) + Math.min(...ys)) / 2;
    const PX = x => PW / 2 + (x - mx) * ps, PY = y => PH / 2 + 12 - (y - my) * ps;
    let pg = markers(COLS);
    order.forEach((f, i) => { const a = pts[i], b = pts[i + 1]; if (Math.hypot(b[0] - a[0], b[1] - a[1]) * ps > 3) pg += arrowSvg(PX(a[0]), PY(a[1]), PX(b[0]), PY(b[1]), colorOf(f), 5); pg += `<text x="${(PX(a[0]) + PX(b[0])) / 2 + 8}" y="${(PY(a[1]) + PY(b[1])) / 2 - 8}" class="jlbl jlbl--sm">${f.name === 'P' ? 'P' : subName(f.name)}</text>`; });
    const closed = Math.hypot(...R) <= tol();
    pg += `<circle cx="${PX(0)}" cy="${PY(0)}" r="7" fill="${closed ? 'var(--mint)' : 'var(--salmon)'}" stroke="var(--outline)" stroke-width="3"/>`;
    if (!closed) pg += `<line x1="${PX(pts[pts.length - 1][0])}" y1="${PY(pts[pts.length - 1][1])}" x2="${PX(0)}" y2="${PY(0)}" stroke="var(--salmon)" stroke-width="3" stroke-dasharray="6 6"/>`;
    $('#jPoly', app).innerHTML = `<svg class="truss-svg" viewBox="0 0 ${PW} ${PH}">${pg}<text x="12" y="22" class="jlbl jlbl--sm">${closed ? 'Closed ✓ ΣF = 0' : 'Gap = resultant (not in equilibrium yet)'}</text></svg>`;
    // readouts
    const r = $('#jRead', app);
    if (r) r.innerHTML = `<span class="pill ${Math.abs(R[0]) <= tol() ? 'pill--ok' : 'pill--bad'}">ΣF<sub>x</sub> = ${fmt(R[0], 2)}</span><span class="pill ${Math.abs(R[1]) <= tol() ? 'pill--ok' : 'pill--bad'}">ΣF<sub>y</sub> = ${fmt(R[1], 2)}</span>${closed ? `<span class="pill pill--ok">Balanced! ${C.forces.filter(f => f.kind === 'unk').map(f => `${f.name} = ${fmt(Math.abs(val(f)), 2)} ${C.unit} (${state(val(f))})`).join(' · ')}</span>` : ''}`;
    if (closed && !C.done) { C.done = true; toast('ΣF = 0 · the pin is in equilibrium!', 'starry'); }
    if (!closed) C.done = false;
  }

  function drawCtrl() {
    const unk = C.forces.filter(f => f.kind === 'unk'), lim = Math.ceil(C.max * 1.6);
    $('#jCtrl', app).innerHTML = `<div class="stage__title" style="margin-bottom:6px">Your unknowns · assume Tension (+)</div>
      ${unk.map(f => `<div class="jrow"><label for="s-${f.k}"><b>${f.name}</b></label><input type="range" id="s-${f.k}" min="${-lim}" max="${lim}" step="${C.unit === 'kN' ? 0.05 : 1}" value="0"><input type="number" id="n-${f.k}" step="any" value="0" inputmode="decimal" aria-label="${f.name} value"><span class="muted">${C.unit}</span></div>`).join('')}
      <div class="readout" id="jRead"></div>
      <div class="controls"><button class="mt-btn mt-btn--secondary mt-btn--sm" id="jHint">Hint: show the equations</button><button class="mt-btn mt-btn--ghost mt-btn--sm" id="jShow">Show answer</button><button class="mt-btn mt-btn--ghost mt-btn--sm" id="jReset">Reset</button></div><div id="jEq"></div>`;
    unk.forEach(f => {
      const s = $('#s-' + f.k, app), n = $('#n-' + f.k, app);
      s.oninput = () => { vals[f.k] = +s.value; n.value = s.value; draw(); };
      n.oninput = () => { vals[f.k] = +n.value || 0; s.value = vals[f.k]; draw(); };
    });
    $('#jReset', app).onclick = reset;
    $('#jShow', app).onclick = () => { unk.forEach(f => { vals[f.k] = Math.round(f.answer * 100) / 100; $('#s-' + f.k, app).value = vals[f.k]; $('#n-' + f.k, app).value = vals[f.k]; }); draw(); };
    $('#jHint', app).onclick = () => {
      const term = (f, i) => { const c = f.dir[i]; if (Math.abs(c) < 1e-9) return ''; const coef = Math.abs(Math.abs(c) - 1) < 1e-9 ? '' : fmt(Math.abs(c), 3) + ' '; const nm = f.kind === 'unk' ? f.name : fmt(f.value, 2); return `${c < 0 ? '− ' : '+ '}${coef}${f.kind === 'unk' ? nm : `(${nm})`}`; };
      const eq = i => C.forces.map(f => term(f, i)).filter(Boolean).join(' ').replace(/^\+ /, '') + ' = 0';
      $('#jEq', app).innerHTML = `<div class="eq"><div>ΣF<sub>x</sub>: ${eq(0)}</div><div>ΣF<sub>y</sub>: ${eq(1)}</div></div><p class="ar muted" style="margin:0;font-size:14.5px">كل member مكتوب على إنه Tension (بيشدّ الـ pin ناحيته). المركّبات جاية من اتجاه الـ member: cos و sin الزاوية.</p>`;
    };
  }
  $$('#jCases button', app).forEach(b => b.onclick = () => { ci = +b.dataset.i; $$('#jCases button', app).forEach(x => x.setAttribute('aria-pressed', x === b)); reset(); });
  reset();
}

// =====================================================================
// 3. SECTION CUTTER — drag a cut line in any direction
// =====================================================================
function cutterLab(app) {
  const OPTS = { pratt: 'Pratt bridge', howe: 'Howe bridge', warren: 'Warren bridge', ex1: 'Example 1', ex2: 'Example 2', builder: 'My Truss Builder model' };
  let which = 'pratt', m, sol, unit, part = 0, p1, p2, drag = null;
  const W = 900, H = 460, PAD = 60;
  app.innerHTML = `${crumbs('Section Cutter')}
  <header class="lhead"><div><div class="kicker">Lab 3</div><h1>Section Cutter</h1><div class="lhead__ar">اسحب أطراف خط القطع (الدواير اللي لونها salmon) في أي اتجاه. القطع الصح لازم يقسم الـ truss لحتتين، ويعدّي على 3 members أو أقل.</div></div><img class="lhead__face" src="${FACE('wink')}" alt=""></header>
  <div class="block"><div class="seg seg--wrap" id="cModels">${Object.entries(OPTS).map(([k, n]) => `<button data-k="${k}" aria-pressed="${k === which}">${n}</button>`).join('')}</div></div>
  <div class="block stage"><div class="stage__bar"><div class="stage__title" id="cTitle"></div>${legend}</div><div id="csv2" class="builder__canvas"></div>
    <div class="controls"><div class="seg" id="cPart"><button data-p="0" aria-pressed="true">Keep part 1</button><button data-p="1" aria-pressed="false">Keep part 2</button></div><button class="mt-btn mt-btn--secondary mt-btn--sm" id="cVert">Make it vertical</button></div>
    <div id="cinfo2" style="margin-top:12px"></div></div>`;

  function load() {
    if (which === 'builder') { try { const s = JSON.parse(localStorage.getItem(LS)); m = s.model; unit = s.unit; } catch { m = null; } }
    else { m = MODELS[which]; unit = which.startsWith('ex') ? 'N' : 'kN'; }
    sol = m && Object.keys(m.joints).length ? solve(m) : { ok: false };
    if (!sol.ok) { $('#csv2', app).innerHTML = `<div class="withface" style="padding:20px"><div class="bubble bubble--soft ar">الموديل اللي في الـ Truss Builder لسه مش stable. ارجع ظبّطه الأول، وبعدين تعالى اقطعه. <a href="#/labs/builder">افتح الـ Builder ←</a></div><img src="${FACE('sweat')}" alt=""></div>`; $('#cinfo2', app).innerHTML = ''; return; }
    const xs = Object.values(m.joints).map(p => p[0]), ys = Object.values(m.joints).map(p => p[1]);
    const xm = (Math.min(...xs) + Math.max(...xs)) / 2 + (Math.max(...xs) - Math.min(...xs)) * 0.08;
    p1 = [xm, Math.max(...ys) + 0.6]; p2 = [xm, Math.min(...ys) - 0.6]; part = 0;
    draw();
  }
  const bounds = () => { const xs = Object.values(m.joints).map(p => p[0]), ys = Object.values(m.joints).map(p => p[1]); return { minX: Math.min(...xs) - 1.2, maxX: Math.max(...xs) + 1.2, minY: Math.min(...ys) - 1.4, maxY: Math.max(...ys) + 1.2 }; };
  const segX = (a, b, c, d) => { const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]); return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0; };

  function draw() {
    const B = bounds(), Fm = frame(B, W, H, PAD);
    const cut = m.members.filter(([a, b]) => segX(p1, p2, m.joints[a], m.joints[b]));
    const cutK = cut.map(mm => key(...mm));
    // components after removing the cut members
    const adj = Object.fromEntries(Object.keys(m.joints).map(j => [j, []]));
    m.members.forEach(([a, b]) => { if (!cutK.includes(key(a, b))) { adj[a].push(b); adj[b].push(a); } });
    const comp = {}; let n = 0;
    for (const j of Object.keys(m.joints)) { if (comp[j] !== undefined) continue; const st = [j]; comp[j] = n; while (st.length) { const x = st.pop(); adj[x].forEach(y => { if (comp[y] === undefined) { comp[y] = n; st.push(y); } }); } n++; }
    const divides = n === 2 && cut.length > 0;
    // name the parts by side of the cut line so "part 1" stays on the same side
    const side = j => { const q = m.joints[j]; return Math.sign((p2[0] - p1[0]) * (q[1] - p1[1]) - (p2[1] - p1[1]) * (q[0] - p1[0])); };
    let keepComp = null;
    if (divides) { const c0 = Object.keys(comp).find(j => comp[j] === 0); const s0 = side(c0) >= 0 ? 0 : 1; keepComp = part === s0 ? 0 : 1; }
    const inKeep = j => keepComp === null || comp[j] === keepComp;
    const dim = m.members.filter(([a, b]) => !cutK.includes(key(a, b)) && !(inKeep(a) && inKeep(b))).map(mm => key(...mm));
    const forces = cut.length <= 3 && divides ? Object.fromEntries(cutK.map(k => [k, sol.forces[k]])) : {};
    const ov = () => `<line class="cutline" x1="${Fm.X(p1[0])}" y1="${Fm.Y(p1[1])}" x2="${Fm.X(p2[0])}" y2="${Fm.Y(p2[1])}"/>` +
      [p1, p2].map((p, i) => `<circle class="handle" data-h="${i}" cx="${Fm.X(p[0])}" cy="${Fm.Y(p[1])}" r="16"/><text class="cutlabel" x="${Fm.X(p[0]) + 20}" y="${Fm.Y(p[1]) + 6}">n</text>`).join('');
    $('#csv2', app).innerHTML = svg(m, { bounds: B, width: W, height: H, pad: PAD, uid: 'cx', forces, highlightMembers: cutK, dim, showReactions: true, reactions: sol.reactions, unit: ' ' + unit, keepJoint: inKeep, overlay: ov });
    $('#cTitle', app).textContent = OPTS[which];
    const how = cut.length <= 3 && divides ? momentHow(m, cut) : [];
    const msg = !cut.length ? 'اسحب الخط لحد ما يعدّي على members.' : !divides ? 'القطع لسه ما قسمش الـ truss لحتتين. طوّل الخط لحد ما يعدّي من فوق لتحت خالص.' : cut.length > 3 ? `القطع عدّى على ${cut.length} members، والحتة الواحدة ليها 3 معادلات بس. غيّر مكان القطع، أو طلّع member منهم بالـ joints الأول.` : 'قطع صح! خُد الـ moment عند النقطة اللي في جدول «Use» عشان يطلعلك مجهول واحد على طول.';
    $('#cinfo2', app).innerHTML = `<div class="readout"><span class="pill ${cut.length && cut.length <= 3 ? 'pill--ok' : 'pill--bad'}">Members cut: <b>${cut.length}</b></span><span class="pill ${divides ? 'pill--ok' : 'pill--bad'}">${divides ? 'Splits into 2 parts ✓' : 'Doesn’t split the truss'}</span></div>
      <p class="ar" style="margin:10px 0">${msg}</p>
      ${how.length ? `<div class="tablewrap"><table class="results"><thead><tr><th>Cut member</th><th>Use</th><th>Force</th><th>T/C</th></tr></thead><tbody>${how.map(([mm, h]) => { const f = sol.forces[key(...mm)]; return `<tr><td>${mm[0]}${mm[1]}</td><td>${h}</td><td>${fmt(Math.abs(f), 2)} ${unit}</td><td class="tag-${state(f)}">${state(f) === 'Z' ? '0' : state(f)}</td></tr>`; }).join('')}</tbody></table></div>` : ''}
      ${which === 'howe' || which === 'pratt' ? `<div class="khamseena" style="margin-top:14px"><svg viewBox="0 0 20 24" aria-hidden="true"><path d="M3 2h14c0 4-3.4 6-3.4 10S16 18.5 16 22H4c0-3.5 2.4-6 2.4-10S3 6 3 2z M5 6.5h10"/></svg><div><div class="khamseena__k">في الخمسينة</div><div class="khamseena__t">قارن الـ diagonals في Pratt وHowe: في Pratt شغالين Tension، وفي Howe شغالين Compression. نفس الأحمال، بس اتجاه الـ diagonal غيّر كل حاجة. وعشان كده Pratt بيناسب الحديد (القضبان الرفيعة بتستحمل الشد كويس).</div></div></div>` : ''}`;
    bind(Fm);
  }
  function bind(Fm) {
    const svgEl = $('#csv2 svg', app); if (!svgEl) return;
    svgEl.onpointerdown = ev => {
      const p = toWorldFromEvent(svgEl, ev, Fm.inv);
      const d1 = Math.hypot(p[0] - p1[0], p[1] - p1[1]), d2 = Math.hypot(p[0] - p2[0], p[1] - p2[1]);
      const lim = 30 / Fm.s;
      drag = d1 < lim ? 0 : d2 < lim ? 1 : null;
      if (drag === null) { // tap elsewhere: move the whole line so it passes through the tap, keeping its direction
        const dx = p2[0] - p1[0], dy = p2[1] - p1[1], mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;
        p1 = [p[0] - dx / 2, p[1] - dy / 2]; p2 = [p[0] + dx / 2, p[1] + dy / 2]; void mx; void my; draw(); return;
      }
      ev.preventDefault();
      const h = drag;
      dragLoop(() => $('#csv2 svg', app), Fm.inv, q => { if (h === 0) p1 = q; else p2 = q; draw(); });
    };
  }
  $$('#cModels button', app).forEach(b => b.onclick = () => { which = b.dataset.k; $$('#cModels button', app).forEach(x => x.setAttribute('aria-pressed', x === b)); load(); });
  $$('#cPart button', app).forEach(b => b.onclick = () => { part = +b.dataset.p; $$('#cPart button', app).forEach(x => x.setAttribute('aria-pressed', x === b)); draw(); });
  $('#cVert', app).onclick = () => { if (!m) return; const xm = (p1[0] + p2[0]) / 2; const B = bounds(); p1 = [xm, B.maxY - 0.6]; p2 = [xm, B.minY + 0.8]; draw(); };
  load();
}
