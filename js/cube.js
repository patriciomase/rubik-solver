// Pure cube model: 26 cubies with integer positions and rotation matrices.
// Coordinates: +x = R, +y = U, +z = F. Shared by the 3D view and the node tests.

export const FACE_NORMALS = {
  U: [0, 1, 0], D: [0, -1, 0],
  R: [1, 0, 0], L: [-1, 0, 0],
  F: [0, 0, 1], B: [0, 0, -1],
};

// Yellow on top, white on bottom, green in front.
export const FACE_COLORS = {
  U: 'yellow', D: 'white', F: 'green', B: 'blue', R: 'orange', L: 'red',
};

const AXIS = { x: 0, y: 1, z: 2 };

// Quarter-turn definitions: axis, layers (null = whole cube), direction (+1 = +90° right-handed).
// Lowercase u/d/r/l/f/b are wide moves (face + adjacent slice); M/E/S are middle slices.
const MOVES = {
  U: ['y', [1], -1], D: ['y', [-1], 1],
  R: ['x', [1], -1], L: ['x', [-1], 1],
  F: ['z', [1], -1], B: ['z', [-1], 1],
  u: ['y', [1, 0], -1], d: ['y', [-1, 0], 1],
  r: ['x', [1, 0], -1], l: ['x', [-1, 0], 1],
  f: ['z', [1, 0], -1], b: ['z', [-1, 0], 1],
  M: ['x', [0], 1], E: ['y', [0], 1], S: ['z', [0], -1],
  x: ['x', null, -1], y: ['y', null, -1], z: ['z', null, -1],
};

const ROT = {
  x: [[1, 0, 0], [0, 0, -1], [0, 1, 0]],
  y: [[0, 0, 1], [0, 1, 0], [-1, 0, 0]],
  z: [[0, -1, 0], [1, 0, 0], [0, 0, 1]],
};

const I3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

function mul(a, b) {
  return a.map((row) => [0, 1, 2].map((j) => row[0] * b[0][j] + row[1] * b[1][j] + row[2] * b[2][j]));
}
function apply(m, v) {
  return m.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);
}
function transpose(m) {
  return [0, 1, 2].map((i) => [0, 1, 2].map((j) => m[j][i]));
}
const eq = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

export function faceOfNormal(n) {
  return Object.keys(FACE_NORMALS).find((f) => eq(FACE_NORMALS[f], n));
}

export function solved() {
  const cubies = [];
  let id = 0;
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++) {
        if (!x && !y && !z) continue;
        const home = [x, y, z];
        const stickers = Object.keys(FACE_NORMALS)
          .filter((f) => FACE_NORMALS[f].some((c, i) => c !== 0 && c === home[i]))
          .map((f) => ({ face: f, color: FACE_COLORS[f], normal: FACE_NORMALS[f] }));
        cubies.push({ id: id++, home, pos: [...home], rot: I3, stickers });
      }
  return { cubies };
}

export function clone(state) {
  return { cubies: state.cubies.map((c) => ({ ...c, pos: [...c.pos], rot: c.rot })) };
}

// "R" -> { face:'R', turns:1 }, "R'" -> -1, "R2" -> 2
export function parseMove(tok) {
  const m = /^([UDRLFBudrlfbMESxyz])(2|'|2')?$/.exec(tok);
  if (!m) throw new Error(`Bad move: ${tok}`);
  const turns = m[2] === "'" ? -1 : m[2] ? 2 : 1;
  return { face: m[1], turns, token: tok };
}

export function parseAlg(str) {
  return str.trim() ? str.trim().split(/\s+/).map(parseMove) : [];
}

export function invertMove(mv) {
  const turns = mv.turns === 2 ? 2 : -mv.turns;
  return { face: mv.face, turns, token: mv.face + (turns === -1 ? "'" : turns === 2 ? '2' : '') };
}

export function invertAlg(moves) {
  return moves.slice().reverse().map(invertMove);
}

// Info the renderer needs to animate a move.
export function moveGeometry(mv) {
  const [axis, , dir] = MOVES[mv.face];
  return { axis, angle: (dir * mv.turns * Math.PI) / 2 };
}

export function inLayer(cubie, mv) {
  const [axis, layers] = MOVES[mv.face];
  return layers === null || layers.includes(cubie.pos[AXIS[axis]]);
}

export function applyMove(state, mv) {
  const [axis, , dir] = MOVES[mv.face];
  let q = dir * mv.turns;
  q = ((q % 4) + 4) % 4;
  let r = I3;
  for (let i = 0; i < q; i++) r = mul(ROT[axis], r);
  for (const c of state.cubies) {
    if (!inLayer(c, mv)) continue;
    c.pos = apply(r, c.pos);
    c.rot = mul(r, c.rot);
  }
  return state;
}

export function applyAlg(state, moves) {
  if (typeof moves === 'string') moves = parseAlg(moves);
  for (const mv of moves) applyMove(state, mv);
  return state;
}

// World-space normal of a cubie's sticker.
export function stickerNormal(cubie, sticker) {
  return apply(cubie.rot, sticker.normal);
}

export function cubieAt(state, pos) {
  return state.cubies.find((c) => eq(c.pos, pos));
}

export function cubieByHome(state, home) {
  return state.cubies.find((c) => eq(c.home, home));
}

export const isHome = (c) => eq(c.pos, c.home);
export const isSolvedCubie = (c) => isHome(c) && eq(c.rot[0], I3[0]) && eq(c.rot[1], I3[1]) && eq(c.rot[2], I3[2]);

// Which face the sticker originally on `face` now points to.
export function whereFaces(cubie, face) {
  const s = cubie.stickers.find((st) => st.face === face);
  return s ? faceOfNormal(stickerNormal(cubie, s)) : null;
}

export const pieceType = (home) => home.filter((v) => v !== 0).length; // 1 center, 2 edge, 3 corner

export { transpose };
