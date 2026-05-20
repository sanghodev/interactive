"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Trash2, PenTool, Palette } from "lucide-react";

// --- Sketch Types ---
interface Point {
    x: number;
    y: number;
}

interface Stroke {
    id: string;
    color: string;
    width: number;
    points: Point[];
    jittered1: Point[];
    jittered2: Point[];
}

const COLORS = [
    "rgba(30, 30, 35, 0.85)",   // Charcoal / Graphite
    "rgba(200, 50, 50, 0.8)",   // Red Pencil
    "rgba(50, 80, 200, 0.8)",   // Blue Pencil
    "rgba(40, 160, 80, 0.8)"    // Green Pencil
];

export default function LivingSketchbook() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [activeColor, setActiveColor] = useState(COLORS[0]);
    
    const strokesRef = useRef<Stroke[]>([]);
    const currentStrokeRef = useRef<Stroke | null>(null);
    const isDrawingRef = useRef(false);
    
    // Animation timing
    const lastBoilTimeRef = useRef(0);
    const BOIL_INTERVAL = 120; // Re-jitter every 120ms (approx 8fps boil)
    const JITTER_AMOUNT = 3;

    // --- Core Logic ---
    const applyJitter = (points: Point[]): Point[] => {
        return points.map(p => ({
            x: p.x + (Math.random() - 0.5) * JITTER_AMOUNT * 2,
            y: p.y + (Math.random() - 0.5) * JITTER_AMOUNT * 2
        }));
    };

    const updateBoil = useCallback(() => {
        strokesRef.current.forEach(stroke => {
            if (stroke.points.length > 0) {
                stroke.jittered1 = applyJitter(stroke.points);
                stroke.jittered2 = applyJitter(stroke.points);
            }
        });
        
        if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
            currentStrokeRef.current.jittered1 = applyJitter(currentStrokeRef.current.points);
            currentStrokeRef.current.jittered2 = applyJitter(currentStrokeRef.current.points);
        }
    }, []);

    const drawPath = (ctx: CanvasRenderingContext2D, points: Point[], color: string, width: number) => {
        if (points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        // Use quadratic curves to smooth out the jagged lines slightly, but keep it rough
        for (let i = 1; i < points.length - 1; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", resize);
        resize();

        let frameId: number;

        const render = (time: number) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Notebook Grid Lines (Background is handled by CSS, this is just for canvas composite if needed)
            
            // Handle Boiling
            if (time - lastBoilTimeRef.current > BOIL_INTERVAL) {
                updateBoil();
                lastBoilTimeRef.current = time;
            }

            // Draw all strokes
            const allStrokes = [...strokesRef.current];
            if (currentStrokeRef.current) allStrokes.push(currentStrokeRef.current);

            allStrokes.forEach(stroke => {
                // To look like a sketch, we draw the jittered paths with lower opacity
                // and a slight random width variance.
                drawPath(ctx, stroke.jittered1, stroke.color, stroke.width * (Math.random() * 0.4 + 0.8));
                drawPath(ctx, stroke.jittered2, stroke.color, stroke.width * (Math.random() * 0.4 + 0.6));
                
                // Draw the original path very faintly as the "core" graphite
                ctx.globalAlpha = 0.5;
                drawPath(ctx, stroke.points, stroke.color, stroke.width * 0.5);
                ctx.globalAlpha = 1.0;
            });

            frameId = requestAnimationFrame(render);
        };

        frameId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(frameId);
        };
    }, [updateBoil]);

    // --- Mouse Handlers ---
    const handlePointerDown = (e: React.PointerEvent) => {
        isDrawingRef.current = true;
        const pt = { x: e.clientX, y: e.clientY };
        currentStrokeRef.current = {
            id: Date.now().toString(),
            color: activeColor,
            width: Math.random() * 2 + 2, // 2 to 4px
            points: [pt],
            jittered1: [pt],
            jittered2: [pt]
        };
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDrawingRef.current || !currentStrokeRef.current) return;
        currentStrokeRef.current.points.push({ x: e.clientX, y: e.clientY });
        
        // Live jitter update for the tip of the pen so it looks active while drawing
        const pts = currentStrokeRef.current.points;
        currentStrokeRef.current.jittered1 = applyJitter(pts);
        currentStrokeRef.current.jittered2 = applyJitter(pts);
    };

    const handlePointerUp = () => {
        if (!isDrawingRef.current || !currentStrokeRef.current) return;
        isDrawingRef.current = false;
        strokesRef.current.push(currentStrokeRef.current);
        setStrokes([...strokesRef.current]); // Trigger React state for UI updates if needed
        currentStrokeRef.current = null;
    };

    const clearCanvas = () => {
        strokesRef.current = [];
        setStrokes([]);
        updateBoil();
    };

    return (
        <div 
            className="relative w-full h-screen overflow-hidden text-neutral-800 select-none touch-none"
            style={{ 
                // Notebook paper aesthetic
                backgroundColor: "#FDFCF0",
                backgroundImage: `
                    linear-gradient(90deg, transparent 79px, #abced4 79px, #abced4 81px, transparent 81px),
                    linear-gradient(#e1e1e1 .1em, transparent .1em)
                `,
                backgroundSize: "100% 1.2em",
                fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', sans-serif" 
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            {/* The animated sketch canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 z-0 touch-none pointer-events-none cursor-crosshair" />

            {/* UI Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between">
                
                <header className="flex justify-between items-start pointer-events-auto">
                    <Link href="/">
                        <motion.button 
                            whileHover={{ scale: 1.05, rotate: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm border-2 border-neutral-300 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-bold text-sm tracking-wide">Back</span>
                        </motion.button>
                    </Link>

                    <div className="text-right">
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-800 drop-shadow-sm" style={{ transform: "rotate(1deg)" }}>
                            Living Sketchbook
                        </h1>
                        <p className="text-sm text-neutral-500 mt-1 flex items-center justify-end gap-1" style={{ transform: "rotate(-1deg)" }}>
                            <PenTool className="w-3 h-3" /> Scribble to animate
                        </p>
                    </div>
                </header>

                <footer className="pointer-events-auto flex items-end justify-between">
                    {/* Color Palette */}
                    <div className="flex flex-col gap-2 bg-white/50 backdrop-blur-sm p-3 rounded-2xl border-2 border-neutral-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-1 px-1">
                            <Palette className="w-4 h-4 text-neutral-500" />
                            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Ink</span>
                        </div>
                        <div className="flex gap-2">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setActiveColor(c)}
                                    className={`w-8 h-8 rounded-full border-2 transition-transform ${activeColor === c ? 'scale-110 shadow-md border-neutral-400' : 'scale-90 border-transparent hover:scale-100'}`}
                                    style={{ backgroundColor: c.replace(/[\d.]+\)$/g, '1)') }} // Solid color for button
                                    title="Change Color"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Tools */}
                    <motion.button
                        whileHover={{ scale: 1.05, rotate: 3 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={clearCanvas}
                        className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 border-2 border-red-200 rounded-2xl shadow-sm hover:bg-red-100 transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                        <span className="font-bold">Crumple Page</span>
                    </motion.button>
                </footer>
            </div>
            
            {/* Custom SVG Noise Overlay for paper texture */}
            <svg className="pointer-events-none fixed inset-0 z-50 opacity-20" width="100%" height="100%">
                <filter id="noise">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#noise)" />
            </svg>
        </div>
    );
}
