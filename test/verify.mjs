// Checks every demo: noise keeps earlier steps intact, the starting position is NOT yet solved
// for the step, and playing the case's moves reaches the step's goal.
// Run: node test/verify.mjs
import * as C from '../js/cube.js';
import { STEPS, caseMoves } from '../js/steps.js';

const solvedHomes = (s, pred) => s.cubies.filter((c) => pred(c.home)).every(C.isSolvedCubie);
const topEdges = (h) => h[1] === 1 && C.pieceType(h) === 2;

const GOALS = {
  cross: (s) => solvedHomes(s, (h) => h[1] === -1 && C.pieceType(h) === 2),
  firstLayer: (s) => solvedHomes(s, (h) => h[1] === -1),
  f2l: (s) => solvedHomes(s, (h) => h[1] <= 0),
  yellowCross: (s) => GOALS.f2l(s) && s.cubies.filter((c) => topEdges(c.home)).every((c) => C.whereFaces(c, 'U') === 'U'),
  yellowEdges: (s) => GOALS.f2l(s) && solvedHomes(s, topEdges),
  cornersPlaced: (s) => GOALS.yellowEdges(s) && s.cubies.filter((c) => c.home[1] === 1).every(C.isHome),
  solved: (s) => s.cubies.every(C.isSolvedCubie),
};
const ORDER = ['cross', 'firstLayer', 'f2l', 'yellowCross', 'yellowEdges', 'cornersPlaced', 'solved'];

let fails = 0;
const check = (ok, msg) => {
  console.log(`${ok ? '  ok ' : 'FAIL '} ${msg}`);
  if (!ok) fails++;
};

for (const step of STEPS) {
  const prev = ORDER[ORDER.indexOf(step.goal) - 1];
  const noisy = C.applyAlg(C.solved(), step.noise);
  if (prev) check(GOALS[prev](noisy), `${step.id}: noise keeps "${prev}"`);
  for (const cs of step.cases) {
    const moves = C.parseAlg(caseMoves(cs));
    const start = C.applyAlg(C.clone(noisy), C.invertAlg(moves));
    check(!GOALS[step.goal](start), `${step.id}/${cs.name.en}: start is unsolved`);
    if (prev) check(GOALS[prev](start), `${step.id}/${cs.name.en}: start keeps "${prev}"`);
    check(GOALS[step.goal](C.applyAlg(start, moves)), `${step.id}/${cs.name.en}: moves reach "${step.goal}"`);
  }
}

console.log(fails ? `\n${fails} failure(s)` : '\nAll demos verified.');
process.exit(fails ? 1 : 0);
