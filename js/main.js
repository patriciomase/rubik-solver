import * as C from './cube.js';
import { CubeView } from './view.js';
import { UI, initialLang, saveLang } from './i18n.js';

const METHOD = document.body.dataset.method || 'beginner';
const { STEPS } = await import(METHOD === 'cfop' ? './steps-cfop.js' : './steps.js');
const GROUPS = { C: 'Cross', F: 'F2L', O: 'OLL', P: 'PLL' };

let lang = initialLang();
const t = (k) => UI[lang][k];
const pick = (obj) => obj[lang];
const $ = (sel, el = document) => el.querySelector(sel);

const algHTML = (alg) => alg.split(' ').map((m) => `<span class="mv">${m}</span>`).join(' ');

// ---------- Step player ----------
class Player {
  constructor(step, index, section) {
    this.step = step;
    this.section = section;
    this.caseIdx = 0;
    this.focus = true;
    this.speed = 1;
    this.gen = 0;
    this.stage = $('.cube-stage', section);
    this.view = null;
    this.algEl = $('.alg', section);
    this.bar = $('.progress span', section);
    this.playBtn = $('[data-act="play"]', section);
    this.hintEl = $('.case-hint', section);

    section.querySelectorAll('.ctl').forEach((b) => b.addEventListener('click', () => this[b.dataset.act]()));
    section.querySelectorAll('[data-speed]').forEach((b) =>
      b.addEventListener('click', () => {
        this.speed = +b.dataset.speed;
        if (this.view) this.view.speed = this.speed;
        section.querySelectorAll('[data-speed]').forEach((x) => x.classList.toggle('on', x === b));
      }),
    );
    this.focusBtn = $('.focus-toggle', section);
    if (!step.focus) this.focusBtn.hidden = true;
    this.focusBtn.addEventListener('click', () => {
      this.focus = !this.focus;
      this.applyFocus();
    });
  }

  ensureView() {
    if (this.view) return;
    this.view = new CubeView(this.stage, this.step.below ? { cameraPos: [5.6, -5.0, 7.6] } : {});
    this.view.speed = this.speed;
    this.loadCase(this.caseIdx);
  }

  applyFocus() {
    this.focusBtn.setAttribute('aria-pressed', String(this.focus));
    this.focusBtn.textContent = this.focus ? t('focusOn') : t('focusOff');
    this.view?.setFocus(this.focus ? this.step.focus : null);
  }

  loadCase(i) {
    this.caseIdx = i;
    this.gen++;
    this.setPlaying(false);
    const cs = this.step.cases[i];
    this.moves = [];
    this.segOf = [];
    cs.segments.forEach((seg, si) => C.parseAlg(seg.alg).forEach((mv) => { this.moves.push(mv); this.segOf.push(si); }));
    this.start = C.applyAlg(C.applyAlg(C.solved(), this.step.noise), C.invertAlg(this.moves));
    this.idx = 0;
    this.section.querySelectorAll('.case-tabs button').forEach((b, bi) => {
      b.classList.toggle('on', bi === i);
      b.setAttribute('aria-selected', String(bi === i));
    });
    this.renderHint();
    this.renderAlg();
    if (this.view) {
      this.view.setState(this.start);
      this.applyFocus();
    }
  }

  renderHint() {
    const cs = this.step.cases[this.caseIdx];
    if (this.step.showScramble) {
      const scramble = C.invertAlg(this.moves).map((m) => m.token).join(' ');
      this.hintEl.innerHTML = `<b>${t('scrambleLabel')}</b> <span class="alg-inline">${scramble}</span>`;
    } else {
      this.hintEl.textContent = cs.hint ? pick(cs.hint) : '';
    }
    this.hintEl.hidden = !this.hintEl.innerHTML;
  }

