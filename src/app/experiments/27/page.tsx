"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MousePointer2, MoveDown } from "lucide-react";
import Link from "next/link";

export default function MouseGuidedLineExperiment() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mounted, setMounted] = useState(false);
    const requestRef = useRef<number>(undefined);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);
    const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const isMovingRef = useRef(false);
    const timeRef = useRef(0);

    useEffect(() => {
        setMounted(true);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.strokeStyle = "#fefce8"; // Creamy white
            ctx.shadowBlur = 0; // Sharper splatters
            ctx.shadowColor = "rgba(254, 252, 232, 0.3)";

            lastPointRef.current = { x: canvas.width / 2, y: 0 };
            mousePosRef.current = { x: canvas.width / 2, y: 0 };
        };

        window.addEventListener("resize", resize);
        resize();

        const draw = () => {
            timeRef.current += 0.04;

            if (!lastPointRef.current) return;

            // 1. Calculate Path with Mouse Easing
            const easing = 0.08;
            const targetX = mousePosRef.current.x;
            const diffX = targetX - lastPointRef.current.x;
            const sway = Math.sin(timeRef.current * 0.7) * 4;
            const jitterX = (Math.random() - 0.5) * 1;

            const nextX = lastPointRef.current.x + diffX * easing + sway + jitterX;

            const baseSpeed = 1.8;
            const mouseActive = Math.abs(diffX) > 0.1;
            const currentSpeed = baseSpeed + (mouseActive ? Math.min(2, Math.abs(diffX) * 0.1) : 0);
            const nextY = lastPointRef.current.y + currentSpeed;

            // 2. Velocity-Driven Pressure
            const speed = Math.abs(diffX);
            const pressure = 0.6 + Math.min(0.6, speed * 0.02) + Math.random() * 0.1;
            const currentWidth = 1.6 * pressure;

            // 3. Draw MULTI-LAYERED STROKE
            // --- Ghost Texture ---
            if (Math.random() > 0.2) {
                const off = (Math.random() - 0.5) * 15;
                ctx.beginPath();
                ctx.globalAlpha = 0.06;
                ctx.lineWidth = 0.3;
                ctx.moveTo(lastPointRef.current.x + off * 0.8, lastPointRef.current.y);
                ctx.lineTo(nextX + off, nextY);
                ctx.stroke();
            }

            // --- The Echo Stroke ---
            const echoX = Math.sin(timeRef.current * 1.5) * 4;
            ctx.beginPath();
            ctx.globalAlpha = 0.12 * pressure;
            ctx.lineWidth = 0.5;
            ctx.moveTo(lastPointRef.current.x + echoX, lastPointRef.current.y);
            ctx.lineTo(nextX + echoX, nextY);
            ctx.stroke();

            // --- Main Stroke ---
            ctx.beginPath();
            ctx.globalAlpha = 0.85 * pressure;
            ctx.lineWidth = currentWidth;
            ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
            ctx.lineTo(nextX, nextY);
            ctx.stroke();

            // --- Clusters of Micro-Splatters ---
            if (Math.random() > 0.92) {
                for (let i = 0; i < 2; i++) {
                    const dx = (Math.random() - 0.5) * 20;
                    const dy = (Math.random() - 0.5) * 20;
                    ctx.beginPath();
                    ctx.globalAlpha = 0.15;
                    ctx.arc(nextX + dx, nextY + dy, Math.random() * 1.0, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            ctx.globalAlpha = 1.0;
            lastPointRef.current = { x: nextX, y: nextY };

            // Infinite scrolling
            if (nextY > canvas.height * 0.6) {
                const shiftAmount = currentSpeed;
                const tempCanvas = document.createElement("canvas");
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext("2d");
                if (tempCtx) {
                    tempCtx.drawImage(canvas, 0, 0);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(tempCanvas, 0, -shiftAmount);
                    lastPointRef.current.y -= shiftAmount;
                }
            }

            requestRef.current = requestAnimationFrame(draw);
        };
        const handleMouseMove = (e: MouseEvent) => {
            mousePosRef.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener("mousemove", handleMouseMove);
        requestRef.current = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <div className="relative min-h-screen bg-[#030303] text-white overflow-hidden font-light selection:bg-yellow-500/30">
            <canvas ref={canvasRef} className="fixed inset-0 z-0 touch-none" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-10 flex justify-between items-center pointer-events-none">
                <Link href="/" scroll={false} className="pointer-events-auto">
                    <motion.div
                        whileHover={{ x: -2, opacity: 0.7 }}
                        className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-3xl text-[9px] font-black tracking-[0.6em] uppercase transition-all cursor-pointer"
                    >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Archive / 027</span>
                    </motion.div>
                </Link>
                <div className="flex flex-col items-end gap-1">
                    <div className="text-[10px] font-black tracking-[0.4em] uppercase text-yellow-100/40">Guided Path</div>
                </div>
            </nav>

            {/* Main UI Overlay */}
            <main className="relative z-20 min-h-screen flex flex-col items-center justify-center p-10 pointer-events-none">
                <div className="text-center space-y-4 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.5 }}
                    >
                        <h1 className="text-[12vw] md:text-[8vw] font-black tracking-tighter text-white/5 uppercase select-none">
                            Inscribe
                        </h1>
                        <p className="text-[10px] font-bold tracking-[1.2em] uppercase text-white/20 -translate-y-4">
                            Direct Interaction
                        </p>
                    </motion.div>
                </div>

                {/* Interaction Prompt */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30">
                    <motion.div
                        animate={{ y: [0, 5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="flex flex-col items-center gap-2"
                    >
                        <MousePointer2 className="w-4 h-4" />
                        <span className="text-[8px] font-black tracking-widest uppercase">Guide the stroke</span>
                    </motion.div>
                </div>
            </main>

            {/* Status Bar */}
            <div className="fixed right-10 bottom-10 z-30 opacity-20 hidden md:flex flex-col items-end gap-2">
                <div className="flex items-center gap-3">
                    <span className="text-[8px] font-black uppercase tracking-widest text-right">Collaboration Mode: ON</span>
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                </div>
                <div className="text-[8px] font-black uppercase tracking-widest opacity-50 underline underline-offset-4 decoration-white/20">
                    Path.027 Control Stream
                </div>
            </div>

            <style jsx global>{`
        body {
          background-color: #030303;
          cursor: crosshair;
        }
      `}</style>
        </div>
    );
}
