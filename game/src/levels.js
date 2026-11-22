// The three floors of Meridian Bank, each a hand-drawn plan.
// A rect is {x, y, w, h} in field coordinates (960x600, origin top-left).
// walls block movement and sight; cover blocks movement and sight; shadow slows detection.
// Guards walk their waypoints in a loop (a single waypoint means a sentry who stands and sweeps).
// Cameras sit on a wall and sweep their cone back and forth around baseAngle.
// loot: kind 'gold' | 'ledger' | 'diamond'. exit: the doorway that opens once all loot is lifted.
import { FIELD } from './config.js';

const WALL = 16;

function border() {
  return [
    { x: 0, y: 0, w: FIELD.width, h: WALL },
    { x: 0, y: FIELD.height - WALL, w: FIELD.width, h: WALL },
    { x: 0, y: 0, w: WALL, h: FIELD.height },
    { x: FIELD.width - WALL, y: 0, w: WALL, h: FIELD.height },
  ];
}

export const LEVELS = [
  {
    name: 'Floor 1 — The Lobby',
    par: 75,
    spawn: { x: 480, y: 545 },
    exit: { x: 430, y: 16, w: 100, h: 26 },
    walls: border(),
    // Reception desk, pillars, planters: three ways across — left, centre, right.
    cover: [
      { x: 400, y: 268, w: 160, h: 56, kind: 'desk' },
      { x: 196, y: 148, w: 44, h: 44, kind: 'pillar' },
      { x: 720, y: 148, w: 44, h: 44, kind: 'pillar' },
      { x: 196, y: 408, w: 52, h: 32, kind: 'planter' },
      { x: 712, y: 408, w: 52, h: 32, kind: 'planter' },
    ],
    shadow: [
      { x: 296, y: 300, w: 130, h: 84 },
      { x: 560, y: 380, w: 130, h: 84 },
    ],
    guards: [
      { waypoints: [{ x: 130, y: 110 }, { x: 830, y: 110 }], speed: 62 },
      { waypoints: [{ x: 830, y: 490 }, { x: 130, y: 490 }], speed: 62 },
    ],
    cameras: [
      { x: 480, y: 16, baseAngle: Math.PI / 2, sweep: 0.9 },
      { x: 16, y: 300, baseAngle: 0, sweep: 0.8 },
    ],
    loot: [
      { x: 884, y: 76, kind: 'gold', name: 'Gold Bar' },
      { x: 76, y: 524, kind: 'gold', name: 'Gold Bar' },
    ],
  },
  {
    name: 'Floor 2 — The Vault Hall',
    par: 90,
    spawn: { x: 76, y: 540 },
    exit: { x: 430, y: 16, w: 100, h: 26 },
    walls: [
      ...border(),
      // Two wing walls with a gap in the middle: left wing, centre hall, right wing.
      { x: 320, y: 0, w: 24, h: 210 },
      { x: 320, y: 390, w: 24, h: 210 },
      { x: 616, y: 0, w: 24, h: 210 },
      { x: 616, y: 390, w: 24, h: 210 },
    ],
    cover: [
      { x: 420, y: 262, w: 120, h: 76, kind: 'desk' },
      { x: 380, y: 110, w: 84, h: 42, kind: 'desk' },
      { x: 496, y: 448, w: 84, h: 42, kind: 'desk' },
      { x: 176, y: 148, w: 38, h: 38, kind: 'pillar' },
      { x: 782, y: 148, w: 38, h: 38, kind: 'pillar' },
      { x: 176, y: 448, w: 38, h: 38, kind: 'pillar' },
      { x: 782, y: 448, w: 38, h: 38, kind: 'pillar' },
    ],
    shadow: [
      { x: 344, y: 96, w: 110, h: 76 },
      { x: 500, y: 420, w: 110, h: 76 },
      { x: 80, y: 280, w: 110, h: 76 },
    ],
    guards: [
      { waypoints: [{ x: 240, y: 100 }, { x: 240, y: 500 }], speed: 62 },
      { waypoints: [{ x: 720, y: 100 }, { x: 720, y: 500 }], speed: 62 },
      { waypoints: [{ x: 480, y: 180 }], speed: 0, sweep: 1.1 },
    ],
    cameras: [
      { x: 480, y: 16, baseAngle: Math.PI / 2, sweep: 0.9 },
      { x: 944, y: 300, baseAngle: Math.PI, sweep: 0.8 },
      { x: 16, y: 300, baseAngle: 0, sweep: 0.8 },
    ],
    loot: [
      { x: 88, y: 76, kind: 'ledger', name: 'The Meridian Ledger' },
      { x: 872, y: 76, kind: 'gold', name: 'Gold Bar' },
      { x: 480, y: 540, kind: 'diamond', name: 'The Halcyon Diamond' },
    ],
  },
  {
    name: 'Floor 3 — The Bullion Room',
    par: 105,
    spawn: { x: 480, y: 300 },
    exit: { x: 430, y: 16, w: 100, h: 26 },
    walls: [
      ...border(),
      // Vault wings with a mid gap, and two pinch walls shaping the centre corridor.
      { x: 240, y: 0, w: 24, h: 180 },
      { x: 240, y: 420, w: 24, h: 180 },
      { x: 696, y: 0, w: 24, h: 180 },
      { x: 696, y: 420, w: 24, h: 180 },
      { x: 264, y: 288, w: 150, h: 24 },
      { x: 546, y: 288, w: 150, h: 24 },
    ],
    cover: [
      { x: 400, y: 108, w: 160, h: 56, kind: 'vault' },
      { x: 400, y: 436, w: 160, h: 56, kind: 'vault' },
      { x: 120, y: 268, w: 60, h: 64, kind: 'desk' },
      { x: 780, y: 268, w: 60, h: 64, kind: 'desk' },
    ],
    shadow: [
      { x: 300, y: 330, w: 120, h: 70 },
      { x: 540, y: 200, w: 120, h: 70 },
      { x: 80, y: 330, w: 100, h: 70 },
    ],
    guards: [
      { waypoints: [{ x: 300, y: 80 }, { x: 660, y: 80 }], speed: 68 },
      { waypoints: [{ x: 660, y: 520 }, { x: 300, y: 520 }], speed: 68 },
      { waypoints: [{ x: 200, y: 140 }, { x: 200, y: 460 }], speed: 62 },
      { waypoints: [{ x: 760, y: 460 }, { x: 760, y: 140 }], speed: 62 },
    ],
    cameras: [
      { x: 480, y: 16, baseAngle: Math.PI / 2, sweep: 0.9 },
      { x: 16, y: 300, baseAngle: 0, sweep: 0.8 },
      { x: 944, y: 300, baseAngle: Math.PI, sweep: 0.8 },
    ],
    loot: [
      { x: 80, y: 80, kind: 'gold', name: 'Gold Bar' },
      { x: 880, y: 80, kind: 'gold', name: 'Gold Bar' },
      { x: 80, y: 520, kind: 'diamond', name: 'The Halcyon Diamond' },
      { x: 880, y: 520, kind: 'ledger', name: 'The Meridian Ledger' },
    ],
  },
];
