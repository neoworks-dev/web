<script>
    import Grid from "$lib/components/Grid.svelte";

</script>
---
<!-- index.html — assumes these are in the same project -->
<!--
  @import "tailwindcss";
  @import "./neoworks.css";
-->
---

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Neoworks — Design on the Grid</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,wght@0,400;0,500;1,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">

<style>
/*
 * In your real project, replace this block with:
 *
 *   @import "tailwindcss";
 *   @import "./neoworks.css";
 *
 * Everything below is just the tokens needed to make this file standalone.
 */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --G: 28px;
  --font-display: "Syne", sans-serif;
  --font-body:    "DM Sans", sans-serif;
  --font-mono:    "DM Mono", monospace;

  --color-bg:        #0e0e10;
  --color-surface:   #17171a;
  --color-surface-2: #1e1e22;
  --color-surface-3: #26262b;

  --color-text-1: #f0f0f2;
  --color-text-2: #9090a0;
  --color-text-3: #5a5a68;
  --color-text-4: #38383f;

  --color-border-1: rgba(255,255,255,0.055);
  --color-border-2: rgba(255,255,255,0.09);
  --color-border-3: rgba(255,255,255,0.16);

  --color-success:        #4ade80;
  --color-success-dim:    rgba(74,222,128,0.10);
  --color-success-border: rgba(74,222,128,0.22);
  --color-error:          #fb7185;
  --color-error-dim:      rgba(251,113,133,0.10);
  --color-error-border:   rgba(251,113,133,0.22);
  --color-warning:        #fbbf24;
  --color-warning-dim:    rgba(251,191,36,0.10);
  --color-warning-border: rgba(251,191,36,0.20);
  --color-info:           #22d3ee;
  --color-info-dim:       rgba(34,211,238,0.10);
  --color-info-border:    rgba(34,211,238,0.22);
  --color-new:            #a78bfa;
  --color-new-dim:        rgba(167,139,250,0.10);
  --color-new-border:     rgba(167,139,250,0.22);

  --color-grove:  #4ade80;  --color-grove-dim:  rgba(74,222,128,0.10);  --color-grove-border:  rgba(74,222,128,0.22);
  --color-vault:  #fb7185;  --color-vault-dim:  rgba(251,113,133,0.10); --color-vault-border:  rgba(251,113,133,0.22);
  --color-vine:   #a78bfa;  --color-vine-dim:   rgba(167,139,250,0.10); --color-vine-border:   rgba(167,139,250,0.22);
  --color-tide:   #22d3ee;  --color-tide-dim:   rgba(34,211,238,0.10);  --color-tide-border:   rgba(34,211,238,0.22);
  --color-twig:   #a3e635;  --color-twig-dim:   rgba(163,230,53,0.10);  --color-twig-border:   rgba(163,230,53,0.22);
  --color-relay:  #fb923c;  --color-relay-dim:  rgba(251,146,60,0.10);  --color-relay-border:  rgba(251,146,60,0.22);
  --color-trail:  #fbbf24;  --color-trail-dim:  rgba(251,191,36,0.10);  --color-trail-border:  rgba(251,191,36,0.22);

  --radius-1: 7px;
  --radius-2: 14px;
  --radius-3: 21px;
  --radius-4: 28px;
  --radius-pill: 9999px;

  --shadow-sm: 0 0 0 1px rgba(255,255,255,0.055), 0 4px 12px rgba(0,0,0,0.35);
  --shadow-md: 0 0 0 1px rgba(255,255,255,0.055), 0 8px 28px rgba(0,0,0,0.50);
  --shadow-lg: 0 0 0 1px rgba(255,255,255,0.09),  0 16px 56px rgba(0,0,0,0.60);

  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-ui:     cubic-bezier(0.15, 0, 0, 1);
}

html, body {
  background: var(--color-bg);
  color: var(--color-text-1);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* ── WebGL grid canvas ── */
#gc {
  position: fixed; inset: 0;
  width: 100%; height: 100%;
  z-index: 0; pointer-events: none;
}

