"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Wind, ArrowDown, ChevronDown } from "lucide-react";

// --- Types ---
interface Cloud {
  x: number;
  y: number;
  z: number; // Depth for parallax
  w: number;
  h: number;
  opacity: number;
  speed: number;
}

interface WindStreak {
  x: number;
  y: number;
  len: number;
  speed: number;
  opacity: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
}

// --- Constants ---
const MAX_ALTITUDE = 15000; // feet
const TERMINAL_VELOCITY = 8; // pixels per frame base speed
const PARACHUTE_SPEED = 1.5;
const GROUND_ALTITUDE = 200;

export default function SkydivingExperience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [altitude, setAltitude] = useState(MAX_ALTITUDE);
  const [speed, setSpeed] = useState(0);
  const [phase, setPhase] = useState<"freefall" | "parachute" | "landed">("freefall");
  const [showDeploy, setShowDeploy] = useState(false);

  const mouseRef = useRef({ x: 0.5, y: 0.5 }); // Normalized 0-1
  const altRef = useRef(MAX_ALTITUDE);
  const phaseRef = useRef<"freefall" | "parachute" | "landed">("freefall");
  const cloudsRef = useRef<Cloud[]>([]);
  const streaksRef = useRef<WindStreak[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const bodyTiltRef = useRef(0); // -1 to 1
  const speedRef = useRef(0);
  const shakeRef = useRef({ x: 0, y: 0 });

  const deployParachute = useCallback(() => {
    if (phaseRef.current === "freefall" && altRef.current < 8000) {
      phaseRef.current = "parachute";
      setPhase("parachute");
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    // Init clouds
    const initClouds = () => {
      cloudsRef.current = Array.from({ length: 25 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 2 - h,
        z: Math.random() * 3 + 0.5,
        w: Math.random() * 300 + 100,
        h: Math.random() * 60 + 20,
        opacity: Math.random() * 0.4 + 0.1,
        speed: Math.random() * 2 + 1,
      }));
    };

    // Init wind streaks
    const initStreaks = () => {
      streaksRef.current = Array.from({ length: 40 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        len: Math.random() * 80 + 30,
        speed: Math.random() * 10 + 5,
        opacity: Math.random() * 0.3 + 0.05,
      }));
    };

    initClouds();
    initStreaks();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / w;
      mouseRef.current.y = e.clientY / h;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    let frameId: number;
    let time = 0;

    const render = () => {
      time += 0.016;
      const isFreefall = phaseRef.current === "freefall";
      const isParachute = phaseRef.current === "parachute";
      const isLanded = phaseRef.current === "landed";

      // --- Physics ---
      const currentSpeed = isFreefall ? TERMINAL_VELOCITY : isParachute ? PARACHUTE_SPEED : 0;
      speedRef.current += (currentSpeed - speedRef.current) * 0.05;

      if (!isLanded) {
        altRef.current -= speedRef.current * 3;
        if (altRef.current <= GROUND_ALTITUDE) {
          altRef.current = GROUND_ALTITUDE;
          phaseRef.current = "landed";
          setPhase("landed");
        }
      }

      // Show deploy button when below 8000ft in freefall
      if (isFreefall && altRef.current < 8000) {
        setShowDeploy(true);
      }

      // Auto-deploy at 2000ft
      if (isFreefall && altRef.current < 2000) {
        phaseRef.current = "parachute";
        setPhase("parachute");
      }

      setAltitude(Math.round(altRef.current));
      setSpeed(Math.round(speedRef.current * 30));

      // Body tilt from mouse
      bodyTiltRef.current += ((mouseRef.current.x - 0.5) * 2 - bodyTiltRef.current) * 0.08;

      // Camera shake (stronger in freefall)
      const shakeIntensity = isFreefall ? 3 : isParachute ? 0.5 : 0;
      shakeRef.current.x = (Math.random() - 0.5) * shakeIntensity;
      shakeRef.current.y = (Math.random() - 0.5) * shakeIntensity;

      // --- Rendering ---
      ctx.save();
      ctx.translate(shakeRef.current.x, shakeRef.current.y);

      // Sky gradient (changes with altitude)
      const altPct = altRef.current / MAX_ALTITUDE;
      const skyTop = `hsl(${210 + altPct * 10}, ${70 + altPct * 20}%, ${Math.max(15, 55 - altPct * 30)}%)`;
      const skyBot = `hsl(${200}, ${50}%, ${Math.max(40, 75 - altPct * 20)}%)`;
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, skyTop);
      skyGrad.addColorStop(1, skyBot);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // --- Ground Layer (visible at low altitude) ---
      if (altRef.current < 5000) {
        const groundVisibility = 1 - altRef.current / 5000;
        const groundY = h - (h * 0.3 * groundVisibility);

        // Patchwork terrain
        ctx.save();
        ctx.globalAlpha = groundVisibility * 0.8;
        const groundGrad = ctx.createLinearGradient(0, groundY, 0, h);
        groundGrad.addColorStop(0, "#5a8c3a");
        groundGrad.addColorStop(0.5, "#4a7c2f");
        groundGrad.addColorStop(1, "#3a6c24");
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, groundY, w, h - groundY);

        // Grid lines for perspective
        ctx.strokeStyle = `rgba(70, 120, 50, ${groundVisibility * 0.4})`;
        ctx.lineWidth = 1;
        const gridSpacing = 60;
        const offsetX = (bodyTiltRef.current * 50 * groundVisibility) % gridSpacing;
        for (let gx = -gridSpacing + offsetX; gx < w + gridSpacing; gx += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(w / 2, groundY);
          ctx.lineTo(gx, h);
          ctx.stroke();
        }
        for (let gy = groundY; gy < h; gy += gridSpacing * 0.5) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(w, gy);
          ctx.stroke();
        }
        ctx.restore();
      }

      // --- Clouds ---
      cloudsRef.current.forEach((cloud) => {
        // Move clouds upward (simulating falling through them)
        cloud.y += speedRef.current * cloud.z * 1.5;
        cloud.x += bodyTiltRef.current * cloud.z * -2; // Parallax tilt

        // Reset clouds that go off screen
        if (cloud.y > h + 100) {
          cloud.y = -cloud.h - Math.random() * 200;
          cloud.x = Math.random() * w;
          cloud.w = Math.random() * 300 + 100;
          cloud.opacity = Math.random() * 0.4 + 0.1;
        }
        if (cloud.y < -cloud.h - 300) {
          cloud.y = h + Math.random() * 200;
          cloud.x = Math.random() * w;
        }

        // Render cloud
        ctx.save();
        ctx.globalAlpha = cloud.opacity * (isFreefall ? 1 : 0.6);
        ctx.fillStyle = "white";
        ctx.shadowBlur = 40;
        ctx.shadowColor = "rgba(255, 255, 255, 0.3)";

        // Organic cloud shape (multiple ellipses)
        const cx = cloud.x;
        const cy = cloud.y;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.ellipse(
            cx + (i - 1.5) * (cloud.w * 0.25),
            cy + Math.sin(i * 1.5) * 8,
            cloud.w * 0.3,
            cloud.h * (0.6 + Math.sin(i) * 0.3),
            0, 0, Math.PI * 2
          );
          ctx.fill();
        }
        ctx.restore();
      });

      // --- Wind Streaks ---
      if (!isLanded) {
        const streakSpeedMult = isFreefall ? 1 : 0.2;
        streaksRef.current.forEach((streak) => {
          streak.y += streak.speed * speedRef.current * streakSpeedMult;
          streak.x += bodyTiltRef.current * -5;

          if (streak.y > h + 50) {
            streak.y = -streak.len;
            streak.x = Math.random() * w;
          }

          ctx.beginPath();
          ctx.moveTo(streak.x, streak.y);
          ctx.lineTo(streak.x + bodyTiltRef.current * -3, streak.y + streak.len * speedRef.current * 0.5);
          ctx.strokeStyle = `rgba(255, 255, 255, ${streak.opacity * speedRef.current * 0.15})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }

      // --- Skydiver Body (First Person Arms/Legs hints) ---
      if (!isLanded) {
        ctx.save();
        ctx.translate(w / 2, h * 0.75);
        ctx.rotate(bodyTiltRef.current * 0.15);

        // Left arm
        ctx.strokeStyle = "rgba(20, 20, 20, 0.6)";
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-80 - bodyTiltRef.current * 20, 30);
        ctx.quadraticCurveTo(-160 - bodyTiltRef.current * 30, -20, -200 - bodyTiltRef.current * 40, -60 + Math.sin(time * 3) * 8);
        ctx.stroke();

        // Right arm
        ctx.beginPath();
        ctx.moveTo(80 - bodyTiltRef.current * 20, 30);
        ctx.quadraticCurveTo(160 - bodyTiltRef.current * 30, -20, 200 - bodyTiltRef.current * 40, -60 + Math.cos(time * 3) * 8);
        ctx.stroke();

        // Gloves
        ctx.fillStyle = "rgba(30, 30, 30, 0.7)";
        ctx.beginPath();
        ctx.arc(-200 - bodyTiltRef.current * 40, -60 + Math.sin(time * 3) * 8, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(200 - bodyTiltRef.current * 40, -60 + Math.cos(time * 3) * 8, 8, 0, Math.PI * 2);
        ctx.fill();

        // Left leg
        ctx.strokeStyle = "rgba(25, 25, 25, 0.5)";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(-50, 80);
        ctx.quadraticCurveTo(-90, 160, -120 + Math.sin(time * 2) * 5, 250);
        ctx.stroke();

        // Right leg
        ctx.beginPath();
        ctx.moveTo(50, 80);
        ctx.quadraticCurveTo(90, 160, 120 + Math.cos(time * 2) * 5, 250);
        ctx.stroke();

        // Boots
        ctx.fillStyle = "rgba(20, 20, 20, 0.6)";
        ctx.beginPath();
        ctx.ellipse(-120 + Math.sin(time * 2) * 5, 255, 14, 8, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(120 + Math.cos(time * 2) * 5, 255, 14, 8, 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // --- Parachute ---
        if (isParachute) {
          ctx.save();
          ctx.translate(w / 2 + bodyTiltRef.current * 20, 0);

          // Canopy
          const canopyW = 350;
          const canopyH = 120;
          const canopyY = h * 0.1;
          const sway = Math.sin(time * 1.5) * 10;

          ctx.fillStyle = "rgba(220, 60, 60, 0.85)";
          ctx.beginPath();
          ctx.ellipse(sway, canopyY, canopyW / 2, canopyH, 0, Math.PI, 0);
          ctx.fill();

          // Stripe
          ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
          ctx.beginPath();
          ctx.ellipse(sway, canopyY, canopyW * 0.15, canopyH * 0.9, 0, Math.PI, 0);
          ctx.fill();

          // Lines
          ctx.strokeStyle = "rgba(80, 80, 80, 0.5)";
          ctx.lineWidth = 1;
          for (let i = -3; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(sway + i * (canopyW * 0.12), canopyY);
            ctx.lineTo(bodyTiltRef.current * 10, h * 0.72);
            ctx.stroke();
          }

          ctx.restore();
        }
      }

      // --- Vignette ---
      const vigGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.8);
      vigGrad.addColorStop(0, "transparent");
      vigGrad.addColorStop(1, `rgba(0, 0, 0, ${isFreefall ? 0.5 : 0.3})`);
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, w, h);

      // --- Motion Blur Edges ---
      if (isFreefall) {
        const blurGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.35, w / 2, h / 2, w * 0.55);
        blurGrad.addColorStop(0, "transparent");
        blurGrad.addColorStop(1, "rgba(200, 220, 255, 0.08)");
        ctx.fillStyle = blurGrad;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.restore(); // End shake transform

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
    <div className="relative w-full h-screen bg-black text-white font-sans overflow-hidden cursor-none">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* HUD Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none p-6 md:p-10 flex flex-col justify-between">
        {/* Top Bar */}
        <header className="flex justify-between items-start">
          <Link href="/" className="pointer-events-auto">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 px-4 py-2 bg-black/30 backdrop-blur-md border border-white/10 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-[10px] tracking-[0.3em] uppercase font-bold">Exit Jump</span>
            </motion.div>
          </Link>

          {/* Altitude Readout */}
          <div className="flex flex-col items-end gap-1 bg-black/30 backdrop-blur-md border border-white/10 rounded-lg px-5 py-3">
            <span className="text-[9px] tracking-[0.3em] uppercase text-white/50">Altitude</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black tabular-nums tracking-tight">
                {altitude.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-white/50">ft</span>
            </div>
          </div>
        </header>

        {/* Center Phase Indicator */}
        <AnimatePresence mode="wait">
          {phase === "freefall" && (
            <motion.div
              key="freefall"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <Wind className="w-6 h-6 text-white/30 animate-pulse" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-white/30 font-bold">
                Free Fall
              </span>
            </motion.div>
          )}
          {phase === "parachute" && (
            <motion.div
              key="chute"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-xl font-black tracking-widest text-green-400 uppercase">
                Canopy Deployed
              </span>
              <span className="text-[10px] tracking-widest text-white/40">Gliding to safety</span>
            </motion.div>
          )}
          {phase === "landed" && (
            <motion.div
              key="landed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <span className="text-4xl font-black tracking-widest text-white uppercase">
                Landed
              </span>
              <span className="text-sm text-white/50">Safe on the ground.</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom HUD */}
        <footer className="flex justify-between items-end">
          {/* Speed */}
          <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2.5">
            <span className="text-[9px] tracking-[0.2em] uppercase text-white/40 block">Speed</span>
            <span className="text-lg font-black tabular-nums">{speed}</span>
            <span className="text-[9px] text-white/40 ml-1">mph</span>
          </div>

          {/* Altitude Bar (vertical) */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-2 h-40 bg-white/10 border border-white/10 rounded-full overflow-hidden">
              <motion.div
                className="absolute bottom-0 w-full rounded-full"
                animate={{
                  height: `${(altitude / MAX_ALTITUDE) * 100}%`,
                  backgroundColor:
                    altitude > 5000
                      ? "rgba(100, 200, 255, 0.8)"
                      : altitude > 2000
                      ? "rgba(255, 200, 50, 0.8)"
                      : "rgba(255, 80, 80, 0.8)",
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <ArrowDown className="w-3 h-3 text-white/30 animate-bounce" />
          </div>

          {/* Deploy Button */}
          <div className="h-14">
            <AnimatePresence>
              {showDeploy && phase === "freefall" && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={deployParachute}
                  className="pointer-events-auto flex items-center gap-3 px-6 py-3 bg-red-600/80 backdrop-blur-md border border-red-400/30 rounded-xl text-white font-black uppercase tracking-wider text-sm shadow-[0_0_30px_rgba(220,50,50,0.4)] hover:bg-red-500/90 transition-colors animate-pulse"
                >
                  <ChevronDown className="w-5 h-5" />
                  Deploy Chute
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </footer>
      </div>

      {/* Crosshair cursor */}
      <div className="fixed inset-0 z-20 pointer-events-none flex items-center justify-center">
        <div className="w-4 h-4 border border-white/20 rounded-full" />
        <div className="absolute w-0.5 h-3 bg-white/15 -translate-y-4" />
        <div className="absolute w-0.5 h-3 bg-white/15 translate-y-4" />
        <div className="absolute w-3 h-0.5 bg-white/15 -translate-x-4" />
        <div className="absolute w-3 h-0.5 bg-white/15 translate-x-4" />
      </div>
    </div>
  );
}
