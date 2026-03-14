"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { ArrowLeft, Sparkles, TrainFront, Cloud, Wind } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// --- Types ---
interface Sprite {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  blink: boolean;
}

export default function InkAndTimberExperiment() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Mouse tracking for parallax and sprites
  const mouseXMotion = useMotionValue(0);
  const mouseYMotion = useMotionValue(0);
  const mouseX = useSpring(mouseXMotion, { damping: 50, stiffness: 200 });
  const mouseY = useSpring(mouseYMotion, { damping: 50, stiffness: 200 });
  
  // Parallax transforms for the background (Dampened for stability)
  const rotateX = useTransform(mouseYMotion, [-500, 500], [3, -3]);
  const rotateY = useTransform(mouseXMotion, [-500, 500], [-3, 3]);

  // --- Soot Sprite Logic ---
  const spritesRef = useRef<Sprite[]>([]);
  const frameRef = useRef<number | undefined>(undefined);

  // --- Lifecycle & Initialization ---
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize Sprites
    const INITIAL_COUNT = 24;
    spritesRef.current = Array.from({ length: INITIAL_COUNT }).map((_, i) => ({
      id: i,
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      size: 10 + Math.random() * 25,
      blink: false
    }));

    const update = () => {
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) {
          frameRef.current = requestAnimationFrame(update);
          return;
      }
      
      ctx.clearRect(0, 0, w, h);

      const targetX = (mouseX.get() as number) + w / 2;
      const targetY = (mouseY.get() as number) + h / 2;

      spritesRef.current.forEach((s) => {
        // Lower friction slightly for perpetual drift
        s.vx *= 0.94;
        s.vy *= 0.94;

        // Repulsion from mouse (Avoidance)
        const dx = targetX - s.x;
        const dy = targetY - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const avoidanceRadius = 350;
        if (dist < avoidanceRadius) {
          const force = Math.pow((avoidanceRadius - dist) / avoidanceRadius, 2) * 2.5;
          s.vx -= (dx / dist) * force;
          s.vy -= (dy / dist) * force;
        }

        // Continuous slow wandering force
        const driftForce = 0.08;
        const timeFactor = Date.now() * 0.001;
        s.vx += Math.cos(timeFactor + s.id) * driftForce;
        s.vy += Math.sin(timeFactor * 0.8 + s.id) * driftForce;

        s.x += s.vx;
        s.y += s.vy;

        // Soft Wrap-around instead of hard bounce
        if (s.x < -50) s.x = w + 50;
        if (s.x > w + 50) s.x = -50;
        if (s.y < -50) s.y = h + 50;
        if (s.y > h + 50) s.y = -50;

        // Draw Soot Sprite (Furry/Hairy Aesthetic)
        ctx.save();
        ctx.translate(s.x, s.y);
        
        // Subtle micro-wiggle/breathing effect
        const time = Date.now() * 0.003;
        const pulse = Math.sin(time + s.id) * 0.05;
        
        ctx.strokeStyle = "rgba(0,0,0,0.9)";
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";

        const HAIR_COUNT = 45;
        for (let i = 0; i < HAIR_COUNT; i++) {
          const angle = (i / HAIR_COUNT) * Math.PI * 2;
          // Fixed seed for hair variability
          const hairSeed = Math.sin(s.id * 7.7 + i * 3.3);
          const hairLength = s.size * (0.8 + hairSeed * 0.4 + pulse);
          
          // Subtle individual hair wiggle
          const wiggle = Math.sin(time * 0.7 + i + s.id) * 0.08;
          
          const px = Math.cos(angle + wiggle) * hairLength;
          const py = Math.sin(angle + wiggle) * hairLength;
          
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(px, py);
          ctx.stroke();
        }

        // Inner solid core for more presence
        ctx.beginPath();
        ctx.fillStyle = "rgba(0,0,0,0.95)";
        ctx.arc(0, 0, s.size * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (Subtly pulsing)
        const eyePulse = 1 + Math.sin(time * 1.5 + s.id) * 0.03;
        const eyeOffset = s.size * 0.22;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(-eyeOffset, -eyeOffset * 0.1, s.size * 0.16 * eyePulse, 0, Math.PI * 2);
        ctx.arc(eyeOffset, -eyeOffset * 0.1, s.size * 0.16 * eyePulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#000";
        ctx.beginPath();
        const pupilPulse = 1 + Math.cos(time * 1.5 + s.id) * 0.05;
        ctx.arc(-eyeOffset, -eyeOffset * 0.1, s.size * 0.06 * pupilPulse, 0, Math.PI * 2);
        ctx.arc(eyeOffset, -eyeOffset * 0.1, s.size * 0.06 * pupilPulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      frameRef.current = requestAnimationFrame(update);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    update();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [mounted, mouseX, mouseY]); // mouseX/mouseY objects are stable

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = e.clientX - window.innerWidth / 2;
    const y = e.clientY - window.innerHeight / 2;
    mouseXMotion.set(x);
    mouseYMotion.set(y);
  };

  const handleMouseDown = () => {
      // Scatter effect on click
      spritesRef.current.forEach(s => {
          const angle = Math.random() * Math.PI * 2;
          const mag = 15 + Math.random() * 10;
          s.vx = Math.cos(angle) * mag;
          s.vy = Math.sin(angle) * mag;
      });
  };

  if (!mounted) return null;

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      className="relative w-full h-screen overflow-hidden bg-[#e6dcc5] font-serif"
    >
      {/* 1. Base Physical Textures & Artwork (Stabilized) */}
      <motion.div 
        className="absolute inset-0 z-0"
      >
        <Image
          src="/images/32/base.png"
          alt="Original Timber and Ink Artwork"
          fill
          className="object-cover pointer-events-none brightness-[1.02] contrast-[1.05]"
          priority
        />
        
        {/* Animated Digital Portal Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
            {/* 
               The 'World' is centered in the generated base image. 
               We position our digital layer exactly over the hand-drawn circle.
            */}
            <div className="relative w-[38vw] h-[38vw] rounded-full overflow-hidden translate-x-[4%] translate-y-[2%] opacity-80 mix-blend-multiply">
                {/* Moving Clouds inside the circle */}
                <motion.div 
                    animate={{ x: [-20, 20], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4"
                >
                    <Cloud className="w-12 h-12 text-blue-400/30 blur-sm" />
                </motion.div>
                
                {/* Moving Train Silhouette (Subtle) */}
                <motion.div 
                    animate={{ 
                        x: [400, -400],
                        y: [100, 150, 100]
                    }}
                    transition={{ 
                        duration: 15, 
                        repeat: Infinity, 
                        ease: "linear" 
                    }}
                    className="absolute bottom-1/3 left-0"
                >
                    <TrainFront className="w-16 h-16 text-yellow-600/20 rotate-[-15deg] blur-[1px]" />
                </motion.div>
            </div>
        </div>
      </motion.div>

      {/* 2. Soot Sprite Digital Layer */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 z-20 pointer-events-none mix-blend-multiply opacity-80"
      />

      {/* 3. Whimsical UI */}
      <nav className="fixed top-0 left-0 w-full z-50 p-8 flex justify-between items-start">
        <Link href="/" scroll={false}>
          <motion.div 
            whileHover={{ scale: 1.05, rotate: -1 }}
            className="group relative"
          >
            {/* Hand-drawn border effect */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-md rounded-[20px_40px_10px_30px] border-2 border-slate-900 translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform" />
            <div className="relative px-6 py-3 bg-white rounded-[20px_40px_10px_30px] border-2 border-slate-900 flex items-center gap-3 text-slate-900 font-bold uppercase tracking-widest text-xs">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Timber</span>
            </div>
          </motion.div>
        </Link>
        
        <div className="text-right space-y-2">
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/40 backdrop-blur-md px-4 py-1 rounded-full border border-slate-900/10 text-[10px] uppercase tracking-[0.3em] font-black text-slate-800"
            >
                EXP-032 / Ink & Timber
            </motion.div>
            <div className="flex gap-2 justify-end">
                {[Wind, Sparkles].map((Icon, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border border-slate-900/20 flex items-center justify-center bg-white/50">
                        <Icon className="w-4 h-4 text-slate-600" />
                    </div>
                ))}
            </div>
        </div>
      </nav>

      <div className="fixed bottom-10 left-10 z-50">
        <div className="max-w-xs space-y-4">
            <h2 className="text-5xl font-black text-slate-900 leading-none drop-shadow-sm">
                TACTICAL<br/>WHIMSY
            </h2>
            <p className="text-xs text-slate-800 font-bold leading-relaxed tracking-wider opacity-70">
                A digital soul for a physical sketch. Move your gaze to stir the soot sprites hidden in the timber. 
            </p>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="fixed bottom-8 right-10 z-50 flex items-center gap-4 text-slate-900/30">
        <span className="text-[10px] font-black tracking-[0.5em] uppercase">Living Sketchbook v1.0</span>
        <div className="w-12 h-px bg-slate-900/20" />
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@900&display=swap');
        
        body {
          background: #e6dcc5;
          cursor: crosshair;
        }

        h2 {
            font-family: 'Outfit', sans-serif;
        }
      `}</style>
    </div>
  );
}