/* ── Layout shell ── */
.layout {
  position: relative; z-index: 1;
  /* THE GRID — all sections snap to 28px */
  width: calc(round(down, 100vw, var(--G)));
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, var(--G));
  grid-auto-rows: var(--G);
  align-content: start;
}

.full { grid-column: 1 / -1; }

/* ────────────────────────────────────────────
   NAV — 2g tall = 56px
   ──────────────────────────────────────────── */
nav {
  grid-column: 1 / -1;
  grid-row: span 2;
  display: flex; align-items: center; justify-content: space-between;
  padding-inline: calc(var(--G) * 2);
  border-bottom: 1px solid var(--color-border-1);
  position: sticky; top: 0; z-index: 10;
  background: rgba(14,14,16,0.85);
  backdrop-filter: blur(12px);
}

.logo {
  display: flex; align-items: center; gap: 10px;
  text-decoration: none;
}
.logo-mark {
  width: var(--G); height: var(--G);
  background: var(--color-text-1);
  border-radius: var(--radius-1);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-size: 12px; font-weight: 800;
  color: var(--color-bg); letter-spacing: -0.05em;
}
.logo-name {
  font-family: var(--font-display); font-size: 15px; font-weight: 700;
  letter-spacing: -0.02em; color: var(--color-text-1);
}

.nav-links {
  display: flex; gap: calc(var(--G) * 1.5);
  list-style: none;
}
.nav-links a {
  font-size: 13px; color: var(--color-text-3); text-decoration: none;
  transition: color 150ms var(--ease-ui);
}
.nav-links a:hover { color: var(--color-text-1); }

.nav-actions { display: flex; gap: 10px; align-items: center; }

/* Buttons (subset of neoworks .btn) */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  font-family: var(--font-display); font-weight: 600; letter-spacing: -0.02em;
  cursor: pointer; border: none; outline: none; text-decoration: none;
  transition: opacity 150ms, background 150ms, border-color 150ms, transform 100ms;
  white-space: nowrap;
}
.btn:active { transform: scale(0.98); }

.btn-sm {
  height: 42px; padding-inline: 14px;
  font-size: 11px; border-radius: var(--radius-1);
}
.btn-md {
  height: 56px; padding-inline: 28px;
  font-size: 13px; border-radius: var(--radius-2);
}
.btn-lg {
  height: 84px; padding-inline: 42px;
  font-size: 16px; border-radius: var(--radius-2);
}

.btn-primary { background: var(--color-text-1); color: var(--color-bg); }
.btn-primary:hover { opacity: 0.88; }
.btn-ghost {
  background: transparent; color: var(--color-text-2);
  border: 1px solid var(--color-border-2);
}
.btn-ghost:hover { border-color: var(--color-border-3); color: var(--color-text-1); }

/* ────────────────────────────────────────────
   HERO — punchy, full-width, sits on the grid
   ──────────────────────────────────────────── */
.hero {
  grid-column: 1 / -1;
  grid-row: span 20;
  display: flex; flex-direction: column; justify-content: center;
  padding: calc(var(--G) * 4) calc(var(--G) * 2) calc(var(--G) * 3);
  border-bottom: 1px solid var(--color-border-1);
}

.eyebrow {
  font-family: var(--font-mono); font-size: 10px; font-weight: 500;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--color-text-4);
  display: flex; align-items: center; gap: 10px;
  margin-bottom: calc(var(--G) * 1.5);
}
.eyebrow::before {
  content: '';
  display: inline-block; width: var(--G); height: 1px;
  background: var(--color-text-4);
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(64px, 10vw, 140px);
  font-weight: 800; line-height: 0.9;
  letter-spacing: -0.04em;
  max-width: 10ch;
  margin-bottom: calc(var(--G) * 2);
}

.hero-title em {
  font-style: normal;
  color: transparent;
  -webkit-text-stroke: 1.5px var(--color-text-3);
}

.hero-foot {
  display: flex; align-items: flex-end; justify-content: space-between;
  flex-wrap: wrap; gap: var(--G);
}

