// Comnt Trusses Lab — lesson content
// English = UI, titles, questions. Egyptian Arabic (عامية) = explanations. Terms stay in English.
const t = s => `<span class="term">${s}</span>`;
const m = s => `<span class="math">${s}</span>`;

// ---------- Videos (all checked on YouTube, Nov 2026) ----------
export const VIDEOS = {
  Hn_iozUo9m4: { t: 'Understanding and Analysing Trusses', ch: 'The Efficient Engineer', lang: 'EN', dur: '17:41', lesson: 1,
    why: 'أحلى فيديو يفهّمك الصورة الكبيرة: ليه المثلث، وإزاي الـ joints والـ sections شغالين — بأنيميشن جامد.' },
  'jn8sR-lS4tw': { t: '5.3 Trusses — Video Lecture', ch: 'Jacob Moore (Mechanics Map)', lang: 'EN', dur: '4:26', lesson: 2,
    why: 'محاضرة قصيرة ٤ دقايق: تعريف الـ truss والافتراضات، مناسبة كمراجعة سريعة.' },
  '8aFVZZ87k3E': { t: 'Use the Method of Joints and BASIC Physics to Analyze a Truss', ch: 'Integral Physics', lang: 'EN', dur: '8:47', lesson: 3,
    why: 'بيشرح إزاي تحس الـ Tension والـ Compression بالمنطق قبل الحسابات.' },
  BVCIQfFzguk: { t: 'Statics: Lesson 48 — Trusses, Method of Joints', ch: 'Jeff Hanson', lang: 'EN', dur: '17:27', lesson: 4,
    why: 'وصفة ٤ خطوات للـ Method of Joints وتريك مثلث 3-4-5. شرح هادي وواضح جدًا.' },
  _rK02neOF18: { t: 'Trusses Method of Joints | Learn to Solve Questions', ch: 'Question Solutions', lang: 'EN', dur: '10:58', lesson: 4,
    why: 'مسائل من كتاب Hibbeler نفسه متحلولة خطوة بخطوة.' },
  oXf_tTFUj0Q: { t: 'Trusses. Joint Method — الجمالونات، طريقة المفصلات', ch: 'المرجع الهندسي (م. محمد فؤاد)', lang: 'AR', dur: '11:57', lesson: 4,
    why: 'شرح مصري بالعربي على مسألة من Hibbeler.' },
  tWB_wTCRFw0: { t: 'Statics — lecture 2 (Trusses using method of joints)', ch: 'Dr. Eng. Ahmed El-Desouky', lang: 'AR', dur: '31:04', lesson: 4,
    why: 'محاضرة كاملة بالعربي عن الـ Method of Joints.' },
  n6P8jBcT8ks: { t: 'Statics: Lesson 49 — Trusses, The Method of Sections', ch: 'Jeff Hanson', lang: 'EN', dur: '13:48', lesson: 5,
    why: 'إمتى تختار Sections بدل Joints، وتريك الـ moment اللي بيطلّع مجهول واحد.' },
  'cdK-bunwPvE': { t: 'Mechanics (1): Statics Lec 8 — Trusses "Method of Sections" (إعدادي هندسة)', ch: 'Eng Fathy Abdelaziz', lang: 'AR', dur: '44:30', lesson: 5,
    why: 'محاضرة لطلبة إعدادي هندسة في مصر — نفس مستواك بالظبط.' },
  '2qCAjylJsfc': { t: 'Trusses. Section Method — الجمالونات، طريقة المقاطع', ch: 'المرجع الهندسي (م. محمد فؤاد)', lang: 'AR', dur: '16:36', lesson: 5,
    why: 'مثال كامل بالعربي على الـ Method of Sections.' },
  xSEScMN6bpo: { t: 'How to identify zero force members in trusses', ch: 'Engineer4Free', lang: 'EN', dur: '9:42', lesson: 6,
    why: 'بيطلّع الـ zero-force members بالنظر بس، وبيشيلها واحدة واحدة عشان الباقي يبان.' },
  eOQRGmTiTfw: { t: 'Statics — lecture 3 part 1 (Trusses — zero force member)', ch: 'Dr. Eng. Ahmed El-Desouky', lang: 'AR', dur: '8:57', lesson: 6,
    why: 'شرح القاعدتين بتوع الـ zero-force بالعربي.' },
};

