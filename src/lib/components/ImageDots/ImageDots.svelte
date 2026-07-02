<script lang="ts">
import { onMount } from 'svelte';

interface Props {
  src: string;
  cellSize?: number;
  contrast?: number;
  invert?: boolean;
  class?: string;
  repelRadius?: number
  repelStrength?: number
  // Dot color (RGB 0..1) and canvas clear color (RGBA 0..1). Defaults keep the original
  // black-dots-on-opaque-white look; pass a light color + transparent bg to overlay on dark.
  color?: [number, number, number]
  background?: [number, number, number, number]
  // Scale the drawn image within the canvas (1 = cover/fill, <1 = smaller with margin).
  scale?: number
  // Whether a click emits an expanding ripple wave through the dots.
  ripple?: boolean
  // Subtle parallax: the whole dot field shifts by this fraction of the cursor's offset
  // from center (0 = off). A cheap depth cue that replaces per-dot hover physics.
  parallax?: number
}

let {
  src,
  cellSize = 8,
  contrast  = 1.5,
  invert    = false,
  class: className = '',
  repelRadius = 140,
  repelStrength = 22,
  color = [0, 0, 0],
  background = [1, 1, 1, 1],
  scale = 1,
  ripple = true,
  parallax = 0
}: Props = $props();

const VS = `
attribute vec2 a_pos;
attribute float a_radius;
attribute float a_alpha;
attribute float a_cx;    // column pivot x (physical px)
attribute float a_col;   // column index 0..2
attribute float a_theta; // angle around the cylinder (0 = facing viewer)
attribute float a_rad;   // cylinder radius (physical px)
uniform vec2 u_res;
uniform vec2 u_offset;
uniform vec3 u_yaw;    // yaw per column (radians)
uniform float u_focal; // perspective focal length, physical px
varying float v_alpha;
void main(){
  vec2 center = u_res * 0.5;
  // Each real dot rides the surface of its column's cylinder, spun about its axis.
  float yaw = u_yaw.x;
  if (a_col > 1.5) yaw = u_yaw.z;
  else if (a_col > 0.5) yaw = u_yaw.y;

  float ang = a_theta + yaw;
  float localX = a_rad * sin(ang); // horizontal offset on the cylinder surface
  float z      = a_rad * cos(ang); // depth, positive toward the viewer
  float persp  = u_focal / (u_focal - z);

  float relY = a_pos.y + u_offset.y - center.y;
  vec2 screen = vec2(a_cx + localX * persp, center.y + relY * persp);
  vec2 clip = (screen / u_res) * 2.0 - 1.0;
  clip.y = -clip.y;
  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = a_radius * 2.0 * persp;
  // Fade toward the silhouette so the curvature reads.
  float facing = cos(ang);
  v_alpha = a_alpha * smoothstep(0.0, 0.18, facing);
}`;

const FS = `
precision mediump float;
uniform vec3 u_color;
varying float v_alpha;
void main(){
  vec2 pc = gl_PointCoord - 0.5;
  float d = length(pc) * 2.0;
  float circle = 1.0 - smoothstep(0.8, 1.0, d);
  if(circle * v_alpha < 0.01) discard;
  gl_FragColor = vec4(u_color, circle * v_alpha);
}`;

interface Dot {
  ox: number; oy: number;   // resting position, physical px, Y-down
  x:  number; y:  number;   // current position
  vx: number; vy: number;   // velocity
  radius: number;           // physical px
  revealAt: number;         // 0-1 normalised BFS distance
  alpha: number;
  revealed: boolean;
  colIndex: number;         // which of the 3 columns this dot belongs to
  colCenterX: number;       // that column's pivot x, physical px
  colRadius: number;        // that column's cylinder radius, physical px
  theta: number;            // angle around the cylinder (0 = facing viewer)
}

const ANIMATION_DURATION = 10.0; // seconds
const SPRING_K           = 0.10;
const DAMPING            = 0.87;

const RIPPLE_WAVE_SPEED  = 800; // px/s in physical coords
const RIPPLE_STRENGTH    = 18;
const RIPPLE_WIDTH       = 60;  // wavefront falloff half-width in physical px
const RIPPLE_DURATION    = 1.4; // seconds until ripple expires

interface Ripple {
  x: number; y: number;
  startTime: number; // performance.now() ms
}

