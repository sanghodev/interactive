"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Sparkles, Activity, Zap } from "lucide-react";

// --- Types & Configuration ---
const MAX_STEPS = 100;
const DISSOLVE_RATE = 0.001;

interface StellarStep {
  x: number;
  y: number;
  z: number;
  angle: number;
  life: number; // 1 to 0
  hue: number;
  size: number;
}

class CelestialParticle {
    x!: number;
    y!: number;
    z!: number;
    vx!: number;
    vy!: number;
    vz!: number;
    size!: number;
    color!: string;

    constructor(w: number, h: number) {
        this.reset(w, h, true);
    }

    reset(w: number, h: number, randomZ = false) {
        this.x = (Math.random() - 0.5) * w * 2;
        this.y = (Math.random() - 0.5) * h * 2;
        this.z = randomZ ? Math.random() * 2000 : 2000;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.vz = -(Math.random() * 2 + 1);
        this.size = Math.random() * 2 + 0.5;
        this.color = `hsla(${200 + Math.random() * 60}, 70%, 80%, ${Math.random() * 0.5 + 0.2})`;
    }

    update(w: number, h: number) {
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;
        if (this.z < 0) this.reset(w, h);
    }

    draw(ctx: CanvasRenderingContext2D, w: number, h: number, camRotateX: number, camRotateY: number) {
        const scale = 1000 / (this.z || 1);
        if (scale < 0.1) return;

        // Apply basic rotation to particles
        const rx = this.x * Math.cos(camRotateY) - this.z * Math.sin(camRotateY);
        const rz = this.x * Math.sin(camRotateY) + this.z * Math.cos(camRotateY);
        
        const px = rx * scale + w / 2;
        const py = this.y * scale + h / 2;

        if (px < 0 || px > w || py < 0 || py > h) return;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(px, py, this.size * scale * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

export default function StellarBridge() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stepsRef = useRef<StellarStep[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, isDown: false, lastX: 0, lastY: 0 });
  const particlesRef = useRef<CelestialParticle[]>([]);
  const [totalSteps, setTotalSteps] = useState(0);
  const [isBuilding, setIsBuilding] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    for (let i = 0; i < 200; i++) {
        particlesRef.current.push(new CelestialParticle(w, h));
    }

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const handleMouseDown = (e: MouseEvent) => {
        mouseRef.current.isDown = true;
        mouseRef.current.lastX = e.clientX;
        mouseRef.current.lastY = e.clientY;
        setIsBuilding(true);
    };

    const handleMouseUp = () => {
        mouseRef.current.isDown = false;
        setIsBuilding(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      if (mouseRef.current.isDown) {
          const dx = e.clientX - mouseRef.current.lastX;
          const dy = e.clientY - mouseRef.current.lastY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 30) {
              const angle = Math.atan2(dy, dx);
              stepsRef.current.push({
                  x: e.clientX,
                  y: e.clientY,
                  z: 500, // Initial depth
                  angle: angle,
                  life: 1.0,
                  hue: (Date.now() / 50) % 360,
                  size: 40 + Math.random() * 40
              });
              setTotalSteps(prev => prev + 1);
              mouseRef.current.lastX = e.clientX;
              mouseRef.current.lastY = e.clientY;

              if (stepsRef.current.length > MAX_STEPS) {
                  stepsRef.current.shift();
              }
          }
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);

    let frameId: number;
    let time = 0;

    const render = () => {
      time += 0.01;
      
      // Infinite Deep Void
      ctx.fillStyle = "#02040a";
      ctx.fillRect(0, 0, w, h);

      // Background Nebula Glow
      const nebulaGrad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w);
      nebulaGrad.addColorStop(0, "rgba(20, 30, 80, 0.15)");
      nebulaGrad.addColorStop(0.5, "rgba(10, 15, 40, 0.05)");
      nebulaGrad.addColorStop(1, "transparent");
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, w, h);

      const vanishingPointX = w / 2 + (mouseRef.current.x - w / 2) * 0.05;
      const vanishingPointY = h / 2 + (mouseRef.current.y - h / 2) * 0.05;

      // Draw Particles
      particlesRef.current.forEach(p => {
          p.update(w, h);
          p.draw(ctx, w, h, 0, (mouseRef.current.x - w/2) * 0.0005);
      });

      // Draw Steps (The Bridge)
      ctx.save();
      stepsRef.current.forEach((step, i) => {
          step.life -= DISSOLVE_RATE;
          step.z += 2; // Move toward camera
          
          if (step.life <= 0) return;

          const scale = 800 / (step.z || 1);
          const px = (step.x - vanishingPointX) * scale + vanishingPointX;
          const py = (step.y - vanishingPointY) * scale + vanishingPointY;

          const alpha = step.life;
          const stepW = step.size * scale;
          const stepH = 10 * scale;

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(step.angle + Math.PI / 2);

          // Crystalline Base
          const grad = ctx.createLinearGradient(-stepW/2, 0, stepW/2, 0);
          grad.addColorStop(0, "transparent");
          grad.addColorStop(0.2, `hsla(${step.hue}, 100%, 80%, ${alpha * 0.8})`);
          grad.addColorStop(0.5, `white`);
          grad.addColorStop(0.8, `hsla(${step.hue}, 100%, 80%, ${alpha * 0.8})`);
          grad.addColorStop(1, "transparent");

          ctx.fillStyle = grad;
          ctx.shadowBlur = 20 * alpha;
          ctx.shadowColor = `hsla(${step.hue}, 100%, 50%, 0.5)`;
          
          // Draw the "plank" of light
          ctx.fillRect(-stepW / 2, -stepH / 2, stepW, stepH);

          // Ray projections (Light leaking)
          if (i > 0) {
              const prev = stepsRef.current[i-1];
              const prevScale = 800 / (prev.z || 1);
              const ppx = (prev.x - vanishingPointX) * prevScale + vanishingPointX;
              const ppy = (prev.y - vanishingPointY) * prevScale + vanishingPointY;

              // Connect steps with ethereal fibers
              ctx.restore();
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(ppx, ppy);
              ctx.strokeStyle = `hsla(${step.hue}, 80%, 70%, ${alpha * 0.2})`;
              ctx.lineWidth = 2 * scale;
              ctx.stroke();
              ctx.save();
          }

          ctx.restore();
      });
      ctx.restore();

      // UI/Prompt when inactive
      if (stepsRef.current.length === 0) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
          ctx.font = "10px 'Outfit', sans-serif";
          ctx.textAlign = "center";
          ctx.letterSpacing = "5px";
          ctx.fillText("DRAG TO MANIFEST THE STELLAR BRIDGE", w/2, h/2 + 100);
      }

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#02040a] overflow-hidden cursor-crosshair select-none">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      
      {/* HUD UI */}
      <div className="relative z-10 w-full h-full flex flex-col p-8 md:p-12 pointer-events-none">
        <nav className="flex justify-between items-start">
            <Link href="/" className="pointer-events-auto">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 group"
                >
                    <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all duration-500">
                        <ArrowLeft className="w-5 h-5 text-white/40 group-hover:text-white" />
                    </div>
                </motion.div>
            </Link>

            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-right"
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-4 backdrop-blur-md">
                    <Activity className={`w-3 h-3 ${isBuilding ? "animate-spin" : ""}`} />
                    <span>Bridge Active // v2.4</span>
                </div>
                <h1 className="text-white text-2xl font-light tracking-[0.5em] uppercase hover:text-cyan-400 transition-colors">Stellar Bridge</h1>
                <p className="text-cyan-200/20 text-[9px] mt-2 tracking-[0.3em] uppercase italic">Manifesting the Infinite</p>
            </motion.div>
        </nav>