// ---------- Models used by widgets ----------
export const MODELS = {
  // Example 1 from the notes (Ch. 5, p.71)
  ex1: { joints: { A: [0.8, 0], B: [0, 0], C: [0, 1.2], D: [0.8, 0.6] },
    members: [['A', 'B'], ['A', 'D'], ['B', 'D'], ['B', 'C'], ['C', 'D']],
    supports: { A: 'pin', C: { dir: [1, 0], name: 'NC' } },
    loads: [{ at: 'D', f: [-800, 0], label: '800 N' }, { at: 'B', f: [0, -1200], label: '1200 N' }] },
  // Example 2 from the notes (p.72)
  ex2: { joints: { A: [0, 0], B: [0.8, 0], C: [1.6, 0], E: [0.8, 0.6], D: [1.6, 0.6] },
    members: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['B', 'D'], ['B', 'E'], ['A', 'E']],
    supports: { A: 'pin', C: { dir: [0, 1], name: 'NC' } },
    loads: [{ at: 'E', f: [0, -400], label: '400 N' }, { at: 'D', f: [-200, 0], label: '200 N' }] },
  // Pratt bridge for the section cutter: 6 panels × 2 m, 2 m high, 10 kN at each inner bottom joint
  pratt: (() => {
    const j = {}; const mem = [];
    for (let i = 0; i <= 6; i++) j['L' + i] = [2 * i, 0];
    for (let i = 1; i <= 5; i++) j['U' + i] = [2 * i, 2];
    for (let i = 0; i < 6; i++) mem.push(['L' + i, 'L' + (i + 1)]);
    for (let i = 1; i < 5; i++) mem.push(['U' + i, 'U' + (i + 1)]);
    mem.push(['L0', 'U1'], ['U5', 'L6']);
    for (let i = 1; i <= 5; i++) mem.push(['L' + i, 'U' + i]);
    mem.push(['U1', 'L2'], ['U2', 'L3'], ['U4', 'L3'], ['U5', 'L4']);
    const loads = [1, 2, 3, 4, 5].map(i => ({ at: 'L' + i, f: [0, -10], label: '10 kN' }));
    return { joints: j, members: mem, supports: { L0: 'pin', L6: { dir: [0, 1], name: 'NL6' } }, loads };
  })(),
  // Zero-force hunter
  zfm: { joints: { A: [0, 0], B: [2, 0], C: [4, 0], D: [6, 0], E: [8, 0], F: [2, 2], G: [4, 2], H: [6, 2], I: [8, 2] },
    members: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['A', 'F'], ['F', 'G'], ['G', 'H'], ['H', 'E'], ['B', 'F'], ['C', 'G'], ['D', 'H'], ['F', 'C'], ['C', 'H'], ['H', 'I'], ['I', 'E']],
    supports: { A: 'pin', E: { dir: [0, 1], name: 'NE' } },
    loads: [{ at: 'C', f: [0, -12], label: '12 kN' }] },
};

