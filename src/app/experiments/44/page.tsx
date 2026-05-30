"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Brain, Zap, Activity, Sparkles } from "lucide-react";

// ═══════════════════════════════════════════════════════════════
//  INTERFACES
// ═══════════════════════════════════════════════════════════════

interface NeuronData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  activation: number;
  membrane: number;
  phase: number;
  lastFired: number;
  type: "e" | "i";
  connCount: number;
}

interface SynapseData {
  from: number;
  to: number;
  weight: number;
  curvature: number;
  impulses: ImpulseData[];
  visualStrength: number;
}

interface ImpulseData {
  progress: number;
  speed: number;
  strength: number;
}

interface ShockwaveData {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
}

interface PulseRingData {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  hue: number;
}

// ═══════════════════════════════════════════════════════════════
//  COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function SynapticGenesis() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState({ neurons: 0, synapses: 0, firingRate: 0 });
  const [showTitle, setShowTitle] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    // ─── Configuration (responsive) ─────────────────────
    const isMobile = w < 768;
    const INITIAL_COUNT = isMobile ? 60 : 100;
    const MAX_NEURONS = isMobile ? 280 : 500;
    const CONNECTION_DIST = isMobile ? 105 : 140;
    const MAX_CONNECTIONS = 6;
    const FIRE_THRESHOLD = 0.8;
    const REFRACTORY_MS = 500;
    const SPONTANEOUS_CHANCE = 0.0004;
    const GROWTH_INTERVAL = 2500;
    const TRAIL_ALPHA = 0.065;

    // ─── Mutable State ──────────────────────────────────
    const mouse = { x: w / 2, y: h / 2, down: false };
    const neurons: NeuronData[] = [];
    const synapses: SynapseData[] = [];
    const connectionKeys = new Set<string>();
    const pulseRings: PulseRingData[] = [];
    const shockwaves: ShockwaveData[] = [];

    let frameCount = 0;
    let lastTime = performance.now();
    let lastGrowthTime = performance.now();
    let firesThisPeriod = 0;
    let lastStatTime = performance.now();

    // ─── Ambient Particles ──────────────────────────────
    const NUM_AMBIENT = isMobile ? 80 : 180;
    const ambient = Array.from({ length: NUM_AMBIENT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      alpha: 0.02 + Math.random() * 0.06,
      size: Math.random() < 0.08 ? 1.5 : 0.5 + Math.random() * 0.5,
    }));

    // ─── Genesis: Spawn Initial Neurons at Center ───────
    for (let i = 0; i < INITIAL_COUNT; i++) {
      const angle =
        (i / INITIAL_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
      const speed = 1.5 + Math.random() * 3;
      neurons.push({
        x: w / 2 + (Math.random() - 0.5) * 8,
        y: h / 2 + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.5 + Math.random() * 2,
        activation: 0.3 + Math.random() * 0.3,
        membrane: 0,
        phase: Math.random() * Math.PI * 2,
        lastFired: -10000,
        type: Math.random() > 0.12 ? "e" : "i",
        connCount: 0,
      });
    }

    // ─── Helpers ────────────────────────────────────────
    const spawnNeuron = (x: number, y: number, vx = 0, vy = 0) => {
      if (neurons.length >= MAX_NEURONS) return;
      neurons.push({
        x,
        y,
        vx,
        vy,
        radius: 1.5 + Math.random() * 2,
        activation: 0.5,
        membrane: 0.1,
        phase: Math.random() * Math.PI * 2,
        lastFired: -10000,
        type: Math.random() > 0.12 ? "e" : "i",
        connCount: 0,
      });
    };

    const cKey = (a: number, b: number) =>
      a < b ? `${a}-${b}` : `${b}-${a}`;

    const bezPt = (
      t: number,
      x0: number,
      y0: number,
      cx: number,
      cy: number,
      x1: number,
      y1: number
    ) => {
      const u = 1 - t;
      return {
        x: u * u * x0 + 2 * u * t * cx + t * t * x1,
        y: u * u * y0 + 2 * u * t * cy + t * t * y1,
      };
    };

    // ─── Event Handlers ─────────────────────────────────
    const handleResize = () => {
      const pw = w,
        ph = h;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      for (const n of neurons) {
        n.x = (n.x / pw) * w;
        n.y = (n.y / ph) * h;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseDown = (e: MouseEvent) => {
      mouse.down = true;
      shockwaves.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: isMobile ? 300 : 450,
        strength: 1,
      });
    };

    const handleMouseUp = () => {
      mouse.down = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      mouse.x = t.clientX;
      mouse.y = t.clientY;
      mouse.down = true;
      shockwaves.push({
        x: t.clientX,
        y: t.clientY,
        radius: 0,
        maxRadius: 300,
        strength: 1,
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      mouse.down = false;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);

    // ─── Render Loop ────────────────────────────────────
    let frameId: number;

    const render = () => {
      const now = performance.now();
      lastTime = now;
      frameCount++;
      let firesThisFrame = 0;

      // ── 1. Background Fade (trail persistence) ──
      ctx.fillStyle = `rgba(0, 0, 0, ${TRAIL_ALPHA})`;
      ctx.fillRect(0, 0, w, h);

      // ── 2. Ambient Dust Particles ──
      for (const p of ambient) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x += w;
        if (p.x > w) p.x -= w;
        if (p.y < 0) p.y += h;
        if (p.y > h) p.y -= h;
        ctx.fillStyle = `rgba(140, 170, 255, ${p.alpha})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      // ── 3. Neuron Physics ──
      const centerX = w / 2,
        centerY = h / 2;
      for (const n of neurons) {
        n.x += n.vx;
        n.y += n.vy;
        n.vx *= 0.996;
        n.vy *= 0.996;

        // Soft boundary — attraction toward center when far
        const dx = centerX - n.x,
          dy = centerY - n.y;
        const dc = Math.sqrt(dx * dx + dy * dy);
        const bound = Math.min(w, h) * 0.42;
        if (dc > bound) {
          const f = (dc - bound) * 0.0004;
          n.vx += (dx / dc) * f;
          n.vy += (dy / dc) * f;
        }

        // Hard boundary nudge
        if (n.x < 20) n.vx += 0.08;
        if (n.x > w - 20) n.vx -= 0.08;
        if (n.y < 20) n.vy += 0.08;
        if (n.y > h - 20) n.vy -= 0.08;

        // Phase oscillation for idle pulsing
        n.phase += 0.012 + n.activation * 0.02;
        n.activation *= 0.94;
        n.membrane *= 0.998;
      }

      // ── 4. Inter-neuron Repulsion (stochastic) ──
      const repChecks = Math.min(neurons.length * 2, 400);
      for (let c = 0; c < repChecks; c++) {
        const i = (Math.random() * neurons.length) | 0;
        const j = (Math.random() * neurons.length) | 0;
        if (i === j) continue;
        const a = neurons[i],
          b = neurons[j];
        const dx = a.x - b.x,
          dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 900 && d2 > 0) {
          const d = Math.sqrt(d2);
          const f = (30 - d) * 0.002;
          const fx = (dx / d) * f,
            fy = (dy / d) * f;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }
      }

      // ── 5. Mouse Proximity Influence ──
      const mouseR = isMobile ? 130 : 180;
      for (const n of neurons) {
        const dx = mouse.x - n.x,
          dy = mouse.y - n.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < mouseR && d > 0) {
          const inf = 1 - d / mouseR;
          n.membrane += inf * 0.015;
          // Subtle magnetic attraction
          n.vx += (dx / d) * inf * 0.015;
          n.vy += (dy / d) * inf * 0.015;
        }
      }

      // ── 6. Shockwave Propagation ──
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += 7;
        sw.strength *= 0.975;
        const ringW = 45;
        for (const n of neurons) {
          const dx = n.x - sw.x,
            dy = n.y - sw.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (Math.abs(d - sw.radius) < ringW) {
            n.membrane += sw.strength * 0.6;
          }
        }
        if (sw.radius > sw.maxRadius || sw.strength < 0.01) {
          shockwaves.splice(i, 1);
        }
      }

      // ── 7. Connection Management (amortized) ──
      const connChecks = Math.min(neurons.length * 3, 600);
      for (let c = 0; c < connChecks; c++) {
        const i = (Math.random() * neurons.length) | 0;
        const j = (Math.random() * neurons.length) | 0;
        if (i === j) continue;
        if (
          neurons[i].connCount >= MAX_CONNECTIONS ||
          neurons[j].connCount >= MAX_CONNECTIONS
        )
          continue;
        const key = cKey(i, j);
        if (connectionKeys.has(key)) continue;
        const dx = neurons[j].x - neurons[i].x;
        const dy = neurons[j].y - neurons[i].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECTION_DIST) {
          connectionKeys.add(key);
          neurons[i].connCount++;
          neurons[j].connCount++;
          synapses.push({
            from: i,
            to: j,
            weight: 0.3 + Math.random() * 0.5,
            curvature: (Math.random() - 0.5) * 0.22,
            impulses: [],
            visualStrength: 0.12,
          });
        }
      }

      // Prune distant synapses (every 90 frames)
      if (frameCount % 90 === 0) {
        for (let i = synapses.length - 1; i >= 0; i--) {
          const s = synapses[i];
          if (s.from >= neurons.length || s.to >= neurons.length) {
            connectionKeys.delete(cKey(s.from, s.to));
            synapses.splice(i, 1);
            continue;
          }
          const ni = neurons[s.from],
            nj = neurons[s.to];
          const dx = ni.x - nj.x,
            dy = ni.y - nj.y;
          if (dx * dx + dy * dy > CONNECTION_DIST * CONNECTION_DIST * 4.5) {
            connectionKeys.delete(cKey(s.from, s.to));
            ni.connCount = Math.max(0, ni.connCount - 1);
            nj.connCount = Math.max(0, nj.connCount - 1);
            synapses.splice(i, 1);
          }
        }
      }

      // ── 8. Firing Check ──
      for (let i = 0; i < neurons.length; i++) {
        const n = neurons[i];

        // Spontaneous firing (random neural noise)
        if (Math.random() < SPONTANEOUS_CHANCE) {
          n.membrane += 0.35;
        }

        // Fire if threshold reached and refractory period has passed
        if (
          n.membrane >= FIRE_THRESHOLD &&
          now - n.lastFired > REFRACTORY_MS
        ) {
          n.activation = 1;
          n.membrane = -0.15; // Hyperpolarization
          n.lastFired = now;
          firesThisPeriod++;
          firesThisFrame++;

          // Emit pulse ring
          pulseRings.push({
            x: n.x,
            y: n.y,
            radius: 0,
            maxRadius: 18 + n.radius * 5,
            alpha: 0.45,
            hue: n.type === "e" ? 190 : 320,
          });

          // Propagate impulses along outgoing synapses
          for (const s of synapses) {
            if (s.from === i) {
              s.impulses.push({
                progress: 0,
                speed: 0.018 + Math.random() * 0.008,
                strength: (n.type === "e" ? 1 : -0.6) * s.weight,
              });
              s.visualStrength = Math.min(1, s.visualStrength + 0.15);
            }
          }
        }
      }

      // ── 9. Impulse Propagation ──
      for (const s of synapses) {
        for (let i = s.impulses.length - 1; i >= 0; i--) {
          const imp = s.impulses[i];
          imp.progress += imp.speed;
          if (imp.progress >= 1) {
            // Deliver signal to target neuron
            if (s.to < neurons.length) {
              const target = neurons[s.to];
              target.membrane += imp.strength * 0.35;
              target.activation = Math.min(
                1,
                target.activation + Math.abs(imp.strength) * 0.12
              );
            }
            s.impulses.splice(i, 1);
          }
        }
        s.visualStrength = Math.max(0.06, s.visualStrength * 0.9985);
      }

      // ── 10. Autonomous Growth ──
      if (
        now - lastGrowthTime > GROWTH_INTERVAL &&
        neurons.length < MAX_NEURONS
      ) {
        lastGrowthTime = now;
        const parent = neurons[(Math.random() * neurons.length) | 0];
        const ang = Math.random() * Math.PI * 2;
        spawnNeuron(
          parent.x + Math.cos(ang) * (35 + Math.random() * 40),
          parent.y + Math.sin(ang) * (35 + Math.random() * 40),
          Math.cos(ang) * 0.5,
          Math.sin(ang) * 0.5
        );
      }

      // ── 11. Hold-to-Create ──
      if (
        mouse.down &&
        neurons.length < MAX_NEURONS &&
        frameCount % 8 === 0
      ) {
        const ang = Math.random() * Math.PI * 2;
        const dist = Math.random() * 18;
        spawnNeuron(
          mouse.x + Math.cos(ang) * dist,
          mouse.y + Math.sin(ang) * dist,
          Math.cos(ang) * 1.2,
          Math.sin(ang) * 1.2
        );
      }

      // ════════════════════════════════════════════════════
      //  DRAWING PIPELINE
      // ════════════════════════════════════════════════════

      // ── Draw Synaptic Connections ──
      for (const s of synapses) {
        if (s.from >= neurons.length || s.to >= neurons.length) continue;
        const nf = neurons[s.from],
          nt = neurons[s.to];
        const mx = (nf.x + nt.x) / 2;
        const my = (nf.y + nt.y) / 2;
        const ddx = nt.x - nf.x,
          ddy = nt.y - nf.y;
        const cpx = mx + -ddy * s.curvature;
        const cpy = my + ddx * s.curvature;

        const alpha = Math.min(0.14, 0.02 + s.visualStrength * 0.08);
        ctx.strokeStyle = `rgba(70, 130, 255, ${alpha})`;
        ctx.lineWidth = 0.4 + s.visualStrength * 0.4;
        ctx.beginPath();
        ctx.moveTo(nf.x, nf.y);
        ctx.quadraticCurveTo(cpx, cpy, nt.x, nt.y);
        ctx.stroke();
      }

      // ── Draw Impulses (additive blending) ──
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const s of synapses) {
        if (
          s.impulses.length === 0 ||
          s.from >= neurons.length ||
          s.to >= neurons.length
        )
          continue;
        const nf = neurons[s.from],
          nt = neurons[s.to];
        const mx = (nf.x + nt.x) / 2;
        const my = (nf.y + nt.y) / 2;
        const ddx = nt.x - nf.x,
          ddy = nt.y - nf.y;
        const cpx = mx + -ddy * s.curvature;
        const cpy = my + ddx * s.curvature;

        for (const imp of s.impulses) {
          const pt = bezPt(imp.progress, nf.x, nf.y, cpx, cpy, nt.x, nt.y);
          const hue = imp.strength > 0 ? 190 : 320;
          const str = Math.abs(imp.strength);
          const sz = 1.5 + str * 2;

          // Glow halo
          ctx.shadowBlur = 12;
          ctx.shadowColor = `hsla(${hue}, 100%, 65%, ${str * 0.7})`;
          ctx.fillStyle = `hsla(${hue}, 100%, 80%, ${str * 0.8})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, sz, 0, Math.PI * 2);
          ctx.fill();

          // Trailing particles
          ctx.shadowBlur = 0;
          for (let j = 1; j <= 4; j++) {
            const tt = imp.progress - j * 0.022;
            if (tt < 0) break;
            const tp = bezPt(tt, nf.x, nf.y, cpx, cpy, nt.x, nt.y);
            ctx.fillStyle = `hsla(${hue}, 100%, 65%, ${(str * 0.25) / j})`;
            ctx.beginPath();
            ctx.arc(tp.x, tp.y, sz * 0.55, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.restore();

      // ── Draw Neurons ──
      for (const n of neurons) {
        const pulse = Math.sin(n.phase) * 0.2 + 0.8;
        const isActive = n.activation > 0.12;
        const isFiring = n.activation > 0.6;

        let hue: number, sat: number, light: number;
        if (isFiring) {
          hue = n.type === "e" ? 185 : 325;
          sat = 100;
          light = 65 + n.activation * 30;
        } else if (isActive) {
          hue = n.type === "e" ? 205 : 300;
          sat = 75;
          light = 30 + n.activation * 35;
        } else {
          hue = n.type === "e" ? 230 : 275;
          sat = 35 + pulse * 15;
          light = 10 + pulse * 6 + n.membrane * 20;
        }

        const r = n.radius * (1 + n.activation * 1.5);

        // Glow halo for active neurons (additive)
        if (isActive) {
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.shadowBlur = 15 + n.activation * 22;
          ctx.shadowColor = `hsla(${hue}, ${sat}%, ${light}%, ${n.activation * 0.55})`;
          ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${n.activation * 0.2})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r * 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Neuron body
        ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${0.35 + n.activation * 0.5 + pulse * 0.1})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core (nucleus)
        ctx.fillStyle = `hsla(${hue}, ${sat}%, ${Math.min(100, light + 25)}%, ${0.6 + n.activation * 0.35})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Draw Pulse Rings (additive) ──
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let i = pulseRings.length - 1; i >= 0; i--) {
        const pr = pulseRings[i];
        pr.radius += 1.2;
        pr.alpha *= 0.91;
        if (pr.radius > pr.maxRadius || pr.alpha < 0.005) {
          pulseRings.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `hsla(${pr.hue}, 100%, 65%, ${pr.alpha})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, pr.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // ── Draw Shockwaves ──
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const sw of shockwaves) {
        // Outer ring
        ctx.strokeStyle = `rgba(80, 200, 255, ${sw.strength * 0.22})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        // Inner ring
        ctx.strokeStyle = `rgba(170, 235, 255, ${sw.strength * 0.1})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius * 0.85, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // ── Global Bloom on Heavy Cascade ──
      if (firesThisFrame > 8) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = `rgba(60, 160, 255, ${Math.min(0.035, firesThisFrame * 0.003)})`;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      // ── Mouse Hold Creation Aura ──
      if (mouse.down) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const aura = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          50
        );
        aura.addColorStop(0, "rgba(80, 180, 255, 0.06)");
        aura.addColorStop(1, "transparent");
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ── Stats Update (throttled to prevent excessive renders) ──
      if (now - lastStatTime > 600) {
        const elapsed = now - lastStatTime;
        const rate = Math.round(firesThisPeriod * (1000 / elapsed));
        setStats({
          neurons: neurons.length,
          synapses: synapses.length,
          firingRate: rate,
        });
        firesThisPeriod = 0;
        lastStatTime = now;
      }

      frameId = requestAnimationFrame(render);
    };

    // Dismiss title after 5 seconds
    const titleTimer = setTimeout(() => setShowTitle(false), 5000);

    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(titleTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  // ═══════════════════════════════════════════════════════════
  //  JSX
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden cursor-crosshair font-sans select-none">
      {/* Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Cinematic Vignette */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* UI Overlay */}
      <div className="relative z-10 w-full h-full flex flex-col pointer-events-none p-5 md:p-8">
        {/* ─── Top Navigation Bar ─── */}
        <nav className="flex items-start justify-between">
          {/* Back Button */}
          <Link href="/" className="pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/[0.07] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 text-white/50" />
              <span className="text-[11px] text-white/50 font-medium tracking-wide hidden sm:inline">
                Return to Archive
              </span>
            </motion.div>
          </Link>

          {/* Live Stats Panel */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-2.5 px-5 py-4 rounded-2xl bg-white/[0.025] backdrop-blur-xl border border-white/[0.05]"
          >
            <div className="flex items-center gap-2.5">
              <Brain className="w-3.5 h-3.5 text-cyan-400/50" />
              <span className="text-[9px] text-white/30 font-mono tracking-[0.15em] uppercase w-[3.5rem]">
                Neurons
              </span>
              <span className="text-[11px] text-cyan-300/70 font-mono font-bold tabular-nums w-8 text-right">
                {stats.neurons}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Activity className="w-3.5 h-3.5 text-violet-400/50" />
              <span className="text-[9px] text-white/30 font-mono tracking-[0.15em] uppercase w-[3.5rem]">
                Synapses
              </span>
              <span className="text-[11px] text-violet-300/70 font-mono font-bold tabular-nums w-8 text-right">
                {stats.synapses}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Zap className="w-3.5 h-3.5 text-amber-400/50" />
              <span className="text-[9px] text-white/30 font-mono tracking-[0.15em] uppercase w-[3.5rem]">
                Hz
              </span>
              <span className="text-[11px] text-amber-300/70 font-mono font-bold tabular-nums w-8 text-right">
                {stats.firingRate}
              </span>
            </div>
          </motion.div>
        </nav>

        {/* ─── Center Title (fades out) ─── */}
        <div className="flex-1 flex items-center justify-center">
          <AnimatePresence>
            {showTitle && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, filter: "blur(12px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.02, filter: "blur(8px)", transition: { duration: 1.2 } }}
                transition={{
                  duration: 1.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-center pointer-events-none"
              >
                <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200/80 to-transparent leading-none">
                  SYNAPTIC
                </h1>
                <h2 className="text-lg sm:text-xl md:text-3xl font-extralight tracking-[0.35em] text-cyan-400/30 mt-2 md:mt-3">
                  GENESIS
                </h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Bottom Bar ─── */}
        <footer className="flex items-end justify-between">
          {/* Interaction Hints */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-1.5"
          >
            <div className="flex items-center gap-2 text-[10px] text-white/15 font-mono tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>MOVE to excite</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-white/15 font-mono tracking-wider">
              <Zap className="w-3 h-3" />
              <span>CLICK to cascade</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-white/15 font-mono tracking-wider">
              <Brain className="w-3 h-3" />
              <span>HOLD to create</span>
            </div>
          </motion.div>

          {/* Experiment ID */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="text-[10px] text-white/10 font-mono tracking-[0.2em]"
          >
            EXP — 044
          </motion.span>
        </footer>
      </div>

      {/* Noise Texture Overlay */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")',
        }}
      />
    </div>
  );
}
