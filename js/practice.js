// Comnt Trusses Lab — Stage 3: Solved Examples (step by step) + Assignment 5 (MCQ with hints and solutions)
// Every number here was checked with the solver in truss.js. Geometry is read from the figures in the notes.
import { solve, svg, key, state, fmt } from './truss.js';
import { MODELS, WALK1 } from './content.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const FACE = n => `assets/faces/${n}.svg`;
const k = (a, b) => key(a, b);
const s5 = Math.sqrt(3);
const legend = `<div class="legend"><span><i class="lt"></i>Tension (T)</span><span><i class="lc"></i>Compression (C)</span><span><i class="lz"></i>Zero</span></div>`;

// ---------------------------------------------------------------- models
export const PM = {
  ex1: MODELS.ex1, ex2: MODELS.ex2,
  ex3: { joints: { A: [0, 6], I: [2, 6], H: [4, 6], G: [6, 6], F: [8, 6], B: [0, 0], C: [2, 1.5], D: [4, 3], E: [6, 4.5] },
    members: [['A', 'I'], ['I', 'H'], ['H', 'G'], ['G', 'F'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['E', 'F'], ['A', 'C'], ['I', 'C'], ['I', 'D'], ['H', 'D'], ['H', 'E'], ['G', 'E']],
    supports: { A: 'pin', B: 'pin' }, loads: [{ at: 'D', f: [0, -200], label: '200 kN' }, { at: 'F', f: [0, -200], label: '200 kN' }] },
  ex4: { joints: { A: [0, 0], B: [2, 0], G: [0, 2], C: [2, 2], F: [0, 4], D: [2, 4], E: [0, 6] },
    members: [['E', 'D'], ['E', 'F'], ['F', 'D'], ['F', 'G'], ['D', 'C'], ['G', 'D'], ['G', 'C'], ['G', 'A'], ['C', 'B'], ['A', 'B'], ['G', 'B']],
    supports: { A: 'pin', B: { dir: [0, 1], name: 'NB' } }, loads: [{ at: 'E', f: [5, 0], label: '5 kN' }, { at: 'D', f: [0, -5], label: '5 kN' }, { at: 'F', f: [10, 0], label: '10 kN' }, { at: 'G', f: [10, 0], label: '10 kN' }] },
  ex5: { joints: { A: [0, 0], B: [2, 0], C: [4, 0], D: [6, 0], E: [8, 0], F: [10, 0], G: [12, 0], N: [0, 1.5], M: [2, 2], L: [4, 2.5], K: [6, 3], J: [8, 2.5], I: [10, 2], H: [12, 1.5] },
    members: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['E', 'F'], ['F', 'G'], ['N', 'M'], ['M', 'L'], ['L', 'K'], ['K', 'J'], ['J', 'I'], ['I', 'H'], ['A', 'N'], ['G', 'H'], ['M', 'B'], ['L', 'C'], ['K', 'D'], ['J', 'E'], ['I', 'F'], ['N', 'B'], ['M', 'C'], ['L', 'D'], ['J', 'D'], ['I', 'E'], ['H', 'F']],
    supports: { A: 'pin', G: { dir: [0, 1], name: 'NG' } }, loads: [{ at: 'N', f: [-8, 0], label: '8 kN' }, { at: 'M', f: [0, -6], label: '6 kN' }, { at: 'K', f: [0, -4], label: '4 kN' }, { at: 'I', f: [0, -3], label: '3 kN' }, { at: 'H', f: [0, -2], label: '2 kN' }] },
  ex6: { joints: { A: [0, 0], B: [1, 0], C: [2, 0], D: [3, 0], E: [4, 0], F: [5, 0], G: [6, 0], H: [7, 0], I: [8, 0], M: [2, 2], L: [4, 2], K: [6, 2], N: [1, 1], O: [3, 1], P: [5, 1], J: [7, 1] },
    members: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['E', 'F'], ['F', 'G'], ['G', 'H'], ['H', 'I'], ['M', 'L'], ['L', 'K'], ['A', 'N'], ['N', 'M'], ['K', 'J'], ['J', 'I'], ['N', 'B'], ['M', 'C'], ['O', 'D'], ['L', 'E'], ['P', 'F'], ['K', 'G'], ['J', 'H'], ['N', 'C'], ['M', 'O'], ['O', 'E'], ['C', 'O'], ['E', 'P'], ['P', 'K'], ['P', 'G'], ['J', 'G']],
    supports: { A: 'pin', I: { dir: [0, 1], name: 'NI' } }, loads: [{ at: 'C', f: [0, -16], label: '16 kN' }, { at: 'E', f: [0, -6], label: '6 kN' }, { at: 'F', f: [0, -8], label: '8 kN' }, { at: 'H', f: [0, -4], label: '4 kN' }] },
  a1: { joints: { A: [0, 0], B: [1, 0], C: [2, 0], D: [1, 0.75] }, members: [['A', 'B'], ['B', 'C'], ['A', 'D'], ['C', 'D'], ['B', 'D']],
    supports: { A: { dir: [0.5, Math.cos(Math.PI / 6)], name: 'NA' }, C: 'pin' }, loads: [{ at: 'D', f: [-400, 0], label: 'F₁ = 400 N' }, { at: 'B', f: [0, -200], label: 'F₂ = 200 N' }] },
  a2: { joints: { H: [0, 0], B: [4, 0], A: [4, -2], C: [4, 2], E: [2, 2], D: [2, 4] },
    members: [['D', 'E'], ['E', 'C'], ['D', 'C'], ['C', 'B'], ['E', 'B'], ['H', 'B'], ['H', 'A'], ['B', 'A'], ['H', 'D']],
    supports: { A: 'pin', H: { dir: [1, 0], name: 'NH' } }, loads: [{ at: 'D', f: [-10, 0], label: '10 kN' }, { at: 'C', f: [-10, 0], label: '10 kN' }, { at: 'E', f: [0, -20], label: '20 kN' }, { at: 'B', f: [-10, 0], label: '10 kN' }] },
  a3: { joints: { A: [0, 0], E: [2, 0], C: [4, 0], B: [3, 2], D: [3, -2] }, members: [['A', 'B'], ['A', 'E'], ['E', 'B'], ['E', 'C'], ['B', 'C'], ['E', 'D'], ['C', 'D']],
    supports: { A: 'pin', D: { dir: [0, 1], name: 'ND' } }, loads: [{ at: 'B', f: [20, 0], label: 'P = 20 kN' }, { at: 'C', f: [0, -20], label: 'P = 20 kN' }] },
  a4: { joints: { A: [0, 0], B: [2, 0], C: [4, 0], D: [6, 0], E: [8, 0], I: [1, s5], H: [3, s5], G: [5, s5], F: [7, s5] },
    members: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['I', 'H'], ['H', 'G'], ['G', 'F'], ['A', 'I'], ['I', 'B'], ['B', 'H'], ['H', 'C'], ['C', 'G'], ['G', 'D'], ['D', 'F'], ['F', 'E']],
    supports: { A: 'pin', E: { dir: [0, 1], name: 'NE' } }, loads: [{ at: 'F', f: [10, 0], label: '10 kN' }, { at: 'B', f: [0, -15], label: '15 kN' }, { at: 'C', f: [0, -20], label: '20 kN' }, { at: 'D', f: [0, -25], label: '25 kN' }] },
  a5: { joints: { A: [0, 0], K: [2, 0], B: [0, 2], J: [1, 2], I: [2, 2], C: [0, 3], H: [1, 3], G: [2, 3], E: [1, 4], D: [-2, 4], F: [4, 4] },
    members: [['A', 'B'], ['A', 'J'], ['K', 'J'], ['K', 'I'], ['B', 'J'], ['J', 'I'], ['B', 'C'], ['B', 'H'], ['H', 'I'], ['I', 'G'], ['C', 'H'], ['H', 'G'], ['C', 'E'], ['E', 'G'], ['D', 'E'], ['E', 'F'], ['D', 'C'], ['F', 'G']],
    supports: { A: { dir: [0, 1], name: 'NA' }, K: 'pin' }, loads: [{ at: 'D', f: [0, -25], label: 'F₁ = 25 kN' }, { at: 'F', f: [0, -20], label: 'F₂ = 20 kN' }] },
  a6: { joints: { A: [0, 0], B: [1.5, 0], C: [3, 0], D: [4.5, 0], E: [6, 0], F: [7.5, 0], G: [9, 0], L: [1.5, 2], K: [3, 2], J: [4.5, 2], I: [6, 2], H: [7.5, 2] },
    members: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['E', 'F'], ['F', 'G'], ['L', 'K'], ['K', 'J'], ['J', 'I'], ['I', 'H'], ['A', 'L'], ['H', 'G'], ['B', 'L'], ['C', 'K'], ['D', 'J'], ['E', 'I'], ['F', 'H'], ['B', 'K'], ['C', 'J'], ['D', 'I'], ['I', 'F']],
    supports: { A: 'pin', G: { dir: [0, 1], name: 'NG' } }, loads: [{ at: 'B', f: [0, -24], label: '24 kN' }, { at: 'C', f: [0, -6], label: '6 kN' }, { at: 'D', f: [0, -4], label: '4 kN' }, { at: 'E', f: [0, -3], label: '3 kN' }, { at: 'F', f: [0, -12], label: '12 kN' }] },
  a7: { joints: { A: [0, 0], B: [1.5, 0], C: [3, 0], D: [4.5, 0], E: [6, 0], F: [7.5, 0], G: [9, 0], P: [1.5, 1], N: [3, 1], K: [6, 1], I: [7.5, 1], O: [1.5, 2], M: [3, 2], L: [4.5, 2], J: [6, 2], H: [7.5, 2] },
    members: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['E', 'F'], ['F', 'G'], ['O', 'M'], ['M', 'L'], ['L', 'J'], ['J', 'H'], ['A', 'O'], ['H', 'G'], ['O', 'P'], ['P', 'B'], ['M', 'N'], ['N', 'C'], ['L', 'D'], ['J', 'K'], ['K', 'E'], ['H', 'I'], ['I', 'F'], ['P', 'M'], ['P', 'C'], ['N', 'L'], ['N', 'D'], ['K', 'L'], ['K', 'D'], ['I', 'J'], ['I', 'E']],
    supports: { A: 'pin', G: { dir: [0, 1], name: 'NG' } }, loads: [{ at: 'B', f: [0, -6], label: '6 kN' }, { at: 'C', f: [0, -10], label: '10 kN' }, { at: 'D', f: [0, -9], label: '9 kN' }, { at: 'E', f: [0, -10], label: '10 kN' }, { at: 'F', f: [0, -3], label: '3 kN' }] },
  a8: { joints: { A: [0, 0], B: [2, 0], I: [0, 2], L: [1, 2], C: [2, 2], H: [0, 4], K: [1, 4], D: [2, 4], G: [0, 6], J: [1, 6], E: [2, 6], F: [0, 8] },
    members: [['A', 'B'], ['A', 'I'], ['B', 'C'], ['A', 'L'], ['L', 'B'], ['I', 'L'], ['L', 'C'], ['I', 'H'], ['C', 'D'], ['I', 'K'], ['K', 'C'], ['H', 'K'], ['K', 'D'], ['H', 'G'], ['D', 'E'], ['H', 'J'], ['J', 'D'], ['G', 'J'], ['J', 'E'], ['G', 'F'], ['F', 'E']],
    supports: { A: { dir: [0, 1], name: 'NA' }, B: 'pin' }, loads: [{ at: 'F', f: [-4, 0], label: '4 kN' }, { at: 'E', f: [0, -10], label: '10 kN' }, { at: 'D', f: [-8, 0], label: '8 kN' }, { at: 'C', f: [-16, 0], label: '16 kN' }] },
};

