// Three.js renderer for a cube model. Renders on demand (only while animating or dragging).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as C from './cube.js';

const STICKER = {
  yellow: '#ffe066', white: '#fbfcfd', green: '#5cc98a', blue: '#4f8fe0', orange: '#ff9f5a', red: '#ef5d6c',
};
const DIM = '#4b5766';
const BODY = '#2f3946';
const SPACING = 1.02;

function roundedSquare(size, r) {
  const s = size / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-s + r, -s);
  shape.lineTo(s - r, -s);
  shape.quadraticCurveTo(s, -s, s, -s + r);
  shape.lineTo(s, s - r);
  shape.quadraticCurveTo(s, s, s - r, s);
  shape.lineTo(-s + r, s);
  shape.quadraticCurveTo(-s, s, -s, s - r);
  shape.lineTo(-s, -s + r);
  shape.quadraticCurveTo(-s, -s, -s + r, -s);
  return new THREE.ShapeGeometry(shape, 4);
}

const bodyGeo = new RoundedBoxGeometry(1, 1, 1, 3, 0.12);
const stickerGeo = roundedSquare(0.82, 0.14);
const bodyMat = new THREE.MeshStandardMaterial({ color: BODY, roughness: 0.55, metalness: 0.05 });
const stickerMats = {};
function stickerMat(color) {
  if (!stickerMats[color]) stickerMats[color] = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.28, roughness: 0.4, metalness: 0 });
  return stickerMats[color];
}

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export class CubeView {
  constructor(container, { interactive = true, autoRotate = false, cameraPos = [5.6, 5.0, 7.6] } = {}) {
    this.container = container;
    this.state = C.solved();
    this.queue = [];
    this.anim = null;
    this.speed = 1;
    this.focus = null;
    this.autoRotate = autoRotate;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    this.camera.position.set(...cameraPos);
    this.camera.lookAt(0, 0, 0);

    this.scene.add(new THREE.HemisphereLight('#ffffff', '#c4d0dc', 1.9));
    const key = new THREE.DirectionalLight('#ffffff', 1.4);
    key.position.set(5, 8, 6);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight('#dbeeff', 0.6);
    fill.position.set(-6, -2, -4);
    this.scene.add(fill);

    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.pivot = new THREE.Group();
    this.root.add(this.pivot);

    this.meshes = this.state.cubies.map((c) => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(bodyGeo, bodyMat));
      g.userData.stickers = c.stickers.map((st) => {
        const m = new THREE.Mesh(stickerGeo, stickerMat(STICKER[st.color]));
        const n = new THREE.Vector3(...st.normal);
        m.position.copy(n.clone().multiplyScalar(0.502));
        m.lookAt(n.clone().multiplyScalar(2));
        m.userData.color = st.color;
        g.add(m);
        return m;
      });
      this.root.add(g);
      return g;
    });

    if (interactive) {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enablePan = false;
      this.controls.enableZoom = false;
      this.controls.rotateSpeed = 0.8;
      this.controls.addEventListener('change', () => this.requestRender());
    }

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.visible = true;
    this.syncAll();
    this.resize();
  }

  resize() {
    const { clientWidth: w, clientHeight: h } = this.container;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.requestRender();
  }

  syncAll() {
    const m4 = new THREE.Matrix4();
    this.state.cubies.forEach((c, i) => {
      const mesh = this.meshes[i];
      const r = c.rot;
      m4.set(r[0][0], r[0][1], r[0][2], 0, r[1][0], r[1][1], r[1][2], 0, r[2][0], r[2][1], r[2][2], 0, 0, 0, 0, 1);
      mesh.quaternion.setFromRotationMatrix(m4);
      mesh.position.set(c.pos[0] * SPACING, c.pos[1] * SPACING, c.pos[2] * SPACING);
    });
    this.requestRender();
  }

  setFocus(pred) {
    this.focus = pred;
    // pred(home, stickerColor) → keep color; lets a step dim whole pieces or single stickers.
    this.state.cubies.forEach((c, i) => {
      for (const s of this.meshes[i].userData.stickers) {
        const dim = pred && !pred(c.home, s.userData.color);
        s.material = stickerMat(dim ? DIM : STICKER[s.userData.color]);
      }
    });
    this.requestRender();
  }

  // Jump instantly to a state (cancels animations).
  setState(state) {
    this.finishAnim(false);
    this.queue.forEach((q) => q.resolve());
    this.queue = [];
    this.state = C.clone(state);
    this.syncAll();
  }

  // Queue an animated move. Returns a promise resolved when it finishes.
  animate(mv) {
    return new Promise((resolve) => {
      this.queue.push({ mv, resolve });
      this.requestRender();
    });
  }

  isBusy() {
    return !!this.anim || this.queue.length > 0;
  }

  startNext() {
    const next = this.queue.shift();
    if (!next) return;
    const geo = C.moveGeometry(next.mv);
    const members = this.state.cubies.map((c, i) => (C.inLayer(c, next.mv) ? this.meshes[i] : null)).filter(Boolean);
    this.pivot.rotation.set(0, 0, 0);
    members.forEach((m) => this.pivot.attach(m));
    const quarter = Math.abs(next.mv.turns) === 2 ? 1.45 : 1;
    this.anim = { ...next, ...geo, members, t0: performance.now(), dur: (330 * quarter) / this.speed };
  }

  finishAnim(apply = true) {
    if (!this.anim) return;
    const { members, mv, resolve } = this.anim;
    this.pivot.rotation.set(0, 0, 0);
    members.forEach((m) => this.root.attach(m));
    if (apply) C.applyMove(this.state, mv);
    this.anim = null;
    this.syncAll();
    resolve?.();
  }

  requestRender() {
    if (this.frame) return;
    this.frame = requestAnimationFrame((t) => this.tick(t));
  }

  tick(now) {
    this.frame = null;
    if (!this.anim && this.queue.length) this.startNext();
    if (this.anim) {
      const p = Math.min(1, (now - this.anim.t0) / this.anim.dur);
      this.pivot.rotation.set(0, 0, 0);
      this.pivot.rotation[this.anim.axis] = this.anim.angle * easeInOut(p);
      if (p >= 1) this.finishAnim(true);
    }
    if (this.autoRotate && this.visible) this.root.rotation.y += 0.0025;
    if (this.visible) this.renderer.render(this.scene, this.camera);
    if (this.anim || this.queue.length || (this.autoRotate && this.visible)) this.requestRender();
  }
}