.hero-sub {
  font-size: 14px; line-height: 1.65; color: var(--color-text-3);
  max-width: 36ch;
}

.hero-actions { display: flex; gap: 14px; align-items: center; }

.hero-note {
  font-family: var(--font-mono); font-size: 10px;
  color: var(--color-text-4); letter-spacing: 0.1em;
}

/* ────────────────────────────────────────────
   APP STRIP — row of app chips
   ──────────────────────────────────────────── */
.app-strip {
  grid-column: 1 / -1;
  grid-row: span 4;
  display: flex; align-items: center; gap: 14px;
  padding: 0 calc(var(--G) * 2);
  border-bottom: 1px solid var(--color-border-1);
  overflow-x: auto;
}

.app-chip {
  display: inline-flex; align-items: center; gap: 7px;
  height: 42px; padding-inline: 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-1);
  border-radius: var(--radius-2);
  font-size: 12px; color: var(--color-text-2);
  white-space: nowrap;
  box-shadow: var(--shadow-sm);
  transition: border-color 150ms var(--ease-ui), transform 150ms var(--ease-spring);
}
.app-chip:hover { transform: translateY(-1px); border-color: var(--color-border-2); }
.app-chip-dot { width: 6px; height: 6px; border-radius: 50%; }
.strip-label {
  font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--color-text-4); white-space: nowrap;
  margin-right: 7px;
}

/* ────────────────────────────────────────────
   GRID EXPLAINER — shows the 28px system
   ──────────────────────────────────────────── */
.section-label {
  grid-column: 1 / -1;
  grid-row: span 3;
  display: flex; align-items: flex-end; justify-content: space-between;
  padding: 0 calc(var(--G) * 2);
  border-bottom: 1px solid var(--color-border-1);
}

.section-title {
  font-family: var(--font-display);
  font-size: clamp(28px, 4vw, 56px);
  font-weight: 800; letter-spacing: -0.04em; line-height: 1;
}

.section-tag {
  font-family: var(--font-mono); font-size: 9px;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--color-text-4);
}

/* Feature cards on the 28px grid — span N cols × span M rows */
.feature-grid {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(auto-fill, var(--G));
  grid-auto-rows: var(--G);
  gap: var(--G);
  padding: var(--G) calc(var(--G) * 2);
  border-bottom: 1px solid var(--color-border-1);
}

.feature-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-1);
  border-radius: var(--radius-3);
  padding: var(--G);
  box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column; justify-content: space-between;
  transition: border-color 250ms var(--ease-ui), transform 200ms var(--ease-spring);
  overflow: hidden;
}
.feature-card:hover {
  border-color: var(--color-border-3);
  transform: translateY(-2px);
}

/* Span values: at a 20-column inner grid (1120px),
   span 8 = 224px, span 12 = 336px, span 20 = full */
.feat-sm   { grid-column: span 8;  grid-row: span 10; }
.feat-lg   { grid-column: span 12; grid-row: span 10; }
.feat-full { grid-column: 1 / -1;  grid-row: span 6; }

.feat-icon {
  width: 42px; height: 42px;
  border-radius: var(--radius-2);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: calc(var(--G) * 2);
}

.feat-title {
  font-family: var(--font-display);
  font-size: 20px; font-weight: 800; letter-spacing: -0.03em;
  margin-bottom: 10px;
}
.feat-body { font-size: 13px; line-height: 1.65; color: var(--color-text-3); }

/* The inline code snippet card */
.code-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border-1);
  border-radius: var(--radius-3);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column;
}

.code-topbar {
  height: 42px; padding-inline: var(--G);
  display: flex; align-items: center; gap: 7px;
  border-bottom: 1px solid var(--color-border-1);
  flex-shrink: 0;
}
.code-dot { width: 8px; height: 8px; border-radius: 50%; }
.code-title {
  font-family: var(--font-mono); font-size: 10px;
  color: var(--color-text-4); letter-spacing: 0.1em;
  margin-left: 7px;
}

