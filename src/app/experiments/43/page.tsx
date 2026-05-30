"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ChevronDown, Crosshair, AlertTriangle } from "lucide-react";

// --- Types ---
interface Cloud {
  x: number;
  y: number;
  z: number; // 0.1 (far) to 1 (near)
  radius: number;
  opacity: number;
  offsetX: number;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  length: number;
  speed: number;
}

const MAX_ALTITUDE = 15000;
const TERMINAL_VELOCITY = 15; 
const PARACHUTE_SPEED = 2;
const GROUND_ALTITUDE = 0;

export default function RealisticSkydiving() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [altitude, setAltitude] = useState(MAX_ALTITUDE);
  const [speed, setSpeed] = useState(0);
  const [phase, setPhase] = useState<"freefall" | "parachute" | "landed">("freefall");
  const [warning, setWarning] = useState(false);

  const stateRef = useRef({
    alt: MAX_ALTITUDE,
    speed: 0,
    phase: "freefall" as "freefall" | "parachute" | "landed",
    mouseX: 0.5,
    mouseY: 0.5,
    tiltX: 0,
    tiltY: 0,
    time: 0
  });

  const deployParachute = useCallback(() => {
    if (stateRef.current.phase === "freefall" && stateRef.current.alt < 8000) {
      stateRef.current.phase = "parachute";
      setPhase("parachute");
      setWarning(false);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    // Generate Clouds
    const clouds: Cloud[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h * 2 - h,
      z: Math.random() * 0.9 + 0.1, // Depth
      radius: Math.random() * 300 + 150,
      opacity: Math.random() * 0.25 + 0.05,
      offsetX: Math.random() * 200 - 100,
    }));

    // Generate Wind Particles for Speed Effect
    const particles: Particle[] = Array.from({ length: 200 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random(),
      length: Math.random() * 60 + 20,
      speed: Math.random() * 15 + 15,
    }));

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      stateRef.current.mouseX = e.clientX / w;
      stateRef.current.mouseY = e.clientY / h;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    let frameId: number;
    let lastTime = performance.now();

    const drawSky = (ctx: CanvasRenderingContext2D, alt: number) => {
      const altRatio = Math.max(0, alt / MAX_ALTITUDE);
      // High alt: dark deep blue (near space), Low alt: bright sky blue
      const topColor = `hsl(215, 80%, ${10 + (1 - altRatio) * 40}%)`;
      const bottomColor = `hsl(205, 60%, ${30 + (1 - altRatio) * 50}%)`;
      
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, topColor);
      grad.addColorStop(1, bottomColor);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    };

    const drawGround = (ctx: CanvasRenderingContext2D, alt: number, tiltX: number, tiltY: number) => {
      if (alt > 10000) return; // Ground completely hidden
      
      const visibility = Math.min(1, (10000 - alt) / 6000);
      const scale = 1 + (1 - alt / 10000) * 5; // Scales up dramatically as you fall
      
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(scale, scale);
      ctx.translate(-w / 2 + tiltX * 150, -h / 2 + tiltY * 150);
      
      ctx.globalAlpha = visibility;
      
      // Satellite-like terrain colors
      const grad = ctx.createRadialGradient(w/2, h/2, 50, w/2, h/2, w);
      grad.addColorStop(0, "#253b15"); // Center dropzone area
      grad.addColorStop(0.3, "#365922");
      grad.addColorStop(0.7, "#284a16");
      grad.addColorStop(1, "#1c360f");
      ctx.fillStyle = grad;
      ctx.fillRect(-w, -h, w * 3, h * 3);

      // Abstract topography / fields pattern
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 1;
      const gridSize = 150;
      for (let x = -w; x < w * 2; x += gridSize) {
        for (let y = -h; y < h * 2; y += gridSize) {
          if ((x + y) % 300 === 0) {
            ctx.fillStyle = "rgba(255,255,255,0.03)";
            ctx.fillRect(x, y, gridSize, gridSize);
          }
          ctx.strokeRect(x, y, gridSize, gridSize);
        }
      }

      // Dropzone Target
      ctx.beginPath();
      ctx.arc(w/2, h/2, 40, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 60, 60, 0.7)";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w/2, h/2, 8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 60, 60, 0.9)";
      ctx.fill();

      ctx.restore();
    };

    const drawClouds = (ctx: CanvasRenderingContext2D, speed: number, tiltX: number, tiltY: number) => {
      clouds.forEach((c) => {
        // Clouds move up as you fall down
        c.y -= speed * c.z * 1.8;
        
        // Parallax horizontal movement based on tilt
        const px = c.x + tiltX * c.z * 400 + c.offsetX;
        const py = c.y + tiltY * c.z * 400;

        if (c.y < -c.radius * 2) {
          c.y = h + c.radius;
          c.x = Math.random() * w;
        }

        // Soft radial gradient for realistic volumetric cloud look
        const grad = ctx.createRadialGradient(px, py, 0, px, py, c.radius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${c.opacity})`);
        grad.addColorStop(0.4, `rgba(255, 255, 255, ${c.opacity * 0.8})`);
        grad.addColorStop(1, `rgba(255, 255, 255, 0)`);
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, c.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const drawParticles = (ctx: CanvasRenderingContext2D, speed: number, cx: number, cy: number, phase: string) => {
      if (speed < 1 || phase === "landed") return;
      
      ctx.save();
      const speedRatio = speed / TERMINAL_VELOCITY;
      
      particles.forEach((p) => {
        // Calculate vector from center for radial blur effect
        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // Push particles outward from center
        p.x += (dx / Math.max(dist, 1)) * p.speed * speedRatio * p.z;
        p.y += (dy / Math.max(dist, 1)) * p.speed * speedRatio * p.z;

        // Reset if out of bounds
        if (p.x < 0 || p.x > w || p.y < 0 || p.y > h || dist > Math.max(w, h)) {
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * 150 + 50; // Spawn near center
          p.x = cx + Math.cos(angle) * r;
          p.y = cy + Math.sin(angle) * r;
        }

        // Fades in as it gets closer to edge
        const alpha = Math.min(0.6, (dist / (w/2)) * 0.8) * speedRatio;
        
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - (dx / Math.max(dist, 1)) * p.length * speedRatio, p.y - (dy / Math.max(dist, 1)) * p.length * speedRatio);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = p.z * 1.5;
        ctx.stroke();
      });
      ctx.restore();
    };

    const render = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      stateRef.current.time += dt;

      const state = stateRef.current;
      const isFreefall = state.phase === "freefall";
      const isParachute = state.phase === "parachute";
      const isLanded = state.phase === "landed";

      // Physics integration
      const targetSpeed = isFreefall ? TERMINAL_VELOCITY : isParachute ? PARACHUTE_SPEED : 0;
      state.speed += (targetSpeed - state.speed) * dt * 2.5; // Smooth deceleration
      
      if (!isLanded) {
        state.alt -= state.speed * dt * 150; // Scaled altitude descent rate
        if (state.alt <= GROUND_ALTITUDE) {
          state.alt = GROUND_ALTITUDE;
          state.phase = "landed";
          setPhase("landed");
          setWarning(false);
        }
      }

      // Altitude triggers
      if (isFreefall) {
        if (state.alt < 3500 && state.alt > 1500) {
          setWarning(true);
        } else {
          setWarning(false);
        }
        if (state.alt <= 1500) {
          // Auto deploy hard deck
          state.phase = "parachute";
          setPhase("parachute");
          setWarning(false);
        }
      }

      setAltitude(Math.max(0, Math.round(state.alt)));
      setSpeed(Math.round(state.speed * 12)); // Approx conversion to mph

      // Camera Tilt Dynamics based on mouse
      const targetTiltX = (state.mouseX - 0.5) * 2;
      const targetTiltY = (state.mouseY - 0.5) * 2;
      state.tiltX += (targetTiltX - state.tiltX) * dt * 4;
      state.tiltY += (targetTiltY - state.tiltY) * dt * 4;

      // Screen Shake (high during freefall, minimal during parachute)
      const shakeIntensity = isFreefall ? Math.pow(state.speed / TERMINAL_VELOCITY, 2) * 6 : isParachute ? 0.5 : 0;
      const sx = (Math.random() - 0.5) * shakeIntensity;
      const sy = (Math.random() - 0.5) * shakeIntensity;

      ctx.save();
      ctx.translate(sx, sy);

      // Rendering Pipeline
      drawSky(ctx, state.alt);
      drawGround(ctx, state.alt, state.tiltX, state.tiltY);
      drawClouds(ctx, state.speed, state.tiltX, state.tiltY);
      
      const cx = w / 2 + state.tiltX * 150;
      const cy = h / 2 + state.tiltY * 150;
      drawParticles(ctx, state.speed, cx, cy, state.phase);

      // Helmet Vignette overlay
      const vigGrad = ctx.createRadialGradient(w/2, h/2, Math.min(w, h) * 0.35, w/2, h/2, Math.max(w, h) * 0.8);
      vigGrad.addColorStop(0, "transparent");
      vigGrad.addColorStop(0.7, "rgba(0,0,0,0.5)");
      vigGrad.addColorStop(1, "rgba(0,0,0,0.95)");
      ctx.fillStyle = vigGrad;
      ctx.fillRect(-w, -h, w*3, h*3);

      ctx.restore();
      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black text-white font-mono overflow-hidden cursor-crosshair selection:bg-transparent">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      
      {/* Helmet Visor Reflection & Chromatic Aberration simulation */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none mix-blend-screen opacity-20 transition-all duration-1000"
        style={{
          boxShadow: phase === "freefall" ? "inset 0 0 150px rgba(100, 150, 255, 0.6)" : "inset 0 0 50px rgba(100, 255, 100, 0.2)"
        }}
      />
      
      {/* Dirt/Scratches on visor (subtle noise overlay) */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

      {/* High-Tech Tactical HUD */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6 md:p-12">
        
        {/* Top HUD Area */}
        <div className="flex justify-between items-start">
          <Link href="/" className="pointer-events-auto">
            <motion.div
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
              className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/20 rounded-sm text-white/80 hover:text-white transition-colors shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest font-bold">Abort Jump</span>
            </motion.div>
          </Link>

          <div className="flex flex-col items-end gap-6">
            {/* Altitude Module */}
            <div className="flex flex-col items-end bg-black/20 backdrop-blur-sm p-3 rounded-sm border-r-2 border-green-400">
              <span className="text-[10px] text-green-400 tracking-[0.3em] mb-1 font-bold">ALTITUDE [FT]</span>
              <div className="text-5xl md:text-6xl font-black tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(74,222,128,0.6)]">
                {altitude.toString().padStart(5, '0')}
              </div>
            </div>
            
            {/* Velocity Module */}
            <div className="flex flex-col items-end bg-black/20 backdrop-blur-sm p-3 rounded-sm border-r-2 border-cyan-400">
              <span className="text-[10px] text-cyan-400 tracking-[0.3em] mb-1 font-bold">VELOCITY [MPH]</span>
              <div className="text-3xl md:text-4xl font-black tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]">
                {speed.toString().padStart(3, '0')}
              </div>
            </div>
          </div>
        </div>

        {/* Center Reticle (Jet fighter style) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 flex items-center justify-center">
          <Crosshair className="w-24 h-24 text-white" strokeWidth={0.5} />
          <div className="absolute w-64 h-[1px] bg-white/20" />
          <div className="absolute h-64 w-[1px] bg-white/20" />
          <div className="absolute w-40 h-40 border border-white/10 rounded-full" />
        </div>

        {/* Dynamic Status / Warnings Display */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-32 flex flex-col items-center">
          <AnimatePresence mode="wait">
            {warning && (
              <motion.div
                key="warning"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-3 text-red-500 bg-red-950/40 px-6 py-3 rounded-sm border border-red-500/80 backdrop-blur-md animate-[pulse_0.5s_ease-in-out_infinite] shadow-[0_0_30px_rgba(239,68,68,0.4)]"
              >
                <AlertTriangle className="w-6 h-6" />
                <span className="text-lg font-black tracking-[0.2em]">PULL ALTITUDE</span>
              </motion.div>
            )}
            
            {phase === "parachute" && (
              <motion.div
                key="deployed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-400 text-xl tracking-[0.3em] font-black drop-shadow-[0_0_15px_rgba(74,222,128,0.8)] bg-black/30 px-6 py-2 rounded backdrop-blur-sm border border-green-500/30"
              >
                CANOPY DEPLOYED
              </motion.div>
            )}

            {phase === "landed" && (
              <motion.div
                key="landed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white text-4xl tracking-[0.4em] font-black drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] bg-black/50 px-8 py-4 rounded-sm backdrop-blur-md border border-white/20"
              >
                TOUCHDOWN
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom HUD / Deploy Action */}
        <div className="flex justify-center items-end h-32">
          <AnimatePresence>
            {phase === "freefall" && (
              <motion.button
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={deployParachute}
                className="pointer-events-auto relative overflow-hidden bg-red-600/90 backdrop-blur-xl border-2 border-red-400 text-white px-10 py-5 rounded-sm shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:bg-red-500 transition-all flex items-center gap-3"
              >
                <ChevronDown className="w-8 h-8 animate-bounce" />
                <span className="text-xl font-black tracking-[0.2em]">DEPLOY CHUTE</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

