// Ana sayfa sahnesi (tek WebGL sahnesi): çelik kalıptan çıkan alüminyum profil ve kaydırmayla ilerleyen üretim anlatısı.
// Açılış: profil kalıp ağzında kor halinde çıkar, uzadıkça soğur. Kalıp değişince profil geri çekilir, kalıbın ağzı yeni kesite döner.
// Anlatı (setStory 0..1): kesim → yüzey (gerçek renk seçenekleri) → LED şerit + opal kapak → uygulama.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PROFILES, normalize } from './profiles.js';

const LENGTH = 17; // profilin görünen en uzun boyu (sahne birimi)
const SHAPE_SIZE = 2.7; // kesitin en uzun kenarı (sahne birimi)
const DIE_RADIUS = 2.7;
const DIE_DEPTH = 1.0;
const CUT_Z = 9; // testerenin kestiği nokta
const PIECE = LENGTH - CUT_Z;

// Mağazadaki gerçek renk seçenekleri. Sıra bilinçli: siyahla biter, LED durağında yanan opal çizgi koyu gövdede okunur.
// Sıra değişirse home-hero.liquid'deki renk listesi de aynı sıraya getirilmeli.
export const FINISHES = [
  { key: 'gumus', color: 0xd6d9dc, metal: 1, rough: 0.3 },
  { key: 'beyaz', color: 0xeeeeec, metal: 0.15, rough: 0.55 },
  { key: 'altin', color: 0xc6a46a, metal: 1, rough: 0.32 },
  { key: 'antrasit', color: 0x45484d, metal: 0.85, rough: 0.38 },
  { key: 'siyah', color: 0x1c1d1f, metal: 0.7, rough: 0.42 },
];
// 3000K: turuncu kehribar yerine logodaki sıcak altına yakın ton (CSS --light ile aynı aile)
const KELVIN = { 3000: 0xffc862, 4000: 0xffdca8, 6500: 0xe4edff };

// Anlatının zaman aralıkları (kaydırma ilerlemesi 0..1)
export const STORY = {
  cut: [0.1, 0.26],
  lift: [0.26, 0.42],
  finish: [0.44, 0.64],
  strip: [0.66, 0.75],
  cover: [0.74, 0.8],
  light: [0.8, 0.86],
  room: [0.86, 0.93],
};

// Kamera durakları: [ilerleme, konum, bakış noktası]
const SHOTS = [
  [0, [12, 7, 24], [1, 2, 8]],
  [0.24, [5.6, 3.3, 13.2], [0, 0.2, 9]],
  [0.52, [5.4, 3.0, 25.5], [0, 0.9, 16.2]],
  [0.78, [6.2, 7.4, 25.5], [0.4, 0.3, 14.6]],
  [1, [9, 9.5, 35], [0, 1, 14]],
];

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeIn = (t) => t * t * t;

function shapeFrom(outline, grow = 0) {
  const pts = normalize(outline, SHAPE_SIZE + grow);
  const shape = new THREE.Shape();
  pts.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
  shape.closePath();
  return shape;
}

function dieGeometry(outline) {
  const plate = new THREE.Shape();
  plate.absarc(0, 0, DIE_RADIUS, 0, Math.PI * 2, false);
  plate.holes.push(new THREE.Path(shapeFrom(outline, 0.08).getPoints()));
  const geo = new THREE.ExtrudeGeometry(plate, {
    depth: DIE_DEPTH, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 3, curveSegments: 96,
  });
  geo.translate(0, 0, -DIE_DEPTH);
  return geo;
}

const profileGeometry = (outline) => new THREE.ExtrudeGeometry(shapeFrom(outline), { depth: 1, bevelEnabled: false, steps: 1 });

function canvasTexture(draw, w = 256, h = 256) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const radialTexture = (stops) => canvasTexture((g, w, h) => {
  const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  stops.forEach(([o, c]) => r.addColorStop(o, c));
  g.fillStyle = r;
  g.fillRect(0, 0, w, h);
});

// Şerit LED'in yonga dizisi (uzunluk boyunca tekrar eder)
function ledChipsTexture() {
  const t = canvasTexture((g, w, h) => {
    g.fillStyle = '#e9e6df';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff';
    for (let i = 0; i < 4; i++) g.fillRect(w * 0.3, (i + 0.25) * (h / 4), w * 0.4, h / 8);
  }, 32, 128);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1, 18);
  return t;
}

