# rubik-solver

An interactive landing page that teaches the 3×3 Rubik's Cube **beginner (layer-by-layer) method**. Each section covers one step with a live 3D cube you can drag, play, pause and step through move by move. English / Spanish.

**Live:** https://patriciomase.github.io/rubik-solver/ · CFOP: https://patriciomase.github.io/rubik-solver/cfop.html

## Beginner method (`index.html`)

0. Notation playground (buttons + keyboard)
1. White cross
2. White corners — `R U R' U'`
3. Middle layer edges — `U R U' R' U' F' U F` / `U' L' U L U F U' F'`
4. Yellow cross — `F R U R' U' F'`
5. Yellow edges — `R U R' U R U2 R'`
6. Place yellow corners — `U R U' L' U R' U' L`
7. Twist yellow corners — `R' D' R D`

## CFOP, 4-look last layer (`cfop.html`)

1. Cross on the bottom (D-move tricks)
2. Intuitive F2L — 7 common pair cases
3. OLL 1 — yellow cross (line / L / dot)
4. OLL 2 — 7 corner cases (Sune, Antisune, H, Pi, Headlights, T, Bowtie)
5. PLL 1 — corners (T-perm, Y-perm)
6. PLL 2 — edges (Ua, Ub, H, Z)
7. A full example solve with checkpoints

## Stack

Plain HTML/CSS/ES modules, [Three.js](https://threejs.org) from a CDN. No build step.

- `js/cube.js` — pure cube model (cubie positions + rotation matrices)
- `js/view.js` — Three.js renderer with animated layer turns
- `js/steps.js`, `js/steps-cfop.js` — step/case data; each demo starts at `noise + inverse(moves)`
- `test/verify.mjs` — checks every demo of both methods actually reaches its step's goal
- `tools/og.html` — source for the social preview images

```sh
python3 -m http.server   # then open http://localhost:8000
node test/verify.mjs     # verify all demos
```
