// Checks every demo of every method: noise keeps the previous step's goal, the starting position
// is NOT yet solved for the step, playing the moves reaches the goal, and any per-segment
// checkpoints (`segment.goal`) hold along the way.
// Run: node test/verify.mjs
import * as C from '../js/cube.js';
import * as beginner from '../js/steps.js';
import * as cfop from '../js/steps-cfop.js';

// Centers can end up spun by slice moves; that is invisible, so only their position counts.
const ok = (c) => (C.pieceType(c.home) === 1 ? C.isHome(c) : C.isSolvedCubie(c));
const solvedHomes = (s, pred) => s.cubies.filter((c) => pred(c.home)).every(ok);
const topEdge = (h) => h[1] === 1 && C.pieceType(h) === 2;
const topCorner = (h) => h[1] === 1 && C.pieceType(h) === 3;
const yellowUp = (c) => C.whereFaces(c, 'U') === 'U';

const GOALS = {
  cross: (s) => solvedHomes(s, (h) => h[1] === -1 && C.pieceType(h) === 2),
  firstLayer: (s) => solvedHomes(s, (h) => h[1] === -1),
  f2l: (s) => solvedHomes(s, (h) => h[1] <= 0),
  yellowCross: (s) => GOALS.f2l(s) && s.cubies.filter((c) => topEdge(c.home)).every(yellowUp),
  oll: (s) => GOALS.f2l(s) && s.cubies.filter((c) => c.home[1] === 1 && C.pieceType(c.home) > 1).every(yellowUp),
  yellowEdges: (s) => GOALS.f2l(s) && solvedHomes(s, topEdge),
  cornersPlaced: (s) => GOALS.yellowEdges(s) && s.cubies.filter((c) => topCorner(c.home)).every(C.isHome),
  pllCorners: (s) => GOALS.oll(s) && solvedHomes(s, topCorner),
  solved: (s) => s.cubies.every(ok),
};

let fails = 0;
const check = (pass, msg) => {
  console.log(`${pass ? '  ok ' : 'FAIL '} ${msg}`);
  if (!pass) fails++;
};

for (const [method, { STEPS }] of Object.entries({ beginner, cfop })) {
  console.log(`\n# ${method}`);
  STEPS.forEach((step, i) => {
    const prev = !step.showScramble && i > 0 ? STEPS[i - 1].goal : null;
    const noisy = C.applyAlg(C.solved(), step.noise);
    if (prev) check(GOALS[prev](noisy), `${step.id}: noise keeps "${prev}"`);
    for (const cs of step.cases) {
      const moves = C.parseAlg(cs.segments.map((s) => s.alg).join(' '));
      const s = C.applyAlg(C.clone(noisy), C.invertAlg(moves));
      const tag = `${step.id}/${cs.name.en}`;
      check(!GOALS[step.goal](s), `${tag}: start is unsolved`);
      if (prev) check(GOALS[prev](s), `${tag}: start keeps "${prev}"`);
      for (const seg of cs.segments) {
        C.applyAlg(s, seg.alg);
        if (seg.goal) check(GOALS[seg.goal](s), `${tag}: after "${seg.label}" → "${seg.goal}"`);
      }
      check(GOALS[step.goal](s), `${tag}: moves reach "${step.goal}"`);
    }
  });
}

console.log(fails ? `\n${fails} failure(s)` : '\nAll demos verified.');
process.exit(fails ? 1 : 0);
