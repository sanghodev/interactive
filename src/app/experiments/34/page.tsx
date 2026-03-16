"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ZenPulsar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Spring physics state
  const scale = useRef(1);
  const targetScale = useRef(1);
  const velocity = useRef(0);
  const stiffness = 0.15;
  const damping = 0.8;

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

    const particles: {x: number, y: number, r: number, vx: number, vy: number, alpha: number}[] = [];
    for (let i = 0; i < 40; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.5,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            alpha: Math.random() * 0.3
        });
    }

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };

    window.addEventListener("resize", handleResize);

    const animate = () => {
      // Background
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, w, h);

      // Spring Physics Update
      const force = (targetScale.current - scale.current) * stiffness;
      velocity.current += force;
      velocity.current *= damping;
      scale.current += velocity.current;

      // Draw Particles
      ctx.fillStyle = "#ffffff";
      particles.forEach(p => {
          p.x += p.vx + (isPressed ? (p.x - w/2) * 0.005 : 0);
          p.y += p.vy + (isPressed ? (p.y - h/2) * 0.005 : 0);
          
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;

          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
      });

      // Draw Pulsar
      ctx.globalAlpha = 1;
      const centerX = w / 2;
      const centerY = h / 2;
      const baseRadius = Math.min(w, h) * 0.15;
      const currentRadius = baseRadius * scale.current;

      // Outer Glow
      const gradient = ctx.createRadialGradient(centerX, centerY, currentRadius * 0.8, centerX, centerY, currentRadius * 1.5);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.15)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Main Circle
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
      ctx.fill();

      // Thin Ring
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius + 20 + Math.sin(Date.now() * 0.002) * 5, 0, Math.PI * 2);
      ctx.stroke();

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isPressed]);

  const handlePointerDown = () => {
    setIsPressed(true);
    targetScale.current = 2.5;
  };

  const handlePointerUp = () => {
    setIsPressed(false);
    targetScale.current = 1;
  };

  return (
    <div 
        className="relative w-full h-screen bg-[#050505] overflow-hidden cursor-none select-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Minimalism UI */}
      <div className="absolute inset-0 pointer-events-none z-10 font-light tracking-widest uppercase">
        <div className="absolute top-12 left-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-white text-sm">Zen Pulsar</h1>
            <p className="text-white/20 text-[10px] mt-1">Exp 034 // Persistent Growth</p>
          </motion.div>
        </div>

        <div className="absolute bottom-12 right-12 text-right">
             <motion.p 
                animate={{ opacity: isPressed ? 1 : 0.3 }}
                className="text-white text-[10px]"
             >
                {isPressed ? "Expanding State" : "Quiescent State"}
             </motion.p>
        </div>

        <div className="absolute bottom-12 left-12 pointer-events-auto">
          <Link href="/">
            <motion.div
              whileHover={{ opacity: 1 }}
              className="text-white/30 text-[10px] hover:text-white transition-opacity border-b border-white/10 pb-1"
            >
              Back to Archive
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Custom Cursor */}
       <motion.div
            className="fixed top-0 left-0 w-4 h-4 rounded-full border border-white/50 pointer-events-none z-50 flex items-center justify-center"
            animate={{
                scale: isPressed ? 2 : 1,
                opacity: isPressed ? 0 : 1
            }}
            style={{ 
                x: "-50%", 
                y: "-50%",
                left: "var(--x)",
                top: "var(--y)"
            }}
        />

      <AnimatePresence>
        {!isPressed && isLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <p className="text-[10px] text-white/10 tracking-[0.5em] mt-[300px]">
                Hold to expand
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('pointermove', (e) => {
              document.documentElement.style.setProperty('--x', e.clientX + 'px');
              document.documentElement.style.setProperty('--y', e.clientY + 'px');
            });
          `,
        }}
      />
    </div>
  );
}