let canvas:    HTMLCanvasElement;
let gl:        WebGLRenderingContext;
let posLoc:    number;
let radiusLoc: number;
let alphaLoc:  number;
let uRes:      WebGLUniformLocation | null;
let uColor:    WebGLUniformLocation | null;
let uOffset:   WebGLUniformLocation | null;
let uYaw:      WebGLUniformLocation | null;
let uFocal:    WebGLUniformLocation | null;
let cxLoc:     number;
let colLoc:    number;
let thetaLoc:  number;
let radLoc:    number;
let vbo:       WebGLBuffer;

let dots:   Dot[]        = [];
let gpuBuf: Float32Array = new Float32Array(0);
let rafId:  number;
let running = false;
let startTime = Infinity;

let mouseX      = 0;
let mouseY      = 0;
let mouseActive = false;
let ripples:    Ripple[] = [];

// Parallax offset (physical px): target follows the cursor, smooth lerps toward it.
let targetOX = 0, targetOY = 0;
let smoothOX = 0, smoothOY = 0;
const PARALLAX_LERP = 0.08;

// Each of the 3 columns yaws about its own center, "looking" toward the cursor.
let columnCentersX = [0, 0, 0];      // pivot x per column, physical px
let targetYaw = [0, 0, 0];
let smoothYaw = [0, 0, 0];
const ROT_LERP = 0.08;

function compile(type: GLenum, source: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, source);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(s) ?? 'compile error');
  return s;
}

function setup() {
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER,   VS));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(prog) ?? 'link error');
  gl.useProgram(prog);

  posLoc    = gl.getAttribLocation(prog, 'a_pos');
  radiusLoc = gl.getAttribLocation(prog, 'a_radius');
  alphaLoc  = gl.getAttribLocation(prog, 'a_alpha');
  cxLoc     = gl.getAttribLocation(prog, 'a_cx');
  colLoc    = gl.getAttribLocation(prog, 'a_col');
  thetaLoc  = gl.getAttribLocation(prog, 'a_theta');
  radLoc    = gl.getAttribLocation(prog, 'a_rad');
  uRes      = gl.getUniformLocation(prog, 'u_res');
  uColor    = gl.getUniformLocation(prog, 'u_color');
  uOffset   = gl.getUniformLocation(prog, 'u_offset');
  uYaw      = gl.getUniformLocation(prog, 'u_yaw');
  uFocal    = gl.getUniformLocation(prog, 'u_focal');

  vbo = gl.createBuffer()!;
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

function applyContrast(v: number, c: number) {
  return Math.max(0, Math.min(1, (v - 0.5) * c + 0.5));
}

interface Column {
  centerX: number;  // pivot x, physical px
  radius: number;   // cylinder radius, physical px
  startCol: number; // first grid column (inclusive)
  endCol: number;   // last grid column (inclusive)
}

// Find the 3 vertical columns from the transparent gaps in the occupancy mask.
// Falls back to three equal bands if gap detection doesn't yield exactly three.
function detectColumns(colHas: Uint8Array, cols: number, csPhys: number): Column[] {
  const clusters: [number, number][] = [];
  let runStart = -1;
  for (let c = 0; c <= cols; c++) {
    const filled = c < cols && colHas[c] === 1;
    if (filled && runStart < 0) runStart = c;
    if (!filled && runStart >= 0) {
      clusters.push([runStart, c - 1]);
      runStart = -1;
    }
  }

  let bands: [number, number][];
  if (clusters.length === 3) {
    bands = clusters;
  } else {
    let lo = cols, hi = 0;
    for (let c = 0; c < cols; c++) {
      if (!colHas[c]) continue;
      if (c < lo) lo = c;
      if (c > hi) hi = c;
    }
    const span = (hi - lo + 1) / 3;
    bands = [
      [lo, Math.round(lo + span) - 1],
      [Math.round(lo + span), Math.round(lo + 2 * span) - 1],
      [Math.round(lo + 2 * span), hi]
    ];
  }

  return bands.map(([a, b]) => ({
    centerX: ((a + b + 1) / 2) * csPhys,
    radius: ((b - a + 1) / 2) * csPhys,
    startCol: a,
    endCol: b
  }));
}

