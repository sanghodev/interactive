"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Bug } from "lucide-react";

// --- Simulation Constants ---
const AGENT_COUNT = 3000;
const SENSOR_ANGLE = Math.PI / 4; 
const SENSOR_DIST = 15;
const TURN_SPEED = 0.3;
const AGENT_SPEED = 1.5;
const EVAPORATION_RATE = 0.94;
const DIFFUSION_RATE = 0.1;

class Ant {
  x: number;
  y: number;
  angle: number;
  speed: number;
  randomOffset: number;
  sensorDist: number;

  constructor(w: number, h: number) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.angle = Math.random() * Math.PI * 2;
    this.speed = AGENT_SPEED * (0.8 + Math.random() * 0.4);
    this.randomOffset = Math.random() * 1000;
    this.sensorDist = SENSOR_DIST * (0.8 + Math.random() * 0.4);
  }

  update(w: number, h: number, trailData: Uint8ClampedArray, mouseX: number, mouseY: number, mouseVel: number) {
    // 1. Direct Mouse Attraction (if close and moving)
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distSq = dx * dx + dy * dy;
    const influenceRadius = 150;
    
    if (distSq < influenceRadius * influenceRadius) {
        const dist = Math.sqrt(distSq);
        const force = (1 - dist / influenceRadius) * (0.02 + mouseVel * 0.05);
        const targetAngle = Math.atan2(dy, dx);
        
        // Blend towards mouse angle
        let angleDiff = targetAngle - this.angle;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        
        this.angle += angleDiff * force;
    }

    // 2. Sensor logic
    const v1 = this.sense(trailData, this.angle - SENSOR_ANGLE, w, h);
    const v2 = this.sense(trailData, this.angle, w, h);
    const v3 = this.sense(trailData, this.angle + SENSOR_ANGLE, w, h);

    const jitter = (Math.random() - 0.5) * 0.2;
    
    if (v2 > v1 && v2 > v3) {
      // Stay on course
    } else if (v2 < v1 && v2 < v3) {
      this.angle += (Math.random() - 0.5) * 2 * TURN_SPEED;
    } else if (v1 > v3) {
      this.angle -= TURN_SPEED + jitter;
    } else if (v3 > v1) {
      this.angle += TURN_SPEED + jitter;
    }

    // 3. Spontaneous randomness (Wander)
    this.angle += (Math.random() - 0.5) * 0.15;

    // 4. Move
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    // Edge handling
    if (this.x < 0) { this.x = w - 1; this.angle += Math.PI; }
    if (this.x >= w) { this.x = 0; this.angle += Math.PI; }
    if (this.y < 0) { this.y = h - 1; this.angle += Math.PI; }
    if (this.y >= h) { this.y = 0; this.angle += Math.PI; }
  }

  sense(trailData: Uint8ClampedArray, sensorAngle: number, w: number, h: number) {
    const sx = this.x + Math.cos(sensorAngle) * this.sensorDist;
    const sy = this.y + Math.sin(sensorAngle) * this.sensorDist;
    
    if (sx < 0 || sx >= w || sy < 0 || sy >= h) return 0;
    
    const idx = (Math.floor(sy) * w + Math.floor(sx)) * 4;
    return trailData[idx]; 
  }
}