// ---------- Lessons ----------
export const LESSONS = [
  {
    id: 1, slug: 'what-is-a-truss', title: 'What is a Truss?', ar: 'يعني إيه Truss؟ وليه المثلث بالذات؟', face: 'tea', mins: 10,
    objectives: ['Define a truss, a member and a joint', 'Spot planar trusses in real life', 'Explain why trusses are built from triangles'],
    sections: [
      { id: 'idea', title: 'The idea', chip: 'concept', blocks: [
        { type: 'explain', ar: `<p>بص حواليك: كباري الحديد، سقف المصانع، ونش البرج اللي في أي موقع… كلهم معمولين بنفس الفكرة.</p>
<p>الـ ${t('Truss')} هو هيكل معمول من قضبان رفيعة ومستقيمة اسمها ${t('Members')}، بتتوصّل ببعض <strong>من أطرافها بس</strong> عند نقط اسمها ${t('Joints')}.</p>
<p>التوصيل ممكن يكون بمسامير (${t('bolting')})، لحام (${t('welding')})، برشام (${t('riveting')})، أو ${t('pin')} بيعدّي في أطراف الـ members.</p>
<p>وفيه قاعدة مهمة: <strong>مفيش member بيكمّل جوه الـ joint.</strong> كل member بيبدأ عند joint وبيخلص عند joint.</p>` },
        { type: 'widget', id: 'anatomy' },
        { type: 'explain', ar: `<p>لو الـ truss كله، ومعاه الأحمال اللي عليه، موجودين في <strong>مستوى واحد</strong>، بنسمّيه ${t('Planar Truss')}. وده اللي بنستخدمه غالبًا في الأسقف والكباري، وهو اللي هنذاكره في الشابتر ده.</p>` },
      ]},
      { id: 'triangle', title: 'Why triangles?', chip: 'try', blocks: [
        { type: 'explain', ar: `<p>جرّب بنفسك: اسحب الـ slider عشان تزقّ المربع والمثلث بنفس القوة من الجنب.</p>
<p>المربع بيتطبق ويبقى معيّن، لأن زواياه حرة تلف حوالين الـ pins. أما المثلث فمفيش طريقة يغيّر بيها شكله غير لو member من أعضائه اتمط أو اتكبس. عشان كده المثلث هو <strong>أصغر شكل ${t('rigid')}</strong>، وكل truss بيتبني منه.</p>` },
        { type: 'widget', id: 'squareTriangle' },
      ]},
      { id: 'irl', title: 'Trusses IRL', chip: 'khamseena', blocks: [
        { type: 'widget', id: 'irl' },
        { type: 'khamseena', ar: 'برج إيفل نفسه truss عملاق ثلاثي الأبعاد: أكتر من ١٨ ألف قطعة حديد متوصّلة بحوالي ٢.٥ مليون مسمار برشام!' },
      ]},
      { id: 'trap', title: 'Exam Trap!', chip: 'trap', blocks: [
        { type: 'trap', bad: 'تعتبر أي هيكل حديد «truss» وتحله بالـ joints على طول.', good: `لو فيه member عليه حمل في نصه، أو member مكمّل جوه الـ joint، يبقى ده ${t('Frame')} مش truss، والطرق اللي في الشابتر ده مش هتنفع معاه.` },
      ]},
      { id: 'check', title: 'Try this!', chip: 'try', blocks: [
        { type: 'tea', items: [`الـ Truss = ${t('members')} مستقيمة + ${t('joints')} عند الأطراف بس.`, `${t('Planar truss')} = كله في مستوى واحد (أسقف وكباري).`, 'المثلث rigid والمربع لأ، عشان كده الـ trusses بتتبني من مثلثات.'] },
        { type: 'quiz', qs: [
          { q: 'Which shape keeps its shape on its own when the joints are pins?', opts: ['Square', 'Triangle', 'Pentagon', 'Hexagon'], a: 1, why: 'المثلث هو الشكل الوحيد اللي أطوال أضلاعه بتحدد زواياه. أي شكل تاني محتاج diagonal يقسمه لمثلثات.' },
          { q: 'In a truss, where can a member be connected to other members?', opts: ['Anywhere along its length', 'Only at its two ends', 'Only at its middle', 'Only at the supports'], a: 1, why: 'كل member بيتوصّل من طرفيه بس عند joints، ومفيش member بيكمّل جوه الـ joint.' },
          { q: 'A truss and all of its loads lie in one plane. It is called a…', opts: ['Space truss', 'Frame', 'Planar truss', 'Machine'], a: 2, why: 'ده التعريف بالظبط: Planar truss، وده النوع اللي في الأسقف والكباري.' },
        ]},
      ]},
      { id: 'videos', title: 'Videos', chip: 'video', blocks: [{ type: 'videos', ids: ['Hn_iozUo9m4'] }] },
      { id: 'comment', title: 'Leave a Comment!', chip: 'comment', blocks: [{ type: 'comment', q: 'Name two trusses you saw today. Where were they, and how many triangles could you count?' }] },
    ],
  },
  {
    id: 2, slug: 'simple-trusses', title: 'Simple Trusses & M = 2J − 3', ar: 'الـ Simple Truss وعدّ الـ Members والـ Joints', face: 'talk', mins: 12,
    objectives: ['Build a simple truss from a basic triangle', 'Use M = 2J − 3 to check a truss', 'Tell unstable, simple and redundant trusses apart'],
    sections: [
      { id: 'build', title: 'Build it', chip: 'concept', blocks: [
        { type: 'explain', ar: `<p>الـ ${t('Simple Truss')} بيبتدي بمثلث أساسي: ${m('3 members')} و ${m('3 joints')}.</p>
<p>بعد كده كل مرة بنضيف ${m('2 members')} جداد ونوصّلهم في ${m('joint')} جديدة واحدة. دوس على <b>Add</b> وشوف العدّاد بيتغيّر.</p>` },
        { type: 'widget', id: 'grow' },
      ]},
      { id: 'rule', title: 'The rule', chip: 'concept', blocks: [
        { type: 'formula', html: `M = 2J − 3<small>M = number of members · J = number of joints</small>` },
        { type: 'explain', ar: `<p>الـ 3 دي جاية منين؟ المثلث الأول فيه 3 members و 3 joints. وكل خطوة بتزوّد ${m('2 members')} و ${m('1 joint')}، يعني:</p>
<p class="en" style="text-align:center">M = 3 + 2(J − 3) = 2J − 3</p>
<p>وفيه سبب أعمق: كل joint بتدينا معادلتين (${m('ΣFx = 0')} و ${m('ΣFy = 0')})، يعني عندنا <strong>${m('2J')} معادلة</strong>. والمجاهيل هي قوى الـ members (${m('M')}) + الـ reactions، وفي العادة 3 (pin بيدي اتنين و roller بيدي واحد). عشان نقدر نحلّ لازم <span class="math">M + 3 = 2J</span>.</p>` },
        { type: 'widget', id: 'countCheck' },
      ]},
      { id: 'trap', title: 'Exam Trap!', chip: 'trap', blocks: [
        { type: 'trap', bad: 'تفتكر إن أي truss بيحقق M = 2J − 3 يبقى stable على طول.', good: 'القانون شرط لازم بس مش كفاية. لو الـ members مترتبة غلط (مثلًا panel مربع من غير diagonal وجنبه panel فيه 2 diagonals) هيبقى العدد صح والـ truss بيتحرك برضه. بص على الشكل نفسه كمان.' },
        { type: 'khamseena', ar: 'لو M أكبر من 2J − 3، الـ truss بيبقى «redundant»: أقوى، بس الـ statics لوحدها مش كفاية تحلّه. هتاخد ده بعدين في Structural Analysis.' },
      ]},
      { id: 'check', title: 'Try this!', chip: 'try', blocks: [
        { type: 'tea', items: ['ابدأ بمثلث، وكل خطوة زوّد 2 members + 1 joint.', `${m('M = 2J − 3')} ← simple & statically determinate (مع 3 reactions).`, `${m('M < 2J − 3')} ← unstable، و ${m('M > 2J − 3')} ← redundant.`] },
        { type: 'quiz', qs: [
          { q: 'Example 1 in your notes has J = 4 joints. How many members does a simple truss with 4 joints have?', opts: ['4', '5', '6', '8'], a: 1, why: '2(4) − 3 = 5. وفعلًا الـ truss بتاع Example 1 فيه 5 members: AB, AD, BD, BC, CD.' },
          { q: 'A truss has J = 7 and M = 10. What can you say?', opts: ['It is a simple truss', 'It is redundant', 'It is unstable (a mechanism)', 'Not enough info'], a: 2, why: '2(7) − 3 = 11. عنده 10 بس، يعني ناقص member، فهيتحرك زي المربع.' },
          { q: 'Why is there a “−3” in M = 2J − 3?', opts: ['Because a triangle has 3 sides', 'Because of the 3 support reactions needed to hold the truss', 'Both ideas lead to the same number', 'It is just a constant'], a: 2, why: 'الاتنين صح: المثلث الأول بيدي 3 members و 3 joints، وبرضه الـ 3 reactions اللي بتمسك الـ truss كـ rigid body. نفس الرقم من طريقين.' },
        ]},
      ]},
      { id: 'videos', title: 'Videos', chip: 'video', blocks: [{ type: 'videos', ids: ['jn8sR-lS4tw'] }] },
      { id: 'comment', title: 'Leave a Comment!', chip: 'comment', blocks: [{ type: 'comment', q: 'Draw a truss with J = 6 on paper. How many members did you need? Does it stay rigid?' }] },
    ],
  },
  {
    id: 3, slug: 'two-force-members', title: 'Assumptions & Two-Force Members', ar: 'الافتراضات، والـ Tension والـ Compression', face: 'think', mins: 12,
    objectives: ['List the 3 design assumptions', 'Explain why every member is a two-force member', 'Tell Tension from Compression on a joint'],
    sections: [
      { id: 'assume', title: '3 assumptions', chip: 'concept', blocks: [
        { type: 'explain', ar: `<p>عشان نحسب بسهولة، بنفترض 3 حاجات:</p>
<ol><li>كل الـ members متوصّلة بـ ${t('smooth pins')}، يعني مفيش احتكاك والـ joint مش بتمسك ${t('moment')}.</li>
<li>الـ members ${t('weightless')}: وزنها صغير جدًا جنب الأحمال فبنهمله.</li>
<li>كل الأحمال الخارجية واقعة على الـ ${t('joints')} بس، مش في نص الـ member.</li></ol>
<p>النتيجة؟ كل member فيه قوتين بس، عند طرفيه. يعني هو ${t('Two-Force Member')}.</p>` },
        { type: 'formula', html: `Two-force member ⇒ force along its axis<small>Equal · Opposite · Collinear (on the line joining the two pins)</small>` },
        { type: 'explain', ar: `<p>ليه لازم القوة تبقى على محور الـ member؟ لو القوتين مش على نفس الخط، هيعملوا ${t('couple')} والـ member هيلف. ولأنه في ${t('equilibrium')}، لازم القوتين يبقوا متساويين، عكس بعض، وعلى نفس الخط اللي بيوصّل الـ pins.</p>
<p>وبكده الـ member يا إمّا مشدود ${t('Tension (T)')}، يا إمّا مكبوس ${t('Compression (C)')}.</p>` },
      ]},
      { id: 'tc', title: 'Tension vs Compression', chip: 'try', blocks: [
        { type: 'widget', id: 'tension' },
        { type: 'explain', ar: `<p><strong>الفورمة اللي تحفظها:</strong></p>
<ul><li>${t('Tension')}: الـ member بيـ<b>شدّ</b> الـ pin ناحيته (السهم على الـ joint رايح بعيد عنها، ناحية الـ member).</li>
<li>${t('Compression')}: الـ member بيـ<b>زقّ</b> الـ pin (السهم على الـ joint داخل عليها).</li></ul>
<p>في الحل، دايمًا <strong>افترض إن كل المجاهيل Tension</strong>. لو الإجابة طلعت موجبة يبقى ${t('T')}، ولو طلعت سالبة يبقى ${t('C')}. سهلة!</p>` },
        { type: 'khamseena', ar: 'الحبل يستحمل شدّ بس، عمره ما يستحمل زقّ. عشان كده الكابلات في الكباري المعلّقة كلها شغالة Tension.' },
      ]},
      { id: 'trap', title: 'Exam Trap!', chip: 'trap', blocks: [
        { type: 'trap', bad: 'ترسم سهم الـ Tension على الـ joint داخل عليها لأن «الـ member مشدود».', good: 'على الـ member نفسه سهم الـ T بيبقى بره (بيمطّه). لكن على الـ pin، الـ member المشدود بيشدّ الـ pin ناحيته، يعني السهم خارج من الـ joint. ركّز إنت راسم الـ FBD لمين.' },
      ]},
      { id: 'check', title: 'Try this!', chip: 'try', blocks: [
        { type: 'tea', items: ['3 افتراضات: smooth pins، weightless، الأحمال على الـ joints بس.', 'يعني كل member هو two-force member والقوة على محوره.', 'افترض T. لو الناتج + يبقى T، ولو − يبقى C.'] },
        { type: 'quiz', qs: [
          { q: 'You assumed F_BC is in tension and solved: F_BC = −900 N. So member BC is…', opts: ['900 N in tension', '900 N in compression', 'A zero-force member', 'You made a mistake — forces can’t be negative'], a: 1, why: 'السالب معناه إن الاتجاه اللي افترضته (T) غلط، فالـ member في Compression بـ 900 N.' },
          { q: 'Which assumption makes every truss member a two-force member?', opts: ['Members are made of steel', 'Loads act only at the joints, members are weightless and pinned', 'The truss is planar', 'Supports are rollers'], a: 1, why: 'لما الأحمال على الـ joints بس، والوزن مهمل، والـ pins ملسا، الـ member ما فيهوش قوى غير عند طرفيه.' },
          { q: 'On the free-body diagram of a JOINT, a member in compression shows an arrow that…', opts: ['Points away from the joint', 'Points toward the joint (pushes it)', 'Is perpendicular to the member', 'Doesn’t appear'], a: 1, why: 'الـ member المكبوس بيزقّ الـ pin، فالسهم داخل على الـ joint.' },
        ]},
      ]},
      { id: 'videos', title: 'Videos', chip: 'video', blocks: [{ type: 'videos', ids: ['8aFVZZ87k3E'] }] },
      { id: 'comment', title: 'Leave a Comment!', chip: 'comment', blocks: [{ type: 'comment', q: 'Think of your desk chair or a ladder: which parts are in tension and which are in compression when you stand on it?' }] },
    ],
  },
  {
    id: 4, slug: 'method-of-joints', title: 'Method of Joints', ar: 'الحل joint ورا joint', face: 'talk', mins: 18,
    objectives: ['Find support reactions from the whole truss', 'Pick a joint with only 2 unknowns', 'Solve ΣFx = 0 and ΣFy = 0 joint by joint and label T / C'],
    sections: [
      { id: 'recipe', title: 'The recipe', chip: 'concept', blocks: [
        { type: 'explain', ar: `<p>الـ ${t('Method of Joints')} بنستخدمه لما نكون عايزين القوة في <strong>كل</strong> الـ members، زي ما بيحصل في الـ design.</p>
<p>الفكرة: كل ${t('pin')} عبارة عن ${t('particle')} في equilibrium، عليه الأحمال الخارجية والقوى اللي جاية من الـ members المتوصّلة بيه. وبما إن كل القوى على الـ pin بتعدّي في نقطة واحدة، يبقى عندنا معادلتين بس:</p>` },
        { type: 'formula', html: `ΣF<sub>x</sub> = 0 &nbsp;·&nbsp; ΣF<sub>y</sub> = 0<small>for every joint (pin) → at most 2 unknowns per joint</small>` },
        { type: 'explain', ar: `<ol><li><strong>الـ truss كله كـ rigid body:</strong> ارسم الـ FBD وطلّع الـ reactions من ${m('ΣFx = 0 , ΣFy = 0 , ΣM = 0')}. القوى الداخلية بتلغي بعضها (قانون نيوتن التالت)، فمش هتظهر.</li>
<li><strong>اختار joint فيها مجهولين بس</strong> (أو أقل).</li>
<li><strong>افترض كل القوى المجهولة Tension</strong> وطبّق ${m('ΣFx = 0')} و ${m('ΣFy = 0')}.</li>
<li><strong>اتنقل للـ joint اللي بعدها</strong> وشيل معاك القيم اللي عرفتها بإشارتها.</li>
<li><strong>اعمل check:</strong> المعادلات اللي فاضلة في آخر joint لازم تطلع صفر.</li></ol>` },
      ]},
      { id: 'walk', title: 'Example 1 — step by step', chip: 'try', blocks: [
        { type: 'explain', ar: `<p>ده <b>Example 1</b> من الملزمة. دوس <b>Next</b> وامشي معايا خطوة خطوة. الـ joint اللي بنحلّها بتنوّر، والـ member بيتلوّن أول ما نعرف قوته (<span class="tag-T">أخضر = T</span>، <span class="tag-C">أحمر = C</span>).</p>` },
        { type: 'widget', id: 'walk1' },
      ]},
      { id: 'trap', title: 'Exam Trap!', chip: 'trap', blocks: [
        { type: 'trap', bad: 'تبدأ بـ joint فيها 3 مجاهيل، أو تنسى تطلّع الـ reactions الأول.', good: 'عدّ المجاهيل في كل joint قبل ما تبدأ. لو مفيش joint فيها اتنين بس، يبقى طلّع الـ reactions من الـ truss كله الأول (زي Example 2 في الملزمة).' },
        { type: 'trap', bad: 'تلخبط الـ sin والـ cos في الـ member المايل.', good: 'استخدم نسب المثلث على طول: BD في Example 1 أطواله 0.6 و 0.8 و 1.0، يعني المركّبة الأفقية = 0.8F والرأسية = 0.6F. ارسم المثلث الصغير جنب الـ joint.' },
      ]},
      { id: 'check', title: 'Try this!', chip: 'try', blocks: [
        { type: 'tea', items: ['Reactions الأول (الـ truss كله).', 'اختار joint فيها مجهولين بس.', 'افترض T، طبّق ΣFx و ΣFy، واتنقل للي بعدها.', 'آخر معادلة = check.'] },
        { type: 'quiz', qs: [
          { q: 'Example 2 (notes, p.72): BEFORE finding the reactions, which joint can you start with?', opts: ['Joint A', 'Joint C', 'Joint D', 'None — find the reactions first'], a: 3, img: 'ex2', why: 'كل joint فيها أكتر من مجهولين: A (AB, AE, XA, YA) و C (BC, CD, NC) و D (CD, DE, BD). عشان كده الملزمة بدأت بالـ truss كله.' },
          { q: 'Example 2: after finding the reactions, joint C has members BC (horizontal) and CD (vertical) and reaction N_C = 125 N ↑. What is F_BC?', opts: ['125 N (T)', '0 — zero-force member', '125 N (C)', '200 N (T)'], a: 1, why: 'عند C مفيش أي قوة أفقية غير F_BC، يعني ΣFx = 0 ← F_BC = 0. وبعدين ΣFy = 0 ← F_CD = −125 N يعني (C).' },
          { q: 'In the method of joints, how many independent equations does each joint give?', opts: ['1', '2', '3', 'Depends on the members'], a: 1, why: 'القوى على الـ pin concurrent (بتعدّي في نقطة واحدة)، فالـ moment بيبقى صفر لوحده. فاضل ΣFx و ΣFy بس.' },
        ]},
      ]},
      { id: 'videos', title: 'Videos', chip: 'video', blocks: [{ type: 'videos', ids: ['BVCIQfFzguk', '_rK02neOF18', 'oXf_tTFUj0Q', 'tWB_wTCRFw0'] }] },
      { id: 'comment', title: 'Leave a Comment!', chip: 'comment', blocks: [{ type: 'comment', q: 'In Example 1, the check at joint C gave 1200 − 0.8(1500) = 0. Why is having a “spare” equation so useful in an exam?' }] },
    ],
  },
  {
    id: 5, slug: 'method-of-sections', title: 'Method of Sections', ar: 'اقطع الـ truss وخُد الحتة اللي تريّحك', face: 'wink', mins: 15,
    objectives: ['Know when Sections is faster than Joints', 'Cut through at most 3 members', 'Pick the moment point that kills two unknowns'],
    sections: [
      { id: 'idea', title: 'The idea', chip: 'concept', blocks: [
        { type: 'explain', ar: `<p>ساعات الامتحان مش عايز كل الـ members، عايز 2 أو 3 بس (مثلًا عشان تغيّرهم). هنا الـ ${t('Method of Sections')} بيوفّر عليك وقت كتير.</p>
<p>الفكرة: <strong>لو الجسم كله في equilibrium، يبقى أي حتة منه في equilibrium برضه.</strong></p>
<ol><li>طلّع الـ reactions من الـ truss كله (غالبًا).</li>
<li>اقطع الـ truss بخط وهمي ${m('n–n')} يعدّي على الـ members اللي عايزها، ويقسم الـ truss لحتتين بالكامل.</li>
<li>خُد حتة واحدة، وارسم قوى الـ members المقطوعة كأنها أحمال خارجية (وافترضها Tension).</li>
<li>عندك 3 معادلات: ${m('ΣFx = 0 , ΣFy = 0 , ΣM = 0')}.</li></ol>` },
        { type: 'formula', html: `Cut ≤ <span class="hl">3</span> members<small>because one segment gives only 3 equations: ΣF<sub>x</sub> = 0 · ΣF<sub>y</sub> = 0 · ΣM<sub>O</sub> = 0</small>` },
      ]},
      { id: 'cutter', title: 'Section Cutter', chip: 'try', blocks: [
        { type: 'explain', ar: `<p>حرّك الـ cut على الكوبري ده (Pratt truss، كل panel طوله 2 m وارتفاعه 2 m، وعلى كل joint تحت 10 kN). شوف الـ members المقطوعة، والنقطة اللي لو أخدت عندها moment هتطلّعلك مجهول واحد على طول.</p>` },
        { type: 'widget', id: 'cutter' },
      ]},
      { id: 'trick', title: 'The moment trick', chip: 'khamseena', blocks: [
        { type: 'explain', ar: `<p><strong>التريك:</strong> اختار نقطة الـ moment عند تقاطع خطّين من الـ 3 members المقطوعة. الاتنين دول مش هيعملوا moment حوالين النقطة دي، فيفضل مجهول واحد بس. زي ما الملزمة عملت في Example 4: أخدت ${m('ΣM<sub>D</sub> = 0')} لأن GD و CD بيعدّوا في D، فطلعت ${m('F<sub>GF</sub>')} على طول.</p>
<p>ولو اتنين من الـ members المقطوعة متوازيين (زي الـ top chord والـ bottom chord)، استخدم ${m('ΣFy = 0')} عشان تطلّع التالت المايل.</p>` },
        { type: 'khamseena', ar: 'ممكن تمزج الطريقتين: لو القطع لازم يعدّي على 4 members (زي Example 6)، طلّع واحد منهم الأول بالـ joints، وبعدين اقطع.' },
      ]},
      { id: 'trap', title: 'Exam Trap!', chip: 'trap', blocks: [
        { type: 'trap', bad: 'تقطع 4 members وتحاول تحلّ بـ 3 معادلات، أو تقطع من غير ما تقسم الـ truss لحتتين بالكامل.', good: 'عدّ الـ members المقطوعة: لازم ≤ 3 والقطع يفصل الحتتين خالص. ولو مش هينفع، طلّع member بالـ joints الأول.' },
        { type: 'trap', bad: 'تنسى moment الأحمال الخارجية أو الـ reactions اللي على الحتة اللي اخترتها.', good: 'اكتب كل قوة على الـ FBD بتاع الحتة: الأحمال + الـ reactions + قوى الـ members المقطوعة. واختار الحتة اللي قواها أقل.' },
      ]},
      { id: 'check', title: 'Try this!', chip: 'try', blocks: [
        { type: 'tea', items: ['Sections = لما تكون عايز members قليلة.', 'اقطع ≤ 3 members، والقطع يفصل الحتتين خالص.', 'Moment عند تقاطع اتنين ← يطلع التالت على طول.'] },
        { type: 'quiz', qs: [
          { q: 'In Example 4 (notes p.75), why did the solution use ΣM_D = 0 for the upper part?', opts: ['Because D is a support', 'Because two of the cut members (GD and CD) pass through D', 'Because D has the largest load', 'Any point gives the same equation'], a: 1, why: 'GD و CD بيعدّوا في D فالـ moment بتاعهم حواليها = 0، ففضل F_GF بس: F_GF(2) − 5(2) = 0 ← F_GF = 5 kN (T).' },
          { q: 'What is the maximum number of unknown member forces you can find from ONE section?', opts: ['2', '3', '4', 'As many as you cut'], a: 1, why: 'الحتة الواحدة rigid body وليها 3 معادلات equilibrium بس.' },
          { q: 'You need the force in ONE diagonal in the middle of a 20-panel bridge. The fastest method is…', opts: ['Method of joints from the left end', 'Method of sections through that panel', 'Guessing by symmetry', 'Zero-force rules'], a: 1, why: 'بالـ joints هتعدّي على joints كتير لحد ما توصل. الـ section بيوصّلك في خطوة واحدة.' },
        ]},
      ]},
      { id: 'videos', title: 'Videos', chip: 'video', blocks: [{ type: 'videos', ids: ['n6P8jBcT8ks', 'cdK-bunwPvE', '2qCAjylJsfc'] }] },
      { id: 'comment', title: 'Leave a Comment!', chip: 'comment', blocks: [{ type: 'comment', q: 'When would you choose Joints over Sections? Write one situation for each.' }] },
    ],
  },
  {
    id: 6, slug: 'zero-force-members', title: 'Zero-Force Members', ar: 'الـ Members اللي «مش شايلة حاجة»، وتطلّعها بالنظر', face: 'starry', mins: 12,
    objectives: ['State the two rules for zero-force members', 'Find them by inspection before solving', 'Explain why engineers still build them'],
    sections: [
      { id: 'rules', title: 'Two rules', chip: 'concept', blocks: [
        { type: 'explain', ar: `<p>الـ ${t('Zero-Force Member')} هو member قوته صفر تحت التحميل ده. بنطلّعه <strong>بالنظر</strong> قبل ما نحل، وده بيوفّر وقت كتير.</p>` },
        { type: 'widget', id: 'zfmRules' },
        { type: 'explain', ar: `<p><strong>الشرط المهم في القاعدتين:</strong> الـ joint ما يكونش عليها لا حمل خارجي ولا reaction.</p>
<p>طب ليه بنبنيهم أصلًا؟ عشان الـ ${t('stability')}: بيمسكوا الـ members الطويلة المكبوسة من الـ ${t('buckling')}، ولو التحميل اتغيّر (عربية عدّت على الكوبري مثلًا) ممكن يبدأوا يشيلوا.</p>` },
      ]},
      { id: 'hunt', title: 'Zero-Force Hunter', chip: 'try', blocks: [
        { type: 'explain', ar: '<p>دوس على كل member شايف إنه zero-force، وبعدين دوس <b>Check</b>. ابدأ بالـ joints اللي ما عليهاش أحمال، وكل ما تلاقي واحد اعتبره مش موجود وبص تاني!</p>' },
        { type: 'widget', id: 'hunter' },
      ]},
      { id: 'trap', title: 'Exam Trap!', chip: 'trap', blocks: [
        { type: 'trap', bad: 'تطبّق القاعدة على joint عليها حمل أو reaction.', good: 'لو فيه حمل على الـ joint في اتجاه الـ member التالت (أو ليه مركّبة في اتجاهه)، الـ member ده مش zero. القاعدتين للـ joints الفاضية بس.' },
        { type: 'trap', bad: 'تقول «zero-force يعني نشيله من الكوبري وخلاص».', good: 'هو صفر تحت التحميل ده بس. لو شلته الـ truss ممكن يبقى unstable، أو الـ member المكبوس يعمل buckling.' },
      ]},
      { id: 'check', title: 'Try this!', chip: 'try', blocks: [
        { type: 'tea', items: ['Rule (a): joint فيها 2 members مش على خط واحد ← الاتنين = 0.', 'Rule (b): joint فيها 3 members، اتنين منهم على خط واحد ← التالت = 0.', 'بشرط مفيش حمل ولا reaction على الـ joint.'] },
        { type: 'quiz', qs: [
          { q: 'Example 3 (notes p.74): EH is already zero (rule b at joint E). Joint H is unloaded and still has GH and HI (collinear) plus HD. Which member is zero?', opts: ['GH', 'HI', 'HD', 'None'], a: 2, why: 'Rule (b): GH و HI على خط واحد، فالتالت HD = 0. شُفت إزاي كل zero بتلاقيه بيفتحلك اللي بعده؟' },
          { q: 'A joint has two non-collinear members and a 10 kN load along one of them. Are both members zero?', opts: ['Yes, rule (a)', 'No — the joint is loaded, so rule (a) does not apply', 'Only the loaded one is zero', 'Only the other one is zero'], a: 1, why: 'القاعدة للـ joints اللي مفيش عليها أحمال بس. هنا الـ member اللي في اتجاه الحمل هيشيله، والتاني = 0.' },
          { q: 'Why do engineers keep zero-force members in a real bridge?', opts: ['To make it look nicer', 'For stability and because loads move', 'They are mistakes in the design', 'To carry the members’ weight only'], a: 1, why: 'بيمنعوا الـ buckling وبيخلّوا الـ truss stable، والتحميل بيتغيّر طول الوقت.' },
        ]},
      ]},
      { id: 'videos', title: 'Videos', chip: 'video', blocks: [{ type: 'videos', ids: ['xSEScMN6bpo', 'eOQRGmTiTfw'] }] },
      { id: 'comment', title: 'Leave a Comment!', chip: 'comment', blocks: [{ type: 'comment', q: 'In Example 6 the notes list BN, NC, DO, CO and LE as zero-force members. Pick one and explain which rule proves it.' }] },
    ],
  },
];