function loadImage() {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const dpr    = devicePixelRatio || 1;
    const dispW  = canvas.offsetWidth;
    const dispH  = canvas.offsetHeight;
    const physW  = dispW  * dpr;
    const physH  = dispH  * dpr;
    const csPhys = cellSize * dpr;

    // Draw image into offscreen canvas at display (logical) resolution
    const oc    = document.createElement('canvas');
    oc.width    = dispW;
    oc.height   = dispH;
    const octx  = oc.getContext('2d')!;
    const ia    = img.naturalWidth / img.naturalHeight;
    const ca    = dispW / dispH;
    let sw = dispW, sh = dispH;
    if (ia > ca) sw = sh * ia;
    else         sh = sw / ia;
    sw *= scale;
    sh *= scale;
    const sx = (dispW - sw) / 2;
    const sy = (dispH - sh) / 2;
    octx.drawImage(img, sx, sy, sw, sh);
    const data  = octx.getImageData(0, 0, dispW, dispH).data;

    const cols  = Math.ceil(physW / csPhys);
    const rows  = Math.ceil(physH / csPhys);

    const newDots: Dot[] = [];
    const colHas = new Uint8Array(cols);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const lx = Math.min(Math.floor((col + 0.5) * cellSize), dispW  - 1);
        const ly = Math.min(Math.floor((row + 0.5) * cellSize), dispH - 1);
        const i  = (ly * dispW + lx) * 4;
        if (data[i + 3] < 128) continue;
        let bright = data[i] / 255 * 0.299
                   + data[i+1] / 255 * 0.587
                   + data[i+2] / 255 * 0.114;
        bright = applyContrast(bright, contrast);
        if (invert) bright = 1 - bright;

        const radius = (1 - bright) * csPhys * 0.48;
        if (radius < 0.5) continue;

        const ox = (col + 0.5) * csPhys;
        const oy = (row + 0.5) * csPhys;
        newDots.push({
          ox, oy, x: ox, y: oy, vx: 0, vy: 0, radius,
          revealAt: 0, alpha: 0, revealed: false,
          colIndex: 0, colCenterX: 0, colRadius: 0, theta: 0
        });
        colHas[col] = 1;
      }
    }

    const columns = detectColumns(colHas, cols, csPhys);
    columnCentersX = columns.map((c) => c.centerX);
    assignCylinder(newDots, columns);

    // Reveal from the bottom up: lowest dots first, regardless of x.
    let minOy = Infinity, maxOy = -Infinity;
    for (const dot of newDots) {
      if (dot.oy < minOy) minOy = dot.oy;
      if (dot.oy > maxOy) maxOy = dot.oy;
    }
    const span = Math.max(1, maxOy - minOy);
    for (const dot of newDots) {
      // 0 at the bottom row, 1 at the top; tiny jitter softens the wavefront.
      const height = (maxOy - dot.oy) / span;
      dot.revealAt = Math.min(1, Math.max(0, height + (Math.random() - 0.5) * 0.04));
    }

    dots      = newDots;
    gpuBuf    = new Float32Array(dots.length * 8); // x,y,radius,alpha,cx,col,theta,R
    startTime = performance.now();
    requestRender();
  };
  img.src = src;
}

function clamp(value: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, value));
}

// Place each real dot on the surface of its nearest column's cylinder: the dot's
// horizontal offset from the column center maps to an angle around the axis, so
// rotating the column foreshortens and curves the dots like a real 3D surface.
function assignCylinder(dotList: Dot[], columns: Column[]) {
  for (const dot of dotList) {
    let nearestIndex = 0;
    let bestDist = Infinity;
    for (let i = 0; i < columns.length; i++) {
      const dist = Math.abs(dot.ox - columns[i].centerX);
      if (dist < bestDist) {
        bestDist = dist;
        nearestIndex = i;
      }
    }
    const column = columns[nearestIndex];
    const u = clamp((dot.ox - column.centerX) / column.radius, -1, 1);
    dot.colIndex = nearestIndex;
    dot.colCenterX = column.centerX;
    dot.colRadius = column.radius;
    dot.theta = Math.asin(u);
  }
}