  renderAlg() {
    const cs = this.step.cases[this.caseIdx];
    let k = 0;
    this.algEl.innerHTML = cs.segments
      .map((seg) => {
        const chips = C.parseAlg(seg.alg).map((mv) => `<button class="chip" data-k="${k++}">${mv.token}</button>`).join('');
        return `<div class="seg">${seg.label ? `<span class="seg-label">${seg.label}</span>` : ''}<div class="chips">${chips}</div></div>`;
      })
      .join('');
    this.algEl.querySelectorAll('.chip').forEach((b) => b.addEventListener('click', () => this.jump(+b.dataset.k + 1)));
    this.updateUI();
  }

  updateUI() {
    this.algEl.querySelectorAll('.chip').forEach((b) => {
      const k = +b.dataset.k;
      b.classList.toggle('done', k < this.idx);
      b.classList.toggle('current', k === this.idx);
    });
    this.algEl.querySelectorAll('.seg').forEach((s, si) => {
      const segDone = this.segOf.every((x, k) => x !== si || k < this.idx);
      s.classList.toggle('seg-done', segDone);
    });
    this.bar.style.width = `${(this.idx / this.moves.length) * 100}%`;
    this.section.classList.toggle('is-complete', this.idx === this.moves.length);
  }

  jump(k) {
    this.gen++;
    this.setPlaying(false);
    this.idx = k;
    const s = C.applyAlg(C.clone(this.start), this.moves.slice(0, k));
    this.view?.setState(s);
    this.updateUI();
  }

  reset() { this.jump(0); }

  next() {
    if (this.idx >= this.moves.length) return Promise.resolve();
    const mv = this.moves[this.idx++];
    this.updateUI();
    return this.view.animate(mv);
  }

  prev() {
    if (this.playing) this.setPlaying(false);
    if (this.idx <= 0) return;
    const mv = C.invertMove(this.moves[--this.idx]);
    this.updateUI();
    this.view.animate(mv);
  }

  setPlaying(on) {
    this.playing = on;
    this.playBtn.textContent = on ? '❚❚' : '▶';
    this.playBtn.setAttribute('aria-label', on ? 'Pause' : 'Play');
  }

  async play() {
    if (this.playing) { this.setPlaying(false); this.gen++; return; }
    if (this.idx >= this.moves.length) this.jump(0);
    const gen = ++this.gen;
    this.setPlaying(true);
    await new Promise((r) => setTimeout(r, 250));
    while (gen === this.gen && this.idx < this.moves.length) {
      const segBefore = this.segOf[this.idx];
      await this.next();
      if (gen !== this.gen) return;
      const segBreak = this.idx < this.moves.length && this.segOf[this.idx] !== segBefore;
      await new Promise((r) => setTimeout(r, (segBreak ? 450 : 90) / this.speed));
    }
    if (gen === this.gen) this.setPlaying(false);
  }

  renderText(index) {
    const s = this.section;
    const step = this.step;
    $('.step-num', s).textContent = String(index + 1).padStart(2, '0');
    $('.eyebrow', s).textContent = `${t('step')} ${index + 1}` + (GROUPS[step.group] ? ` · ${GROUPS[step.group]}` : '');
    $('h2', s).textContent = pick(step.title);
    $('.tagline', s).textContent = pick(step.tagline);
    $('.body', s).innerHTML = pick(step.body);
    $('.tip p', s).innerHTML = pick(step.tip);
    $('.done-toggle span', s).textContent = t('learned');
    $('.drag-chip', s).textContent = step.below ? t('dragBelow') : t('drag');
    const tabs = $('.case-tabs', s);
    if (!tabs.children.length) {
      step.cases.forEach((_, i) => {
        const b = document.createElement('button');
        b.setAttribute('role', 'tab');
        b.addEventListener('click', () => this.loadCase(i));
        tabs.appendChild(b);
      });
    }
    [...tabs.children].forEach((b, i) => {
      b.textContent = pick(step.cases[i].name);
      b.classList.toggle('on', i === this.caseIdx);
    });
    if (this.moves) this.renderHint();
    this.applyFocus();
  }
}

