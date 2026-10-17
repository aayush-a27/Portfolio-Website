# Aayush Bhadula — Portfolio

Single-page React + Vite portfolio with WebGL image effects, an interactive 3D hero, a scroll-scrubbed frame sequence, and light/dark themes. Frontend only: no backend.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run lint
```

## Where things live

| Path | Purpose |
| --- | --- |
| `src/data/portfolio.js` | **All portfolio content** (text, links, skills, projects). Edit content here only. |
| `src/config/media.js` | Every visual asset: hero model, scroll sequence frames, 3D work gallery. |
| `src/index.css` | Design tokens for both themes, typography, buttons, shared primitives. |
| `src/hooks/useReveals.js` | Declarative scroll reveals (`data-reveal="chars|words|fade|stagger|clip|line|scrub-words"`, `data-speed`). |
| `src/lib/motion.js` | GSAP + ScrollTrigger setup and the shared motion vocabulary. |
| `src/lib/smoothScroll.js` | Lenis smooth scrolling, anchor navigation, scroll locking. |
| `src/lib/webgl/` | Shared WebGL renderer and shaders for the liquid image effects. |
| `src/lib/three/stage.js` | three.js loader (meshopt), lighting presets, model preparation. |
| `src/components/Three/` | Lazily loaded 3D components (hero model, full-screen viewer). |

## Assets you can add or replace

All of these are configured in `src/config/media.js`.

- **Hero / inspectable 3D models:** put a `.glb` in `public/models/` and reference it (`heroModel.url`, or `model:` on a gallery item). Browsers cannot load `.blend` files, so export glTF Binary from Blender. Keep models small. The katana was reduced from 408 MB to 2.5 MB with:
  `npx @gltf-transform/cli optimize in.glb out.glb --compress meshopt --texture-compress webp --texture-size 1024`
  If texture compression fails on 16-bit PNG textures, downscale them in Blender first.
- **Skills drift car:** `public/models/porsche-930.glb` (`skillsCar` in media.js). The drift path, slip angle and speed are constants at the top of `src/components/Three/CarScene.jsx` (`TRACK`, `ARC`, `MAX_SLIP`). A replacement car needs tire/rim meshes whose material names contain `tire` or `rim` for the wheels to spin.
- **3D work gallery:** add renders to `src/assets/work/` (WebP, ~1600 px) and an entry to `work3d`. An `iteration` image enables the liquid "iteration" transition.
- **Project previews:** no screenshots exist yet. Add `preview: importedImage` to a project in `src/data/portfolio.js` to give it a liquid WebGL preview.

## Accessibility & motion

- `prefers-reduced-motion` is respected: no smooth scrolling, no idle animation, and image transitions become short cross-fades.
- The custom cursor only runs on fine pointers. Touch devices keep native behaviour.
- Without WebGL, the hero shows the still render and image transitions fall back to CSS clip-path reveals.

### Development-only QA flags

Add these to the dev server URL (they are stripped from production builds):

- `?motion`: preview full motion even if your OS requests reduced motion (Windows: *Settings → Accessibility → Visual effects → Animation effects*).
- `?nowebgl`: exercise the non-WebGL fallbacks.