export default function AntColony() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pheromoneCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const mouseRef = useRef({ x: -100, y: -100, lastX: -100, lastY: -100, vel: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const pCanvas = pheromoneCanvasRef.current;
    if (!canvas || !pCanvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    const pCtx = pCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx || !pCtx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    
    const scale = 0.5;
    const sw = Math.floor(w * scale);
    const sh = Math.floor(h * scale);

    canvas.width = w;
    canvas.height = h;
    pCanvas.width = sw;
    pCanvas.height = sh;

    const ants: Ant[] = [];
    for (let i = 0; i < AGENT_COUNT; i++) {
        ants.push(new Ant(sw, sh));
    }

    pCtx.fillStyle = "black";
    pCtx.fillRect(0, 0, sw, sh);

    const handleResize = () => {
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;
    };

    const handleMouseMove = (e: MouseEvent) => {
        const mx = e.clientX * scale;
        const my = e.clientY * scale;
        
        // Calculate velocity
        const dx = mx - mouseRef.current.x;
        const dy = my - mouseRef.current.y;
        const currentVel = Math.sqrt(dx * dx + dy * dy);
        
        mouseRef.current.lastX = mouseRef.current.x;
        mouseRef.current.lastY = mouseRef.current.y;
        mouseRef.current.x = mx;
        mouseRef.current.y = my;
        // Dampened velocity
        mouseRef.current.vel = mouseRef.current.vel * 0.9 + currentVel * 0.1;
    };
    
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    setIsReady(true);

    let animationId: number;
    const render = () => {
        const imgData = pCtx.getImageData(0, 0, sw, sh);
        const data = imgData.data;

        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const mvel = mouseRef.current.vel;

        // Update Ants
        ants.forEach(ant => {
            ant.update(sw, sh, data, mx, my, mvel);
            const idx = (Math.floor(ant.y) * sw + Math.floor(ant.x)) * 4;
            
            // Pheromone color shifts slightly based on local activity
            data[idx] = Math.min(255, data[idx] + 30); 
            data[idx+1] = Math.min(255, data[idx+1] + 20);
            data[idx+2] = Math.min(255, data[idx+2] + 10);
        });

        // Mouse pheromone deposit (stronger when moving)
        if (mx > 0) {
            const range = 4 + Math.floor(mvel * 0.5);
            for (let ox = -range; ox < range; ox++) {
                for (let oy = -range; oy < range; oy++) {
                    const tx = Math.floor(mx + ox);
                    const ty = Math.floor(my + oy);
                    if (tx >= 0 && tx < sw && ty >= 0 && ty < sh) {
                        const idx = (ty * sw + tx) * 4;
                        const strength = Math.max(0, 1 - Math.sqrt(ox*ox + oy*oy) / range);
                        data[idx] = Math.min(255, data[idx] + 50 * strength);
                        data[idx+1] = Math.min(255, data[idx+1] + 60 * strength);
                        data[idx+2] = Math.min(255, data[idx+2] + 80 * strength);
                    }
                }
            }
        }

        // Diffusion & Evaporation
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.floor(data[i] * EVAPORATION_RATE);
            data[i+1] = Math.floor(data[i+1] * (EVAPORATION_RATE - 0.01));
            data[i+2] = Math.floor(data[i+2] * (EVAPORATION_RATE - 0.02));
        }

        pCtx.putImageData(imgData, 0, 0);

        ctx.fillStyle = "#0a0805";
        ctx.fillRect(0, 0, w, h);
        
        ctx.globalCompositeOperation = "screen";
        ctx.drawImage(pCanvas, 0, 0, w, h);
        ctx.globalCompositeOperation = "source-over";

        animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("mousemove", handleMouseMove);
        cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#0a0805] overflow-hidden cursor-none select-none font-sans">
      <canvas ref={pheromoneCanvasRef} className="hidden" />
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Hero UI */}
      <div className="relative z-10 w-full h-full flex flex-col pointer-events-none">
        <nav className="p-8 flex justify-between items-start">
            <Link href="/" className="pointer-events-auto">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 group"
                >
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-4 h-4 text-white/50" />
                    </div>
                </motion.div>
            </Link>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-end"
            >
                <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-bold tracking-widest uppercase mb-2">
                    Live Simulation
                </div>
                <h2 className="text-white/20 text-[10px] tracking-[0.4em] uppercase">Archive / Exp 036</h2>
            </motion.div>
        </nav>

        <div className="flex-grow flex flex-col items-center justify-center text-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="max-w-4xl"
            >
                <h1 className="text-7xl md:text-9xl font-black text-white leading-none tracking-tighter uppercase mb-6 drop-shadow-2xl">
                    Collective<br />Logic.
                </h1>
                <p className="text-amber-500/40 text-xs md:text-sm tracking-[0.5em] uppercase font-light">
                    An emergent colony of 3,000 algorithmic agents
                </p>
            </motion.div>
        </div>

        <footer className="p-12 flex justify-between items-end">
             <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-0.5 bg-amber-500/30" />
                    <span className="text-white/30 text-[9px] uppercase tracking-[0.3em]">Agent-Based Intelligence</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-0.5 bg-amber-500/30" />
                    <span className="text-white/30 text-[9px] uppercase tracking-[0.3em]">Pheromone Gradient Decay</span>
                </div>
             </div>

             <motion.div 
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="flex items-center gap-2"
             >
                <Bug className="w-4 h-4 text-amber-500/50 fill-amber-500/20" />
                <span className="text-amber-500/50 text-[10px] uppercase tracking-widest">Colony Active</span>
             </motion.div>
        </footer>
      </div>

      {/* Grainy Texture Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Interaction Ripple */}
      <InteractionIndicator />
    </div>
  );
}

function InteractionIndicator() {
    const [pos, setPos] = useState({ x: -100, y: -100 });

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            setPos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMove);
        return () => window.removeEventListener("mousemove", handleMove);
    }, []);

    return (
        <motion.div 
            className="fixed w-32 h-32 rounded-full border border-amber-500/10 pointer-events-none z-50 flex items-center justify-center"
            style={{ 
                left: pos.x, 
                top: pos.y, 
                translateX: "-50%", 
                translateY: "-50%" 
            }}
        >
            <div className="w-1 h-1 bg-amber-500/50 rounded-full" />
            <motion.div 
                className="absolute inset-0 rounded-full border border-amber-500/20"
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ repeat: Infinity, duration: 2 }}
            />
        </motion.div>
    );
}