// ---------- Build page ----------
const stepsRoot = $('#steps');
const tpl = $('#stepTpl');
const nav = $('#stepsNav');
const players = STEPS.map((step, i) => {
  const frag = tpl.content.cloneNode(true);
  const section = frag.querySelector('section');
  section.id = `step-${step.id}`;
  if (i % 2) section.classList.add('flip');
  stepsRoot.appendChild(frag);

  const a = document.createElement('a');
  a.href = `#${section.id}`;
  a.textContent = i + 1;
  a.dataset.target = section.id;
  nav.appendChild(a);

  const box = $('.done-toggle input', section);
  const doneKey = METHOD === 'beginner' ? `done-${step.id}` : `done-${METHOD}-${step.id}`;
  try { box.checked = localStorage.getItem(doneKey) === '1'; } catch {}
  const markDone = () => {
    a.classList.toggle('learned', box.checked);
    section.classList.toggle('learned', box.checked);
  };
  markDone();
  box.addEventListener('change', () => {
    try { localStorage.setItem(doneKey, box.checked ? '1' : '0'); } catch {}
    markDone();
  });

  return new Player(step, i, section);
});

// Face legend + move pad
const legend = $('#faceLegend');
const pad = $('#movePad');
if (legend) ['U', 'D', 'R', 'L', 'F', 'B'].forEach((f) => {
  legend.insertAdjacentHTML('beforeend', `<li><span class="face-dot face-${f}">${f}</span><span data-face="${f}"></span></li>`);
});
const padKeys = (pad.dataset.keys || 'U D R L F B y').split(' ');
pad.style.gridTemplateColumns = `repeat(${padKeys.length}, 1fr)`;
padKeys.forEach((f) => {
  pad.insertAdjacentHTML('beforeend', `<div class="pad-col"><button class="key" data-mv="${f}">${f}</button><button class="key key-prime" data-mv="${f}'">${f}'</button></div>`);
});

function renderStatic() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  document.querySelectorAll('[data-i18n-html]').forEach((el) => (el.innerHTML = t(el.dataset.i18nHtml)));
  document.querySelectorAll('[data-face]').forEach((el) => (el.textContent = t('faces')[el.dataset.face]));
  document.querySelectorAll('[data-lang]').forEach((b) => b.classList.toggle('on', b.dataset.lang === lang));
  players.forEach((p, i) => p.renderText(i));
  const cmp = $('#compare');
  if (cmp) {
    cmp.innerHTML = `<thead><tr><th></th><th>${t('methodBeginner')}</th><th>CFOP</th></tr></thead><tbody>${t('compareRows')
      .map((r) => `<tr><th>${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td></tr>`)
      .join('')}</tbody>`;
  }
  $('#cheatsheet').innerHTML = STEPS.flatMap((step, i) =>
    (step.cheat || []).map((ch, j) => {
      const name = ch.name ? `<small>${pick(ch.name)}</small>` : '';
      const label = j ? name : `${pick(step.title)}${name}`;
      return `<a class="cheat${j ? ' cheat-cont' : ''}" href="#step-${step.id}"><span class="cheat-n">${j ? '' : i + 1}</span><span class="cheat-t">${label}</span><span class="cheat-a">${algHTML(ch.alg)}</span></a>`;
    }),
  ).join('');
}
document.querySelectorAll('[data-lang]').forEach((b) =>
  b.addEventListener('click', () => {
    lang = b.dataset.lang;
    saveLang(lang);
    renderStatic();
  }),
);
renderStatic();

