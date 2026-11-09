/* The home page's hero: the mark of Proper Eleven built as a monument.
   Two obsidian pillars stand in a misty night, light pours out between them, embers rise,
   and as you scroll the camera walks through the gate. Three.js, with bloom. */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const hero = document.querySelector("[data-hero]");
const canvas = document.querySelector("[data-gate-canvas]");
const content = document.querySelector("[data-hero-content]");

if (hero && canvas && hasWebGL()) {
  try {
    init();
  } catch (err) {
    console.warn("The gate scene could not start:", err);
  }
}

function hasWebGL() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch (e) {
    return false;
  }
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function init() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance", alpha: false });
  let dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const NIGHT = 0x07070d;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(NIGHT);
  scene.fog = new THREE.FogExp2(new THREE.Color().setRGB(0.026, 0.017, 0.024, THREE.LinearSRGBColorSpace), 0.03);

  const camera = new THREE.PerspectiveCamera(32, 1, 0.08, 220);

  /* Environment for reflections: a warm horizon behind the gate and a cool sky above. */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x020206);
  const panel = (w, h, color, k, x, y, z) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide })
    );
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    envScene.add(m);
  };
  panel(40, 4, 0xff6a2a, 2.4, 0, 1.5, -18);
  panel(26, 10, 0x5d6fb8, 0.55, -12, 16, 8);
  panel(10, 24, 0xff8a45, 0.7, 16, 4, 0);
  panel(10, 24, 0xff8a45, 0.7, -16, 4, 0);
  panel(30, 8, 0x1a2140, 0.5, 0, 6, 22);
  scene.environment = pmrem.fromScene(envScene, 0.04).texture;

  /* Sky: night overhead, an ember dawn low behind the gate. */
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(120, 48, 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: { uGlow: { value: 0 }, uTime: { value: 0 } },
      vertexShader: `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform float uGlow;
        uniform float uTime;
        varying vec3 vDir;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 45758.5); }
        void main() {
          float h = vDir.y;
          vec3 top = vec3(0.006, 0.007, 0.016);
          vec3 mid = vec3(0.018, 0.016, 0.034);
          vec3 low = vec3(0.026, 0.017, 0.024);
          vec3 col = mix(low, mid, smoothstep(-0.05, 0.16, h));
          col = mix(col, top, smoothstep(0.16, 0.75, h));
          float ang = atan(vDir.x, -vDir.z);
          float rise = h - 0.1;
          float glow = exp(-ang * ang * 7.0) * exp(-rise * rise * 26.0) * smoothstep(0.0, 0.09, h);
          col += vec3(1.0, 0.32, 0.09) * glow * 0.34 * uGlow;
          col += vec3(0.5, 0.2, 0.12) * exp(-ang * ang * 1.5) * smoothstep(0.0, 0.3, h) * (1.0 - smoothstep(0.3, 0.8, h)) * 0.035 * uGlow;
          vec2 g = floor(vec2(ang * 260.0, h * 260.0));
          float s = step(0.9975, hash(g)) * smoothstep(0.12, 0.5, h);
          col += vec3(0.75, 0.8, 1.0) * s * (0.35 + 0.35 * sin(uTime * 1.3 + hash(g + 3.1) * 40.0));
          gl_FragColor = vec4(col, 1.0);
        }`,
    })
  );
  scene.add(sky);

  /* The floor: dark and glossy. It's slightly see-through, so the mirrored gate under it reads as a reflection. */
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(240, 240),
    new THREE.MeshStandardMaterial({ color: 0x08080d, roughness: 0.32, metalness: 0.2, transparent: true, opacity: 0.86, envMapIntensity: 0.6 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.renderOrder = 1;
  scene.add(floor);

  /* The two pillars. */
  const H = 7.4;
  const W = 1.12;
  const GAP = 1.46;
  const stone = new THREE.MeshPhysicalMaterial({
    color: 0x0c0c13,
    roughness: 0.3,
    metalness: 0.82,
    clearcoat: 1,
    clearcoatRoughness: 0.22,
    envMapIntensity: 0.75,
  });
  const pillarGeo = new RoundedBoxGeometry(W, H, W, 5, 0.045);
  const gateGroup = new THREE.Group();
  scene.add(gateGroup);

  const stripMats = [];
  const stripMat = () => {
    const m = new THREE.MeshBasicMaterial({ color: 0x000000, fog: false, toneMapped: true });
    stripMats.push(m);
    return m;
  };
  const stripGeo = new THREE.BoxGeometry(0.045, H - 0.5, 0.045);

  for (const side of [-1, 1]) {
    const p = new THREE.Mesh(pillarGeo, stone);
    p.position.set(side * GAP, H / 2, 0);
    gateGroup.add(p);
    // Light lines down the inner front edge and the inner back edge of each pillar.
    for (const z of [W / 2 + 0.006, -W / 2 - 0.006]) {
      const s = new THREE.Mesh(stripGeo, stripMat());
      s.position.set(side * (GAP - W / 2 - 0.006), H / 2, z);
      gateGroup.add(s);
    }
    // Reflections under the floor.
    const r = new THREE.Mesh(pillarGeo, stone);
    r.position.set(side * GAP, -H / 2 - 0.01, 0);
    gateGroup.add(r);
    const rs = new THREE.Mesh(stripGeo, stripMat());
    rs.position.set(side * (GAP - W / 2 - 0.006), -H / 2, W / 2 + 0.006);
    gateGroup.add(rs);
  }

  /* Light between the pillars: a soft column, brightest in the middle. */
  const beamMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
    uniforms: { uI: { value: 0 }, uTime: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform float uI;
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        float x = abs(vUv.x - 0.5) * 2.0;
        float core = exp(-x * x * 34.0);
        float halo = exp(-x * x * 3.2) * 0.12;
        float v = smoothstep(0.0, 0.18, vUv.y) * (1.0 - smoothstep(0.62, 1.0, vUv.y));
        float shimmer = 0.9 + 0.1 * sin(uTime * 1.9 + vUv.y * 9.0) * sin(uTime * 1.3);
        vec3 col = mix(vec3(1.0, 0.36, 0.1), vec3(1.0, 0.82, 0.55), core);
        gl_FragColor = vec4(col * (core * 1.35 + halo) * v * uI * shimmer, 1.0);
      }`,
  });
  const beam = new THREE.Mesh(new THREE.PlaneGeometry((GAP - W / 2) * 2, H * 1.25), beamMat);
  beam.position.set(0, H * 0.55, 0);
  scene.add(beam);

  /* A pool of light spilling out of the gate across the floor. */
  const poolMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
    uniforms: { uI: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform float uI;
      varying vec2 vUv;
      void main() {
        vec2 q = (vUv - vec2(0.5, 0.9)) * vec2(3.6, 1.15);
        float a = exp(-dot(q, q) * 2.6);
        float lane = exp(-pow((vUv.x - 0.5) * 9.0, 2.0)) * smoothstep(0.0, 0.9, vUv.y) * 0.55;
        gl_FragColor = vec4(vec3(1.0, 0.42, 0.14) * (a * 0.55 + lane * 0.35) * uI, 1.0);
      }`,
  });
  const pool = new THREE.Mesh(new THREE.PlaneGeometry(16, 26), poolMat);
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(0, 0.012, 11.4);
  pool.renderOrder = 2;
  scene.add(pool);

  /* Lights. */
  const inner = new THREE.PointLight(0xff6326, 0, 9, 1.7);
  inner.position.set(0, 3.2, 0.25);
  scene.add(inner);
  const behind = new THREE.PointLight(0xff7a36, 0, 22, 1.4);
  behind.position.set(0, 4.6, -3.6);
  scene.add(behind);
  const moon = new THREE.DirectionalLight(0x8c9cff, 0.32);
  moon.position.set(-6, 9, 10);
  scene.add(moon);
  scene.add(new THREE.HemisphereLight(0x161b30, 0x040406, 0.5));

  /* Embers rising out of the gate. */
  const EMBERS = small ? 420 : 900;
  const eg = new THREE.BufferGeometry();
  const ePos = new Float32Array(EMBERS * 3);
  const eSeed = new Float32Array(EMBERS);
  const eSpeed = new Float32Array(EMBERS);
  const eSize = new Float32Array(EMBERS);
  for (let i = 0; i < EMBERS; i++) {
    const g = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
    ePos[i * 3] = g * 6.5;
    ePos[i * 3 + 1] = Math.random() * 11;
    ePos[i * 3 + 2] = (Math.random() - 0.35) * 12;
    eSeed[i] = Math.random();
    eSpeed[i] = 0.35 + Math.random() * 0.75;
    eSize[i] = 0.5 + Math.pow(Math.random(), 3) * 2.4;
  }
  eg.setAttribute("position", new THREE.BufferAttribute(ePos, 3));
  eg.setAttribute("aSeed", new THREE.BufferAttribute(eSeed, 1));
  eg.setAttribute("aSpeed", new THREE.BufferAttribute(eSpeed, 1));
  eg.setAttribute("aSize", new THREE.BufferAttribute(eSize, 1));
  const emberMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: false,
    uniforms: { uTime: { value: 0 }, uPx: { value: dpr }, uI: { value: 0 } },
    vertexShader: `
      uniform float uTime;
      uniform float uPx;
      attribute float aSeed;
      attribute float aSpeed;
      attribute float aSize;
      varying float vA;
      varying float vHeat;
      void main() {
        vec3 p = position;
        float t = uTime * aSpeed + aSeed * 37.0;
        p.y = mod(p.y + t * 0.55, 11.0);
        p.x += sin(t * 0.8 + aSeed * 6.28) * 0.45 + sin(t * 0.21) * 0.3;
        p.z += cos(t * 0.6 + aSeed * 3.1) * 0.4;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPx * (18.0 / -mv.z);
        float life = p.y / 11.0;
        vA = smoothstep(0.0, 0.06, life) * (1.0 - smoothstep(0.45, 1.0, life)) * (0.55 + 0.45 * sin(t * 3.0 + aSeed * 20.0));
        vHeat = aSeed;
      }`,
    fragmentShader: `
      uniform float uI;
      varying float vA;
      varying float vHeat;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        vec3 col = mix(vec3(1.0, 0.3, 0.06), vec3(1.0, 0.8, 0.45), vHeat) * 2.4;
        gl_FragColor = vec4(col * a * vA * uI, 1.0);
      }`,
  });
  const embers = new THREE.Points(eg, emberMat);
  embers.frustumCulled = false;
  scene.add(embers);

  /* Low mist drifting across the floor. */
  const mistTex = makeMistTexture();
  const mists = [];
  const MISTS = small ? 7 : 12;
  for (let i = 0; i < MISTS; i++) {
    const near = i % 3 === 0;
    const m = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: mistTex,
        color: near ? 0xff7a40 : 0x5b679c,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false,
      })
    );
    const s = 9 + Math.random() * 9;
    m.scale.set(s * 1.8, s * 0.55, 1);
    m.position.set((Math.random() - 0.5) * 26, 0.5 + Math.random() * 1.1, near ? (Math.random() - 0.4) * 6 : -6 + Math.random() * 16);
    m.userData = { base: near ? 0.09 : 0.06, speed: (Math.random() - 0.5) * 0.25, phase: Math.random() * 6.28 };
    scene.add(m);
    mists.push(m);
  }

  /* Post-processing: bloom, then a finishing pass (edge vignette, faint colour fringing, and the fade to night). */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.5, 0.86);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const finish = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uFade: { value: 0 }, uVig: { value: 1 } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float uFade;
      uniform float uVig;
      varying vec2 vUv;
      void main() {
        vec2 c = vUv - 0.5;
        float r2 = dot(c, c);
        vec2 off = c * r2 * 0.016;
        vec3 col = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
        col *= 1.0 - smoothstep(0.12, 0.85, r2 * 1.7) * 0.62 * uVig;
        col = mix(col, vec3(0.031, 0.039, 0.071), uFade);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  composer.addPass(finish);

  /* Sizing. Wide screens put the gate right of centre, leaving the left for the headline. */
  let wide = true;
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    composer.setPixelRatio(dpr);
    bloom.resolution.set(w * 0.5, h * 0.5);
    camera.aspect = w / h;
    wide = camera.aspect > 1.15;
    camera.fov = wide ? 30 : camera.aspect > 0.8 ? 36 : 44;
    camera.updateProjectionMatrix();
    emberMat.uniforms.uPx.value = dpr * (h / 900);
  }
  resize();
  new ResizeObserver(resize).observe(canvas);

  /* Pointer drift. */
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  if (!coarse && !reduce) {
    window.addEventListener("pointermove", (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    });
  }

  /* The intro: the light comes on when the page opens. */
  const state = { power: reduce ? 1 : 0, approach: reduce ? 0 : 1 };
  const begin = () => {
    if (reduce) return;
    const g = window.gsap;
    if (g) {
      g.to(state, { power: 1, duration: 2.6, ease: "power2.out", delay: 0.05 });
      g.to(state, { approach: 0, duration: 3.2, ease: "expo.out" });
    } else {
      state.power = 1;
      state.approach = 0;
    }
  };
  if (window.PET && window.PET.whenOpen) window.PET.whenOpen(begin);
  else begin();

  /* Scroll: how far the hero has scrolled away (0 at the top, 1 once it's gone). */
  const stage = hero.querySelector(".hero__stage");
  let heroH = hero.offsetHeight;
  window.addEventListener("resize", () => {
    heroH = hero.offsetHeight;
  });
  function progress() {
    const r = hero.getBoundingClientRect();
    return r.height > 0 ? clamp(-r.top / r.height, 0, 1) : 0;
  }

  let visible = true;
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible && !running) loop();
  }).observe(hero);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !running) loop();
  });

  let last = performance.now();
  let running = false;
  let frames = 0;
  let slowTime = 0;
  let firstFrame = true;
  let time = 0;

  function frame() {
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!reduce) time += dt;
    const p = reduce ? 0 : progress();
    const e = easeInOut(p);

    // Flicker the lights on during the intro, then hold steady.
    const pw = state.power;
    const flick = pw < 1 ? (Math.sin(time * 41.0) > 0.2 || pw > 0.55 ? 1 : 0.35) : 1;
    const level = pw * flick;
    const stripLevel = level * (1 + p * 0.5);
    for (const m of stripMats) m.color.setRGB(4.4 * stripLevel, 1.25 * stripLevel, 0.32 * stripLevel);
    beamMat.uniforms.uI.value = smooth(0.15, 1.0, pw) * (1 + p * 0.9);
    beamMat.uniforms.uTime.value = time;
    poolMat.uniforms.uI.value = smooth(0.25, 1.0, pw) * (1 + p * 0.8);
    emberMat.uniforms.uI.value = smooth(0.3, 1.0, pw);
    emberMat.uniforms.uTime.value = time;
    sky.material.uniforms.uGlow.value = 0.35 + 0.65 * smooth(0.1, 1.0, pw) + p * 0.6;
    sky.material.uniforms.uTime.value = time;
    inner.intensity = 13 * level * (1 - p * 0.6);
    behind.intensity = 34 * smooth(0.1, 1.0, pw);
    for (const m of mists) {
      m.position.x += m.userData.speed * dt;
      if (m.position.x > 16) m.position.x = -16;
      if (m.position.x < -16) m.position.x = 16;
      m.material.opacity = m.userData.base * smooth(0.2, 1.0, pw) * (0.8 + 0.2 * Math.sin(time * 0.4 + m.userData.phase));
    }

    // Camera: a slow approach on arrival, then the scroll carries it through the gate.
    pointer.sx = lerp(pointer.sx, pointer.x, 0.04);
    pointer.sy = lerp(pointer.sy, pointer.y, 0.04);
    const offX = wide ? -3.1 : 0;
    const startZ = wide ? 17.5 : 21;
    const z = lerp(startZ + state.approach * 4, wide ? 12 : 15, e);
    const y = lerp(wide ? 2.4 : 2.8, 3.5, e) + Math.sin(time * 0.35) * 0.05 - pointer.sy * 0.25 * (1 - e);
    const x = pointer.sx * 0.7 * (1 - e) + Math.sin(time * 0.23) * 0.06;
    camera.position.set(x, y, z);
    camera.lookAt(lerp(offX, 0, smooth(0, 0.7, p)), lerp(3.35, 3.9, e), 0);

    bloom.strength = 0.55 + p * 0.3;
    renderer.toneMappingExposure = 1.0 + p * 0.15;
    finish.uniforms.uFade.value = smooth(0.55, 1.0, p) * 0.5;

    composer.render(dt);

    // The scene lags behind the scroll, so the next section slides up over it.
    if (stage) stage.style.transform = `translate3d(0, ${(p * heroH * 0.42).toFixed(1)}px, 0)`;
    if (content) {
      const a = 1 - smooth(0.0, 0.5, p);
      content.style.opacity = a.toFixed(3);
      content.style.transform = `translate3d(0, ${(-p * 70).toFixed(1)}px, 0)`;
      content.style.visibility = a <= 0.001 ? "hidden" : "";
    }

    if (firstFrame) {
      firstFrame = false;
      canvas.classList.add("is-ready");
    }

    // If the device struggles, render fewer pixels.
    frames++;
    if (frames > 20 && frames < 140) {
      slowTime += dt > 0.026 ? 1 : 0;
      if (slowTime > 40 && dpr > 1) {
        dpr = 1;
        renderer.setPixelRatio(dpr);
        resize();
        slowTime = 0;
      }
    }
  }

  function loop() {
    running = true;
    last = performance.now();
    const tick = () => {
      if (!visible || document.hidden) {
        running = false;
        return;
      }
      frame();
      if (reduce) {
        running = false;
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  loop();

  if (reduce) {
    // One still frame, redrawn when the size changes.
    new ResizeObserver(() => requestAnimationFrame(frame)).observe(canvas);
  }
}

function makeMistTexture() {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  for (let i = 0; i < 18; i++) {
    const x = size * (0.3 + Math.random() * 0.4);
    const y = size * (0.4 + Math.random() * 0.2);
    const r = size * (0.08 + Math.random() * 0.14);
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, "rgba(255,255,255,0.22)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  }
  // Feather the edges so the sprite never shows its square.
  g.globalCompositeOperation = "destination-in";
  const edge = g.createRadialGradient(size / 2, size / 2, size * 0.12, size / 2, size / 2, size * 0.5);
  edge.addColorStop(0, "rgba(0,0,0,1)");
  edge.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = edge;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
