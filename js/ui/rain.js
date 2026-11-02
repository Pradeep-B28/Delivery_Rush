// Canvas-based diagonal rain particle effect layered over the city map.
// Uses CONFIG feature flags and reduced motion queries.
// Used by city container in rain mood shifts.

import { CONFIG } from "../content.js";
import { isReducedMotion } from "../motion.js";

const MAX_DROPS = 80;

export function createRainOverlay(canvas) {
  if (!canvas) return { start() {}, stop() {}, resize() {} };
  const ctx = canvas.getContext("2d");
  if (!ctx) return { start() {}, stop() {}, resize() {} };

  let active = false;
  let animId = null;
  const drops = [];

  function initDrops() {
    drops.length = 0;
    const w = canvas.width || 520;
    const h = canvas.height || 520;
    for (let i = 0; i < MAX_DROPS; i++) {
      drops.push({
        x: Math.random() * (w + 100) - 50,
        y: Math.random() * h,
        len: 9 + Math.random() * 9,
        speed: 9 + Math.random() * 6,
        opacity: 0.2 + Math.random() * 0.35
      });
    }
  }

  function render() {
    if (!active) return;
    if (isReducedMotion() || !CONFIG.features.rainEffect) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1.2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(165, 243, 252, 0.35)";

    ctx.beginPath();
    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 4, d.y + d.len);

      d.x -= 2.5;
      d.y += d.speed;

      if (d.y > h) {
        d.y = -d.len;
        d.x = Math.random() * (w + 100) - 50;
      }
      if (d.x < -20) {
        d.x = w + 20;
      }
    }
    ctx.stroke();

    animId = requestAnimationFrame(render);
  }

  return {
    start() {
      if (active) return;
      active = true;
      initDrops();
      animId = requestAnimationFrame(render);
    },
    stop() {
      active = false;
      if (animId) cancelAnimationFrame(animId);
      animId = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    resize(width, height) {
      canvas.width = width;
      canvas.height = height;
      initDrops();
    }
  };
}