        <div className="flex-grow flex flex-col items-center justify-center text-center">
            <AnimatePresence>
                {isBuilding && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <Zap className="w-8 h-8 text-cyan-400 animate-pulse" />
                        <span className="text-cyan-400/50 text-[10px] tracking-[1em] uppercase">Constructing Reality</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <footer className="flex justify-between items-end border-t border-white/5 pt-8">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4 text-white/40 text-[9px] tracking-widest uppercase">
                    <span>Generated Nodes</span>
                    <span className="text-white/80 font-mono tracking-tighter">{totalSteps.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-4 text-white/20 text-[8px] tracking-widest uppercase">
                    <span>Crystalline Integrity</span>
                    <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-cyan-500/40"
                            animate={{ width: isBuilding ? "100%" : "30%" }}
                        />
                    </div>
                </div>
            </div>

            <div className="text-right max-w-[200px]">
                <p className="text-white/30 text-[9px] leading-relaxed tracking-wider italic uppercase">
                    "Every movement is a step toward the eternal light."
                </p>
                <div className="mt-4 flex justify-end gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                    <span className="text-cyan-500/50 text-[8px] font-bold tracking-widest uppercase">Streaming Context</span>
                </div>
            </div>
        </footer>
      </div>

      <LuminousCursor isActive={isBuilding} />
    </div>
  );
}

function LuminousCursor({ isActive }: { isActive: boolean }) {
    const cursorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const move = (e: MouseEvent) => {
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
            }
        };
        window.addEventListener("mousemove", move);
        return () => window.removeEventListener("mousemove", move);
    }, []);

    return (
        <div 
            ref={cursorRef}
            className={`fixed top-0 left-0 w-12 h-12 -ml-6 -mt-6 rounded-full border transition-all duration-300 pointer-events-none z-50 flex items-center justify-center ${isActive ? "border-cyan-400/50 scale-125 bg-cyan-400/10" : "border-white/10 scale-100"}`}
        >
            <div className={`w-1 h-1 rounded-full shadow-[0_0_20px_white] transition-all duration-300 ${isActive ? "bg-cyan-400 scale-150 shadow-cyan-400" : "bg-white"}`} />
            {isActive && (
                <Sparkles className="absolute w-4 h-4 text-cyan-400 animate-spin-slow opacity-50" />
            )}
        </div>
    );
}