function physicsStep(elapsed: number): number {
  const dpr = devicePixelRatio || 1;
  const mr  = repelRadius * dpr;
  const ms  = repelStrength * dpr;
  let moved = 0;

  for (const dot of dots) {
    const revealed = dot.revealAt <= elapsed / ANIMATION_DURATION;

    if (!revealed) { dot.alpha = 0; continue; }

    // First frame of reveal — kick dot outward from origin
    if (!dot.revealed) {
      dot.revealed = true;
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.5 + Math.random() * 1.5) * dpr * 4;
      dot.vx = Math.cos(angle) * speed;
      dot.vy = Math.sin(angle) * speed;
      dot.x  = dot.ox + dot.vx * 3;
      dot.y  = dot.oy + dot.vy * 3;
    }

    // Fade in
    const timeSinceReveal = elapsed - dot.revealAt * ANIMATION_DURATION;
    dot.alpha = Math.min(1, timeSinceReveal / 0.4);

    // Spring toward resting position
    dot.vx += (dot.ox - dot.x) * SPRING_K;
    dot.vy += (dot.oy - dot.y) * SPRING_K;

    // Mouse repulsion
    if (mouseActive) {
      const dx   = dot.x - mouseX;
      const dy   = dot.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mr && dist > 0.001) {
        const force = ms * Math.pow(1 - dist / mr, 2);
        dot.vx += (dx / dist) * force;
        dot.vy += (dy / dist) * force;
      }
    }

    // Ripple waves
    for (const rip of ripples) {
      const age        = (performance.now() - rip.startTime) / 1000;
      const waveR      = age * RIPPLE_WAVE_SPEED * dpr;
      const waveWidth  = RIPPLE_WIDTH * dpr;
      const dx         = dot.x - rip.x;
      const dy         = dot.y - rip.y;
      const dist       = Math.sqrt(dx * dx + dy * dy);
      const proximity  = 1 - Math.abs(dist - waveR) / waveWidth;
      if (proximity > 0 && dist > 0.001) {
        const decay  = 1 - age / RIPPLE_DURATION;
        const force  = proximity * RIPPLE_STRENGTH * decay * dpr;
        dot.vx += (dx / dist) * force;
        dot.vy += (dy / dist) * force;
      }
    }

    // Damping
    dot.vx *= DAMPING;
    dot.vy *= DAMPING;

    dot.x += dot.vx;
    dot.y += dot.vy;
    moved += Math.abs(dot.vx) + Math.abs(dot.vy);
  }
  return moved;
}

function uploadAndDraw() {
  let visibleCount = 0;
  for (const dot of dots) {
    if (dot.alpha < 0.01) continue;
    const base = visibleCount * 8;
    gpuBuf[base]     = dot.x;
    gpuBuf[base + 1] = dot.y;
    gpuBuf[base + 2] = dot.radius;
    gpuBuf[base + 3] = dot.alpha;
    gpuBuf[base + 4] = dot.colCenterX;
    gpuBuf[base + 5] = dot.colIndex;
    gpuBuf[base + 6] = dot.theta;
    gpuBuf[base + 7] = dot.colRadius;
    visibleCount++;
  }

  const slice = gpuBuf.subarray(0, visibleCount * 8);
  const stride = 8 * 4; // 8 floats * 4 bytes

  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, slice, gl.DYNAMIC_DRAW);

  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc,    2, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(radiusLoc);
  gl.vertexAttribPointer(radiusLoc, 1, gl.FLOAT, false, stride, 8);
  gl.enableVertexAttribArray(alphaLoc);
  gl.vertexAttribPointer(alphaLoc,  1, gl.FLOAT, false, stride, 12);
  gl.enableVertexAttribArray(cxLoc);
  gl.vertexAttribPointer(cxLoc,     1, gl.FLOAT, false, stride, 16);
  gl.enableVertexAttribArray(colLoc);
  gl.vertexAttribPointer(colLoc,    1, gl.FLOAT, false, stride, 20);
  gl.enableVertexAttribArray(thetaLoc);
  gl.vertexAttribPointer(thetaLoc,  1, gl.FLOAT, false, stride, 24);
  gl.enableVertexAttribArray(radLoc);
  gl.vertexAttribPointer(radLoc,    1, gl.FLOAT, false, stride, 28);

  gl.clearColor(background[0], background[1], background[2], background[3]);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform2f(uRes, canvas.width, canvas.height);
  gl.uniform3f(uColor, color[0], color[1], color[2]);
  gl.uniform2f(uOffset, smoothOX, smoothOY);
  gl.uniform3f(uYaw, smoothYaw[0], smoothYaw[1], smoothYaw[2]);
  gl.uniform1f(uFocal, Math.max(canvas.width, canvas.height) * 1.6);
  gl.drawArrays(gl.POINTS, 0, visibleCount);
}

