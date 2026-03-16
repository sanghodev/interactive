"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ParallelWorld() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Motion values for mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for the mask position
  const springX = useSpring(mouseX, { stiffness: 150, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 30 });

  // Spring for mask size (interactive on click)
  const maskSize = useMotionValue(150);
  const springMaskSize = useSpring(maskSize, { stiffness: 100, damping: 20 });
  
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    if (isPressed) {
      maskSize.set(300);
    } else {
      maskSize.set(isHovering ? 150 : 0);
    }
  }, [isPressed, isHovering, maskSize]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden cursor-none select-none"
      onPointerEnter={() => setIsHovering(true)}
      onPointerLeave={() => {
        setIsHovering(false);
        setIsPressed(false);
      }}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
    >
      {/* Reality Layer (Background) */}
      <div className="absolute inset-0 z-0">
        <video
          src="/video_1.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover grayscale-[0.5] opacity-60"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Parallel World Layer (Foreground Reveal) */}
      <motion.div 
        className="absolute inset-0 z-10"
        style={{
          maskImage: `radial-gradient(circle var(--mask-size) at var(--mask-x) var(--mask-y), black 0%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(circle var(--mask-size) at var(--mask-x) var(--mask-y), black 0%, transparent 100%)`,
        } as any}
      >
        <video
          src="/video_13.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* CSS Variables for Masking */}
      <motion.style>
        {`
          :root {
            --mask-x: ${springX.get()}px;
            --mask-y: ${springY.get()}px;
            --mask-size: ${springMaskSize.get()}px;
          }
        `}
      </motion.style>
      
      {/* Fallback using Inline Style for smoother updates if CSS variables lag */}
      <motion.div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          maskImage: useSpring(mouseX, { stiffness: 150, damping: 30 }).on("change", (latest) => {
              // This is a bit hacky for Next.js/React, let's use a better approach with Framer Motion style bindings
          })
        } as any}
      />

      {/* Real-time Style Update Component */}
      <MaskStyleUpdater x={springX} y={springY} size={springMaskSize} />

      {/* UI Overlays */}
      <nav className="absolute top-0 left-0 w-full z-50 p-8 flex justify-between items-start pointer-events-none">
        <Link href="/" className="pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ x: -5 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-white/50 text-xs font-medium hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Archive</span>
          </motion.div>
        </Link>

        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-right"
        >
          <h1 className="text-white text-sm font-light tracking-[0.3em] uppercase">Parallel Vision</h1>
          <p className="text-white/20 text-[10px] mt-1 tracking-widest">EXP 035 // Dimension Rift</p>
        </motion.div>
      </nav>

      <div className="absolute bottom-12 left-12 z-50 pointer-events-none">
        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            className="text-white text-[9px] uppercase tracking-[0.4em] mix-blend-difference"
        >
            {isPressed ? "Rift Stabilized" : "Move mouse to reveal / Click to expand"}
        </motion.p>
      </div>

      {/* Custom Cursor / Mask Indicator */}
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 rounded-full border border-white/30 pointer-events-none z-50 flex items-center justify-center"
        style={{ 
          x: springX, 
          y: springY,
          translateX: "-50%",
          translateY: "-50%"
        }}
      >
        <motion.div 
            className="w-1 h-1 bg-white rounded-full"
            animate={{ scale: isPressed ? [1, 2, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 1 }}
        />
      </motion.div>
    </div>
  );
}

// Separate component to handle the high-frequency style updates for the mask
function MaskStyleUpdater({ x, y, size }: { x: any, y: any, size: any }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const update = () => {
            if (ref.current) {
                const parent = ref.current.parentElement;
                if (parent) {
                    const maskReveal = parent.querySelector('.absolute.inset-0.z-10') as HTMLElement;
                    if (maskReveal) {
                        const mask = `radial-gradient(circle ${size.get()}px at ${x.get()}px ${y.get()}px, black 0%, transparent 100%)`;
                        maskReveal.style.maskImage = mask;
                        maskReveal.style.webkitMaskImage = mask;
                    }
                }
            }
            requestAnimationFrame(update);
        };
        const frame = requestAnimationFrame(update);
        return () => cancelAnimationFrame(frame);
    }, [x, y, size]);

    return <div ref={ref} className="hidden" />;
}
