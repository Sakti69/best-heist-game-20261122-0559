// Meridian Vault: everything the eye sees — the floor, the cones, the loot, the thief,
// and the HUD bar above the canvas (floor, loot, coins, lives, score, time, alarm meter).
import { FIELD, GUARD, CAMERA, PLAYER, LIVES } from './config.js';
import { rayDistance } from './world.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

const CONE_RAYS = 26;

function conePolygon(ctx, x, y, angle, range, halfAngle, blockers) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let i = 0; i <= CONE_RAYS; i += 1) {
    const a = angle - halfAngle + (2 * halfAngle * i) / CONE_RAYS;
    const d = rayDistance(x, y, a, range, blockers);
    ctx.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
  }
  ctx.closePath();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function drawFloor(state) {
    const level = state.level;
    // Night floor: deep slate with a faint tile grid.
    ctx.fillStyle = '#1b2334';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.strokeStyle = 'rgba(255,255,255,0.045)';
    ctx.lineWidth = 1;
    for (let x = 48; x < FIELD.width; x += 48) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, FIELD.height); ctx.stroke();
    }
    for (let y = 48; y < FIELD.height; y += 48) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(FIELD.width, y); ctx.stroke();
    }
    // Shadow patches: dark floor where detection crawls.
    for (const s of level.shadow) {
      ctx.fillStyle = 'rgba(0,0,0,0.42)';
      roundRect(ctx, s.x, s.y, s.w, s.h, 14);
      ctx.fill();
    }
    // Exit doorway in the top wall.
    const e = level.exit;
    ctx.fillStyle = state.exitOpen ? '#1f7a4a' : '#5a2a2a';
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.fillStyle = state.exitOpen ? '#37d67a' : '#c05a5a';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(state.exitOpen ? 'EXIT — OPEN' : 'EXIT — LOCKED', e.x + e.w / 2, e.y + e.h / 2 + 1);
    // Loot, each with a pulsing halo so it reads at a glance.
    for (const l of state.loot) {
      if (l.taken) continue;
      const pulse = 0.5 + 0.3 * Math.sin(state.clock * 3 + l.x);
      ctx.beginPath();
      ctx.arc(l.x, l.y, 20 + pulse * 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,211,77,0.16)';
      ctx.fill();
      if (l.kind === 'gold') {
        ctx.fillStyle = '#ffd34d';
        roundRect(ctx, l.x - 13, l.y - 7, 26, 14, 3);
        ctx.fill();
        ctx.fillStyle = '#b98a1d';
        ctx.fillRect(l.x - 13, l.y + 2, 26, 3);
      } else if (l.kind === 'ledger') {
        ctx.fillStyle = '#b678f0';
        roundRect(ctx, l.x - 10, l.y - 12, 20, 24, 2);
        ctx.fill();
        ctx.fillStyle = '#e8d5ff';
        ctx.fillRect(l.x - 6, l.y - 8, 12, 3);
        ctx.fillRect(l.x - 6, l.y - 2, 12, 3);
        ctx.fillRect(l.x - 6, l.y + 4, 8, 3);
      } else {
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = '#7ee7ff';
        ctx.fillRect(-10, -10, 20, 20);
        ctx.fillStyle = '#c8f6ff';
        ctx.fillRect(-10, -10, 20, 6);
        ctx.restore();
      }
      ctx.fillStyle = '#ffe9a8';
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.fillText(l.name.toUpperCase(), l.x, l.y + 30);
    }
  }

  function drawCover(state) {
    for (const c of state.level.cover) {
      if (c.kind === 'desk') {
        ctx.fillStyle = '#6b4f2a';
        roundRect(ctx, c.x, c.y, c.w, c.h, 6);
        ctx.fill();
        ctx.fillStyle = '#8a6a3c';
        ctx.fillRect(c.x + 6, c.y + 6, c.w - 12, 8);
        ctx.fillStyle = '#4a3520';
        ctx.fillRect(c.x + 8, c.y + c.h - 12, c.w - 16, 4);
      } else if (c.kind === 'pillar') {
        ctx.fillStyle = '#4a5468';
        ctx.beginPath();
        ctx.arc(c.x + c.w / 2, c.y + c.h / 2, c.w / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#67738a';
        ctx.beginPath();
        ctx.arc(c.x + c.w / 2, c.y + c.h / 2, c.w / 2 - 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (c.kind === 'planter') {
        ctx.fillStyle = '#2e4d33';
        roundRect(ctx, c.x, c.y, c.w, c.h, 6);
        ctx.fill();
        ctx.fillStyle = '#4c8a54';
        ctx.beginPath();
        ctx.arc(c.x + c.w / 2, c.y + c.h / 2 - 4, 10, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Vault: brushed steel with a gold stripe.
        ctx.fillStyle = '#5a6474';
        roundRect(ctx, c.x, c.y, c.w, c.h, 6);
        ctx.fill();
        ctx.fillStyle = '#ffd34d';
        ctx.fillRect(c.x, c.y + c.h / 2 - 3, c.w, 6);
        ctx.fillStyle = '#39404d';
        ctx.beginPath();
        ctx.arc(c.x + c.w / 2, c.y + c.h / 2, 9, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawWalls(state) {
    for (const w of state.level.walls) {
      ctx.fillStyle = '#3d4a63';
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.fillStyle = '#5a6a86';
      if (w.h <= 16) ctx.fillRect(w.x, w.y + w.h - 4, w.w, 4);
      else if (w.w <= 24) ctx.fillRect(w.x + w.w - 4, w.y, 4, w.h);
    }
  }

  function drawCones(state) {
    // Cameras first (cool blue), then guards (amber; red while the alarm is up).
    for (const c of state.cameras) {
      ctx.fillStyle = 'rgba(120,180,255,0.20)';
      conePolygon(ctx, c.x, c.y, c.angle, CAMERA.range, CAMERA.halfAngle, state.blockers);
      ctx.fill();
      ctx.strokeStyle = 'rgba(150,200,255,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    for (const g of state.guards) {
      let fill = 'rgba(245,166,35,0.26)';
      let stroke = 'rgba(245,166,35,0.55)';
      if (state.alarm || g.state === 'chase') {
        fill = 'rgba(255,60,60,0.34)';
        stroke = 'rgba(255,80,80,0.7)';
      } else if (g.state === 'investigate' || g.state === 'look') {
        fill = 'rgba(255,140,40,0.32)';
        stroke = 'rgba(255,140,40,0.65)';
      }
      ctx.fillStyle = fill;
      conePolygon(ctx, g.x, g.y, g.angle, GUARD.range, GUARD.halfAngle, state.blockers);
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  function drawActors(state) {
    // Cameras: wall boxes with a lens.
    for (const c of state.cameras) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.angle);
      ctx.fillStyle = '#222a3a';
      ctx.fillRect(-4, -8, 16, 16);
      ctx.fillStyle = '#9ec8ff';
      ctx.beginPath();
      ctx.arc(12, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // Guards: amber bodies, a nose for facing, "!" when suspicious, "!!" on the hunt.
    for (const g of state.guards) {
      ctx.fillStyle = state.alarm || g.state === 'chase' ? '#e5484d' : '#f5a623';
      ctx.beginPath();
      ctx.arc(g.x, g.y, GUARD.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1b2334';
      ctx.beginPath();
      ctx.arc(g.x + Math.cos(g.angle) * 6, g.y + Math.sin(g.angle) * 6, 4, 0, Math.PI * 2);
      ctx.fill();
      if (g.state === 'investigate' || g.state === 'look') {
        ctx.fillStyle = '#ffd34d';
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', g.x, g.y - 18);
      } else if (g.state === 'chase' || state.alarm) {
        ctx.fillStyle = '#ff5a5a';
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('!!', g.x, g.y - 18);
      }
    }
    // The flying coin.
    if (state.coin) {
      const c = state.coin;
      const k = Math.min(1, c.t / 0.35);
      const x = c.x0 + (c.x1 - c.x0) * k;
      const y = c.y0 + (c.y1 - c.y0) * k - Math.sin(k * Math.PI) * 26;
      ctx.fillStyle = '#ffd34d';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,211,77,0.5)';
      ctx.beginPath();
      ctx.arc(c.x1, c.y1, 10, 0, Math.PI * 2);
      ctx.stroke();
    }
    // The thief, Rook: teal, with a facing wedge; crouched he hugs the floor.
    const p = state.player;
    if (state.mode !== 'title' || p.invuln > 0) {
      const blink = p.invuln > 0 && Math.floor(state.clock * 10) % 2 === 0;
      if (!blink) {
        ctx.fillStyle = '#35e0c8';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.crouch ? 9 : PLAYER.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0b2e2a';
        ctx.beginPath();
        ctx.moveTo(p.x + Math.cos(p.angle) * 12, p.y + Math.sin(p.angle) * 12);
        ctx.lineTo(p.x + Math.cos(p.angle + 2.5) * 7, p.y + Math.sin(p.angle + 2.5) * 7);
        ctx.lineTo(p.x + Math.cos(p.angle - 2.5) * 7, p.y + Math.sin(p.angle - 2.5) * 7);
        ctx.closePath();
        ctx.fill();
        if (p.crouch) {
          ctx.strokeStyle = 'rgba(53,224,200,0.7)';
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    }
    // Spawn marker: the way in.
    ctx.fillStyle = 'rgba(53,224,200,0.35)';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('IN', state.level.spawn.x, state.level.spawn.y + 26);
  }

  function panel(x, y, w, h) {
    ctx.fillStyle = 'rgba(8,12,22,0.82)';
    roundRect(ctx, x, y, w, h, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,211,77,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawOverlay(state, screen, best) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (screen === SCREEN_TITLE) {
      ctx.fillStyle = 'rgba(8,12,22,0.42)';
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      ctx.fillStyle = '#ffd34d';
      ctx.font = 'bold 54px system-ui, sans-serif';
      ctx.fillText('MERIDIAN VAULT', FIELD.width / 2, 150);
      ctx.fillStyle = '#e8eefc';
      ctx.font = '20px system-ui, sans-serif';
      ctx.fillText('You are Rook. Three floors. Nine pieces of loot. One way out.', FIELD.width / 2, 200);
      ctx.font = '16px system-ui, sans-serif';
      ctx.fillStyle = '#9fb0cc';
      ctx.fillText('WASD / arrows — move      Shift — sprint (loud)      C — crouch (quiet, slow)', FIELD.width / 2, 250);
      ctx.fillText('Click — toss a coin to pull a guard away      P — pause      M — mute', FIELD.width / 2, 276);
      ctx.fillStyle = '#ffd34d';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.fillText('Lift all the loot, then reach the green EXIT. Do not get caught.', FIELD.width / 2, 322);
      ctx.fillStyle = '#35e0c8';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText('Press SPACE or click to start', FIELD.width / 2, 380);
      if (best > 0) {
        ctx.fillStyle = '#9fb0cc';
        ctx.font = '15px system-ui, sans-serif';
        ctx.fillText(`Best score: ${best}`, FIELD.width / 2, 420);
      }
    } else if (screen === SCREEN_PAUSED) {
      ctx.fillStyle = 'rgba(8,12,22,0.6)';
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      panel(FIELD.width / 2 - 190, 220, 380, 130);
      ctx.fillStyle = '#e8eefc';
      ctx.font = 'bold 30px system-ui, sans-serif';
      ctx.fillText('PAUSED', FIELD.width / 2, 262);
      ctx.fillStyle = '#9fb0cc';
      ctx.font = '16px system-ui, sans-serif';
      ctx.fillText('P or Space to keep moving', FIELD.width / 2, 306);
    } else if (state.mode === 'floorclear') {
      panel(FIELD.width / 2 - 230, 240, 460, 110);
      ctx.fillStyle = '#37d67a';
      ctx.font = 'bold 30px system-ui, sans-serif';
      ctx.fillText('FLOOR CLEAR', FIELD.width / 2, 272);
      ctx.fillStyle = '#e8eefc';
      ctx.font = '16px system-ui, sans-serif';
      ctx.fillText(state.message, FIELD.width / 2, 312);
    } else if (state.mode === 'win') {
      ctx.fillStyle = 'rgba(8,12,22,0.62)';
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      panel(FIELD.width / 2 - 260, 150, 520, 260);
      ctx.fillStyle = '#ffd34d';
      ctx.font = 'bold 36px system-ui, sans-serif';
      ctx.fillText('THE VAULT IS YOURS', FIELD.width / 2, 200);
      ctx.fillStyle = '#e8eefc';
      ctx.font = '19px system-ui, sans-serif';
      ctx.fillText(`Score ${state.score}   •   Time ${formatTime(state.time)}`, FIELD.width / 2, 252);
      ctx.fillText(`Loot ${state.stats.loot}/9   •   Alarms ${state.stats.alarms}   •   Caught ${state.stats.caught}x`, FIELD.width / 2, 284);
      ctx.fillStyle = state.stats.alarms === 0 ? '#37d67a' : '#9fb0cc';
      ctx.font = '17px system-ui, sans-serif';
      ctx.fillText(
        state.stats.alarms === 0 ? 'A perfect ghost run. No alarm, ever.' : 'Rook walks out into the night.',
        FIELD.width / 2, 322,
      );
      ctx.fillStyle = '#35e0c8';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.fillText('Press SPACE to run it again', FIELD.width / 2, 368);
    } else if (state.mode === 'over') {
      ctx.fillStyle = 'rgba(20,6,8,0.66)';
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      panel(FIELD.width / 2 - 240, 190, 480, 200);
      ctx.fillStyle = '#ff5a5a';
      ctx.font = 'bold 36px system-ui, sans-serif';
      ctx.fillText('CAUGHT', FIELD.width / 2, 240);
      ctx.fillStyle = '#e8eefc';
      ctx.font = '19px system-ui, sans-serif';
      ctx.fillText(`Score ${state.score}   •   Loot ${state.stats.loot}/9`, FIELD.width / 2, 288);
      ctx.fillStyle = '#35e0c8';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.fillText('Press SPACE to try again', FIELD.width / 2, 336);
    }
    // The spoken line: what just happened, bottom centre.
    if (state.messageTimer > 0 && screen === SCREEN_PLAY) {
      ctx.fillStyle = 'rgba(8,12,22,0.75)';
      const w = ctx.measureText(state.message).width + 28;
      roundRect(ctx, FIELD.width / 2 - w / 2, FIELD.height - 44, w, 28, 8);
      ctx.fill();
      ctx.fillStyle = state.alarm ? '#ff8a8a' : '#ffe9a8';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillText(state.message, FIELD.width / 2, FIELD.height - 29);
    }
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function draw(state, screen, best) {
    ctx.clearRect(0, 0, FIELD.width, FIELD.height);
    drawFloor(state);
    drawCover(state);
    drawWalls(state);
    drawCones(state);
    drawActors(state);
    drawOverlay(state, screen, best);
    updateHud(state, best);
  }

  function updateHud(state, best) {
    const set = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    set('hud-floor', state.level.name);
    set('hud-loot', `Loot ${state.lootTaken}/${state.loot.length}`);
    set('hud-coins', `Coins ${state.coins}`);
    set('hud-lives', '♥'.repeat(Math.max(0, state.lives)) + '♡'.repeat(Math.max(0, LIVES - state.lives)));
    set('hud-score', `Score ${state.score}`);
    set('hud-time', formatTime(state.time));
    set('hud-best', `Best ${best}`);
    const fill = document.getElementById('hud-alarm-fill');
    const label = document.getElementById('hud-alarm-label');
    if (fill) {
      fill.style.width = `${Math.round(state.detection)}%`;
      fill.style.background = state.alarm
        ? '#e5484d'
        : state.detection >= 75 ? '#e5484d' : state.detection >= 40 ? '#f5a623' : '#37d67a';
    }
    if (label) label.textContent = state.alarm ? 'ALARM!' : `ALARM ${Math.round(state.detection)}%`;
  }

  return { draw, updateHud };
}