export function mountExtrusion(root, { shape = 'led', kelvin = 3000 } = {}) {
  const canvas = root.querySelector('canvas');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.85;

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 160);

  // Işıklar
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-6, 10, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -16, right: 16, top: 14, bottom: -12, near: 1, far: 50 });
  key.shadow.radius = 6;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xdfe7ff, 0.6);
  rim.position.set(8, 4, -6);
  scene.add(rim);
  const heatLight = new THREE.PointLight(0xff6a1a, 18, 9, 2);
  heatLight.position.set(0, 0, 0.9);
  scene.add(heatLight);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.ShadowMaterial({ opacity: 0.16 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -DIE_RADIUS - 0.02;
  floor.receiveShadow = true;
  scene.add(floor);

  // Kalıp
  const dieMat = new THREE.MeshStandardMaterial({ color: 0x55595e, metalness: 0.92, roughness: 0.34 });
  const die = new THREE.Mesh(dieGeometry(PROFILES[shape].outline), dieMat);
  die.castShadow = true;
  scene.add(die);

  // Profil: ısı ve akış gölgelendiricisi
  const uniforms = { uTime: { value: 0 }, uLen: { value: 0 }, uHeat: { value: 1 } };
  const profMat = new THREE.MeshStandardMaterial({ color: 0xd6d9dc, metalness: 1, roughness: 0.3 });
  profMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uLen;\nvarying float vDist;\nvarying vec3 vObj;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvDist = position.z * uLen;\nvObj = position;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform float uTime; uniform float uHeat;
        varying float vDist; varying vec3 vObj;
        float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
          return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        float grain = vnoise(vec2((vObj.x + vObj.y) * 160.0, vDist * 1.5));
        float flow = vnoise(vec2((vObj.x - vObj.y) * 5.0, (vDist - uTime * 1.1) * 0.7));
        roughnessFactor = clamp(roughnessFactor + (grain - 0.5) * 0.14 + (flow - 0.5) * 0.12, 0.1, 0.85);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float heat = exp(-vDist * 0.62) * uHeat;
        vec3 hot = mix(vec3(1.0, 0.24, 0.03), vec3(1.0, 0.72, 0.36), smoothstep(0.55, 1.0, heat));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.16, 0.08, 0.06), clamp(heat * 0.75, 0.0, 1.0));
        totalEmissiveRadiance += hot * heat * 2.6;`);
  };
  const profile = new THREE.Mesh(profileGeometry(PROFILES[shape].outline), profMat);
  profile.castShadow = true;
  scene.add(profile);

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialTexture([[0, 'rgba(255,190,110,1)'], [0.25, 'rgba(255,120,40,0.55)'], [1, 'rgba(255,90,20,0)']]),
    blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
  }));
  glow.scale.set(5.2, 5.2, 1);
  glow.position.set(0, 0, 0.25);
  scene.add(glow);

  // Testere
  const saw = new THREE.Group();
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0xb9bdc2, metalness: 1, roughness: 0.22 });
  const blade = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.06, 96), bladeMat);
  blade.rotation.x = Math.PI / 2;
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.22, 32), dieMat);
  hub.rotation.x = Math.PI / 2;
  const teeth = new THREE.Mesh(new THREE.TorusGeometry(2.12, 0.05, 6, 120), new THREE.MeshStandardMaterial({ color: 0x6d7076, metalness: 1, roughness: 0.4 }));
  saw.add(blade, hub, teeth);
  saw.position.set(0, 7, CUT_Z);
  saw.visible = false;
  scene.add(saw);
  const sparks = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialTexture([[0, 'rgba(255,230,180,1)'], [0.3, 'rgba(255,170,80,0.5)'], [1, 'rgba(255,140,60,0)']]),
    blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0,
  }));
  sparks.scale.set(2.4, 2.4, 1);
  sparks.position.set(0, 0.9, CUT_Z);
  scene.add(sparks);

  // Kesilen parça + LED şerit + opal kapak
  const pieceGroup = new THREE.Group();
  const pieceMat = new THREE.MeshStandardMaterial({ color: FINISHES[0].color, metalness: 1, roughness: 0.3 });
  const piece = new THREE.Mesh(profileGeometry(PROFILES[shape].outline), pieceMat);
  piece.scale.z = PIECE;
  piece.castShadow = true;
  pieceGroup.add(piece);
  const s = SHAPE_SIZE / 22; // LED kanal kesitinin ölçeği (mm → birim)
  const lightColor = new THREE.Color(KELVIN[kelvin] || KELVIN[3000]);
  const stripMat = new THREE.MeshStandardMaterial({ color: 0xf1eee8, roughness: 0.6, emissive: lightColor.clone(), emissiveIntensity: 0, emissiveMap: ledChipsTexture() });
  const strip = new THREE.Mesh(new THREE.BoxGeometry(16 * s, 0.05, PIECE * 0.98), stripMat);
  const coverMat = new THREE.MeshStandardMaterial({ color: 0xf6f4ef, roughness: 0.92, metalness: 0, emissive: lightColor.clone(), emissiveIntensity: 0, transparent: true, opacity: 0.96 });
  // Kapak yandıkça taban rengi koyulaşır: yüzeyi ortam ışığı değil LED'in rengi belirler
  const coverOff = new THREE.Color(0xf6f4ef);
  const coverLit = new THREE.Color(0x3a3530);
  const cover = new THREE.Mesh(new THREE.BoxGeometry(18.6 * s, 1.1 * s, PIECE * 0.99), coverMat);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: radialTexture([[0, 'rgba(255,255,255,0.9)'], [0.35, 'rgba(255,255,255,0.25)'], [1, 'rgba(255,255,255,0)']]),
    color: lightColor.clone(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0,
  }));
  halo.scale.set(3.4, 9, 1);
  pieceGroup.add(strip, cover, halo);
  pieceGroup.position.set(0, 0, CUT_Z);
  pieceGroup.visible = false;
  scene.add(pieceGroup);
  const ledLight = new THREE.PointLight(lightColor.clone(), 0, 10, 2);
  pieceGroup.add(ledLight);

  // Durum
  let len = reduce ? LENGTH : 0;
  let phase = reduce ? 'idle' : 'extrude';
  let phaseT = 0;
  let pending = null;
  let current = shape;
  let story = 0;
  let storyTarget = 0;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const view = { w: 1, h: 1 };
  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();
  const tmpA = new THREE.Vector3();
  const tmpB = new THREE.Vector3();
  const finishA = new THREE.Color();
  const finishB = new THREE.Color();

  function swapGeometry(next) {
    for (const m of [die, profile, piece]) m.geometry.dispose();
    die.geometry = dieGeometry(PROFILES[next].outline);
    profile.geometry = profileGeometry(PROFILES[next].outline);
    piece.geometry = profileGeometry(PROFILES[next].outline);
    current = next;
  }

  function setShape(next) {
    if (!PROFILES[next] || (next === current && !pending)) return;
    if (reduce) { swapGeometry(next); render(); return; }
    pending = next;
    phase = 'retract';
    phaseT = 0;
    start();
  }

  function setKelvin(k) {
    lightColor.set(KELVIN[k] || KELVIN[3000]);
    stripMat.emissive.copy(lightColor);
    coverMat.emissive.copy(lightColor);
    halo.material.color.copy(lightColor);
    ledLight.color.copy(lightColor);
    render();
  }

  function shotAt(p) {
    let i = 0;
    while (i < SHOTS.length - 2 && p > SHOTS[i + 1][0]) i++;
    const [p0, c0, t0] = SHOTS[i];
    const [p1, c1, t1] = SHOTS[i + 1];
    const k = smooth(p0, p1, p);
    camPos.set(...c0).lerp(tmpA.set(...c1), k);
    camLook.set(...t0).lerp(tmpB.set(...t1), k);
  }

  function applyStory(p) {
    // Kesim: testere iner, kıvılcım, profil kesilir
    const cut = smooth(STORY.cut[0], STORY.cut[1], p);
    saw.visible = p > STORY.cut[0] - 0.04 && p < STORY.lift[1] + 0.06;
    saw.position.y = THREE.MathUtils.lerp(6.5, 0.25, cut) + smooth(STORY.lift[0], STORY.lift[1], p) * 6.5;
    sparks.material.opacity = cut > 0.55 && cut < 0.999 ? 0.9 : 0;
    const cutDone = p >= STORY.cut[1];
    // Kesilen parça ayrılır, döner, sonra yüzey değişir
    pieceGroup.visible = cutDone;
    if (cutDone) {
      const lift = smooth(STORY.lift[0], STORY.lift[1], p);
      pieceGroup.position.set(0, lift * 0.9, CUT_Z + lift * 1.2);
      pieceGroup.rotation.set(lift * 0.12, -lift * 0.35, 0);
      const f = clamp01((p - STORY.finish[0]) / (STORY.finish[1] - STORY.finish[0])) * (FINISHES.length - 1);
      const i = Math.min(Math.floor(f), FINISHES.length - 2);
      const k = smooth(0.55, 1, f - i);
      const a = FINISHES[i];
      const b = FINISHES[i + 1];
      pieceMat.color.copy(finishA.set(a.color)).lerp(finishB.set(b.color), k);
      pieceMat.metalness = THREE.MathUtils.lerp(a.metal, b.metal, k);
      pieceMat.roughness = THREE.MathUtils.lerp(a.rough, b.rough, k);
      // LED şerit kanala kayar, kapak oturur, ışık yanar (yalnız LED kanal kesitinde)
      const led = current === 'led';
      const stripIn = smooth(STORY.strip[0], STORY.strip[1], p);
      const coverIn = smooth(STORY.cover[0], STORY.cover[1], p);
      const on = smooth(STORY.light[0], STORY.light[1], p);
      strip.visible = led && stripIn > 0;
      cover.visible = led && coverIn > 0;
      strip.position.set(0, (1.5 - 7.25) * s + 0.03 + (1 - stripIn) * 1.8, PIECE / 2);
      cover.position.set(0, (12.6 - 7.25) * s + (1 - coverIn) * 1.4, PIECE / 2);
      stripMat.emissiveIntensity = on * 1.6;
      coverMat.color.copy(coverOff).lerp(coverLit, on * 0.85);
      coverMat.emissiveIntensity = on * 1.3; // yüksek değerde ton eşleme ışığı beyaza patlatıyor, renk sıcaklığı kayboluyor
      halo.visible = led && on > 0;
      halo.material.opacity = on * 0.8;
      halo.position.set(0, 0.9, PIECE / 2);
      ledLight.intensity = led ? on * 14 : 0;
      ledLight.position.set(0, 1.4, PIECE / 2);
    }
    // Uygulama aşamasında tuval CSS'te (--room) söner, oda fotoğrafı sayfa katmanında belirir.
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = root.querySelector('.xhero__sticky') || root;
    view.w = w; view.h = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 1 ? 42 : 28;
    camera.updateProjectionMatrix();
    render();
  }

  function render() {
    // Kesimden sonra ana profil kesim noktasında biter
    const shown = story >= STORY.cut[1] ? Math.min(len, CUT_Z) : len;
    uniforms.uLen.value = Math.max(shown, 0.0001);
    profile.scale.z = Math.max(shown, 0.0001);
    profile.visible = shown > 0.01;
    const heat = uniforms.uHeat.value;
    heatLight.intensity = 18 * heat;
    glow.material.opacity = 0.35 + 0.65 * heat;
    applyStory(story);
    shotAt(story);
    const sway = 1 - smooth(0, 0.2, story) * 0.6;
    camera.position.set(camPos.x + pointer.x * 0.9 * sway, camPos.y + pointer.y * 0.6 * sway, camPos.z);
    camera.lookAt(camLook);
    // Duraklarda metin sol altta durur: kadraj kaydırılır, profil sağa (dikey ekranda yukarı) geçer.
    const side = smooth(0.06, 0.14, story) * (1 - smooth(0.84, 0.92, story));
    if (side > 0.001) {
      const wide = view.w / view.h > 1.2;
      camera.setViewOffset(view.w, view.h, wide ? -view.w * 0.2 * side : 0, wide ? 0 : view.h * 0.14 * side, view.w, view.h);
    } else if (camera.view?.enabled) camera.clearViewOffset();
    // Işık yandığında ortam ışığı kısılır, opal çizgi öne çıkar
    scene.environmentIntensity = 1 - smooth(STORY.light[0], STORY.light[1], story) * 0.45 * (1 - smooth(STORY.room[0], STORY.room[1], story));
    renderer.render(scene, camera);
  }

  const clock = new THREE.Clock();
  let raf = 0;
  let visible = true;
  function frame() {
    raf = 0;
    const dt = Math.min(clock.getDelta(), 0.05);
    uniforms.uTime.value += dt;
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    story += (storyTarget - story) * (reduce ? 1 : 0.14);
    if (saw.visible) blade.rotation.y += dt * 18, teeth.rotation.z += dt * 18;
    phaseT += dt;
    if (phase === 'extrude') {
      const t = Math.min(phaseT / 2.4, 1);
      len = LENGTH * easeOut(t);
      uniforms.uHeat.value = 1;
      if (t >= 1) phase = 'idle';
    } else if (phase === 'retract') {
      const t = Math.min(phaseT / 0.55, 1);
      len = LENGTH * (1 - easeIn(t));
      if (t >= 1) { swapGeometry(pending); pending = null; phase = 'extrude'; phaseT = 0; }
    } else {
      uniforms.uHeat.value = 0.9 + Math.sin(uniforms.uTime.value * 1.7) * 0.08;
    }
    render();
    if (visible && !reduce) raf = requestAnimationFrame(frame);
  }
  function start() { if (!raf && visible && !reduce) { clock.getDelta(); raf = requestAnimationFrame(frame); } }

  const ro = new ResizeObserver(resize);
  ro.observe(root.querySelector('.xhero__sticky') || root);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }, { threshold: 0 });
  io.observe(root);
  const onPointer = (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (!reduce) window.addEventListener('pointermove', onPointer, { passive: true });

  resize();
  if (reduce) render(); else start();

  return {
    setShape,
    setKelvin,
    setStory(p) {
      storyTarget = clamp01(p);
      if (reduce) { story = storyTarget; render(); } else start();
    },
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      scene.traverse((o) => { o.geometry?.dispose(); if (o.material) [].concat(o.material).forEach((m) => { m.map?.dispose(); m.emissiveMap?.dispose(); m.dispose(); }); });
      envRT.dispose(); pmrem.dispose(); renderer.dispose();
    },
  };
}