// ---------------------------------------------------------------- solved examples
const EX = [
  { id: 'ex-1', model: 'ex1', unit: 'N', title: 'Example 1 · Method of Joints', page: 71, ask: 'Find the support reactions and the force in each member.', steps: WALK1.map(s => ({ ...s, show: s.show })) },
  { id: 'ex-2', model: 'ex2', unit: 'N', title: 'Example 2 · Method of Joints', page: 72, ask: 'Find the reactions and the force in every member.', steps: [
    { title: 'Why not start at a joint?', ar: 'كل joint فيها أكتر من مجهولين (عدّهم!)، فلازم نطلّع الـ reactions الأول من الـ truss كله.', show: [], eq: [] },
    { title: 'Step 1 · Reactions', reactions: true, show: [], ar: 'Moment حوالين A يخلّص من X<sub>A</sub> و Y<sub>A</sub>.', eq: ['ΣM<sub>A</sub> = 0: N<sub>C</sub>(1.6) − 400(0.8) + 200(0.6) = 0 → <span class="res">N<sub>C</sub> = 125 N</span>', 'ΣF<sub>x</sub> = 0 → <span class="res">X<sub>A</sub> = 200 N</span>', 'ΣF<sub>y</sub> = 0 → <span class="res">Y<sub>A</sub> = 275 N</span>'] },
    { title: 'Step 2 · Joint C', joint: 'C', reactions: true, show: [k('B', 'C'), k('C', 'D')], ar: 'عند C: BC أفقي وCD رأسي، والـ reaction رأسي. مفيش أي قوة أفقية غير F<sub>BC</sub>.', eq: ['ΣF<sub>x</sub> = 0 → <span class="res">F<sub>BC</sub> = 0</span>', 'ΣF<sub>y</sub> = 0 → F<sub>CD</sub> + 125 = 0 → <span class="res">F<sub>CD</sub> = 125 N (C)</span>'] },
    { title: 'Step 3 · Joint D', joint: 'D', reactions: true, show: [k('B', 'C'), k('C', 'D'), k('B', 'D'), k('D', 'E')], ar: 'BD مايل: sin = 0.6 و cos = 0.8 (مثلث 0.6 × 0.8 × 1.0).', eq: ['ΣF<sub>y</sub>: −F<sub>CD</sub> − 0.6F<sub>BD</sub> = 0 → <span class="res">F<sub>BD</sub> = 208.33 N (T)</span>', 'ΣF<sub>x</sub>: −F<sub>DE</sub> − 0.8F<sub>BD</sub> − 200 = 0 → <span class="res">F<sub>DE</sub> = 366.67 N (C)</span>'] },
    { title: 'Step 4 · Joint E', joint: 'E', reactions: true, show: [k('B', 'C'), k('C', 'D'), k('B', 'D'), k('D', 'E'), k('A', 'E'), k('B', 'E')], ar: 'عند E عرفنا DE، وفاضل AE (مايل) و BE (رأسي).', eq: ['ΣF<sub>x</sub>: F<sub>DE</sub> − 0.8F<sub>AE</sub> = 0 → <span class="res">F<sub>AE</sub> = 458.33 N (C)</span>', 'ΣF<sub>y</sub>: −F<sub>BE</sub> − 0.6F<sub>AE</sub> − 400 = 0 → <span class="res">F<sub>BE</sub> = 125 N (C)</span>'] },
    { title: 'Step 5 · Joint A', joint: 'A', reactions: true, show: [k('B', 'C'), k('C', 'D'), k('B', 'D'), k('D', 'E'), k('A', 'E'), k('B', 'E'), k('A', 'B')], ar: 'آخر مجهول: AB. وبعدها joint B تبقى check.', eq: ['ΣF<sub>x</sub>: F<sub>AB</sub> + 0.8F<sub>AE</sub> + X<sub>A</sub> = 0 → <span class="res">F<sub>AB</sub> = 166.67 N (T)</span>', 'Check at B: −166.67 + 0 + 0.8(208.33) = <span class="res">0 ✓</span>'] },
  ] },
  { id: 'ex-3', model: 'ex3', unit: 'kN', title: 'Example 3 · Reactions + zero members', page: 73, ask: 'Find the reactions at A and B, name the zero members, then the member forces.', steps: [
    { title: 'Joint B has one member', show: [], ar: 'الـ joint B عليها member واحد بس (BC) والـ reaction. يعني الاتنين لازم يكونوا على نفس الخط: R<sub>B</sub> في اتجاه BC (tan α = 8/6). أما A فعليها X<sub>A</sub> و Y<sub>A</sub>.', eq: [] },
    { title: 'Step 1 · Reactions', reactions: true, show: [], ar: 'ΣM<sub>A</sub> = 0 بيطلّع R<sub>B</sub> على طول.', eq: ['ΣM<sub>A</sub>: R<sub>B</sub> sinα (6) − 200(4) − 200(8) = 0', '<span class="res">R<sub>B</sub> = 500 kN</span> (along CB, pushing up-right)', '<span class="res">X<sub>A</sub> = 400 kN (←)</span> , <span class="res">Y<sub>A</sub> = 100 kN (↑)</span>'] },
    { title: 'Step 2 · Zero members by inspection', zero: [k('G', 'E'), k('E', 'H'), k('H', 'D')], show: [k('G', 'E'), k('E', 'H'), k('H', 'D')], ar: 'Rule (b) 3 مرات ورا بعض: عند G (GF و GH على خط واحد) ← GE = 0. عند E (ED و EF على خط واحد) ← EH = 0. عند H (HI و HG على خط واحد) ← HD = 0.', eq: ['<span class="res">GE = EH = HD = 0</span>'] },
    { title: 'Step 3 · Joint F', joint: 'F', reactions: true, show: [k('G', 'E'), k('E', 'H'), k('H', 'D'), k('E', 'F'), k('F', 'G')], ar: 'EF مايل بنفس زاوية α: cos α = 0.6 و sin α = 0.8.', eq: ['ΣF<sub>y</sub>: −0.6F<sub>EF</sub> − 200 = 0 → <span class="res">F<sub>EF</sub> = 1000/3 = 333.33 kN (C)</span>', 'ΣF<sub>x</sub>: −F<sub>FG</sub> − 0.8F<sub>EF</sub> = 0 → <span class="res">F<sub>FG</sub> = 800/3 = 266.67 kN (T)</span>'] },
    { title: 'Step 4 · Follow the chain', reactions: true, show: [k('G', 'E'), k('E', 'H'), k('H', 'D'), k('E', 'F'), k('F', 'G'), k('G', 'H'), k('D', 'E'), k('H', 'I'), k('B', 'C')], ar: 'من الـ zero members على طول: GH = FG ، DE = EF ، HI = GH. وعند B: BC = R<sub>B</sub>.', eq: ['F<sub>GH</sub> = F<sub>HI</sub> = <span class="res">266.67 kN (T)</span>', 'F<sub>DE</sub> = <span class="res">333.33 kN (C)</span>', 'F<sub>BC</sub> = <span class="res">500 kN (C)</span>'] },
    { title: 'Step 5 · The rest (D, I, C)', reactions: true, show: 'all', ar: 'الملزمة سايبة الباقي للطالب. دي الإجابات عشان تراجع عليها: joint D بتطلّع CD و DI، وjoint I بتطلّع AI و CI، وjoint C بتطلّع AC.', eq: ['F<sub>CD</sub> = 444.44 (C) · F<sub>DI</sub> = 160.25 (T)', 'F<sub>AI</sub> = 355.56 (T) · F<sub>CI</sub> = 133.33 (C) · F<sub>AC</sub> = 109.43 (T)'] },
  ] },
  { id: 'ex-4', model: 'ex4', unit: 'kN', title: 'Example 4 · Method of Sections', page: 75, ask: 'Find the reactions at A and B and the force in CD, GD and FG.', steps: [
    { title: 'Step 1 · Reactions', reactions: true, show: [], ar: 'Moment حوالين A. انتبه: كل الأحمال الأفقية ليها moment حوالين A (ذراعها هو الارتفاع).', eq: ['ΣM<sub>A</sub>: N<sub>B</sub>(2) − 5(2) − 5(6) − 10(4) − 10(2) = 0 → <span class="res">N<sub>B</sub> = 50 kN</span>', 'ΣF<sub>x</sub> → <span class="res">X<sub>A</sub> = 25 kN (←)</span> · ΣF<sub>y</sub> → <span class="res">Y<sub>A</sub> = 45 kN (↓)</span>'] },
    { title: 'Step 2 · Cut CD, GD, FG', reactions: true, cut: [[-0.6, 3], [2.6, 3]], keep: ['E', 'F', 'D'], show: [k('C', 'D'), k('G', 'D'), k('F', 'G')], ar: 'قطع أفقي بين الدور التاني والتالت، وناخد الحتة اللي فوق (EDF) عشان مفيش عليها reactions.', eq: [] },
    { title: 'Step 3 · ΣF<sub>x</sub> → GD', cut: [[-0.6, 3], [2.6, 3]], keep: ['E', 'F', 'D'], show: [k('G', 'D')], ar: 'GD هو الوحيد اللي ليه مركّبة أفقية من الـ 3 المقطوعين (زاويته 45°).', eq: ['ΣF<sub>x</sub>: 10 + 5 − F<sub>GD</sub>/√2 = 0 → <span class="res">F<sub>GD</sub> = 15√2 = 21.21 kN (T)</span>'] },
    { title: 'Step 4 · ΣM<sub>D</sub> → FG', cut: [[-0.6, 3], [2.6, 3]], keep: ['E', 'F', 'D'], show: [k('G', 'D'), k('F', 'G')], joint: 'D', ar: 'GD و CD بيعدّوا في D، فالـ moment حوالين D مش هيشوف غير FG و حمل E.', eq: ['ΣM<sub>D</sub>: F<sub>GF</sub>(2) − 5(2) = 0 → <span class="res">F<sub>GF</sub> = 5 kN (T)</span>'] },
    { title: 'Step 5 · ΣF<sub>y</sub> → CD', cut: [[-0.6, 3], [2.6, 3]], keep: ['E', 'F', 'D'], show: [k('G', 'D'), k('F', 'G'), k('C', 'D')], ar: 'آخر مجهول. لاحظ إن الملزمة كاتبة «N<sub>A</sub> = 50» في الـ reactions، والصح N<sub>B</sub>.', eq: ['ΣF<sub>y</sub>: −F<sub>CD</sub> − F<sub>GD</sub>/√2 − F<sub>GF</sub> − 5 = 0 → <span class="res">F<sub>CD</sub> = 25 kN (C)</span>'] },
  ] },
  { id: 'ex-5', model: 'ex5', unit: 'kN', title: 'Example 5 · Method of Sections (roof)', page: 75, ask: 'Find the force in LM, MC and BC and say if each is T or C.', steps: [
    { title: 'Step 1 · Reactions', reactions: true, show: [], ar: 'Moment حوالين G (الـ roller)، والـ 8 kN الأفقية ذراعها 1.5 m.', eq: ['ΣM<sub>G</sub>: −Y<sub>A</sub>(12) + 8(1.5) + 6(10) + 4(6) + 3(2) = 0 → <span class="res">Y<sub>A</sub> = 8.5 kN</span>', 'ΣF<sub>x</sub> → <span class="res">X<sub>A</sub> = 8 kN</span>'] },
    { title: 'Step 2 · Cut LM, MC, BC', reactions: true, cut: [[3, 3.3], [3, -0.8]], keep: ['A', 'B', 'N', 'M'], show: [k('L', 'M'), k('M', 'C'), k('B', 'C')], ar: 'قطع رأسي في الـ panel التاني، وناخد الحتة الشمال ABMN.', eq: [] },
    { title: 'Step 3 · ΣM<sub>M</sub> → BC', cut: [[3, 3.3], [3, -0.8]], keep: ['A', 'B', 'N', 'M'], reactions: true, joint: 'M', show: [k('B', 'C')], ar: 'LM و MC بيعدّوا في M، فالـ moment حوالين M بيطلّع BC لوحده.', eq: ['ΣM<sub>M</sub>: F<sub>BC</sub>(2) + X<sub>A</sub>(2) − Y<sub>A</sub>(2) − 8(0.5) = 0 → <span class="res">F<sub>BC</sub> = 2.5 kN (T)</span>'] },
    { title: 'Step 4 · ΣF<sub>x</sub>, ΣF<sub>y</sub> → LM, MC', cut: [[3, 3.3], [3, -0.8]], keep: ['A', 'B', 'N', 'M'], reactions: true, show: [k('B', 'C'), k('L', 'M'), k('M', 'C')], ar: 'معادلتين في مجهولين. ميل LM: tan θ = 0.5/2 = 0.25 يعني θ = 14.04°، و MC بزاوية 45°.', eq: ['0.97F<sub>LM</sub> + 0.707F<sub>MC</sub> = −2.5', '0.242F<sub>LM</sub> − 0.707F<sub>MC</sub> = −2.5', '<span class="res">F<sub>LM</sub> = 4.12 kN (C)</span> · <span class="res">F<sub>MC</sub> = 2.12 kN (T)</span>'] },
  ] },
  { id: 'ex-6', model: 'ex6', unit: 'kN', title: 'Example 6 · Zero members + mixed method', page: 76, ask: 'Name the zero-force members, then find KL, KP, GP and GF.', steps: [
    { title: 'Step 1 · Zero members', zero: [k('B', 'N'), k('N', 'C'), k('D', 'O'), k('C', 'O'), k('L', 'E')], show: [k('B', 'N'), k('N', 'C'), k('D', 'O'), k('C', 'O'), k('L', 'E')], ar: 'عند B: BN = 0 (rule b). وبعدها عند N يبقى AN و NM على خط واحد ← NC = 0. نفس الكلام عند D ← DO = 0، وعند O ← CO = 0. وعند L ← LE = 0.', eq: ['<span class="res">BN = NC = DO = CO = LE = 0</span>'] },
    { title: 'Step 2 · Reactions', reactions: true, show: [], ar: 'ΣM<sub>A</sub> = 0 للـ truss كله.', eq: ['N<sub>I</sub>(8) = 16(2) + 6(4) + 8(5) + 4(7) → <span class="res">N<sub>I</sub> = 15.5 kN</span>'] },
    { title: 'Step 3 · The cut hits 4 members', reactions: true, cut: [[5.6, 2.6], [5.6, -0.6]], keep: ['G', 'H', 'I', 'J', 'K'], show: [k('K', 'L'), k('K', 'P'), k('G', 'P'), k('G', 'F')], ar: 'القطع بيعدّي على KL و KP و GP و GF، يعني 4 مجاهيل. لازم نطلّع واحد منهم الأول بالـ joints.', eq: [] },
    { title: 'Step 4 · Joints F then P → GP', joint: 'P', show: [k('F', 'P'), k('G', 'P')], ar: 'عند F: الحمل 8 kN بيتشال بالـ vertical PF، يعني F<sub>FP</sub> = 8 kN (T). وعند P: حلّل في الاتجاه العمودي على EK عشان EP و PK يختفوا.', eq: ['<span class="res">F<sub>FP</sub> = 8 kN (T)</span>', '<span class="res">F<sub>GP</sub> = 5.66 kN (C)</span>'] },
    { title: 'Step 5 · Right part IGK', cut: [[5.6, 2.6], [5.6, -0.6]], keep: ['G', 'H', 'I', 'J', 'K'], reactions: true, show: [k('K', 'L'), k('K', 'P'), k('G', 'P'), k('G', 'F')], ar: 'دلوقتي فاضل 3 مجاهيل بس: ΣF<sub>y</sub> ← KP، وΣM<sub>K</sub> ← GF، وΣF<sub>x</sub> ← KL.', eq: ['ΣF<sub>y</sub> → <span class="res">F<sub>KP</sub> = 10.6 kN (T)</span>', 'ΣM<sub>K</sub> → <span class="res">F<sub>GF</sub> = 17.5 kN (T)</span>', 'ΣF<sub>x</sub> → <span class="res">F<sub>KL</sub> = 21 kN (C)</span>'] },
  ] },
];