function frame() {
  const now = performance.now();
  const elapsed = startTime === Infinity ? 0 : (now - startTime) / 1000;
  ripples = ripples.filter(r => (now - r.startTime) / 1000 < RIPPLE_DURATION);

  // Smooth the parallax offset and per-column rotation toward the cursor targets.
  smoothOX += (targetOX - smoothOX) * PARALLAX_LERP;
  smoothOY += (targetOY - smoothOY) * PARALLAX_LERP;
  let yawMoving = false;
  for (let i = 0; i < smoothYaw.length; i++) {
    smoothYaw[i] += (targetYaw[i] - smoothYaw[i]) * ROT_LERP;
    if (Math.abs(targetYaw[i] - smoothYaw[i]) > 0.0005) yawMoving = true;
  }
  const offsetMoving =
    Math.abs(targetOX - smoothOX) > 0.1 ||
    Math.abs(targetOY - smoothOY) > 0.1 ||
    yawMoving;

  const revealing = startTime !== Infinity && elapsed < ANIMATION_DURATION + 0.5;
  let moved = 0;
  if (dots.length > 0) {
    moved = physicsStep(elapsed);
    uploadAndDraw();
  }

  // Idle out when nothing is animating so the rAF loop stops burning CPU.
  const busy =
    revealing ||
    ripples.length > 0 ||
    offsetMoving ||
    moved > 0.4 ||
    (mouseActive && repelStrength > 0);

  if (busy) {
    rafId = requestAnimationFrame(frame);
  } else {
    running = false;
  }
}

function requestRender() {
  if (running) return;
  running = true;
  rafId = requestAnimationFrame(frame);
}

function resize() {
  const dpr     = devicePixelRatio || 1;
  canvas.width  = canvas.offsetWidth  * dpr;
  canvas.height = canvas.offsetHeight * dpr;
  gl.viewport(0, 0, canvas.width, canvas.height);
  requestRender();
}

export function replay() {
  for (const dot of dots) {
    dot.x = dot.ox; dot.y = dot.oy;
    dot.vx = 0; dot.vy = 0;
    dot.alpha = 0; dot.revealed = false;
  }
  startTime = performance.now();
  requestRender();
}

onMount(() => {
  const ctxOpts = { alpha: true, premultipliedAlpha: false };
  gl = (canvas.getContext('webgl', ctxOpts) ||
    canvas.getContext('experimental-webgl', ctxOpts)) as WebGLRenderingContext;
  if (!gl) { console.error('WebGL not supported'); return; }

  setup();
  resize();
  loadImage();
  requestRender();

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const onMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const dpr  = devicePixelRatio || 1;
    mouseX      = (e.clientX - rect.left) * dpr;
    mouseY      = (e.clientY - rect.top)  * dpr;
    mouseActive = true;
    if (parallax !== 0) {
      // Each column turns toward the cursor about its own axis, so they rotate individually.
      const maxYaw = parallax * 4.5; // ≈0.18 rad (~10°) at full horizontal offset
      const half = canvas.width / 2;
      for (let i = 0; i < targetYaw.length; i++) {
        const offset = (mouseX - columnCentersX[i]) / half;
        targetYaw[i] = Math.max(-1, Math.min(1, offset)) * maxYaw;
      }
    }
    requestRender();
  };
  const onLeave = () => {
    mouseActive = false;
    for (let i = 0; i < targetYaw.length; i++) targetYaw[i] = 0;
    requestRender();
  };
  const onClick = (e: MouseEvent) => {
    if (!ripple) return;
    const rect = canvas.getBoundingClientRect();
    const dpr  = devicePixelRatio || 1;
    ripples.push({
      x:         (e.clientX - rect.left) * dpr,
      y:         (e.clientY - rect.top)  * dpr,
      startTime: performance.now()
    });
    requestRender();
  };
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseleave', onLeave);
  canvas.addEventListener('click', onClick);

  return () => {
    cancelAnimationFrame(rafId);
    ro.disconnect();
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseleave', onLeave);
    canvas.removeEventListener('click', onClick);
  };
});

$effect(() => {
  src;
  if (!gl) return;
  dots = []; // clear while loading
  loadImage();
});
</script>

<canvas bind:this={canvas} class={className}></canvas>
