"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Shield, User } from 'lucide-react';
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion';

export default function PixelMosaicExperiment() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  
  // PARITY: Interaction model from Experiment 29
  const mouseXMotion = useMotionValue(0.5);
  const smoothMouseX = useSpring(mouseXMotion, {
    damping: 35,
    stiffness: 120,
    mass: 0.4
  });

  const imgARef = useRef<HTMLImageElement | null>(null);
  const imgBRef = useRef<HTMLImageElement | null>(null);

  // UI Overlays
  const indicatorLeft = useTransform(smoothMouseX, [0, 1], ["0%", "100%"]);
  // Adjust opacities to be visible more easily during center transition
  const valorOpacity = useTransform(smoothMouseX, [0.3, 0.6], [1, 0]);
  const logicOpacity = useTransform(smoothMouseX, [0.4, 0.7], [0, 1]);

  // Ensure component is mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Canvas Logic - only runs after mounting
  useEffect(() => {
    if (!mounted) return;
    
    console.log("EXP-30: Initializing Canvas Logic...");
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("EXP-30: Canvas Ref is null despite being mounted!");
      return;
    }
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const imgA = new Image();
    const imgB = new Image();
    
    imgA.onload = () => { console.log("EXP-30: Image A (Corporate) Loaded"); imgARef.current = imgA; };
    imgB.onload = () => { console.log("EXP-30: Image B (Athlete) Loaded"); imgBRef.current = imgB; };
    imgA.onerror = () => console.error("EXP-30: Error loading Image A");
    imgB.onerror = () => console.error("EXP-30: Error loading Image B");

    imgA.src = '/images/30/corporate.jpg';
    imgB.src = '/images/30/athlete.jpg';

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      console.log(`EXP-30: Canvas Resized to ${canvas.width}x${canvas.height}`);
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
      
      const progress = smoothMouseX.get();
      const time = Date.now() * 0.001;

      // Fill background
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Base Layer (Athlete - Image B)
      if (imgBRef.current && imgBRef.current.complete && imgBRef.current.naturalWidth > 0) {
        const meta = getDrawMeta(imgBRef.current, width, height);
        ctx.drawImage(imgBRef.current, meta.offsetX, meta.offsetY, meta.drawW, meta.drawH);
      }

      // 2. Draw Mosaic Layer (Corporate - Image A)
      if (imgARef.current && imgARef.current.complete && imgARef.current.naturalWidth > 0) {
        const metaA = getDrawMeta(imgARef.current, width, height);
        const pixelSize = 16;
        const cols = Math.ceil(width / pixelSize);
        const rows = Math.ceil(height / pixelSize);
        
        ctx.globalAlpha = 1.0;

        for (let i = 0; i < cols; i++) {
          for (let j = 0; j < rows; j++) {
            const x = i * pixelSize;
            const y = j * pixelSize;
            
            const relX = i / cols;
            const relY = j / rows;
            
            let noise = Math.sin(relX * 10 + time * 0.5) * Math.cos(relY * 8 + time * 0.3) * 0.12;
            noise += Math.sin(relX * 20 - time * 0.7) * 0.04;
            
            const threshold = relX + noise;
            
            if (progress > threshold) {
              const diff = progress - threshold;
              const scale = Math.min(1.0, diff * 12);
              
              if (scale > 0.01) {
                const sSize = pixelSize * scale;
                const offset = (pixelSize - sSize) / 2;

                const relativeXInDraw = x - metaA.offsetX;
                const relativeYInDraw = y - metaA.offsetY;
                
                if (relativeXInDraw >= 0 && relativeXInDraw < metaA.drawW &&
                    relativeYInDraw >= 0 && relativeYInDraw < metaA.drawH) {
                  
                  const sampleX = (relativeXInDraw / metaA.drawW) * imgARef.current.width;
                  const sampleY = (relativeYInDraw / metaA.drawH) * imgARef.current.height;
                  
                  ctx.drawImage(
                    imgARef.current, 
                    sampleX, sampleY, 1, 1, 
                    x + offset, y + offset, sSize, sSize
                  );
                }
              }
            }
          }
        }
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
    <div className="relative w-full h-screen overflow-hidden bg-[#050505] font-sans selection:bg-white/30">
      {/* Interaction Indicator (Line) */}
      <motion.div 
        className="absolute top-0 bottom-0 z-40 w-px bg-white/40 shadow-[0_0_20px_rgba(255,255,255,0.4)] pointer-events-none mix-blend-difference"
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
            <span>Archive / EXP-030</span>
          </motion.div>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-[9px] font-black tracking-[0.5em] text-white/40 uppercase">
          <span>Mosaic Assembly System</span>
          <div className="w-12 h-px bg-white/10" />
          <span>v2.1 / Stable</span>
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

      {/* Main Canvas Engine */}
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-none touch-none"
      />
      
      {/* Interaction Prompts */}
      <div className="fixed bottom-10 left-10 right-10 z-30 flex justify-between items-end mix-blend-difference pointer-events-none uppercase font-black text-[9px] tracking-[0.5em] opacity-40 text-white">
        <div className="flex items-center gap-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Move to harmonize identities</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Pixel Reconfiguration Protocol</span>
          <div className="w-10 h-px bg-white/30" />
          <span>030</span>
        </div>
      </div>

      <style jsx global>{`
        body { margin: 0; background: #050505; overflow: hidden; }
        canvas { filter: saturate(1.05) contrast(1.1); }
      `}</style>
    </div>
  );
}
