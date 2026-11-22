// Meridian Vault: tuning constants for the whole game.
// One place for every number that shapes how the heist feels.
export const FIELD = { width: 960, height: 600 };
export const STEP = 1 / 60;
export const LIVES = 3;
export const COINS_PER_FLOOR = 3;
export const BEST_KEY = 'meridian-vault-best';

// The thief.
export const PLAYER = {
  radius: 11,
  walk: 165,
  sprint: 248,
  crouch: 92,
};

// Guards: patrol speed, chase speed (a touch faster than a walk, slower than a sprint),
// vision range and half-angle, and how close a guard must get to catch the thief.
export const GUARD = {
  radius: 12,
  patrol: 62,
  investigate: 95,
  chase: 178,
  range: 195,
  halfAngle: 0.56, // ~32 degrees
  catchDistance: 22,
};

// Wall cameras: fixed, sweeping, a little longer sight than a guard, narrower cone.
export const CAMERA = {
  range: 215,
  halfAngle: 0.49, // ~28 degrees
  sweepSpeed: 0.55, // radians per second
};

// Detection: 0..100. Rises while any guard or camera sees the thief, falls when unseen.
// At 100 the alarm trips; guards chase until the thief stays unseen for ALARM_COOL seconds.
export const DETECTION = {
  guardNear: 100, // per second, point blank
  guardFar: 30, // per second, at the edge of the cone
  cameraNear: 62,
  cameraFar: 20,
  crouchFactor: 0.55,
  shadowFactor: 0.55,
  sprintFactor: 1.25,
  decay: 30, // per second while unseen
  alarmCool: 3.5, // seconds unseen to stand the alarm down
  alarmReset: 35, // detection after the alarm stands down
};

// Noise: sprinting and a landing coin pull guards in earshot over to look.
export const NOISE = {
  sprintRadius: 230,
  sprintPulse: 0.4, // seconds between noise pulses while sprinting
  coinRadius: 300,
  coinFlight: 0.35, // seconds the coin spends in the air
  investigateTime: 2.2, // seconds a guard looks around an investigated point
};

// Scoring.
export const SCORE = {
  loot: 500,
  floorClear: 1000,
  ghostBonus: 300, // a floor cleared without tripping the alarm
  catchPenalty: 150,
  timePar: [75, 90, 105], // seconds per floor; beating par pays 10/sec
};
