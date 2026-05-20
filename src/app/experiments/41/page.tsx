"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Star, Sparkles } from "lucide-react";

// --- Constellation Data ---
interface Point {
    x: number;
    y: number;
}
interface ConstellationData {
    id: string;
    name: string;
    points: Point[];
    connections: [number, number][];
}

const CONSTELLATIONS: ConstellationData[] = [
    {
        id: "wolf",
        name: "Lupus (The Wolf)",
        points: [
            { x: 0.35, y: 0.3 }, { x: 0.4, y: 0.32 }, { x: 0.42, y: 0.25 },
            { x: 0.48, y: 0.4 }, { x: 0.65, y: 0.45 }, { x: 0.75, y: 0.6 }, 
            { x: 0.45, y: 0.7 }, { x: 0.65, y: 0.75 }, { x: 0.55, y: 0.55 } 
        ],
        connections: [
            [0, 1], [1, 2], [1, 3], [3, 4], [4, 5], 
            [3, 6], [4, 8], [8, 7], [6, 8], [5, 7]
        ]
    },
    {
        id: "eagle",
        name: "Aquila (The Eagle)",
        points: [
            { x: 0.5, y: 0.2 }, { x: 0.2, y: 0.3 }, { x: 0.35, y: 0.4 }, 
            { x: 0.5, y: 0.45 }, { x: 0.65, y: 0.4 }, { x: 0.8, y: 0.3 },  
            { x: 0.5, y: 0.7 }   
        ],
        connections: [
            [0, 3], [1, 2], [2, 3], [3, 4], [4, 5], 
            [3, 6], [2, 6], [4, 6]
        ]
    },
    {
        id: "stag",
        name: "Cervus (The Stag)",
        points: [
            { x: 0.3, y: 0.4 }, { x: 0.4, y: 0.35 }, { x: 0.35, y: 0.2 }, 
            { x: 0.45, y: 0.15 }, { x: 0.5, y: 0.45 }, { x: 0.7, y: 0.45 }, 
            { x: 0.75, y: 0.35 }, { x: 0.45, y: 0.75 }, { x: 0.65, y: 0.8 }  
        ],
        connections: [
            [0, 1], [1, 2], [1, 3], [1, 4], [4, 5], 
            [5, 6], [4, 7], [5, 8]
        ]
    }
];

// --- Simulation Types ---
interface BgStar {
    x: number;
    y: number;
    size: number;
    twinkleSpeed: number;
    twinkleVal: number;
}

interface CStar {
    origX: number;
    origY: number;
    x: number;
    y: number;
    active: boolean;
    activationPulse: number;
}

interface ActiveConstellation {
    data: ConstellationData;
    stars: CStar[];
    completed: boolean;
    opacity: number;
    notified?: boolean;
}

