<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let mx = -9999, my = -9999;

  const MAX_RIPPLES = 6;

  interface Ripple {
    x: number;
    y: number;
    t: number;
  }

  let ripples: Ripple[] = Array(MAX_RIPPLES).fill(null).map(() => ({ x: 0, y: 0, t: -9999 }));
  let rippleIndex = 0;

  const VERT = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  const FRAG = `
    precision mediump float;
    uniform vec2  u_res;
    uniform vec2  u_mouse;
    uniform float u_time;
    uniform vec3  u_ripples[${MAX_RIPPLES}];

    void main() {
      vec2 uv = gl_FragCoord.xy;

      vec2 cell     = mod(uv, 28.0);
      vec2 toCorner = min(cell, 28.0 - cell);
      float d       = length(toCorner);
      float dot     = 1.0 - smoothstep(0.5, 2.2, d);

      vec2  m    = vec2(u_mouse.x, u_res.y - u_mouse.y);
      float dist = length(uv - m);
      float glow = smoothstep(220.0, 24.0, dist);

      float rippleAmt = 0.0;
      for (int i = 0; i < ${MAX_RIPPLES}; i++) {
        vec2  origin = vec2(u_ripples[i].x, u_res.y - u_ripples[i].y);
        float age    = u_time - u_ripples[i].z;
        float radius = age * 380.0;
        float fade   = 1.0 - smoothstep(0.0, 1.6, age);
        float ring   = abs(length(uv - origin) - radius);
        float band   = 1.0 - smoothstep(0.0, 28.0, ring);
        rippleAmt   += band * fade * 0.9;
      }
      rippleAmt = clamp(rippleAmt, 0.0, 1.0);

      float alpha = dot * mix(0.45, 0.8, max(glow, rippleAmt));
      gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
    }
  `;

  function makeShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Failed to create shader');
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      throw new Error(`Shader compile error: ${gl.getShaderInfoLog(shader)}`);
    return shader;
  }

  function makeProgram(gl: WebGLRenderingContext): WebGLProgram {
    const prog = gl.createProgram();
    if (!prog) throw new Error('Failed to create program');
    gl.attachShader(prog, makeShader(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, makeShader(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
      throw new Error(`Program link error: ${gl.getProgramInfoLog(prog)}`);
    return prog;
  }

  function getUniform(gl: WebGLRenderingContext, prog: WebGLProgram, name: string): WebGLUniformLocation {
    const loc = gl.getUniformLocation(prog, name);
    if (!loc) throw new Error(`Uniform not found: ${name}`);
    return loc;
  }

  onMount(() => {
    const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true });
    if (!gl) throw new Error('WebGL not supported');

    const prog = makeProgram(gl);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes     = getUniform(gl, prog, 'u_res');
    const uMouse   = getUniform(gl, prog, 'u_mouse');
    const uTime    = getUniform(gl, prog, 'u_time');
    const uRipples = Array.from({ length: MAX_RIPPLES }, (_, i) =>
      getUniform(gl, prog, `u_ripples[${i}]`)
    );

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const startTime = performance.now();

    function resize(): void {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      gl!.viewport(0, 0, canvas.width, canvas.height);
      gl!.uniform2f(uRes, canvas.width, canvas.height);
    }

    let animFrame: number;
    function frame(): void {
      const t = (performance.now() - startTime) / 1000;
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.uniform2f(uMouse, mx, my);
      gl!.uniform1f(uTime, t);
      ripples.forEach((r, i) => gl!.uniform3f(uRipples[i], r.x, r.y, r.t));
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      animFrame = requestAnimationFrame(frame);
    }

    const onMouseMove  = (e: MouseEvent): void => { mx = e.clientX; my = e.clientY; };
    const onMouseLeave = (): void             => { mx = -9999; my = -9999; };
    const onClick      = (e: MouseEvent): void => {
      const t = (performance.now() - startTime) / 1000;
      ripples[rippleIndex % MAX_RIPPLES] = { x: e.clientX, y: e.clientY, t };
      rippleIndex++;
    };

    window.addEventListener('resize',     resize);
    window.addEventListener('mousemove',  onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('click',      onClick);

    resize();
    frame();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize',     resize);
      window.removeEventListener('mousemove',  onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('click',      onClick);
    };
  });
</script>

<canvas bind:this={canvas} />

<style>
  canvas {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
  }
</style>