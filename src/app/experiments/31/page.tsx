"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Shield, User } from 'lucide-react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

// --- Perlin Noise Utility ---
// A simple 2D Perlin Noise implementation for smooth, organic randomness
class Perlin {
  p: number[];
  constructor() {
    this.p = new Array(512);
    const permutation = [151,160,137,91,90,15,
      131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
      190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
      88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
      77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
      102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
      135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
      5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,162,215,171,180,72,127,
      132,243,121,167,93,154,152,157,189,128,155,204,115,221,104,106,193,121,182,
      24,11,214,125,249,211,210,135,112,111,236,110,67,113,220,114,232,192,115,221];
    for (let i = 0; i < 256; i++) {
      this.p[i] = this.p[i + 256] = permutation[i];
    }
  }

  fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
  lerp(t: number, a: number, b: number) { return a + t * (b - a); }
  grad(hash: number, x: number, y: number, z: number) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x: number, y: number, z: number) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);
    const A = this.p[X] + Y, AA = this.p[A] + Z, AB = this.p[A + 1] + Z;
    const B = this.p[X + 1] + Y, BA = this.p[B] + Z, BB = this.p[B + 1] + Z;

    return this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.p[AA], x, y, z),
      this.grad(this.p[BA], x - 1, y, z)),
      this.lerp(u, this.grad(this.p[AB], x, y - 1, z),
        this.grad(this.p[BB], x - 1, y - 1, z))),
      this.lerp(v, this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1),
        this.grad(this.p[BA + 1], x - 1, y, z - 1)),
        this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1),
          this.grad(this.p[BB + 1], x - 1, y - 1, z - 1))));
  }
}

const perlin = new Perlin();