// ---------------------------------------------------------------- assignment 5
const L = s => `<span class="math">${s}</span>`;
const AS = [
  { id: '5-1', model: 'a1', unit: 'N', given: 'F₁ = 400 N, F₂ = 200 N. The roller at A sits on a 30° incline.', qs: [
    { q: 'The magnitude of the normal reaction at A is (N):', o: ['188.56', '222.24', '244.48', '288.68'], a: 3, hint: 'الـ reaction عند A عمودي على السطح المايل، يعني ليه مركّبة أفقية (N sin30) ورأسية (N cos30). خُد ΣM<sub>C</sub> = 0 عشان تخلص من reactions الـ pin.', sol: ['ΣM<sub>C</sub>: −N<sub>A</sub>cos30(2) + 400(0.75) + 200(1) = 0', 'N<sub>A</sub> = 500 / 1.732 = <b>288.68 N</b>'] },
    { q: 'The magnitude of the force in member CD is (N):', o: ['64.33', '72.67', '83.33', '96.67'], a: 2, hint: 'ابدأ بـ joint B: ΣF<sub>y</sub> بيطلّع BD. وبعدين joint D فيها مجهولين بس (AD و CD). المثلث 0.75 × 1 × 1.25.', sol: ['Joint B: F<sub>BD</sub> = 200 N (T)', 'Joint D: −0.8F<sub>AD</sub> + 0.8F<sub>CD</sub> = 400 , −0.6F<sub>AD</sub> − 0.6F<sub>CD</sub> = 200', 'F<sub>CD</sub> = <b>83.33 N (T)</b>'] },
    { q: 'The magnitude of the force in member AD is (N):', o: ['464.33', '416.67', '372.33', '324.67'], a: 1, hint: 'نفس معادلتين joint D من السؤال اللي فات.', sol: ['F<sub>AD</sub> + F<sub>CD</sub> = −333.33 , F<sub>CD</sub> − F<sub>AD</sub> = 500', 'F<sub>AD</sub> = <b>416.67 N (C)</b>'] },
  ] },
  { id: '5-2', model: 'a2', unit: 'kN', given: 'H rests against a smooth wall (horizontal reaction only). A is a pin.', qs: [
    { q: 'The horizontal component of the reaction at pin A is (kN):', o: ['50', '60', '80', '90'], a: 0, hint: 'ΣM<sub>A</sub> = 0 بيطلّع N<sub>H</sub> (ذراعه 2 m)، وبعدين ΣF<sub>x</sub>.', sol: ['ΣM<sub>A</sub>: −N<sub>H</sub>(2) + 10(6) + 10(4) + 20(2) + 10(2) = 0 → N<sub>H</sub> = 80 kN', 'ΣF<sub>x</sub>: X<sub>A</sub> + 80 − 30 = 0 → X<sub>A</sub> = −50 → <b>50 kN (←)</b>'] },
    { q: 'The magnitude of the force in member AH is (kN):', o: ['33.5', '44.7', '55.9', '66.3'], a: 2, hint: 'Joint A: فيها AB (رأسي) و AH (مايل). ΣF<sub>x</sub> مش هيشوف غير AH و X<sub>A</sub>. طول AH = √20.', sol: ['ΣF<sub>x</sub> at A: −(4/√20)F<sub>AH</sub> − 50 = 0', 'F<sub>AH</sub> = <b>55.9 kN (C)</b>'] },
    { q: 'The magnitude of the force in member HD is (kN):', o: ['22.67', '27.95', '32.33', '44.48'], a: 1, hint: 'Joint H: N<sub>H</sub> أفقي و HB أفقي، يعني ΣF<sub>y</sub> مش هيشوف غير HA و HD.', sol: ['ΣF<sub>y</sub> at H: −(2/√20)F<sub>HA</sub> + (4/√20)F<sub>HD</sub> = 0', 'F<sub>HD</sub> = F<sub>HA</sub>/2 = <b>27.95 kN (C)</b>'] },
    { q: 'The magnitude of the force in member CD is (kN):', o: ['6.35', '5.44', '4.62', '3.53'], a: 3, hint: 'Joint D: DE رأسي، فـ ΣF<sub>x</sub> مش هيشوف غير DC و DH والحمل 10 kN.', sol: ['ΣF<sub>x</sub> at D: 0.707F<sub>DC</sub> − 0.447F<sub>DH</sub> − 10 = 0', '0.707F<sub>DC</sub> = 10 − 12.5 → F<sub>DC</sub> = <b>3.54 kN (C)</b>'] },
  ] },
  { id: '5-3', model: 'a3', unit: 'kN', given: 'P = 20 kN. The dashed line BD in the figure is not a member.', qs: [
    { q: 'The normal reaction at support D is (kN):', o: ['80', '60', '40', '0'], a: 2, hint: 'ΣM<sub>A</sub> = 0: الـ P الأفقية عند B ذراعها 2 m، والرأسية عند C ذراعها 4 m.', sol: ['ΣM<sub>A</sub>: N<sub>D</sub>(3) − 20(2) − 20(4) = 0', 'N<sub>D</sub> = <b>40 kN</b>'] },
    { q: 'The magnitude of the force in member CD is (kN):', o: ['16.67', '22.36', '26.33', '34.48'], a: 1, hint: 'Joint D فيها DE و DC بس + N<sub>D</sub>. الشكل متماثل، فـ F<sub>DE</sub> = F<sub>DC</sub>.', sol: ['ΣF<sub>y</sub> at D: (2/√5)(F<sub>DE</sub> + F<sub>DC</sub>) + 40 = 0', 'F<sub>DC</sub> = −10√5 → <b>22.36 kN (C)</b>'] },
    { q: 'The magnitude of the force in member BC is (kN):', o: ['30', '20', '10', '0'], a: 3, hint: 'Joint C: CE أفقي، فـ ΣF<sub>y</sub> بيوازن CB و CD والحمل P.', sol: ['ΣF<sub>y</sub> at C: (2/√5)F<sub>CB</sub> − (2/√5)F<sub>CD</sub> − 20 = 0', 'F<sub>CB</sub> = −22.36 + 22.36 = <b>0</b> (zero member under this loading!)'] },
    { q: 'The magnitude of the force in member AB is (kN):', o: ['36.06', '32.36', '26.08', '22.48'], a: 0, hint: 'Joint B: BC = 0، فاضل BA و BE والحمل P الأفقي. معادلتين في مجهولين.', sol: ['ΣF<sub>y</sub> at B → F<sub>BE</sub>/√5 = −F<sub>BA</sub>/√13', 'ΣF<sub>x</sub>: −3F<sub>BA</sub>/√13 + F<sub>BA</sub>/√13 + 20 = 0', 'F<sub>AB</sub> = 10√13 = <b>36.06 kN (T)</b>'] },
  ] },
  { id: '5-4', model: 'a4', unit: 'kN', given: 'All triangles are equilateral (2 m sides, 60°). Height = √3 m.', qs: [
    { q: 'The normal reaction at support E is (kN):', o: ['34.66', '32.36', '36.08', '42.48'], a: 0, hint: 'ΣM<sub>A</sub> = 0، ومتنساش الـ 10 kN الأفقية عند F (ذراعها √3).', sol: ['ΣM<sub>A</sub>: N<sub>E</sub>(8) − 15(2) − 20(4) − 25(6) − 10(√3) = 0', 'N<sub>E</sub> = <b>34.66 kN</b>'] },
    { q: 'The magnitude of the force in member GC is (kN):', o: ['12.06', '9.56', '11.15', '5.39'], a: 2, hint: 'اقطع في الـ panel بين C و D (HG و GC و CD)، وخُد الحتة اليمين، و ΣF<sub>y</sub>: GC هو الوحيد المايل.', sol: ['ΣF<sub>y</sub> (right part): 34.66 − 25 − F<sub>GC</sub> sin60 = 0', 'F<sub>GC</sub> = <b>11.16 kN (T)</b>'] },
    { q: 'The magnitude of the force in member CD is (kN):', o: ['42.48', '45.59', '32.64', '28.72'], a: 1, hint: 'نفس القطع، بس خُد moment حوالين G (تقاطع HG و GC).', sol: ['ΣM<sub>G</sub>: 34.66(3) − 25(1) − F<sub>CD</sub>(√3) = 0', 'F<sub>CD</sub> = <b>45.6 kN (T)</b>'] },
    { q: 'The magnitude of the force in member DF is (kN):', o: ['46.06', '40.02', '34.26', '28.48'], a: 1, hint: 'Joint E الأول (EF من ΣF<sub>y</sub>)، وبعدين joint F: ΣF<sub>y</sub> بيطلّع DF.', sol: ['Joint E: F<sub>EF</sub> sin60 + 34.66 = 0 → F<sub>EF</sub> = −40.03', 'Joint F: −F<sub>EF</sub> sin60 − F<sub>FD</sub> sin60 = 0 → F<sub>DF</sub> = <b>40.03 kN (T)</b>'] },
  ] },
  { id: '5-5', model: 'a5', unit: 'kN', given: 'F₁ = 25 kN, F₂ = 20 kN. The dashed lines are dimensions, not members.', note: 'ملحوظة للمدرّس: الـ truss بالشكل ده ناقصه member واحد (M + R = 21 أقل من 2J = 22)، يعني لو جاله حمل أفقي هيتحرك. بس تحت الأحمال الرأسية دي القوى متزنة وليها قيمة واحدة، فالإجابات سليمة.', qs: [
    { q: 'The magnitude of the force in member IG is (kN):', o: ['30', '20', '15', '0'], a: 2, hint: 'ابدأ بـ joint F (FG من ΣF<sub>y</sub>)، وبعدين joint G.', sol: ['Joint F: F<sub>FG</sub> = −20√5 = −44.72', 'Joint E → F<sub>EG</sub> = +7.07 · Joint G ΣF<sub>y</sub>: −20 + 5 − F<sub>GI</sub> = 0', 'F<sub>IG</sub> = <b>15 kN (C)</b>'] },
    { q: 'The magnitude of the force in member BC is (kN):', o: ['30', '20', '15', '0'], a: 0, hint: 'Joint D (CD) ← joint E (CE) ← joint C: ΣF<sub>y</sub>.', sol: ['ΣF<sub>y</sub> at C: −F<sub>CB</sub> + (1/√5)F<sub>CD</sub> + 0.707F<sub>CE</sub> = 0', '−F<sub>CB</sub> − 25 − 5 = 0 → F<sub>BC</sub> = <b>30 kN (C)</b>'] },
    { q: 'The magnitude of the force in member BH is (kN):', o: ['40', '20', '10', '0'], a: 3, hint: 'Joint A: AJ = 0 ، يعني AB = −30. وبعدين joint B: ΣF<sub>y</sub>.', sol: ['ΣF<sub>y</sub> at B: −F<sub>BA</sub> + F<sub>BC</sub> + 0.707F<sub>BH</sub> = 0', '30 − 30 + 0.707F<sub>BH</sub> = 0 → F<sub>BH</sub> = <b>0</b>'] },
    { q: 'The magnitude of the force in member CD is (kN):', o: ['32.4', '46.5', '55.9', '62.3'], a: 2, hint: 'Joint D فيها DE (أفقي) و DC (مايل) بس. ΣF<sub>y</sub> على طول.', sol: ['ΣF<sub>y</sub> at D: −F<sub>DC</sub>/√5 − 25 = 0', 'F<sub>CD</sub> = 25√5 = <b>55.9 kN (C)</b>'] },
    { q: 'The magnitude of the force in member CE is (kN):', o: ['0', '7.07', '14.14', '21.21'], a: 1, hint: 'DE = 50 (T) من joint D، و EF = 40 (T) من joint F. وعند E: ΣF<sub>y</sub> بتقول CE = −EG.', sol: ['ΣF<sub>x</sub> at E: −50 + 40 − 0.707F<sub>EC</sub> + 0.707F<sub>EG</sub> = 0 , F<sub>EG</sub> = −F<sub>EC</sub>', 'F<sub>CE</sub> = <b>7.07 kN (C)</b>'] },
    { q: 'The magnitude of the force in member AJ is (kN):', o: ['30', '20', '10', '0'], a: 3, hint: 'Joint A: الـ roller رأسي، و AB رأسي. مين تاني ليه مركّبة أفقية؟', sol: ['ΣF<sub>x</sub> at A: F<sub>AJ</sub>/√5 = 0 → F<sub>AJ</sub> = <b>0</b>'] },
    { q: 'The magnitude of the force in member JK is (kN):', o: ['0', '7.07', '14.14', '21.21'], a: 0, hint: 'Joint K: X<sub>K</sub> = 0 (مفيش أحمال أفقية)، و KI رأسي.', sol: ['ΣF<sub>x</sub> at K: −F<sub>KJ</sub>/√5 + X<sub>K</sub> = 0 , X<sub>K</sub> = 0 → F<sub>JK</sub> = <b>0</b>'] },
  ] },
  { id: '5-6', model: 'a6', unit: 'kN', given: 'Panels 1.5 m wide, 2 m high (3-4-5 diagonals).', qs: [
    { q: 'The normal reaction at support G is (kN):', o: ['25', '20', '15', '10'], a: 1, hint: 'ΣM<sub>A</sub> = 0 للـ truss كله.', sol: ['N<sub>G</sub>(9) = 24(1.5) + 6(3) + 4(4.5) + 3(6) + 12(7.5) = 180', 'N<sub>G</sub> = <b>20 kN</b> (and Y<sub>A</sub> = 29 kN)'] },
    { q: 'The magnitude of the force in member ID is (kN):', o: ['6.25', '8.45', '10.56', '14.12'], a: 0, hint: 'اقطع في الـ panel بين D و E (JI و DI و DE)، وخُد الحتة اليمين، و ΣF<sub>y</sub>.', sol: ['ΣF<sub>y</sub>: 20 − 3 − 12 − 0.8F<sub>DI</sub> = 0', 'F<sub>ID</sub> = <b>6.25 kN (T)</b>'] },
    { q: 'The magnitude of the force in member DE is (kN):', o: ['9', '12', '18', '21'], a: 3, hint: 'نفس القطع، moment حوالين I (تقاطع JI و DI).', sol: ['ΣM<sub>I</sub>: 20(3) − 12(1.5) − F<sub>DE</sub>(2) = 0', 'F<sub>DE</sub> = <b>21 kN (T)</b>'] },
    { q: 'The magnitude of the force in member JD is (kN):', o: ['2', '1.5', '1', '0.5'], a: 2, hint: 'Joint D: الـ bottom chord أفقي، فـ ΣF<sub>y</sub>: JD + مركّبة DI − 4 = 0.', sol: ['ΣF<sub>y</sub> at D: F<sub>DJ</sub> + 0.8(6.25) − 4 = 0', 'F<sub>JD</sub> = <b>1 kN (C)</b>'] },
    { q: 'The magnitude of the force in member BL is (kN):', o: ['12', '17', '29', '35'], a: 2, hint: 'Joint L: فيها AL و LK و LB. الـ LK أفقي، فـ ΣF<sub>x</sub> و ΣF<sub>y</sub> بيدّوك AL الأول. أو: قطع الـ panel الأول وبعدين joint B.', sol: ['Section B–C: 29 − 24 + 0.8F<sub>BK</sub> = 0 → F<sub>BK</sub> = −6.25', 'ΣF<sub>y</sub> at B: F<sub>BL</sub> + 0.8F<sub>BK</sub> − 24 = 0 → F<sub>BL</sub> = <b>29 kN (T)</b>'] },
  ] },
  { id: '5-7', model: 'a7', unit: 'kN', given: 'A K-truss: panels 1.5 m, two 1 m levels.', qs: [
    { q: 'The normal reaction at support G is (kN):', o: ['12', '15', '18', '24'], a: 2, hint: 'ΣM<sub>A</sub> = 0.', sol: ['N<sub>G</sub>(9) = 6(1.5) + 10(3) + 9(4.5) + 10(6) + 3(7.5) = 162', 'N<sub>G</sub> = <b>18 kN</b> (Y<sub>A</sub> = 20 kN)'] },
    { q: 'The magnitude of the force in member JL is (kN):', o: ['15.96', '24.75', '28.24', '32.48'], a: 1, hint: 'تريك الـ K-truss: القطع بين D و E بيقطع 4 members، بس عند joint K: ΣF<sub>x</sub> بتقول F<sub>KL</sub> = −F<sub>KD</sub>، فمركّباتهم الأفقية بتلغي بعض.', sol: ['ΣF<sub>x</sub> (right part) → F<sub>LJ</sub> = −F<sub>DE</sub>', 'ΣM<sub>K</sub>: 18(3) − 3(1.5) + F<sub>LJ</sub>(1) − F<sub>DE</sub>(1) = 0', 'F<sub>JL</sub> = <b>24.75 kN (C)</b>'] },
    { q: 'The magnitude of the force in member DE is (kN):', o: ['15.96', '24.75', '28.24', '32.48'], a: 1, hint: 'نفس المعادلتين بتوع السؤال اللي فات.', sol: ['−2F<sub>DE</sub> + 49.5 = 0', 'F<sub>DE</sub> = <b>24.75 kN (T)</b>'] },
    { q: 'The magnitude of the force in member DK is (kN):', o: ['11.96', '8.75', '6.24', '4.51'], a: 3, hint: 'نفس القطع: ΣF<sub>y</sub> للحتة اليمين. استخدم F<sub>KL</sub> = −F<sub>KD</sub>. طول KD = √(1.5² + 1²) = 1.803.', sol: ['ΣF<sub>y</sub>: 18 − 10 − 3 + 0.555F<sub>KL</sub> − 0.555F<sub>KD</sub> = 0', 'F<sub>DK</sub> = <b>4.51 kN (T)</b>'] },
    { q: 'The magnitude of the force in member KL is (kN):', o: ['4.51', '8.75', '6.24', '11.96'], a: 0, hint: 'F<sub>KL</sub> = −F<sub>KD</sub>.', sol: ['F<sub>KL</sub> = <b>4.51 kN (C)</b>'] },
  ] },
  { id: '5-8', model: 'a8', unit: 'kN', given: 'A tower truss: 2 m wide, 2 m levels, K-joints in the middle.', qs: [
    { q: 'The magnitude of the force in member CD is (kN):', o: ['8', '6', '4', '2'], a: 3, hint: 'اقطع أفقي بين C و D (IH و IK و KC و CD) وخُد الحتة اللي فوق. عند K: ΣF<sub>y</sub> بتقول F<sub>KI</sub> = −F<sub>KC</sub>.', sol: ['ΣM<sub>K</sub>: 4(4) − 10(1) + F<sub>IH</sub>(1) − F<sub>CD</sub>(1) = 0', 'ΣF<sub>y</sub>: −10 − F<sub>IH</sub> − F<sub>CD</sub> = 0', 'F<sub>CD</sub> = <b>2 kN (C)</b>'] },
    { q: 'The magnitude of the force in member IH is (kN):', o: ['8', '6', '4', '2'], a: 0, hint: 'نفس المعادلتين.', sol: ['6 + F<sub>IH</sub> − F<sub>CD</sub> = 0 → F<sub>IH</sub> = <b>8 kN (C)</b>'] },
    { q: 'The magnitude of the force in member CK is (kN):', o: ['8.96', '10.72', '13.42', '16.24'], a: 2, hint: 'نفس القطع: ΣF<sub>x</sub> للحتة اللي فوق (4 + 8 = 12 kN لشمال).', sol: ['ΣF<sub>x</sub>: −12 − (1/√5)F<sub>KI</sub> + (1/√5)F<sub>KC</sub> = 0 , F<sub>KI</sub> = −F<sub>KC</sub>', 'F<sub>CK</sub> = 6√5 = <b>13.42 kN (T)</b>'] },
    { q: 'The magnitude of the force in member IK is (kN):', o: ['8.96', '13.42', '10.72', '16.24'], a: 1, hint: 'F<sub>KI</sub> = −F<sub>KC</sub>.', sol: ['F<sub>IK</sub> = <b>13.42 kN (C)</b>'] },
  ] },
];

