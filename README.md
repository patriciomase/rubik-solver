# rubik-solver

An interactive landing page that teaches the 3×3 Rubik's Cube **beginner (layer-by-layer) method**. Each section covers one step with a live 3D cube you can drag, play, pause and step through move by move. English / Spanish.

**Live:** https://patriciomase.github.io/rubik-solver/

## Steps

0. Notation playground (buttons + keyboard)
1. White cross
2. White corners — `R U R' U'`
3. Middle layer edges — `U R U' R' U' F' U F` / `U' L' U L U F U' F'`
4. Yellow cross — `F R U R' U' F'`
5. Yellow edges — `R U R' U R U2 R'`
6. Place yellow corners — `U R U' L' U R' U' L`
7. Twist yellow corners — `R' D' R D`

## Stack

Plain HTML/CSS/ES modules, [Three.js](https://threejs.org) from a CDN. No build step.

- `js/cube.js` — pure cube model (cubie positions + rotation matrices)
- `js/view.js` — Three.js renderer with animated layer turns
- `js/steps.js` — step/case data; each demo starts at `noise + inverse(moves)`
- `test/verify.mjs` — checks every demo actually reaches its step's goal

```sh
python3 -m http.server   # then open http://localhost:8000
node test/verify.mjs     # verify all demos
```
