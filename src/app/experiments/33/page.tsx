"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Flower {
  x: number;
  y: number;
  id: number;
  age: number;
  size: number;
  hue: number;
  growth: number;
  petals: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  hue: number;
}

export default function AetherBloom() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const mouse = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    setIsLoaded(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const particles: Particle[] = [];
    const flowersList: Flower[] = [];

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      mouse.current.active = true;

      if (Math.random() > 0.4) {
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          age: 0,
          life: 50 + Math.random() * 50,
          hue: 180 + Math.random() * 60,
        });
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      flowersList.push({
        x: e.clientX,
        y: e.clientY,
        id: Date.now(),
        age: 0,
        size: 0,
        hue: 160 + Math.random() * 80,
        growth: 0.02 + Math.random() * 0.03,
        petals: 5 + Math.floor(Math.random() * 8),
      });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);

    const drawPhyllotaxis = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      petals: number,
      hue: number,
      age: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      const angle = 137.5 * (Math.PI / 180);
      const c = size * 0.5;

      for (let i = 0; i < petals * age * 10; i++) {
        const a = i * angle;
        const r = c * Math.sqrt(i);
        const px = r * Math.cos(a);
        const py = r * Math.sin(a);

        const s = Math.max(1, (1 - i / (petals * 20)) * 4);
        ctx.fillStyle = `hsla(${hue + i * 0.1}, 100%, 70%, ${0.5 - i / (petals * 30)})`;
        ctx.beginPath();
        ctx.arc(px, py, s, 0, Math.PI * 2);
        ctx.fill();
        
        if (i % 20 === 0) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = `hsla(${hue}, 100%, 50%, 0.8)`;
            ctx.stroke();
        }
      }
      ctx.restore();
    };

    const animate = () => {
      ctx.fillStyle = "rgba(10, 10, 10, 0.15)";
      ctx.fillRect(0, 0, w, h);

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.02; // Etheric rising
        p.age++;

        const opacity = Math.max(0, 1 - p.age / p.life);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, opacity * 2, 0, Math.PI * 2);
        ctx.fill();

        if (p.age > p.life) particles.splice(i, 1);
      }

      // Flowers
      flowersList.forEach((f) => {
        if (f.age < 1) f.age += f.growth;
        const dist = Math.hypot(f.x - mouse.current.x, f.y - mouse.current.y);
        const interaction = Math.max(0, 1 - dist / 300) * 0.5;
        f.size = 20 + interaction * 40;

        drawPhyllotaxis(ctx, f.x, f.y, f.size, f.petals, f.hue, f.age);
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden cursor-crosshair">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Glassmorphic UI */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-8 left-8 right-8 flex justify-between items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-1"
          >
            <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <h1 className="text-2xl font-bold tracking-tighter text-white uppercase italic">
                Aether Bloom
              </h1>
              <p className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">
                Observed Experiment 033 / Vernal Pulse
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-end gap-1"
          >
             <div className="p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
                 <p className="text-[10px] text-white/40 font-mono">EST. MARCH 16, 2026</p>
             </div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-8 flex flex-col gap-4 pointer-events-auto">
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-white/60 hover:text-white text-xs font-mono transition-colors"
            >
              ← RETURN TO ARCHIVE
            </motion.div>
          </Link>
        </div>

        <div className="absolute bottom-12 right-12 text-right">
            <p className="text-[10px] text-white/20 font-mono tracking-tighter uppercase leading-none mb-1">Interactive Generative Flora</p>
            <p className="text-[8px] text-emerald-400 font-mono uppercase tracking-[0.2em]">Growth Stage: Optimized</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 pointer-events-none bg-gradient-to-t from-cyan-500/5 to-transparent z-0"
      />
      
      {/* Interaction Hint */}
      <AnimatePresence>
        {!mouse.current.active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <p className="text-[10px] text-white/30 font-mono tracking-[0.3em] uppercase animate-pulse">
                Click to sow • Move to nourish
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