// ---------------------------------------------------------------- pages
export function practice(app, arg, ctx) {
  const ex = EX.find(e => e.id === arg), as = AS.find(a => a.id === arg);
  if (ex) return examplePage(app, ex, ctx);
  if (as) return assignPage(app, as, ctx);
  const S = ctx.S;
  const done = a => a.qs.filter((q, i) => S.quiz['p' + a.id + '-' + i] === q.a).length;
  app.innerHTML = `<div class="lhead"><div><div class="kicker">Practice</div><h1>Examples & Assignment 5</h1><div class="lhead__ar">الأمثلة الست اللي في الملزمة متحلولة خطوة بخطوة على الرسمة، وبعدها الـ assignments بشكل الامتحان. كل سؤال ليه Hint وحل كامل، وتقدر تفتح أي مسألة في الـ Truss Builder وتشوف كل القوى.</div></div><img class="lhead__face" src="${FACE('think')}" alt=""></div>
  <section class="block"><div class="block__head"><h2>Solved Examples</h2><span class="badge">notes pp. 71–77</span></div>
    <div class="path">${EX.map((e, i) => `<a class="lcard" href="#/practice/${e.id}"><div class="lcard__mini">${svg(PM[e.model], { labels: false, hideLoads: true, width: 300, height: 110, pad: 18, uid: 'pe' + i })}</div><div class="lcard__title">${e.title}</div><div class="muted" style="font-size:14.5px">${e.ask}</div></a>`).join('')}</div></section>
  <section class="block"><div class="block__head"><h2>Assignment 5</h2><span class="badge">${AS.reduce((s, a) => s + a.qs.length, 0)} questions</span></div>
    <div class="path">${AS.map((a, i) => { const d = done(a); return `<a class="lcard ${d === a.qs.length ? 'is-done' : ''}" href="#/practice/${a.id}"><div class="lcard__mini">${svg(PM[a.model], { labels: false, hideLoads: true, width: 300, height: 110, pad: 18, uid: 'pa' + i })}</div><div class="lcard__top"><div class="lcard__title">Problem ${a.id}</div><span class="badge ${d === a.qs.length ? 'badge--done' : ''}">${d}/${a.qs.length}</span></div></a>`; }).join('')}</div></section>`;
}

