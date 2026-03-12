"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import { ArrowLeft, User, Shield } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DualIdentityExperiment() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0.5); // 0 to 1
  const smoothMouseX = useSpring(mouseX, {
    damping: 30,
    stiffness: 100,
    mass: 0.5
  });

  // Calculate percentage for clip-path
  const clipPercentage = useTransform(smoothMouseX, [0, 1], ["0%", "100%"]);
  const insetClip = useTransform(clipPercentage, (v: string) => `inset(0 0 0 ${v})`);
  
  const athleteOpacity = useTransform(smoothMouseX, [0.4, 0.6], [1, 0]);
  const corporateOpacity = useTransform(smoothMouseX, [0.4, 0.6], [0, 1]);

  useEffect(() => {
    setMounted(true);
    
    const handleMove = (clientX: number) => {
      if (!containerRef.current) return;
      const { left, width } = containerRef.current.getBoundingClientRect();
      const x = (clientX - left) / width;
      mouseX.set(Math.max(0, Math.min(1, x)));
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchstart", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchstart", handleTouchMove);
    };
  }, [mouseX]);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white overflow-hidden font-light selection:bg-white/20">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center mix-blend-difference">
        <Link href="/" scroll={false} className="pointer-events-auto">
          <motion.div
            whileHover={{ x: -2, opacity: 0.7 }}
            className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-3xl text-[9px] font-black tracking-[0.6em] uppercase transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Archive / 029</span>
          </motion.div>
        </Link>
        <div className="flex flex-col items-end gap-1">
          <div className="text-[10px] font-black tracking-[0.4em] uppercase opacity-40">Dual Identity</div>
        </div>
      </nav>

      <main 
        ref={containerRef}
        className="relative w-full h-screen cursor-none select-none overflow-hidden"
      >
        {/* Under Layer: Athlete */}
        <div className="absolute inset-0 z-10 bg-[#0c0c0c]">
          <Image
            src="/images/29/athlete.jpg"
            alt="Athlete identity"
            fill
            className="object-cover object-center scale-105"
            priority
          />
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Athlete Content Overlay */}
          <div className="absolute bottom-20 left-10 md:left-20 z-30 max-w-xl">
            <motion.div
              style={{ opacity: athleteOpacity }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 opacity-60">
                <Shield className="w-4 h-4" />
                <span className="text-[10px] font-black tracking-[0.4em] uppercase">Professional Athlete</span>
              </div>
              <h2 className="text-[10vw] md:text-[8vw] font-black tracking-tighter leading-none uppercase">
                DISCIPLINE
              </h2>
            </motion.div>
          </div>
        </div>

        {/* Top Layer: Corporate (Clipped) */}
        <motion.div 
          className="absolute inset-0 z-20 overflow-hidden"
          style={{ 
            clipPath: insetClip
          }}
        >
          <div className="relative w-full h-full bg-[#0a0a0a]">
            <Image
              src="/images/29/corporate.jpg"
              alt="Corporate identity"
              fill
              className="object-cover object-center scale-105"
              priority
            />
            <div className="absolute inset-0 bg-black/10" />

            {/* Corporate Content Overlay */}
            <div className="absolute bottom-20 right-10 md:right-20 z-30 max-w-xl text-right">
              <motion.div
                style={{ opacity: corporateOpacity }}
                className="space-y-4 flex flex-col items-end"
              >
                <div className="flex items-center gap-3 opacity-60">
                  <User className="w-4 h-4" />
                  <span className="text-[10px] font-black tracking-[0.4em] uppercase">Corporate Professional</span>
                </div>
                <h2 className="text-[10vw] md:text-[8vw] font-black tracking-tighter leading-none uppercase">
                  AMBITION
                </h2>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Split Line Indicator */}
        <motion.div 
          className="absolute top-0 bottom-0 z-40 w-px bg-white/40 shadow-[0_0_20px_rgba(255,255,255,0.3)] pointer-events-none"
          style={{ left: clipPercentage }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center">
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
              <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
            </div>
          </div>
        </motion.div>

        {/* Custom Cursor Hidden as per simplified design */}
      </main>

      {/* Footer / Meta Info */}
      <footer className="fixed bottom-10 left-10 right-10 z-50 flex justify-between items-end mix-blend-difference pointer-events-none">
        <div className="text-[8px] font-black tracking-[0.4em] uppercase opacity-30">
          Identity Exploration v1.0
        </div>
        <div className="text-[8px] font-black tracking-[0.4em] uppercase opacity-30 text-right">
          Move cursor to reveal
        </div>
      </footer>

      <style jsx global>{`
        body {
          background-color: #0a0a0a;
        }
      `}</style>
    </div>
  );
}
