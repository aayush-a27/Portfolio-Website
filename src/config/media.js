/*
 * Media configuration — every visual asset the redesign uses, in one place.
 *
 * Sources (copied from Desktop/models and optimised for the web):
 *   public/models/katana.glb          ← models/Katana.glb (408 MB → 2.5 MB:
 *                                       geometry simplified, 1K WebP textures,
 *                                       meshopt compression)
 *   public/models/katana-poster.webp  ← models/Katana.png
 *   src/assets/work/*.webp            ← models/*.png renders (1600 px WebP)
 *   public/models/porsche-930.glb     ← Downloads/porsche-911930-turbo-1975…glb
 *
 * To add or replace media, edit this file; components read from here.
 */
import katana from '../assets/work/katana.webp';
import katanaScratched from '../assets/work/katana-scratched.webp';
import streetLamp from '../assets/work/street-lamp.webp';
import streetLamp2 from '../assets/work/street-lamp-2nd-iteration.webp';
import telephone from '../assets/work/telephone.webp';
import telephoneBooth from '../assets/work/telephone-booth.webp';
import monsterGreen from '../assets/work/monster-green.webp';
import monsterOrange from '../assets/work/monster-can-orange.webp';
import swordFog from '../assets/work/sword-fog.webp';
import bird from '../assets/work/bird.webp';
import birdCycles from '../assets/work/bird-cycles.webp';
import perfume from '../assets/work/perfume-model.webp';

/* ------------------------------------------------------------ hero model */

export const heroModel = {
  url: '/models/katana.glb',
  poster: '/models/katana-poster.webp',
  alt: 'Katana — 3D model',
};

/* ------------------------------------------------------ skills drift car */

/*
 * Scroll-scrubbed drift in the Skills section.
 * Source: Downloads/porsche-911930-turbo-1975-wwwvecarzcom/source/
 * free_1975_porsche_911_930_turbo.glb (90 MB → 3.5 MB: textures downscaled
 * to 1K WebP in Blender, geometry simplified, meshopt compression; tire and
 * rim meshes kept separate so the wheels can spin and steer).
 */
export const skillsCar = {
  url: '/models/porsche-930.glb',
};

/* -------------------------------------------------------- 3D work gallery */

/*
 * Titles come from the source file names. `iteration` pairs a render with
 * its later version (the liquid transition melts from one to the other).
 * `model` enables the interactive 3D inspector — add a GLB to
 * public/models and reference it here to make more pieces inspectable.
 */
export const workTitle = { lead: '3D', accent: 'Work' };
export const workMedium = 'Blender';

export const work3d = [
  {
    id: 'katana',
    title: 'Katana',
    image: katana,
    iteration: katanaScratched,
    model: heroModel.url,
  },
  {
    id: 'street-lamp',
    title: 'Street Lamp',
    image: streetLamp,
    iteration: streetLamp2,
  },
  {
    id: 'telephone-booth',
    title: 'Telephone Booth',
    image: telephone,
    iteration: telephoneBooth,
  },
  {
    id: 'monster-can',
    title: 'Monster Can',
    image: monsterGreen,
    iteration: monsterOrange,
  },
  {
    id: 'sword',
    title: 'Sword',
    image: swordFog,
  },
  {
    id: 'bird',
    title: 'Bird',
    image: bird,
    iteration: birdCycles,
  },
  {
    id: 'perfume-bottle',
    title: 'Perfume Bottle',
    image: perfume,
  },
];