function openInBuilder(model, unit) {
  try { localStorage.setItem('comnt-trusses-builder-v1', JSON.stringify({ model: JSON.parse(JSON.stringify(model)), unit })); } catch { }
  location.hash = '#/labs/builder';
}

// ---- step-by-step example
function examplePage(app, ex, ctx) {
  const m = PM[ex.model], sol = solve(m); let i = 0; const seen = new Set();
  const idx = EX.indexOf(ex), prev = EX[idx - 1], next = EX[idx + 1];
  app.innerHTML = `<nav class="crumbs"><a href="#/practice">Practice</a><span>›</span><span>Solved examples</span></nav>
  <header class="lhead"><div><div class="kicker">Notes p.${ex.page}</div><h1>${ex.title}</h1><div class="lhead__ar" style="direction:ltr;text-align:left">${ex.ask}</div></div><img class="lhead__face" src="${FACE('talk')}" alt=""></header>
  <div class="block steps"><div class="stage"><div class="stage__bar"><div class="stage__title">${ex.title.split(' · ')[0]}</div>${legend}</div><div id="esv"></div></div>
    <div><div class="stepnav">${ex.steps.map((_, k2) => `<button data-k="${k2}" aria-label="Step ${k2}">${k2}</button>`).join('')}</div><div class="steppanel" aria-live="polite" id="epanel"></div>
    <div class="controls"><button class="mt-btn mt-btn--secondary mt-btn--sm" id="ePrev">← Back</button><button class="mt-btn mt-btn--sm" id="eNext">Next →</button><button class="mt-btn mt-btn--ghost mt-btn--sm" id="eLab">Open in Truss Builder</button></div></div></div>
  <div class="lfoot">${prev ? `<a class="mt-btn mt-btn--secondary" href="#/practice/${prev.id}">← ${prev.title.split(' · ')[0]}</a>` : '<span></span>'}${next ? `<a class="mt-btn" href="#/practice/${next.id}">${next.title.split(' · ')[0]} →</a>` : `<a class="mt-btn" href="#/practice/5-1">Assignment 5 →</a>`}</div>`;
  const draw = () => {
    const s = ex.steps[i]; seen.add(i);
    const showKeys = s.show === 'all' ? Object.keys(sol.forces) : s.show;
    const forces = Object.fromEntries(showKeys.map(kk => [kk, sol.forces[kk]]));
    const keep = s.keep ? new Set(s.keep) : null;
    const dim = keep ? m.members.filter(([a, b]) => !(keep.has(a) && keep.has(b)) && !showKeys.includes(k(a, b))).map(([a, b]) => k(a, b)) : [];
    const ov = s.cut ? (X, Y) => `<line class="cutline" x1="${X(s.cut[0][0])}" y1="${Y(s.cut[0][1])}" x2="${X(s.cut[1][0])}" y2="${Y(s.cut[1][1])}"/>` : null;
    $('#esv', app).innerHTML = svg(m, { forces, memberLabels: !s.cut, dp: ex.unit === 'N' ? 0 : 2, highlightJoint: s.joint, highlightMembers: s.zero || [], dim, showReactions: !!s.reactions, reactions: sol.reactions, unit: ' ' + ex.unit, keepJoint: keep ? j => keep.has(j) : undefined, width: 620, height: 460, pad: 80, uid: 'e', overlay: ov });
    const rows = showKeys.filter(kk => sol.forces[kk] !== undefined).map(kk => `<tr><td>F<sub>${kk}</sub></td><td>${fmt(Math.abs(sol.forces[kk]), 2)} ${ex.unit}</td><td class="tag-${state(sol.forces[kk])}">${state(sol.forces[kk]) === 'Z' ? '0' : state(sol.forces[kk])}</td></tr>`).join('');
    $('#epanel', app).innerHTML = `<h4>${s.title}</h4><div class="ar">${s.ar}</div>${s.eq.length ? `<div class="eq">${s.eq.map(e => `<div>${e}</div>`).join('')}</div>` : ''}${rows && s.show !== 'all' ? `<table class="results"><thead><tr><th>Member</th><th>Force</th><th>T/C</th></tr></thead><tbody>${rows}</tbody></table>` : ''}`;
    $$('.stepnav button', app).forEach((b, k2) => { b.removeAttribute('aria-current'); if (k2 === i) b.setAttribute('aria-current', 'step'); b.classList.toggle('is-seen', seen.has(k2) && k2 !== i); });
    $('#ePrev', app).disabled = i === 0;
    $('#eNext', app).textContent = i === ex.steps.length - 1 ? 'Start over ↺' : 'Next →';
  };
  $('#eNext', app).onclick = () => { if (i === ex.steps.length - 1) i = 0; else { i++; if (i === ex.steps.length - 1) ctx.toast('Example solved! كده إنت فهمتها!', 'laugh'); } draw(); };
  $('#ePrev', app).onclick = () => { i = Math.max(0, i - 1); draw(); };
  $$('.stepnav button', app).forEach(b => b.onclick = () => { i = +b.dataset.k; draw(); });
  $('#eLab', app).onclick = () => openInBuilder(m, ex.unit);
  draw();
}