// ---------- Hero: scrambles and solves itself on a loop ----------
const hero = new CubeView($('#heroCube'), { autoRotate: true, cameraPos: [5.4, 4.3, 7.2] });
const FACES = ['U', 'D', 'R', 'L', 'F', 'B'];
function randomScramble(n) {
  const out = [];
  let last = '';
  while (out.length < n) {
    const f = FACES[Math.floor(Math.random() * 6)];
    if (f === last) continue;
    last = f;
    out.push(C.parseMove(f + ["", "'", '2'][Math.floor(Math.random() * 3)]));
  }
  return out;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// On the CFOP page the hero replays the full example solve instead.
const example = STEPS.find((s) => s.showScramble)?.cases[0];
(async function heroLoop() {
  await wait(700);
  if (example) {
    const sol = C.parseAlg(example.segments.map((sg) => sg.alg).join(' '));
    for (;;) {
      hero.setState(C.applyAlg(C.solved(), C.invertAlg(sol)));
      await wait(1400);
      hero.speed = 3.4;
      for (const mv of sol) await hero.animate(mv);
      await wait(3000);
    }
  }
  for (;;) {
    const scr = randomScramble(18);
    hero.speed = 3.2;
    for (const mv of scr) await hero.animate(mv);
    await wait(1600);
    hero.speed = 2.2;
    for (const mv of C.invertAlg(scr)) await hero.animate(mv);
    await wait(2600);
  }
})();

// ---------- Notation pad ----------
let padView = null;
const history = [];
const historyEl = $('#padHistory');
function padMove(tok) {
  if (!padView) return;
  padView.animate(C.parseMove(tok));
  history.push(tok);
  historyEl.textContent = history.slice(-10).join(' ');
}
pad.addEventListener('click', (e) => {
  const b = e.target.closest('[data-mv]');
  if (b) padMove(b.dataset.mv);
});
$('#padReset').addEventListener('click', () => {
  padView?.setState(C.solved());
  history.length = 0;
  historyEl.textContent = '';
});
$('#padScramble').addEventListener('click', () => {
  if (!padView) return;
  padView.speed = 3;
  const scr = randomScramble(16);
  const done = scr.map((mv) => padView.animate(mv));
  done[done.length - 1].then(() => { padView.speed = 1; });
  history.push(...scr.map((m) => m.token));
  historyEl.textContent = history.slice(-10).join(' ');
});
let padVisible = false;
window.addEventListener('keydown', (e) => {
  if (!padVisible || e.metaKey || e.ctrlKey || e.altKey) return;
  const f = e.key.toUpperCase();
  if (!FACES.includes(f) && e.key.toLowerCase() !== 'y') return;
  const face = e.key.toLowerCase() === 'y' ? 'y' : f;
  padMove(e.shiftKey ? `${face}'` : face);
});

// ---------- Lazy-create cubes as sections approach the viewport ----------
const finale = { view: null };
const io = new IntersectionObserver(
  (entries) => {
    for (const en of entries) {
      const el = en.target;
      if (el.id === 'heroCube') { hero.visible = en.isIntersecting; if (en.isIntersecting) hero.requestRender(); continue; }
      if (el.id === 'padCube') {
        padVisible = en.isIntersecting;
        if (en.isIntersecting && !padView) padView = new CubeView(el);
        continue;
      }
      if (el.id === 'finaleCube') {
        if (!finale.view) finale.view = new CubeView(el, { autoRotate: true });
        finale.view.visible = en.isIntersecting;
        if (en.isIntersecting) finale.view.requestRender();
        continue;
      }
      const p = players.find((pl) => pl.stage === el);
      if (p && en.isIntersecting) p.ensureView();
    }
  },
  { rootMargin: '300px 0px' },
);
io.observe($('#heroCube'));
io.observe($('#padCube'));
io.observe($('#finaleCube'));
players.forEach((p) => io.observe(p.stage));

// Highlight the current step in the top nav.
const navIO = new IntersectionObserver(
  (entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      nav.querySelectorAll('a').forEach((a) => a.classList.toggle('active', a.dataset.target === en.target.id));
    }
  },
  { rootMargin: '-45% 0px -50% 0px' },
);
players.forEach((p) => navIO.observe(p.section));
['notation', 'finale'].forEach((id) => navIO.observe(document.getElementById(id)));
