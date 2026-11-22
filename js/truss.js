// Comnt Trusses Lab — tiny 2D truss solver + SVG renderer (no dependencies)
// Convention: member force > 0 = Tension (pulls on the pin), < 0 = Compression.

const EPS = 1e-9;

// ---------- Solver ----------
// model = { joints:{A:[x,y],...}, members:[['A','B'],...],
//           supports:{A:'pin', C:{dir:[1,0]}}   // roller: one reaction along dir
//           loads:[{at:'D', f:[fx,fy]}] }
export function solve(model) {
  const ids = Object.keys(model.joints);
  const idx = Object.fromEntries(ids.map((id, i) => [id, i]));
  const unknowns = [];                                   // labels for each column
  model.members.forEach(([a, b]) => unknowns.push({ kind: 'member', a, b, name: a + b }));
  for (const [j, s] of Object.entries(model.supports || {})) {
    if (s === 'pin' || s.type === 'pin') {
      unknowns.push({ kind: 'reaction', at: j, dir: [1, 0], name: 'X' + j });
      unknowns.push({ kind: 'reaction', at: j, dir: [0, 1], name: 'Y' + j });
    } else {
      const d = norm(s.dir || [0, 1]);
      unknowns.push({ kind: 'reaction', at: j, dir: d, name: (s.name || 'N' + j) });
    }
  }
  const nEq = ids.length * 2, nUn = unknowns.length;
  const A = Array.from({ length: nEq }, () => new Array(nUn).fill(0));
  const b = new Array(nEq).fill(0);
  unknowns.forEach((u, c) => {
    if (u.kind === 'member') {
      const pa = model.joints[u.a], pb = model.joints[u.b];
      const e = norm([pb[0] - pa[0], pb[1] - pa[1]]);   // unit A→B
      // tension pulls joint A toward B, and joint B toward A
      A[2 * idx[u.a]][c] += e[0]; A[2 * idx[u.a] + 1][c] += e[1];
      A[2 * idx[u.b]][c] -= e[0]; A[2 * idx[u.b] + 1][c] -= e[1];
    } else {
      A[2 * idx[u.at]][c] += u.dir[0]; A[2 * idx[u.at] + 1][c] += u.dir[1];
    }
  });
  (model.loads || []).forEach(L => { b[2 * idx[L.at]] -= L.f[0]; b[2 * idx[L.at] + 1] -= L.f[1]; });
  const x = lsq(A, b, nUn);
  if (!x) return { ok: false, reason: nUn < nEq ? 'unstable' : 'indeterminate', m: model.members.length, j: ids.length, r: nUn - model.members.length };
  const forces = {}, reactions = {};
  unknowns.forEach((u, c) => {
    const v = Math.abs(x[c]) < 1e-7 ? 0 : x[c];
    if (u.kind === 'member') forces[key(u.a, u.b)] = v; else reactions[u.name] = { at: u.at, dir: u.dir, value: v };
  });
  return { ok: true, forces, reactions, m: model.members.length, j: ids.length, r: nUn - model.members.length };
}

// Gauss–Jordan for square systems; for non-square returns null (statically indeterminate/unstable)
function lsq(A, b, n) {
  if (A.length !== n) return null;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < EPS) return null;            // singular → unstable
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      if (f) for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}

export const key = (a, b) => (a < b ? a + b : b + a);
export const norm = v => { const L = Math.hypot(v[0], v[1]) || 1; return [v[0] / L, v[1] / L]; };
export const state = f => (Math.abs(f) < 1e-6 ? 'Z' : f > 0 ? 'T' : 'C');
export const fmt = (v, d = 2) => {
  const r = Math.round(v * 10 ** d) / 10 ** d;
  return (Object.is(r, -0) ? 0 : r).toLocaleString('en-US', { maximumFractionDigits: d });
};