export default function CelestialMenagerie() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [roundDiscovered, setRoundDiscovered] = useState(0);
    const [totalDiscovered, setTotalDiscovered] = useState(0);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const bgStarsRef = useRef<BgStar[]>([]);
    const poolRef = useRef<ActiveConstellation[]>([]);
    const roundRef = useRef(0);
    const mouseRef = useRef({ x: 0, y: 0, hoverRadius: 80 });
    const delayTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let w = window.innerWidth;
        let h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;

        const initBgStars = () => {
            bgStarsRef.current = Array.from({ length: 400 }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                size: Math.random() * 1.5 + 0.1,
                twinkleSpeed: Math.random() * 0.05 + 0.01,
                twinkleVal: Math.random() * Math.PI * 2
            }));
        };

        const initPool = () => {
            poolRef.current = [];
            const TOTAL_CONSTELLATIONS = 30;
            const offsets = [
                { dx: 0, dy: 0, scale: 1 },                 // Center-ish
                { dx: -0.3 * w, dy: 0.1 * h, scale: 0.8 },  // Bottom Left
                { dx: 0.3 * w, dy: -0.15 * h, scale: 0.85 } // Top Right
            ];
            const numerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"];

            for (let i = 0; i < TOTAL_CONSTELLATIONS; i++) {
                const template = CONSTELLATIONS[Math.floor(Math.random() * CONSTELLATIONS.length)];
                const off = offsets[i % 3]; // Cycles through the 3 positions so each round has 3 distinct spots
                
                const scale = off.scale * (Math.random() * 0.2 + 0.9); // Slight scale variation
                const cw = w * 0.4 * scale;
                const ch = h * 0.4 * scale;
                const cx = (w / 2) - (cw / 2) + off.dx + (Math.random() * 50 - 25);
                const cy = (h / 2) - (ch / 2) + off.dy + (Math.random() * 50 - 25);
                
                const angle = Math.random() * Math.PI * 2;
                const cosA = Math.cos(angle);
                const sinA = Math.sin(angle);

                const suffix = numerals[Math.floor(Math.random() * numerals.length)];
                const instanceName = `${template.name} ${suffix}`;

                const stars = template.points.map(p => {
                    const centeredX = p.x - 0.5;
                    const centeredY = p.y - 0.5;
                    const rotX = centeredX * cosA - centeredY * sinA;
                    const rotY = centeredX * sinA + centeredY * cosA;
                    const finalX = cx + (rotX + 0.5) * cw;
                    const finalY = cy + (rotY + 0.5) * ch;

                    return {
                        origX: finalX, origY: finalY,
                        x: finalX, y: finalY,
                        active: false, activationPulse: 0
                    };
                });

                poolRef.current.push({
                    data: { ...template, name: instanceName },
                    completed: false,
                    opacity: 0,
                    stars: stars
                });
            }
        };

        initBgStars();
        initPool();

        const handleResize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            initBgStars();
            initPool(); // Regenerate based on new size
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("mousemove", handleMouseMove);

        let frameId: number;
        let time = 0;
        let isTransitioning = false;

        const render = () => {
            time += 0.01;
            
            const bgGrad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w);
            bgGrad.addColorStop(0, "#0a0e17");
            bgGrad.addColorStop(1, "#02040a");
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = "white";
            bgStarsRef.current.forEach(star => {
                star.twinkleVal += star.twinkleSpeed;
                const opacity = 0.3 + Math.sin(star.twinkleVal) * 0.3;
                star.x -= 0.1;
                if (star.x < 0) star.x = w;

                ctx.globalAlpha = opacity;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1.0;

            if (roundRef.current * 3 >= poolRef.current.length) {
                // Done with all 30
                ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                ctx.fillRect(0, 0, w, h);
                frameId = requestAnimationFrame(render);
                return;
            }

            const currentBatch = poolRef.current.slice(roundRef.current * 3, roundRef.current * 3 + 3);
            let roundCompletedCount = 0;

            currentBatch.forEach(c => {
                let activeStars = 0;

                c.stars.forEach(star => {
                    star.x = star.origX + Math.sin(time * 2 + star.origX) * 3;
                    star.y = star.origY + Math.cos(time * 2 + star.origY) * 3;

                    if (!c.completed && !isTransitioning) {
                        const dist = Math.hypot(mouseRef.current.x - star.x, mouseRef.current.y - star.y);
                        if (dist < mouseRef.current.hoverRadius && !star.active) {
                            star.active = true;
                        }
                    }

                    if (star.active) {
                        activeStars++;
                        star.activationPulse += 0.05;
                    }
                });

                if (activeStars === c.stars.length && !c.completed) {
                    c.completed = true;
                }

                if (c.completed) {
                    roundCompletedCount++;
                    c.opacity += (1 - c.opacity) * 0.05;
                    
                    if (!c.notified) {
                        c.notified = true;
                        setToastMessage(`Discovered: ${c.data.name}`);
                        setTimeout(() => setToastMessage(null), 3000);
                        setTotalDiscovered(prev => prev + 1);
                    }
                }

                // Draw lines
                c.data.connections.forEach(([s1, s2]) => {
                    const star1 = c.stars[s1];
                    const star2 = c.stars[s2];

                    if (star1.active && star2.active) {
                        ctx.beginPath();
                        ctx.moveTo(star1.x, star1.y);
                        ctx.lineTo(star2.x, star2.y);
                        
                        if (c.completed) {
                            ctx.strokeStyle = `rgba(150, 230, 255, ${(0.4 + Math.sin(time * 3) * 0.2) * (isTransitioning ? 0.3 : 1)})`;
                            ctx.lineWidth = 2;
                            ctx.shadowBlur = 10;
                            ctx.shadowColor = "cyan";
                        } else {
                            ctx.strokeStyle = "rgba(100, 200, 255, 0.2)";
                            ctx.lineWidth = 1;
                            ctx.shadowBlur = 0;
                        }
                        ctx.stroke();
                    }
                });
                ctx.shadowBlur = 0;

                // Draw stars
                c.stars.forEach(star => {
                    if (star.active) {
                        ctx.beginPath();
                        ctx.arc(star.x, star.y, c.completed ? 3 : 2, 0, Math.PI * 2);
                        ctx.fillStyle = isTransitioning ? "rgba(255, 255, 255, 0.5)" : "white";
                        ctx.shadowBlur = c.completed && !isTransitioning ? 15 : 5;
                        ctx.shadowColor = "rgba(100, 220, 255, 1)";
                        ctx.fill();

                        if (!c.completed && star.activationPulse < Math.PI) {
                            const pRadius = 2 + Math.sin(star.activationPulse) * 15;
                            const pAlpha = 1 - (star.activationPulse / Math.PI);
                            ctx.beginPath();
                            ctx.arc(star.x, star.y, pRadius, 0, Math.PI * 2);
                            ctx.strokeStyle = `rgba(100, 220, 255, ${pAlpha})`;
                            ctx.stroke();
                        }
                    } else {
                        ctx.beginPath();
                        ctx.arc(star.x, star.y, 1, 0, Math.PI * 2);
                        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
                        ctx.fill();
                    }
                });
            });

            // Handle Round Transition
            setRoundDiscovered(roundCompletedCount);
            if (roundCompletedCount === 3 && !isTransitioning) {
                isTransitioning = true;
                if (!delayTimerRef.current) {
                    delayTimerRef.current = setTimeout(() => {
                        roundRef.current++;
                        isTransitioning = false;
                        delayTimerRef.current = null;
                        
                        if (roundRef.current * 3 < poolRef.current.length) {
                             setToastMessage(`A new sky approaches...`);
                             setTimeout(() => setToastMessage(null), 2500);
                        } else {
                             setToastMessage(`All 30 Myths Uncovered.`);
                        }
                    }, 4000); // 4 second pause to admire the completed round
                }
            }

            // Draw Custom Cursor Glow
            const distGlow = ctx.createRadialGradient(mouseRef.current.x, mouseRef.current.y, 0, mouseRef.current.x, mouseRef.current.y, mouseRef.current.hoverRadius);
            distGlow.addColorStop(0, "rgba(255, 255, 255, 0.05)");
            distGlow.addColorStop(1, "transparent");
            ctx.fillStyle = distGlow;
            ctx.beginPath();
            ctx.arc(mouseRef.current.x, mouseRef.current.y, mouseRef.current.hoverRadius, 0, Math.PI * 2);
            ctx.fill();

            frameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(frameId);
            if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
        };
    }, []);

    return (
        <div className="relative w-full h-screen bg-black text-white font-sans overflow-hidden cursor-crosshair">
            <canvas ref={canvasRef} className="absolute inset-0 z-0" />

            <div className="absolute inset-0 z-10 pointer-events-none p-6 md:p-12 flex flex-col justify-between">
                
                <header className="flex justify-between items-start">
                    <Link href="/" className="pointer-events-auto">
                        <motion.div 
                            whileHover={{ x: -5 }}
                            className="flex items-center gap-3 text-white/50 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="text-[10px] tracking-[0.3em] uppercase font-bold">Star Map</span>
                        </motion.div>
                    </Link>

                    <div className="text-right">
                        <h1 className="text-2xl font-black uppercase tracking-[0.4em] text-white/90">Celestial</h1>
                        <p className="text-[10px] tracking-[0.2em] text-cyan-400 uppercase mt-1">Menagerie</p>
                    </div>
                </header>

                <footer className="flex flex-col items-center">
                    <div className="flex items-center gap-4 mb-4">
                        <Star className={`w-4 h-4 transition-colors duration-700 ${roundDiscovered >= 1 ? "text-cyan-400 fill-cyan-400 drop-shadow-[0_0_10px_cyan]" : "text-white/20"}`} />
                        <Star className={`w-4 h-4 transition-colors duration-700 ${roundDiscovered >= 2 ? "text-cyan-400 fill-cyan-400 drop-shadow-[0_0_10px_cyan]" : "text-white/20"}`} />
                        <Star className={`w-4 h-4 transition-colors duration-700 ${roundDiscovered >= 3 ? "text-cyan-400 fill-cyan-400 drop-shadow-[0_0_10px_cyan]" : "text-white/20"}`} />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-white/40">
                        {totalDiscovered} of 30 Myths Found
                    </span>
                    <p className="mt-2 text-xs text-white/20 font-light italic">Trace the hidden stars to reveal the sky.</p>
                </footer>
            </div>

            <AnimatePresence>
                {toastMessage && (
                    <motion.div 
                        key={toastMessage}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 1.1 }}
                        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center text-center"
                    >
                        <Sparkles className="w-8 h-8 text-cyan-300 mb-4 animate-pulse" />
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-white drop-shadow-[0_0_15px_rgba(0,255,255,0.8)]">
                            {toastMessage}
                        </h2>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

