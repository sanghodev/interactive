"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Sparkles, Sliders, Image as ImageIcon, MousePointer2, Eraser } from "lucide-react";

// --- Configuration & Types ---
const PARTICLE_COUNT = 3000;
const SHAPE_STAG = 0, SHAPE_EAGLE = 1, SHAPE_WOLF = 2, SHAPE_CUSTOM = 3;

interface SimSettings {
    speed: number;
    friction: number;
    magnetism: number;
    particleSize: number;
    hue: number;
    glow: number;
}

class LuminousParticle {
  x: number;
  y: number;
  tx: number; 
  ty: number; 
  vx: number = 0;
  vy: number = 0;
  ease: number = 0.04 + Math.random() * 0.04;
  size: number = 0.5 + Math.random() * 1.5;

  constructor(w: number, h: number) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.tx = this.x;
    this.ty = this.y;
  }

  update(mx: number, my: number, settings: SimSettings) {
    const dx = mx - this.x;
    const dy = my - this.y;
    const distSq = dx * dx + dy * dy;
    const radius = 120;
    
    if (distSq < radius * radius) {
      const dist = Math.sqrt(distSq);
      const force = (radius - dist) / radius;
      const magForce = settings.magnetism * 4;
      this.vx -= dx / dist * force * magForce;
      this.vy -= dy / dist * force * magForce;
      // Orbital force
      this.vx += dy / dist * force * (magForce * 0.5);
      this.vy -= dx / dist * force * (magForce * 0.5);
    }

    const currentEase = this.ease * settings.speed;
    this.vx += (this.tx - this.x) * currentEase;
    this.vy += (this.ty - this.y) * currentEase;

    this.vx *= settings.friction;
    this.vy *= settings.friction;

    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx: CanvasRenderingContext2D, time: number, settings: SimSettings) {
    const localGlow = Math.sin(time * 0.002 + this.x * 0.01) * 0.5 + 0.5;
    const alpha = (0.2 + localGlow * 0.8) * settings.glow;
    ctx.fillStyle = `hsla(${settings.hue + (this.x / 10)}, 80%, 70%, ${alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * settings.particleSize * (0.8 + localGlow * 0.4), 0, Math.PI * 2);
    ctx.fill();
  }
}

// --- Standalone Template Generator ---
const generateStandaloneHTML = (points: {x: number, y: number}[], settings: SimSettings) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Luminous Menagerie - Standalone</title>
    <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #05050a; overflow: hidden; font-family: sans-serif; }
        canvas { display: block; }
        .overlay { position: fixed; bottom: 20px; left: 20px; color: rgba(255,255,255,0.2); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; pointer-events: none; }
    </style>
</head>
<body>
    <canvas id="canvas"></canvas>
    <div class="overlay">Luminous Export // PRISM</div>
    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const points = ${JSON.stringify(points)};
        const settings = ${JSON.stringify(settings)};
        
        let w, h;
        const PARTICLE_COUNT = 3000;
        const particles = [];
        const mouse = { x: -1000, y: -1000 };

        class Particle {
            constructor() {
                this.x = Math.random() * innerWidth;
                this.y = Math.random() * innerHeight;
                this.tx = this.x;
                this.ty = this.y;
                this.vx = 0;
                this.vy = 0;
                this.ease = 0.04 + Math.random() * 0.04;
                this.size = 0.5 + Math.random() * 1.5;
            }
            update() {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < 14400) {
                    const dist = Math.sqrt(distSq);
                    const force = (120 - dist) / 120;
                    const mag = settings.magnetism * 4;
                    this.vx -= dx / dist * force * mag;
                    this.vy -= dy / dist * force * mag;
                    this.vx += dy / dist * force * (mag * 0.5);
                    this.vy -= dx / dist * force * (mag * 0.5);
                }
                const ease = this.ease * settings.speed;
                this.vx += (this.tx - this.x) * ease;
                this.vy += (this.ty - this.y) * ease;
                this.vx *= settings.friction;
                this.vy *= settings.friction;
                this.x += this.vx;
                this.y += this.vy;
            }
            draw(time) {
                const glow = Math.sin(time * 0.002 + this.x * 0.01) * 0.5 + 0.5;
                ctx.fillStyle = 'hsla(' + (settings.hue + (this.x / 10)) + ', 80%, 70%, ' + ((0.2 + glow * 0.8) * settings.glow) + ')';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * settings.particleSize * (0.8 + glow * 0.4), 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function init() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            for(let i=0; i<PARTICLE_COUNT; i++) {
                const p = new Particle();
                const pt = points[Math.floor((i / PARTICLE_COUNT) * points.length)] || {x: w/2, y: h/2};
                p.tx = pt.x; p.ty = pt.y;
                particles.push(p);
            }
        }

        function animate(t) {
            ctx.fillStyle = 'rgba(5, 5, 10, 0.2)';
            ctx.fillRect(0, 0, w, h);
            particles.forEach(p => { p.update(); p.draw(t); });
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        });
        window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
        
        init();
        requestAnimationFrame(animate);
    </script>
</body>
</html>`;
};