// ---------- Renderer ----------
// opts: { forces, unit, labels:true, memberLabels:false, highlightJoint, highlightMembers:[], dim:[],
//         showReactions:false, reactions, cut:{x}|{p1,p2}, hideLoads, width, height, pad, tappable }
export function svg(model, opts = {}) {
  const P = Object.values(model.joints);
  const xs = P.map(p => p[0]), ys = P.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const spanX = Math.max(maxX - minX, 0.5), spanY = Math.max(maxY - minY, 0.5);
  const W = opts.width || 640, H = opts.height || Math.round(Math.min(460, Math.max(260, W * (spanY + 1.2) / (spanX + 1.6))));
  const pad = opts.pad ?? 78;
  const s = Math.min((W - 2 * pad) / spanX, (H - 2 * pad) / spanY);
  const ox = (W - s * spanX) / 2 - s * minX, oy = (H + s * spanY) / 2 + s * minY;
  const X = x => ox + s * x, Y = y => oy - s * y;
  const J = id => [X(model.joints[id][0]), Y(model.joints[id][1])];
  const forces = opts.forces || {};
  const hl = new Set(opts.highlightMembers || []), dim = new Set(opts.dim || []);
  let out = `<svg class="truss-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${opts.aria || 'Truss diagram'}">`;
  out += `<defs><marker id="ah${opts.uid || ''}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="context-stroke"/></marker></defs>`;
  // supports (under members)
  for (const [j, sp] of Object.entries(model.supports || {})) out += supportGlyph(J(j), sp);
  // members
  model.members.forEach(([a, b]) => {
    const k = key(a, b), f = forces[k];
    const st = f === undefined ? 'N' : state(f);
    const [x1, y1] = J(a), [x2, y2] = J(b);
    const cls = ['mem', 'mem--' + st, hl.has(k) ? 'is-hl' : '', dim.has(k) ? 'is-dim' : '', opts.tappable ? 'is-tap' : ''].join(' ');
    out += `<g class="${cls}" data-m="${k}"><line class="mem__hit" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><line class="mem__bar" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    if (opts.memberLabels && f !== undefined) {
      let mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      if (opts.cut && Math.abs(x2 - x1) > 1) {   // keep the tag off the cut line, on the kept side
        const tx = X(opts.cut.x) + (opts.tagSide === 'right' ? 46 : -46), tt = (tx - x1) / (x2 - x1);
        if (tt > 0.08 && tt < 0.92) { mx = x1 + tt * (x2 - x1); my = y1 + tt * (y2 - y1); }
      }
      const txt = st === 'Z' ? '0' : `${fmt(Math.abs(f), opts.dp ?? 1)} ${st}`;
      out += `<g class="mem__tag"><rect x="${mx - 34}" y="${my - 13}" width="68" height="26" rx="13"/><text x="${mx}" y="${my + 5}">${txt}</text></g>`;
    }
    out += `</g>`;
  });
  // cut line
  if (opts.cut) {
    const cx = X(opts.cut.x);
    out += `<line class="cutline" x1="${cx}" y1="${16}" x2="${cx}" y2="${H - 16}"/><text class="cutlabel" x="${cx + 8}" y="${30}">n</text><text class="cutlabel" x="${cx + 8}" y="${H - 22}">n</text>`;
  }
  // loads
  const keep = opts.keepJoint || (() => true);
  if (!opts.hideLoads) (model.loads || []).filter(L => keep(L.at)).forEach(L => {
    // a load whose tail would sit inside the truss is drawn "hanging" (tail at the joint) so it never crosses members
    const p = model.joints[L.at], d = norm(L.f), q = [p[0] - d[0] * 0.35 * spanX, p[1] - d[1] * 0.35 * spanY];
    const inside = q[0] >= minX - 1e-6 && q[0] <= maxX + 1e-6 && q[1] >= minY - 1e-6 && q[1] <= maxY + 1e-6;
    out += arrow(J(L.at), L.f, 'load', L.label, opts.uid, inside);
  });
  // reactions
  if (opts.showReactions && opts.reactions) for (const r of Object.values(opts.reactions)) {
    if (Math.abs(r.value) < 1e-9 || !keep(r.at)) continue;
    const v = [r.dir[0] * r.value, r.dir[1] * r.value];
    out += arrow(J(r.at), v, 'react', `${fmt(Math.abs(r.value), opts.dp ?? 0)}${opts.unit || ''}`, opts.uid, false);
  }
  // joints
  Object.keys(model.joints).forEach(id => {
    const [x, y] = J(id);
    const on = opts.highlightJoint === id;
    out += `<g class="jnt${on ? ' is-on' : ''}" data-j="${id}"><circle cx="${x}" cy="${y}" r="${on ? 11 : 8}"/>`;
    if (opts.labels !== false) {
      const o = labelOffset(model, id);
      out += `<text class="jnt__lbl" x="${x + o[0] * 22}" y="${y - o[1] * 22 + 6}">${id}</text>`;
    }
    out += `</g>`;
  });
  if (opts.overlay) out += opts.overlay(X, Y, J);
  return out + `</svg>`;

  function arrow([x, y], f, cls, label, uid, hang) {
    const d = norm([f[0], -f[1]]); const L = 54, g = cls === 'react' ? 40 : 12;   // reactions start below the support glyph
    // normal: arrow ends at the joint (pushes in). hang: arrow starts at the joint (pulls out)
    let x0, y0, x1, y1;
    if (hang) { x0 = x + d[0] * 12; y0 = y + d[1] * 12; x1 = x + d[0] * (L + 12); y1 = y + d[1] * (L + 12); }
    else { x0 = x - d[0] * (L + g); y0 = y - d[1] * (L + g); x1 = x - d[0] * g; y1 = y - d[1] * g; }
    const tx = hang ? x1 : x0, ty = hang ? y1 : y0, horiz = Math.abs(d[0]) > .5;
    const lx = horiz ? tx : tx + 8, ly = horiz ? ty - 10 : (hang ? ty + 18 : ty - 6);
    const t = label ? `<text class="arr__lbl" x="${lx}" y="${ly}" text-anchor="${horiz ? 'middle' : 'start'}">${label}</text>` : '';
    return `<g class="arr arr--${cls}"><line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" marker-end="url(#ah${uid || ''})"/>${t}</g>`;
  }
}

function labelOffset(model, id) {
  // push label away from the average direction of connected members
  const p = model.joints[id]; let sx = 0, sy = 0;
  model.members.forEach(([a, b]) => {
    if (a === id || b === id) { const q = model.joints[a === id ? b : a]; const e = norm([q[0] - p[0], q[1] - p[1]]); sx += e[0]; sy += e[1]; }
  });
  // also move away from the support glyph side
  const sp = model.supports && model.supports[id];
  if (sp) { const dir = (sp === 'pin' || sp.type === 'pin') ? [0, 1] : norm(sp.dir || [0, 1]); const e = norm([-sx, -sy]); sx = -e[0] - dir[0] * 1.2; sy = -e[1] - dir[1] * 1.2; }
  let e = norm([-sx || 0.001, -sy || 1]);
  // don't sit on top of a load arrow at this joint: slide the label to the side
  (model.loads || []).filter(L => L.at === id).forEach(L => { const d = norm(L.f); if (e[0] * d[0] + e[1] * d[1] > 0.5) e = norm([Math.abs(d[1]) > .5 ? 1 : e[0], Math.abs(d[1]) > .5 ? e[1] * 0.5 : 1]); });
  return e;
}

function supportGlyph([x, y], sp) {
  const isPin = sp === 'pin' || sp.type === 'pin';
  const dir = isPin ? [0, 1] : norm(sp.dir || [0, 1]);
  const ang = Math.atan2(dir[0], dir[1]) * 180 / Math.PI;   // rotate canonical (reaction +y) glyph
  const g = isPin
    ? `<path d="M0 0 L-17 28 L17 28 Z"/><line x1="-26" y1="28" x2="26" y2="28"/>${hatch(28)}`
    : `<path d="M0 0 L-15 22 L15 22 Z"/><circle cx="-8" cy="28" r="5"/><circle cx="8" cy="28" r="5"/><line x1="-26" y1="34" x2="26" y2="34"/>${hatch(34)}`;
  return `<g class="sup" transform="translate(${x} ${y}) rotate(${ang})">${g}</g>`;
}
const hatch = y0 => [-22, -11, 0, 11, 22].map(h => `<line class="sup__h" x1="${h}" y1="${y0}" x2="${h - 8}" y2="${y0 + 9}"/>`).join('');

// counts for the simple-truss check
export const counts = m => ({ M: m.members.length, J: Object.keys(m.joints).length });