pre {
  padding: var(--G);
  font-family: var(--font-mono); font-size: 12px; line-height: 1.85;
  overflow-x: auto; flex: 1;
}
.t-comment { color: var(--color-text-4); }
.t-sel     { color: #7dd3fc; }
.t-prop    { color: #4ade80; }
.t-val     { color: #fdba74; }
.t-num     { color: #a78bfa; }

/* ────────────────────────────────────────────
   COMPONENT SHOWCASE
   ──────────────────────────────────────────── */
.showcase {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(auto-fill, var(--G));
  grid-auto-rows: var(--G);
  gap: var(--G);
  padding: var(--G) calc(var(--G) * 2);
  border-bottom: 1px solid var(--color-border-1);
}

/* Badge strip */
.badge-row {
  grid-column: 1 / -1; grid-row: span 2;
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
}

.badge {
  display: inline-flex; align-items: center;
  height: var(--G); padding-inline: 14px;
  border-radius: var(--radius-1);
  font-family: var(--font-mono); font-size: 9px; font-weight: 500;
  letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap;
}
.badge-success { background: var(--color-success-dim); color: var(--color-success); border: 1px solid var(--color-success-border); }
.badge-error   { background: var(--color-error-dim);   color: var(--color-error);   border: 1px solid var(--color-error-border); }
.badge-warning { background: var(--color-warning-dim); color: var(--color-warning); border: 1px solid var(--color-warning-border); }
.badge-info    { background: var(--color-info-dim);    color: var(--color-info);    border: 1px solid var(--color-info-border); }
.badge-new     { background: var(--color-new-dim);     color: var(--color-new);     border: 1px solid var(--color-new-border); }
.badge-neutral { background: var(--color-surface-3);   color: var(--color-text-2);  border: 1px solid var(--color-border-1); }

/* Mini stat cards in showcase */
.mini-stat {
  grid-column: span 5; grid-row: span 5;
  background: var(--color-surface);
  border: 1px solid var(--color-border-1);
  border-radius: var(--radius-3);
  padding: 14px;
  box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column; justify-content: space-between;
}
.mini-label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-text-3); }
.mini-value { font-family: var(--font-display); font-size: 28px; font-weight: 800; letter-spacing: -0.04em; line-height: 1; }
.mini-change { font-size: 10px; }

/* Input + button row */
.input-demo {
  grid-column: span 12; grid-row: span 4;
  background: var(--color-surface);
  border: 1px solid var(--color-border-1);
  border-radius: var(--radius-3);
  padding: var(--G);
  box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column; gap: 10px; justify-content: center;
}

.input {
  width: 100%; height: 42px;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
  border-radius: var(--radius-2);
  color: var(--color-text-1);
  font-family: var(--font-body); font-size: 13px;
  padding-inline: 14px; outline: none;
  transition: border-color 150ms;
}
.input::placeholder { color: var(--color-text-4); }
.input:focus { border-color: var(--color-border-3); background: var(--color-surface-3); }

/* Progress bars demo */
.progress-demo {
  grid-column: span 8; grid-row: span 4;
  background: var(--color-surface);
  border: 1px solid var(--color-border-1);
  border-radius: var(--radius-3);
  padding: var(--G);
  box-shadow: var(--shadow-sm);
  display: flex; flex-direction: column; gap: 10px; justify-content: center;
}
.prog-row { display: flex; align-items: center; gap: 10px; }
.prog-label { font-family: var(--font-mono); font-size: 9px; color: var(--color-text-3); letter-spacing: 0.1em; width: 42px; text-align: right; flex-shrink: 0; }
.progress { height: 3px; background: var(--color-surface-3); border-radius: 9999px; overflow: hidden; flex: 1; }
.progress-fill { height: 100%; border-radius: 9999px; transition: width 600ms var(--ease-spring); }
.prog-pct { font-family: var(--font-mono); font-size: 9px; color: var(--color-text-4); width: 28px; flex-shrink: 0; }

/* ────────────────────────────────────────────
   CTA
   ──────────────────────────────────────────── */
.cta {
  grid-column: 1 / -1;
  grid-row: span 18;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center;
  gap: var(--G);
  padding: calc(var(--G) * 4) calc(var(--G) * 2);
  border-bottom: 1px solid var(--color-border-1);
}

.cta-title {
  font-family: var(--font-display);
  font-size: clamp(48px, 8vw, 112px);
  font-weight: 800; line-height: 0.9;
  letter-spacing: -0.04em; max-width: 12ch;
}
.cta-title em { font-style: normal; color: var(--color-text-3); }
.cta-sub { font-family: var(--font-mono); font-size: 10px; color: var(--color-text-4); letter-spacing: 0.18em; text-transform: uppercase; }
.cta-actions { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; justify-content: center; }

/* ────────────────────────────────────────────
   FOOTER
   ──────────────────────────────────────────── */
footer {
  grid-column: 1 / -1;
  grid-row: span 3;
  display: flex; align-items: center; justify-content: space-between;
  padding-inline: calc(var(--G) * 2);
  border-top: 1px solid var(--color-border-1);
  font-family: var(--font-mono); font-size: 9px;
  letter-spacing: 0.15em; text-transform: uppercase; color: var(--color-text-4);
}

/* ────────────────────────────────────────────
   RESPONSIVE
   ──────────────────────────────────────────── */
@media (max-width: calc(28px * 24)) {
  .nav-links { display: none; }
  .feat-sm, .feat-lg { grid-column: 1 / -1; }
  .mini-stat { grid-column: span 10; }
  .input-demo, .progress-demo { grid-column: 1 / -1; }
}
</style>
</head>
<body>

<!-- <Grid></Grid> -->

<div class="layout">

  <!-- NAV -->
  <nav>
    <a class="logo" href="#">
      <div class="logo-mark">N</div>
      <span class="logo-name">Neoworks</span>
    </a>
    <ul class="nav-links">
      <li><a href="#">System</a></li>
      <li><a href="#">Components</a></li>
      <li><a href="#">Apps</a></li>
      <li><a href="#">Docs</a></li>
    </ul>
    <div class="nav-actions">
      <a href="#" class="btn btn-sm btn-ghost">GitHub</a>
      <a href="#" class="btn btn-sm btn-primary">Get Started</a>
    </div>
  </nav>

  <!-- HERO -->
  <div class="hero">
    <p class="eyebrow">Design System — v1.0</p>
    <h1 class="hero-title">BUILT ON <em>28</em> PIXELS</h1>
    <div class="hero-foot">
      <p class="hero-sub">
        Every spacing, size, and radius is a multiple of 7px. Every layout snaps to a 28px grid. No guesswork. No drift. Just rhythm.
      </p>
      <div>
        <div class="hero-actions">
          <a href="#" class="btn btn-md btn-primary">Explore the system</a>
          <a href="#" class="btn btn-md btn-ghost">View on GitHub</a>
        </div>
        <p class="hero-note" style="margin-top:14px">Tailwind v5 · CSS-first · No config needed</p>
      </div>
    </div>
  </div>

  <!-- APP STRIP -->
  <div class="app-strip">
    <span class="strip-label">Includes</span>
    <div class="app-chip"><span class="app-chip-dot" style="background:var(--color-grove)"></span>Grove — Files</div>
    <div class="app-chip"><span class="app-chip-dot" style="background:var(--color-vault)"></span>Vault — Passwords</div>
    <div class="app-chip"><span class="app-chip-dot" style="background:var(--color-vine)"></span>Vine — Contacts</div>
    <div class="app-chip"><span class="app-chip-dot" style="background:var(--color-tide)"></span>Tide — Calendar</div>
    <div class="app-chip"><span class="app-chip-dot" style="background:var(--color-twig)"></span>Twig — Tasks</div>
    <div class="app-chip"><span class="app-chip-dot" style="background:var(--color-relay)"></span>Relay — Sharing</div>
    <div class="app-chip"><span class="app-chip-dot" style="background:var(--color-trail)"></span>Trail — Trips</div>
  </div>

  <!-- SECTION: THE GRID -->
  <div class="section-label" style="grid-row: span 4; padding-block: var(--G);">
    <h2 class="section-title">The System</h2>
    <span class="section-tag">01 / 03</span>
  </div>

  <!-- FEATURE CARDS -->
  <div class="feature-grid">

    <div class="feature-card feat-sm">
      <div>
        <div class="feat-icon" style="background:rgba(74,222,128,.1)">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#4ade80" stroke-width="1.5"><rect x="1" y="1" width="7" height="7" rx="1"/><rect x="10" y="1" width="7" height="7" rx="1"/><rect x="1" y="10" width="7" height="7" rx="1"/><rect x="10" y="10" width="7" height="7" rx="1"/></svg>
        </div>
        <div class="feat-title">28px Grid</div>
        <p class="feat-body">Every element in the system snaps to a 28px grid. Columns, rows, gaps, and padding — all multiples of 7px. Card corners land on dots.</p>
      </div>
      <div style="font-family:var(--font-mono);font-size:10px;color:var(--color-text-4);margin-top:var(--G)">--spacing-g: 28px</div>
    </div>

    <div class="feature-card feat-lg">
      <div>
        <div class="feat-icon" style="background:rgba(34,211,238,.1)">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#22d3ee" stroke-width="1.5"><path d="M1 9h16M9 1v16M4 4l10 10M14 4L4 14"/></svg>
        </div>
        <div class="feat-title">Auto-Fill Columns</div>
        <p class="feat-body">Declare the grid once. The browser generates exactly as many 28px columns as fit. Elements span N columns and M rows. No breakpoints for placement — only for span changes.</p>
      </div>
      <div class="code-card" style="margin-top:var(--G)">
        <div class="code-topbar">
          <div class="code-dot" style="background:#ff5f56"></div>
          <div class="code-dot" style="background:#ffbd2e"></div>
          <div class="code-dot" style="background:#27c93f"></div>
          <span class="code-title">layout.css</span>
        </div>
      </div>
    </div>

    <div class="feature-card feat-full">
      <div style="display:flex;gap:var(--G);align-items:flex-start;flex-wrap:wrap">
        <div style="flex:1;min-width:200px">
          <div class="feat-icon" style="background:rgba(167,139,250,.1)">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#a78bfa" stroke-width="1.5"><circle cx="9" cy="9" r="7"/><path d="M9 5v4l3 3"/></svg>
          </div>
          <div class="feat-title">Tailwind v5 Tokens</div>
          <p class="feat-body">All design tokens live in <code style="font-family:var(--font-mono);font-size:11px;color:var(--color-text-2)">@theme</code>. No config file. Import once, use everywhere via Tailwind utilities or raw CSS variables.</p>
        </div>
        <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start;padding-top:4px">
          <div style="font-family:var(--font-mono);font-size:10px;color:var(--color-text-4);line-height:2">
            <div><span style="color:var(--color-success)">g/4</span> = 7px</div>
            <div><span style="color:var(--color-success)">g/2</span> = 14px</div>
            <div><span style="color:var(--color-success)">g</span>   = 28px</div>
            <div><span style="color:var(--color-success)">g×1.5</span> = 42px</div>
            <div><span style="color:var(--color-success)">g×2</span> = 56px</div>
            <div><span style="color:var(--color-success)">g×3</span> = 84px</div>
          </div>
          <div style="font-family:var(--font-mono);font-size:10px;color:var(--color-text-4);line-height:2">
            <div><span style="color:var(--color-info)">r1</span> = 7px</div>
            <div><span style="color:var(--color-info)">r2</span> = 14px</div>
            <div><span style="color:var(--color-info)">r3</span> = 21px</div>
            <div><span style="color:var(--color-info)">r4</span> = 28px</div>
            <div><span style="color:var(--color-info)">ctrl-sm</span> = 42px</div>
            <div><span style="color:var(--color-info)">ctrl-md</span> = 56px</div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- SECTION: COMPONENTS -->
  <div class="section-label" style="grid-row: span 4; padding-block: var(--G);">
    <h2 class="section-title">Components</h2>
    <span class="section-tag">02 / 03</span>
  </div>

  <!-- COMPONENT SHOWCASE -->
  <div class="showcase">

    <!-- Badges -->
    <div class="badge-row">
      <span class="badge badge-success">Success</span>
      <span class="badge badge-error">Error</span>
      <span class="badge badge-warning">Warning</span>
      <span class="badge badge-info">Info</span>
      <span class="badge badge-new">New</span>
      <span class="badge badge-neutral">Neutral</span>
    </div>

    <!-- Buttons -->
    <div style="grid-column:1/-1;grid-row:span 3;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
      <button class="btn btn-sm btn-primary">Primary</button>
      <button class="btn btn-sm btn-ghost">Ghost</button>
      <button class="btn btn-sm btn-ghost" style="background:var(--color-error-dim);color:var(--color-error);border-color:var(--color-error-border)">Danger</button>
      <button class="btn btn-md btn-primary">Primary MD</button>
      <button class="btn btn-md btn-ghost">Ghost MD</button>
    </div>

    <!-- Mini stat cards: each span 5 × 5 rows -->
    <div class="mini-stat">
      <div class="mini-label">Revenue</div>
      <div class="mini-value">84.2k</div>
      <div class="mini-change" style="color:var(--color-success);font-size:10px">↑ 12.4%</div>
    </div>
    <div class="mini-stat">
      <div class="mini-label">Users</div>
      <div class="mini-value">21.8k</div>
      <div class="mini-change" style="color:var(--color-success);font-size:10px">↑ 4.1%</div>
    </div>
    <div class="mini-stat">
      <div class="mini-label">Conv.</div>
      <div class="mini-value">3.7%</div>
      <div class="mini-change" style="color:var(--color-error);font-size:10px">↓ 0.3%</div>
    </div>

    <!-- Input demo -->
    <div class="input-demo">
      <input class="input" type="text" placeholder="Search campaigns…">
      <div style="display:flex;gap:10px">
        <input class="input" type="email" placeholder="Email address" style="flex:1">
        <button class="btn btn-sm btn-primary">Subscribe</button>
      </div>
    </div>

    <!-- Progress bars -->
    <div class="progress-demo">
      <div class="prog-row">
        <span class="prog-label">Grove</span>
        <div class="progress"><div class="progress-fill" style="width:84%;background:var(--color-grove)"></div></div>
        <span class="prog-pct">84%</span>
      </div>
      <div class="prog-row">
        <span class="prog-label">Vault</span>
        <div class="progress"><div class="progress-fill" style="width:61%;background:var(--color-vault)"></div></div>
        <span class="prog-pct">61%</span>
      </div>
      <div class="prog-row">
        <span class="prog-label">Tide</span>
        <div class="progress"><div class="progress-fill" style="width:45%;background:var(--color-tide)"></div></div>
        <span class="prog-pct">45%</span>
      </div>
      <div class="prog-row">
        <span class="prog-label">Vine</span>
        <div class="progress"><div class="progress-fill" style="width:32%;background:var(--color-vine)"></div></div>
        <span class="prog-pct">32%</span>
      </div>
    </div>

  </div>

  <!-- CTA -->
  <div class="cta">
    <p class="eyebrow" style="justify-content:center">Open source · MIT</p>
    <h2 class="cta-title">SNAP TO THE <em>GRID</em></h2>
    <p class="cta-sub">No build step. No config. Just import and go.</p>
    <div class="cta-actions">
      <a href="#" class="btn btn-lg btn-primary">Get Neoworks Free</a>
      <a href="#" class="btn btn-lg btn-ghost">Read the Docs</a>
    </div>
  </div>

  <!-- FOOTER -->
  <footer>
    <span>Neoworks Design System © 2026</span>
    <span>Built on 28px</span>
  </footer>

</div>
</body>
</html>