export default function LuminousMenagerie() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentShape, setCurrentShape] = useState(SHAPE_STAG);
  const [settings, setSettings] = useState<SimSettings>({
      speed: 1.0,
      friction: 0.94,
      magnetism: 1.0,
      particleSize: 1.0,
      hue: 30,
      glow: 1.0,
  });
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<LuminousParticle[]>([]);
  const customPointsRef = useRef<{x: number, y: number}[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    if (particlesRef.current.length === 0) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particlesRef.current.push(new LuminousParticle(w, h));
        }
    }

    const getTargetPos = (index: number, shape: number, width: number, height: number) => {
        if (shape === SHAPE_CUSTOM && customPointsRef.current.length > 0) {
            const ptIndex = Math.floor((index / PARTICLE_COUNT) * customPointsRef.current.length);
            return customPointsRef.current[ptIndex];
        }

        const t = (index / PARTICLE_COUNT);
        const scale = Math.min(width, height) * 0.5;
        const centerX = width / 2;
        const centerY = height / 2;

        if (shape === SHAPE_STAG) {
            if (t < 0.3) { 
                const bt = (t / 0.3) * Math.PI * 2;
                return { x: centerX + Math.cos(bt) * scale * 0.2, y: centerY + Math.sin(bt) * scale * 0.1 + 50 };
            } else if (t < 0.5) { 
                const nt = (t - 0.3) / 0.2;
                return { x: centerX + 50 + nt * 20, y: centerY - nt * 100 + 50 };
            } else { 
                const at = (t - 0.5) / 0.5;
                const side = at < 0.5 ? -1 : 1;
                const localT = (at % 0.5) / 0.5;
                return {
                    x: centerX + 70 + (Math.sin(localT * 10) * 30 + localT * 50) * side,
                    y: centerY - 50 - localT * 150 + Math.cos(localT * 5) * 20
                };
            }
        } else if (shape === SHAPE_EAGLE) {
            if (t < 0.7) { 
                const wingT = (t / 0.7) * 2 - 1; 
                const wingCurve = Math.pow(Math.abs(wingT), 0.5) * -150;
                const flutter = Math.sin(Date.now() * 0.005 + wingT * 5) * 20;
                return {
                    x: centerX + wingT * scale * 0.8,
                    y: centerY + wingCurve + flutter
                };
            } else { 
                const bt = (t - 0.7) / 0.3;
                return {
                    x: centerX + Math.cos(bt * Math.PI * 2) * 30,
                    y: centerY + bt * 50 - 20
                };
            }
        } else {
            if (t < 0.4) { 
                const bt = (t / 0.4) * Math.PI * 2;
                return { x: centerX + Math.cos(bt) * scale * 0.3, y: centerY + Math.sin(bt) * scale * 0.15 + 40 };
            } else if (t < 0.7) { 
                const ht = (t - 0.4) / 0.3;
                return {
                  x: centerX - 120 + (ht < 0.5 ? 0 : 20),
                  y: centerY - 20 - (ht * 100)
                };
            } else { 
                const tt = (t - 0.7) / 0.3;
                return {
                    x: centerX + 150 + tt * 60,
                    y: centerY + 20 + Math.sin(tt * 5) * 40
                };
            }
        }
    };

    const updateTargets = () => {
        particlesRef.current.forEach((p, i) => {
            const target = getTargetPos(i, currentShape, w, h);
            p.tx = target.x;
            p.ty = target.y;
        });
    };

    updateTargets();

    const handleResize = () => {
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;
        updateTargets();
    };

    const handleMouseMove = (e: MouseEvent) => {
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    let animationId: number;
    const render = (time: number) => {
        ctx.fillStyle = "rgba(5, 5, 10, 0.2)";
        ctx.fillRect(0, 0, w, h);

        particlesRef.current.forEach(p => {
            p.update(mouseRef.current.x, mouseRef.current.y, settings);
            p.draw(ctx, time, settings);
        });

        if (currentShape === SHAPE_EAGLE) {
            updateTargets();
        }

        animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    let shapeInterval: NodeJS.Timeout;
    if (!isStudioOpen && currentShape !== SHAPE_CUSTOM) {
        shapeInterval = setInterval(() => {
            setCurrentShape(prev => (prev + 1) % 3);
        }, 8000);
    }

    return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("mousemove", handleMouseMove);
        cancelAnimationFrame(animationId);
        if (shapeInterval) clearInterval(shapeInterval);
    };
  }, [currentShape, isStudioOpen, settings]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const tempCanvas = document.createElement("canvas");
            const tempCtx = tempCanvas.getContext("2d");
            if (!tempCtx) return;

            const maxDim = 400;
            const aspect = img.width / img.height;
            if (img.width > img.height) {
                tempCanvas.width = maxDim;
                tempCanvas.height = maxDim / aspect;
            } else {
                tempCanvas.height = maxDim;
                tempCanvas.width = maxDim * aspect;
            }

            tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
            const data = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;
            const points: {x: number, y: number}[] = [];

            const step = 4;
            for (let y = 0; y < tempCanvas.height; y += step) {
                for (let x = 0; x < tempCanvas.width; x += step) {
                    const idx = (y * tempCanvas.width + x) * 4;
                    const brightness = (data[idx] + data[idx+1] + data[idx+2]) / 3;
                    if (brightness > 120) {
                        points.push({
                            x: (x / tempCanvas.width - 0.5) * (window.innerWidth * 0.6) + window.innerWidth / 2,
                            y: (y / tempCanvas.height - 0.5) * (window.innerHeight * 0.6) + window.innerHeight / 2
                        });
                    }
                }
            }

            if (points.length > 0) {
                customPointsRef.current = points;
                setCurrentShape(SHAPE_CUSTOM);
            }
        };
        img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleExport = () => {
      // Collect current points
      const currentPoints = particlesRef.current.map(p => ({ x: p.tx, y: p.ty }));
      const html = generateStandaloneHTML(currentPoints, settings);
      
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `luminous_menagerie_export_${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-full h-screen bg-[#05050a] overflow-hidden cursor-none select-none font-sans">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] rounded-full bg-indigo-600/5 blur-[150px]" />
      </div>

      {/* Hero UI */}
      <div className="relative z-10 w-full h-full flex flex-col pointer-events-none p-8 md:p-12">
        <nav className="flex justify-between items-start">
            <Link href="/" className="pointer-events-auto">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 group"
                >
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all backdrop-blur-md">
                        <ArrowLeft className="w-4 h-4 text-white/50 group-hover:text-white" />
                    </div>
                </motion.div>
            </Link>

            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-right pointer-events-auto cursor-pointer group"
                onClick={() => setIsStudioOpen(!isStudioOpen)}
            >
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-500 ${isStudioOpen ? "bg-amber-500/20 border-amber-500/50 text-amber-500" : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"} text-[9px] font-bold tracking-[0.3em] uppercase mb-3`}>
                    <Sparkles className={`w-3 h-3 ${isStudioOpen ? "animate-pulse" : ""}`} />
                    <span>{isStudioOpen ? "Close Studio" : "Open Studio"}</span>
                </div>
                <h1 className="text-white text-sm font-light tracking-[0.5em] uppercase group-hover:text-indigo-400 transition-colors">Luminous Menagerie</h1>
                <p className="text-white/20 text-[10px] mt-1 tracking-widest uppercase">Archive // EXP 037</p>
            </motion.div>
        </nav>

        <div className="flex-grow flex flex-col items-center justify-end text-center mb-12">
            <motion.div
                key={currentShape}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.3, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-4"
            >
                <h2 className="text-3xl md:text-5xl font-thin text-white tracking-[1em] uppercase">
                    {currentShape === SHAPE_EAGLE ? "Phoenix" : 
                     currentShape === SHAPE_STAG ? "Sacred Stag" : 
                     currentShape === SHAPE_WOLF ? "Night Howler" : "Custom Shape"}
                </h2>
            </motion.div>
            
            <p className="text-white/15 text-[9px] tracking-[0.8em] uppercase">
                {isStudioOpen ? "Studio Mode Active" : "Move cursor to influence the spectral flow"}
            </p>
        </div>

        <footer className="flex justify-between items-end text-[8px] font-medium tracking-[0.4em] uppercase text-white/20">
            <div className="flex flex-col gap-2">
                <span>Morphing Geometry</span>
                <span>{PARTICLE_COUNT.toLocaleString()} Spectral Points</span>
            </div>
            <div className="text-right">
                <span>Interwoven Reality</span>
                <span>Continuous Evolution</span>
            </div>
        </footer>
      </div>

      {/* Studio UI Overlay */}
      <AnimatePresence>
        {isStudioOpen && (
            <motion.div
                initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 40, filter: "blur(10px)" }}
                className="fixed right-8 top-1/2 -translate-y-1/2 z-40 w-80 p-8 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-y-auto max-h-[90vh]"
            >
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-white text-[10px] font-bold tracking-[0.3em] uppercase">Studio Controls</h3>
                </div>
                
                <div className="space-y-8">
                    <ControlSlider 
                        label="Evolution Speed" 
                        value={settings.speed} 
                        min={0.2} max={3} step={0.1} 
                        onChange={(v) => setSettings(s => ({...s, speed: v}))} 
                    />
                    <ControlSlider 
                        label="Viscosity (Friction)" 
                        value={settings.friction} 
                        min={0.8} max={0.99} step={0.01} 
                        onChange={(v) => setSettings(s => ({...s, friction: v}))} 
                    />
                    <ControlSlider 
                        label="Magnetic Force" 
                        value={settings.magnetism} 
                        min={0} max={3} step={0.1} 
                        onChange={(v) => setSettings(s => ({...s, magnetism: v}))} 
                    />
                    <ControlSlider 
                        label="Glow Intensity" 
                        value={settings.glow} 
                        min={0.1} max={2} step={0.1} 
                        onChange={(v) => setSettings(s => ({...s, glow: v}))} 
                    />
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-[9px] uppercase tracking-widest text-white/30">
                            <span>Spectrum (Hue)</span>
                            <span className="text-white/60 font-mono">{settings.hue}°</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" max="360" 
                            value={settings.hue} 
                            onChange={(e) => setSettings(s => ({...s, hue: parseInt(e.target.value)}))}
                            className="w-full h-1 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 appearance-none rounded-full cursor-pointer accent-white"
                        />
                    </div>

                    <div className="pt-6 space-y-4 border-t border-white/5">
                        <div className="flex items-center gap-2 text-white/30 text-[9px] uppercase tracking-widest">
                            <ImageIcon className="w-3 h-3" />
                            <span>Silhouette Generator</span>
                        </div>
                        
                        <label className="flex flex-col items-center justify-center h-28 border border-white/10 bg-white/5 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer text-white/40 hover:text-white group">
                            <Sparkles className="w-5 h-5 mb-2 text-indigo-400 group-hover:scale-125 transition-transform" />
                            <span className="text-[10px] uppercase tracking-tighter font-semibold">Extract from Image</span>
                            <span className="text-[8px] opacity-50 mt-1 uppercase tracking-widest">PNG / JPG</span>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>

                        <button 
                            onClick={() => setCurrentShape((prev) => (prev + 1) % 3)}
                            className="flex items-center justify-center gap-2 w-full py-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] uppercase tracking-[0.3em] font-bold rounded-xl hover:bg-indigo-500/20 transition-all"
                        >
                            <MousePointer2 className="w-3 h-3" />
                            Next Animal
                        </button>

                        <button 
                            onClick={handleExport}
                            className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] uppercase tracking-[0.3em] font-bold rounded-xl hover:bg-emerald-500/30 transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                        >
                            <Sparkles className="w-3 h-3" />
                            Download Standalone (.html)
                        </button>

                        <button 
                            onClick={() => {
                                setCurrentShape(SHAPE_STAG);
                                setSettings({
                                    speed: 1.0, friction: 0.94, magnetism: 1.0, particleSize: 1.0, hue: 30, glow: 1.0
                                });
                            }}
                            className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 border border-white/10 text-white/40 text-[9px] uppercase tracking-[0.3em] font-bold rounded-xl hover:bg-white/10 transition-all"
                        >
                            <Eraser className="w-3 h-3" />
                            Reset Defaults
                        </button>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <LuminousCursor />
    </div>
  );
}

function ControlSlider({ label, value, min, max, step, onChange }: { label: string, value: number, min: number, max: number, step: number, onChange: (v: number) => void }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center text-[9px] uppercase tracking-widest">
                <span className="text-white/30">{label}</span>
                <span className="text-white/70 font-mono tracking-tighter">{value.toFixed(2)}</span>
            </div>
            <div className="relative flex items-center">
                <input 
                    type="range" 
                    min={min} max={max} step={step} 
                    value={value} 
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/10 appearance-none rounded-full cursor-pointer accent-white hover:accent-indigo-400 transition-all"
                />
            </div>
        </div>
    );
}

function LuminousCursor() {
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
            className="fixed w-4 h-4 rounded-full border border-white/20 pointer-events-none z-50 flex items-center justify-center backdrop-blur-sm"
            style={{ 
                left: pos.x, 
                top: pos.y, 
                translateX: "-50%", 
                translateY: "-50%" 
            }}
        >
            <motion.div 
                className="w-[2px] h-[2px] bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                animate={{ scale: [1, 2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
            />
        </motion.div>
    );
}