export default function PerlinRevealExperiment() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  
  const mouseXMotion = useMotionValue(0.5);
  const smoothMouseX = useSpring(mouseXMotion, {
    damping: 35,
    stiffness: 120,
    mass: 0.4
  });

  const imgARef = useRef<HTMLImageElement | null>(null);
  const imgBRef = useRef<HTMLImageElement | null>(null);

  const indicatorLeft = useTransform(smoothMouseX, [0, 1], ["0%", "100%"]);
  const valorOpacity = useTransform(smoothMouseX, [0.3, 0.6], [1, 0]);
  const logicOpacity = useTransform(smoothMouseX, [0.4, 0.7], [0, 1]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const imgA = new Image();
    const imgB = new Image();
    
    imgA.onload = () => { imgARef.current = imgA; };
    imgB.onload = () => { imgBRef.current = imgB; };
    
    imgA.src = '/images/31/corporate.jpg';
    imgB.src = '/images/31/athlete.jpg';

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    let animationFrameId: number;

    const getDrawMeta = (img: HTMLImageElement, w: number, h: number) => {
      const imgRatio = img.width / img.height;
      const canvasRatio = w / h;
      let drawW, drawH, offsetX, offsetY;
      if (imgRatio > canvasRatio) {
        drawW = h * imgRatio;
        drawH = h;
        offsetX = (w - drawW) / 2;
        offsetY = 0;
      } else {
        drawW = w;
        drawH = w / imgRatio;
        offsetX = 0;
        offsetY = (h - drawH) / 2;
      }
      return { drawW, drawH, offsetX, offsetY };
    };

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) return;
      
      const progress = smoothMouseX.get();
      const time = Date.now() * 0.0003;

      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Background (Athlete)
      if (imgBRef.current && imgBRef.current.complete && imgBRef.current.naturalWidth > 0) {
        const meta = getDrawMeta(imgBRef.current, width, height);
        ctx.drawImage(imgBRef.current, meta.offsetX, meta.offsetY, meta.drawW, meta.drawH);
      }

      // 2. Draw Lightweight Organic Transition (Corporate)
      if (imgARef.current && imgARef.current.complete && imgARef.current.naturalWidth > 0) {
        const metaA = getDrawMeta(imgARef.current, width, height);
        
        // Increased baseSize to 8px for significant performance boost
        const baseSize = 8; 
        const cols = Math.ceil(width / baseSize);
        const rows = Math.ceil(height / baseSize);
        
        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const relX = i / cols;
            const relY = j / rows;
            
            // Simplified noise for performance
            const n1 = perlin.noise(relX * 2, relY * 2, time); 
            const n2 = perlin.noise(relX * 5, relY * 5, time * 1.5);
            // High-freq jitter dither
            const dither = (Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1; 
            
            const threshold = relX + (n1 * 0.15) + (n2 * 0.1) + (dither * 0.08);
            const dist = progress - threshold;
            
            if (dist > 0) {
              const x = i * baseSize;
              const y = j * baseSize;
              
              const relativeXInDraw = x - metaA.offsetX;
              const relativeYInDraw = y - metaA.offsetY;
              
              if (relativeXInDraw >= 0 && relativeXInDraw < metaA.drawW &&
                  relativeYInDraw >= 0 && relativeYInDraw < metaA.drawH) {
                
                const sampleX = (relativeXInDraw / metaA.drawW) * imgARef.current.width;
                const sampleY = (relativeYInDraw / metaA.drawH) * imgARef.current.height;

                // 2. Focus Scaling
                const t = Math.min(1.0, dist / 0.2);
                
                // Continuous crystallization
                const currentBlockSize = baseSize + (24 * (1 - Math.pow(t, 2)));
                
                // Centering Fix: ensure large block center matches high-res cell center
                const visualOffsetX = (baseSize - currentBlockSize) / 2;
                const visualOffsetY = (baseSize - currentBlockSize) / 2;

                ctx.globalAlpha = Math.min(1.0, t * 2);

                if (t < 0.4) {
                  // Mosaic phase: single point sample (centered)
                  // Use sample from the middle of the cell for better color accuracy
                  ctx.drawImage(
                    imgARef.current, 
                    sampleX, sampleY, 1, 1, 
                    x + visualOffsetX, y + visualOffsetY, currentBlockSize, currentBlockSize
                  );
                } else {
                  // High-res phase: sample actual image chunk
                  const sw = (baseSize / metaA.drawW) * imgARef.current.width;
                  const sh = (baseSize / metaA.drawH) * imgARef.current.height;
                  ctx.drawImage(
                    imgARef.current, 
                    sampleX, sampleY, sw, sh, 
                    x, y, baseSize, baseSize
                  );
                }
              }
            }
          }
        }
        ctx.globalAlpha = 1.0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleMove = (clientX: number) => {
      const x = clientX / window.innerWidth;
      mouseXMotion.set(Math.max(0, Math.min(1, x)));
    };

    const mouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const touchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handleMove(e.touches[0].clientX);
    };

    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('touchmove', touchMove, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('touchmove', touchMove);
    };
  }, [mounted, mouseXMotion, smoothMouseX]);

  if (!mounted) return null;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050505] font-sans">
      {/* Interaction Indicator */}
      <motion.div 
        className="absolute top-0 bottom-0 z-40 w-px bg-white/40 shadow-[0_0_25px_rgba(255,255,255,0.4)] pointer-events-none mix-blend-difference"
        style={{ left: indicatorLeft }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/30 bg-black/60 backdrop-blur-xl flex items-center justify-center">
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse delay-75" />
          </div>
        </div>
      </motion.div>

      {/* Navigation Banner */}
      <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center mix-blend-difference pointer-events-none">
        <Link href="/" scroll={false} className="pointer-events-auto">
          <motion.div
            whileHover={{ x: -4, opacity: 0.8 }}
            className="flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl text-[10px] font-black tracking-[0.6em] uppercase transition-all cursor-pointer text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Archive / EXP-031</span>
          </motion.div>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-[9px] font-black tracking-[0.5em] text-white/40 uppercase">
          <span>Perlin Noise Reconfiguration</span>
          <div className="w-12 h-px bg-white/10" />
          <span>v1.0 / Beta</span>
        </div>
      </nav>

      {/* Narrative Context Overlays */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <motion.div 
          style={{ opacity: valorOpacity }}
          className="absolute bottom-16 left-8 md:left-16 space-y-4 mix-blend-difference"
        >
          <div className="flex items-center gap-4 opacity-50">
            <Shield className="w-5 h-5 text-white" />
            <span className="text-[11px] font-black tracking-[0.5em] uppercase text-white">Primal Valor</span>
          </div>
          <h2 className="text-[12vw] font-black tracking-tighter leading-[0.85] text-white">
            ATHLETE
          </h2>
        </motion.div>

        <motion.div 
          style={{ opacity: logicOpacity }}
          className="absolute bottom-16 right-8 md:right-16 text-right space-y-4 mix-blend-difference"
        >
          <div className="flex flex-row-reverse items-center gap-4 opacity-50">
            <User className="w-5 h-5 text-white" />
            <span className="text-[11px] font-black tracking-[0.5em] uppercase text-white">Calculated Logic</span>
          </div>
          <h2 className="text-[12vw] font-black tracking-tighter leading-[0.85] text-white">
            STRATEGY
          </h2>
        </motion.div>
      </div>

      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-none touch-none"
      />
      
      {/* Interaction Prompts */}
      <div className="fixed bottom-10 left-10 right-10 z-30 flex justify-between items-end mix-blend-difference pointer-events-none uppercase font-black text-[9px] tracking-[0.5em] opacity-40 text-white">
        <div className="flex items-center gap-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Move to harmonize with noise</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Perlin Reconstruction Protocol</span>
          <div className="w-10 h-px bg-white/30" />
          <span>031</span>
        </div>
      </div>

      <style jsx global>{`
        body { margin: 0; background: #050505; overflow: hidden; }
        canvas { filter: saturate(1.05) contrast(1.1) brightness(1.1); }
      `}</style>
    </div>
  );
}
