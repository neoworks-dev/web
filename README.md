# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
bun x sv@0.15.0 create --template minimal --types ts --add tailwindcss="plugins:typography,forms" --install bun ./apps/neoworks.dev
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Dotted world map

`ActiveUsersMap.svelte` renders a dotted world map that tints each country from
gray toward blue by its share of active users. The dot geometry is not drawn by
hand — it is generated from [Natural Earth](https://www.naturalearthdata.com/)
country polygons (`ne_110m_admin_0_countries`) and committed as
`src/lib/worldDots.ts`.

Each entry in `DOTS` is `[x, y, countryIndex]` in the exported `VIEW_W × VIEW_H`
viewBox; `DOT_CODES` maps `countryIndex` to an ISO 3166-1 alpha-2 code so the
component can colour dots per country.

To regenerate (e.g. to change dot density), edit `STEP` in the script and run:

```sh
node scripts/gen-world-dots.mjs
```

The script downloads the source polygons, rasterizes them into a lon/lat grid via
point-in-polygon, and overwrites `src/lib/worldDots.ts`. Smaller `STEP` = more
dots (finer map, larger file).