// ---- assignment problem (exam-style MCQ)
function assignPage(app, as, ctx) {
  const S = ctx.S, m = PM[as.model];
  const idx = AS.indexOf(as), prev = AS[idx - 1], next = AS[idx + 1];
  app.innerHTML = `<nav class="crumbs"><a href="#/practice">Practice</a><span>›</span><span>Assignment 5</span></nav>
  <header class="lhead"><div><div class="kicker">Assignment 5</div><h1>Problem ${as.id}</h1><div class="lhead__ar" style="direction:ltr;text-align:left">${as.given}</div></div><img class="lhead__face" src="${FACE('think')}" alt=""></header>
  <div class="block grid2" style="align-items:start">
    <div class="stage asg-fig"><div class="stage__bar"><div class="stage__title">The truss</div><div class="seg"><button aria-pressed="true" data-v="q">Question</button><button aria-pressed="false" data-v="a">All forces</button></div></div><div id="asv"></div>
      <div class="controls"><button class="mt-btn mt-btn--secondary mt-btn--sm" id="aLab">Open in Truss Builder</button><button class="mt-btn mt-btn--ghost mt-btn--sm" id="aCut">Cut it in the Section Cutter</button></div>
      ${as.note ? `<div class="bubble bubble--soft ar" style="margin-top:12px;font-size:15px">${as.note}</div>` : ''}</div>
    <div id="aqs"></div>
  </div>
  <div class="lfoot">${prev ? `<a class="mt-btn mt-btn--secondary" href="#/practice/${prev.id}">← ${prev.id}</a>` : `<a class="mt-btn mt-btn--secondary" href="#/practice">← Practice</a>`}${next ? `<a class="mt-btn" href="#/practice/${next.id}">Problem ${next.id} →</a>` : `<a class="mt-btn" href="#/practice">All done →</a>`}</div>`;
  const sol = solve(m);
  const drawFig = all => { $('#asv', app).innerHTML = svg(m, { forces: all ? sol.forces : {}, memberLabels: all, dp: 2, showReactions: all, reactions: sol.reactions, unit: ' ' + as.unit, width: 560, height: 460, pad: 80, uid: 'a' }); };
  $$('[data-v]', app).forEach(b => b.onclick = () => { $$('[data-v]', app).forEach(x => x.setAttribute('aria-pressed', x === b)); drawFig(b.dataset.v === 'a'); });
  drawFig(false);
  $('#aLab', app).onclick = () => openInBuilder(m, as.unit);
  $('#aCut', app).onclick = () => { try { localStorage.setItem('comnt-trusses-builder-v1', JSON.stringify({ model: m, unit: as.unit })); } catch { } location.hash = '#/labs/cutter'; setTimeout(() => document.querySelector('#cModels [data-k="builder"]')?.click(), 60); };
  $('#aqs', app).innerHTML = as.qs.map((q, qi) => `<div class="quiz" data-qi="${qi}" style="margin-bottom:14px">
    <div class="quiz__count">${as.id} · Q${qi + 1} of ${as.qs.length}</div><p class="quiz__q">${q.q}</p>
    <div class="quiz__opts">${q.o.map((o, oi) => `<button class="opt" data-oi="${oi}"><span class="opt__l">${'abcd'[oi]}</span><span>${o}</span></button>`).join('')}</div>
    <div class="controls" style="margin-top:10px"><button class="mt-btn mt-btn--secondary mt-btn--sm" data-hint>Hint</button><button class="mt-btn mt-btn--ghost mt-btn--sm" data-sol>Show solution</button></div>
    <div data-hbox></div><div class="quiz__fb"></div></div>`).join('');
  $$('#aqs .quiz', app).forEach(box => {
    const qi = +box.dataset.qi, q = as.qs[qi], kk = 'p' + as.id + '-' + qi;
    const solHtml = `<div class="eq">${q.sol.map(x => `<div>${x}</div>`).join('')}</div>`;
    const show = (oi, silent) => {
      $$('.opt', box).forEach((b, j) => { b.disabled = true; b.classList.toggle('is-right', j === q.a); b.classList.toggle('is-wrong', j === oi && oi !== q.a); });
      const ok = oi === q.a, fb = $('.quiz__fb', box);
      fb.innerHTML = `<img src="${FACE(ok ? 'laugh' : 'sweat')}" alt=""><div class="bubble ${ok ? 'bubble--mint' : 'bubble--soft'}"><b>${ok ? 'You got it! · كده إنت فهمتها!' : `Not quite — the answer is (${'abcd'[q.a]}) ${q.o[q.a]}`}</b>${solHtml}<button class="mt-btn mt-btn--ghost mt-btn--sm" data-retry style="padding:0;min-height:30px">Try again</button></div>`;
      fb.classList.add('is-on');
      $('[data-retry]', fb).onclick = () => { delete S.quiz[kk]; ctx.save(); $$('.opt', box).forEach(b => { b.disabled = false; b.className = 'opt'; }); fb.classList.remove('is-on'); };
      if (!silent && ok && as.qs.every((qq, j) => S.quiz['p' + as.id + '-' + j] === qq.a)) ctx.toast(`Problem ${as.id} complete!`, 'starry');
    };
    $$('.opt', box).forEach(b => b.onclick = () => { const oi = +b.dataset.oi; S.quiz[kk] = oi; ctx.save(); show(oi); });
    $('[data-hint]', box).onclick = () => { $('[data-hbox]', box).innerHTML = `<div class="bubble bubble--soft ar" style="margin-top:10px;font-size:15.5px"><div class="bubble__who"><img src="${FACE('wink')}" alt="">Hint</div>${q.hint}</div>`; };
    $('[data-sol]', box).onclick = () => { $('[data-hbox]', box).innerHTML = `<div style="margin-top:10px">${solHtml}</div>`; };
    if (S.quiz[kk] !== undefined) show(S.quiz[kk], true);
  });
}