// Walkthrough for Example 1 (numbers checked with the solver: they match the notes)
export const WALK1 = [
  { title: 'Read the problem', joint: null, show: [], ar: 'عندنا pin عند A، و roller سايب على الحيطة عند C (بيدي reaction أفقي N<sub>C</sub> بس)، وحمل 800 N أفقي عند D و 1200 N لتحت عند B. المطلوب: الـ reactions والقوة في كل member.', eq: [] },
  { title: 'Step 1 · Reactions (whole truss)', joint: null, reactions: true, show: [], ar: 'ناخد الـ truss كله كـ rigid body. نبدأ بـ moment حوالين A عشان نخلص من X<sub>A</sub> و Y<sub>A</sub> مرة واحدة.',
    eq: ['ΣM<sub>A</sub> = 0: −N<sub>C</sub>(1.2) + 800(0.6) + 1200(0.8) = 0', '<span class="res">N<sub>C</sub> = 1200 N</span>', 'ΣF<sub>x</sub> = 0: −X<sub>A</sub> − 800 + N<sub>C</sub> = 0 → <span class="res">X<sub>A</sub> = 400 N</span>', 'ΣF<sub>y</sub> = 0: Y<sub>A</sub> − 1200 = 0 → <span class="res">Y<sub>A</sub> = 1200 N</span>'] },
  { title: 'Step 2 · Joint A', joint: 'A', reactions: true, show: ['AB', 'AD'], ar: 'عند A فيه مجهولين بس: F<sub>AB</sub> (أفقي) و F<sub>AD</sub> (رأسي). كل واحد فيهم بيوازن reaction لوحده.',
    eq: ['ΣF<sub>x</sub> = 0 → F<sub>AB</sub> = X<sub>A</sub> = <span class="res">400 N (C)</span>', 'ΣF<sub>y</sub> = 0 → F<sub>AD</sub> = Y<sub>A</sub> = <span class="res">1200 N (C)</span>'] },
  { title: 'Step 3 · Joint B', joint: 'B', reactions: true, show: ['AB', 'AD', 'BD', 'BC'], ar: 'عند B عرفنا F<sub>AB</sub>، وفاضل F<sub>BD</sub> (مايل) و F<sub>BC</sub> (رأسي). BD أطواله 0.8 × 0.6 × 1.0، يعني sin θ = 0.8 و cos θ = 0.6.',
    eq: ['ΣF<sub>x</sub> = 0: 0.8 F<sub>BD</sub> = 400 → <span class="res">F<sub>BD</sub> = 500 N (T)</span>', 'ΣF<sub>y</sub> = 0: −1200 + F<sub>BC</sub> + 0.6 F<sub>BD</sub> = 0', '<span class="res">F<sub>BC</sub> = 900 N (T)</span>'] },
  { title: 'Step 4 · Joint C', joint: 'C', reactions: true, show: ['AB', 'AD', 'BD', 'BC', 'CD'], ar: 'عند C فاضل مجهول واحد: F<sub>CD</sub>. نستخدم ΣF<sub>y</sub>.',
    eq: ['ΣF<sub>y</sub> = 0: 0.6 F<sub>CD</sub> = 900 → <span class="res">F<sub>CD</sub> = 1500 N (C)</span>'] },
  { title: 'Step 5 · Check', joint: 'C', reactions: true, show: ['AB', 'AD', 'BD', 'BC', 'CD'], ar: 'فاضل معادلة ما استخدمناهاش: ΣF<sub>x</sub> عند C. لو طلعت صفر يبقى الحل كله صح. 🎉',
    eq: ['ΣF<sub>x</sub> = N<sub>C</sub> − 0.8 F<sub>CD</sub> = 1200 − 0.8(1500) = <span class="res">0 ✓</span>'] },
];

// Home "In a Khamseena" facts
export const FACTS = [
  'كوبري إمبابة الحديد في القاهرة اتبنى سنة ١٩٢٤، وهو truss حديد بيعدّي عليه قطر وعربيات.',
  'الـ International Space Station ليها «عمود فقري» طويل اسمه Integrated Truss Structure، شايل ألواح الطاقة الشمسية.',
  'أبراج الكهربا الضغط العالي اللي على الطرق الصحراوي كلها trusses ثلاثية الأبعاد.',
  'كلمة Pratt وHowe وWarren أسامي مهندسين اخترعوا أشكال trusses بقت مشهورة في الكباري.',
];
