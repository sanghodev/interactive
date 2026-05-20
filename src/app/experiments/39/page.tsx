"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Scissors, Thermometer, ShieldCheck, Weight, Hash } from "lucide-react";

// --- Types ---
interface Slice {
  points: { x: number; y: number }[];
  opacity: number;
  hue: number;
}

export default function ButcherShop() {
  const [isSlicing, setIsSlicing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const slicesRef = useRef<Slice[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsSlicing(true);
      mouseRef.current.lastX = e.clientX;
      mouseRef.current.lastY = e.clientY;
      slicesRef.current.push({
        points: [{ x: e.clientX, y: e.clientY }],
        opacity: 1,
        hue: 0
      });
    };

    const handleMouseUp = () => {
      setIsSlicing(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      if (isSlicing && slicesRef.current.length > 0) {
        const currentSlice = slicesRef.current[slicesRef.current.length - 1];
        currentSlice.points.push({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);

    let frameId: number;
    const render = () => {
      ctx.clearRect(0, 0, w, h);

      // Rendering Slices (The Blade Marks)
      slicesRef.current.forEach((slice, idx) => {
        if (slice.points.length < 2) return;

        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(255, 0, 0, 0.5)";
        ctx.strokeStyle = `rgba(220, 20, 60, ${slice.opacity})`;
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(slice.points[0].x, slice.points[0].y);
        for (let i = 1; i < slice.points.length; i++) {
          ctx.lineTo(slice.points[i].x, slice.points[i].y);
        }
        ctx.stroke();

        // Sub-glimmer (the sharp edge)
        ctx.strokeStyle = `rgba(255, 255, 255, ${slice.opacity * 0.8})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        slice.opacity -= 0.01;
        if (slice.opacity <= 0) {
          slicesRef.current.splice(idx, 1);
        }
      });

      frameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, [isSlicing]);

  return (
    <div className="relative w-full min-h-screen bg-[#0a0a0a] text-[#f5f5f5] overflow-hidden font-serif selection:bg-red-900/50 cursor-none">
      <canvas ref={canvasRef} className="absolute inset-0 z-40 pointer-events-none" />

      {/* --- Background Texture --- */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/black-paper.png")' }} />
      
      {/* --- Main UI Content --- */}
      <div className="relative z-10 w-full min-h-screen flex flex-col p-6 md:p-12">
        <header className="flex justify-between items-start mb-24">
          <Link href="/">
            <motion.div 
              whileHover={{ x: -5 }}
              className="flex items-center gap-4 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-none border border-white/20 bg-white/5 flex items-center justify-center group-hover:bg-red-900/20 group-hover:border-red-500/50 transition-all duration-500">
                <ArrowLeft className="w-5 h-5 text-white/40 group-hover:text-red-400" />
              </div>
              <span className="text-[10px] tracking-[0.4em] uppercase text-white/20 group-hover:text-red-400 transition-colors">Return to Vault</span>
            </motion.div>
          </Link>

          <div className="text-right">
            <div className="flex items-center justify-end gap-3 mb-2">
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-red-600">Established 1984</span>
                <div className="w-12 h-[1px] bg-red-600/30" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">The Prime<br /><span className="text-red-600">Butcher</span></h1>
          </div>
        </header>

        <section className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Massive Hero Text */}
            <div className="lg:col-span-7">
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative"
                >
                    <span className="absolute -top-12 left-0 text-[10px] tracking-[1em] uppercase text-white/30 font-sans">Premium Selection // Batch 039</span>
                    <h2 className="text-8xl md:text-[12rem] font-black uppercase leading-[0.8] tracking-tighter text-white/90">
                        Sharp<br />Edge
                    </h2>
                    <p className="mt-12 text-lg md:text-xl text-white/40 max-w-lg leading-relaxed font-sans font-light">
                        Precision, heritage, and the unspoken art of the cut. We specialize in rare livestock and technical preparation techniques passed through generations.
                    </p>
                    
                    <div className="mt-12 flex flex-wrap gap-8">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] tracking-widest uppercase text-white/20">Status</span>
                            <span className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-widest">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                Operation Active
                            </span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] tracking-widest uppercase text-white/20">Grade</span>
                            <span className="text-xs font-bold uppercase tracking-widest border border-white/20 px-2 py-1">A5++ Marbling</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Product Display Cards */}
            <div className="lg:col-span-5 grid grid-cols-1 gap-6">
                {[
                    { id: "A1", name: "Stripped Ribeye", weight: "850g", temp: "-2°C", icon: Weight },
                    { id: "B4", name: "Bone-in Sirloin", weight: "1.2kg", temp: "-1.5°C", icon: Scissors },
                ].map((item, i) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                        className="group relative p-8 border border-white/10 bg-white/[0.02] backdrop-blur-3xl overflow-hidden cursor-pointer"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                            <item.icon className="w-24 h-24 text-white" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <Hash className="w-3 h-3 text-red-600" />
                                <span className="text-[10px] font-mono text-white/40 tracking-widest">{item.id}</span>
                            </div>
                            <h3 className="text-2xl font-bold uppercase tracking-[0.2em] mb-4 group-hover:text-red-500 transition-colors">{item.name}</h3>
                            <div className="flex gap-6 mt-8">
                                <div className="flex items-center gap-2">
                                    <Weight className="w-3.5 h-3.5 text-white/20" />
                                    <span className="text-[10px] tracking-widest text-white/60">{item.weight}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Thermometer className="w-3.5 h-3.5 text-white/20" />
                                    <span className="text-[10px] tracking-widest text-white/60">{item.temp}</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                    </motion.div>
                ))}
            </div>
        </section>

        <footer className="mt-24 border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-end gap-12 sm:gap-0">
            <div className="flex gap-12 translate-y-2">
                <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-white/20 uppercase tracking-[0.5em]">Inventory Seal</span>
                    <ShieldCheck className="w-6 h-6 text-white/10" />
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-white/20 uppercase tracking-[0.5em]">Digital Trace</span>
                    <span className="text-[9px] font-mono text-white/40">NX-BUTCHER-39.SYS</span>
                </div>
            </div>

            <div className="text-right">
                <div className="inline-flex items-center gap-4 px-6 py-3 border border-white/10 bg-white/5 hover:bg-red-600 hover:text-white transition-all duration-300 cursor-pointer group pointer-events-auto">
                    <span className="text-xs font-bold uppercase tracking-[0.3em]">Enter Smokehouse</span>
                    <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-2 transition-transform" />
                </div>
                <p className="mt-4 text-[9px] text-white/20 tracking-widest uppercase italic max-w-[240px] ml-auto">
                    The quality of the cut determines the depth of the flavor. Precision is our only metric.
                </p>
            </div>
        </footer>
      </div>

      <ButcherCursor isSlicing={isSlicing} />
    </div>
  );
}

function ButcherCursor({ isSlicing }: { isSlicing: boolean }) {
    const cursorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const move = (e: MouseEvent) => {
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) rotate(${isSlicing ? "15deg" : "0deg"})`;
            }
        };
        window.addEventListener("mousemove", move);
        return () => window.removeEventListener("mousemove", move);
    }, [isSlicing]);

    return (
        <div 
            ref={cursorRef}
            className="fixed top-0 left-0 pointer-events-none z-50 flex items-center justify-center mix-blend-difference"
            style={{ transition: "transform 0.05s linear" }}
        >
            {/* The Blade Cursor */}
            <div className={`relative flex flex-col items-center transition-all duration-300 ${isSlicing ? "scale-150" : "scale-100"}`}>
                <div className={`w-[1px] h-12 bg-white ${isSlicing ? "bg-red-500 shadow-[0_0_15px_red]" : ""}`} />
                <div className={`absolute top-0 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center transition-all ${isSlicing ? "opacity-0" : "opacity-100"}`}>
                    <div className="w-1 h-1 bg-white rounded-full" />
                </div>
                {isSlicing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -top-12 text-[10px] tracking-widest font-mono text-red-500 whitespace-nowrap"
                  >
                    CUTTING //
                  </motion.div>
                )}
            </div>
        </div>
    );
}
