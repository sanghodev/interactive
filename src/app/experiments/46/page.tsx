"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Trophy, Wind } from "lucide-react";

// ═══════════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════════
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  dir: Direction;
}

interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  dir: Direction;
  stunTimer: number;
}

interface Smoke {
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
}

interface Collectible {
  x: number;
  y: number;
  radius: number;
  collected: boolean;
}

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS & CONFIG
// ═══════════════════════════════════════════════════════════════
const COLORS = {
  bg: "#fcf9f2",      // Paper white
  player: "#ff3b3b",  // Crayon Red
  enemy: "#3b82f6",   // Crayon Blue
  smoke: "#94a3b8",   // Crayon Gray
  star: "#fbbf24",    // Crayon Yellow
  line: "#334155",    // Dark Slate
};

export default function CrayonRacer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  // Controls state
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    // ─── Game State ───
    const player: Player = { x: w / 2, y: h / 2, width: 40, height: 26, speed: 4, dir: "RIGHT" };
    const enemies: Enemy[] = [];
    const smokes: Smoke[] = [];
    const collectibles: Collectible[] = [];
    
    let localScore = 0;
    let isGameOver = false;
    let frameCount = 0;
    let jitterOffset = 0; // Used to recalculate "wobbly" lines

    // Initialize Entities
    const spawnEnemy = () => {
      // Spawn away from player
      let ex, ey;
      do {
        ex = Math.random() * w;
        ey = Math.random() * h;
      } while (Math.abs(ex - player.x) < 200 && Math.abs(ey - player.y) < 200);
      
      enemies.push({ x: ex, y: ey, width: 36, height: 24, speed: 2.5 + Math.random() * 1.5, dir: "UP", stunTimer: 0 });
    };

    const spawnCollectible = () => {
      collectibles.push({
        x: 50 + Math.random() * (w - 100),
        y: 50 + Math.random() * (h - 100),
        radius: 12,
        collected: false
      });
    };

    // Initial Spawns
    for (let i=0; i<3; i++) spawnEnemy();
    for (let i=0; i<5; i++) spawnCollectible();

    // ─── Input Handling ───
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
      if (e.code === "Space" && !isGameOver) {
        // Drop smoke (Bang-gu)
        smokes.push({
          x: player.x,
          y: player.y,
          radius: 20 + Math.random() * 10,
          life: 180, // frames
          maxLife: 180
        });
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key] = false; };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("resize", () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    // ─── Custom Rendering (Crayon Style) ───
    // Helper to add jitter to coordinates
    const j = (val: number, amount: number = 2) => val + (Math.random() - 0.5) * amount;

    const drawCrayonRect = (cx: number, cy: number, cw: number, ch: number, color: string, isFill = true) => {
      ctx.save();
      ctx.translate(cx, cy);
      
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 4;
      
      ctx.beginPath();
      // Draw a wobbly rectangle
      ctx.moveTo(j(-cw/2), j(-ch/2));
      ctx.lineTo(j(cw/2), j(-ch/2));
      ctx.lineTo(j(cw/2), j(ch/2));
      ctx.lineTo(j(-cw/2), j(ch/2));
      ctx.closePath();

      if (isFill) {
        // Scribble fill
        ctx.fillStyle = color;
        ctx.fill();
        // Outline
        ctx.strokeStyle = COLORS.line;
        ctx.stroke();
        
        // Add some inner scribble lines to make it look colored in
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for(let i=0; i<4; i++) {
            ctx.moveTo(j(-cw/2.5), j(-ch/2.5 + i*ch/4));
            ctx.lineTo(j(cw/2.5), j(-ch/2.5 + (i+0.5)*ch/4));
        }
        ctx.stroke();
      } else {
        ctx.strokeStyle = color;
        ctx.stroke();
      }
      
      ctx.restore();
    };

    const drawCrayonCircle = (cx: number, cy: number, r: number, color: string) => {
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      ctx.beginPath();
      // Draw a rough circle using multiple connected arcs/lines
      const segments = 8;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const rr = r + (Math.random() - 0.5) * 4; // jitter radius
        const px = cx + Math.cos(theta) * rr;
        const py = cy + Math.sin(theta) * rr;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      
      ctx.fillStyle = color;
      ctx.fill();
      
      ctx.lineWidth = 3;
      ctx.strokeStyle = COLORS.line;
      ctx.stroke();
      ctx.restore();
    };

    const drawPlayer = (p: Player) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        
        // Rotation based on direction
        if (p.dir === "UP") ctx.rotate(-Math.PI/2);
        else if (p.dir === "DOWN") ctx.rotate(Math.PI/2);
        else if (p.dir === "LEFT") ctx.rotate(Math.PI);
        
        // Draw car body (centered at 0,0 now due to translate)
        drawCrayonRect(0, 0, p.width, p.height, COLORS.player);
        
        // Draw Wheels
        drawCrayonRect(-p.width/2 + 5, -p.height/2, 10, 6, COLORS.line); // Top Left
        drawCrayonRect(p.width/2 - 10, -p.height/2, 10, 6, COLORS.line); // Top Right
        drawCrayonRect(-p.width/2 + 5, p.height/2, 10, 6, COLORS.line);  // Bottom Left
        drawCrayonRect(p.width/2 - 10, p.height/2, 10, 6, COLORS.line);  // Bottom Right
        
        // Eyes (windshield)
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(p.width/2 - 8, -5, 4, 0, Math.PI*2);
        ctx.arc(p.width/2 - 8, 5, 4, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(p.width/2 - 7, -5, 1.5, 0, Math.PI*2);
        ctx.arc(p.width/2 - 7, 5, 1.5, 0, Math.PI*2);
        ctx.fill();
        
        ctx.restore();
    };

    const drawEnemy = (e: Enemy) => {
        ctx.save();
        ctx.translate(e.x, e.y);
        
        if (e.dir === "UP") ctx.rotate(-Math.PI/2);
        else if (e.dir === "DOWN") ctx.rotate(Math.PI/2);
        else if (e.dir === "LEFT") ctx.rotate(Math.PI);
        
        drawCrayonRect(0, 0, e.width, e.height, e.stunTimer > 0 ? "#a8a29e" : COLORS.enemy);
        
        // Angry Eyes
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(e.width/2 - 12, -8); ctx.lineTo(e.width/2 - 4, -4);
        ctx.moveTo(e.width/2 - 12, 8); ctx.lineTo(e.width/2 - 4, 4);
        ctx.stroke();

        ctx.restore();
    };

    const drawSmoke = (s: Smoke) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, s.life / s.maxLife);
        
        ctx.beginPath();
        const segments = 6;
        for(let i=0; i<=segments; i++){
            const th = (i/segments)*Math.PI*2;
            const px = s.x + Math.cos(th)*s.radius + j(0, 5);
            const py = s.y + Math.sin(th)*s.radius + j(0, 5);
            if(i===0) ctx.moveTo(px,py);
            else ctx.lineTo(px,py);
        }
        ctx.fillStyle = COLORS.smoke;
        ctx.fill();
        ctx.strokeStyle = COLORS.line;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
    };

    // ─── Game Loop ───
    let animationId: number;

    const loop = () => {
      if (isGameOver) return;
      frameCount++;
      
      // Update logic
      
      // Player Movement
      if (keys.current["ArrowUp"] || keys.current["w"]) { player.dir = "UP"; player.y -= player.speed; }
      else if (keys.current["ArrowDown"] || keys.current["s"]) { player.dir = "DOWN"; player.y += player.speed; }
      else if (keys.current["ArrowLeft"] || keys.current["a"]) { player.dir = "LEFT"; player.x -= player.speed; }
      else if (keys.current["ArrowRight"] || keys.current["d"]) { player.dir = "RIGHT"; player.x += player.speed; }
      
      // Keep player in bounds (wrap around like classic games)
      if (player.x < 0) player.x = w;
      if (player.x > w) player.x = 0;
      if (player.y < 0) player.y = h;
      if (player.y > h) player.y = 0;

      // Update Smoke
      for (let i = smokes.length - 1; i >= 0; i--) {
        smokes[i].life--;
        smokes[i].radius += 0.2; // expands slowly
        if (smokes[i].life <= 0) smokes.splice(i, 1);
      }

      // Update Enemies
      for (const e of enemies) {
        if (e.stunTimer > 0) {
            e.stunTimer--;
            continue;
        }

        // Simple AI: Move towards player on major axis
        const dx = player.x - e.x;
        const dy = player.y - e.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) { e.x += e.speed; e.dir = "RIGHT"; }
            else { e.x -= e.speed; e.dir = "LEFT"; }
        } else {
            if (dy > 0) { e.y += e.speed; e.dir = "DOWN"; }
            else { e.y -= e.speed; e.dir = "UP"; }
        }
        
        // Wrap around
        if (e.x < 0) e.x = w; if (e.x > w) e.x = 0;
        if (e.y < 0) e.y = h; if (e.y > h) e.y = 0;

        // Collision with Smoke
        for (const s of smokes) {
            const sdx = e.x - s.x;
            const sdy = e.y - s.y;
            if (sdx*sdx + sdy*sdy < (s.radius + 10)**2 && e.stunTimer <= 0) {
                e.stunTimer = 120; // Stun for 2 seconds
            }
        }

        // Collision with Player
        const pdx = e.x - player.x;
        const pdy = e.y - player.y;
        if (Math.abs(pdx) < (e.width/2 + player.width/2 - 5) && Math.abs(pdy) < (e.height/2 + player.height/2 - 5)) {
            isGameOver = true;
            setGameOver(true);
        }
      }

      // Collectibles
      for (let i = collectibles.length - 1; i >= 0; i--) {
        const c = collectibles[i];
        const dx = c.x - player.x;
        const dy = c.y - player.y;
        if (dx*dx + dy*dy < (c.radius + player.width/2)**2) {
            collectibles.splice(i, 1);
            localScore += 100;
            setScore(localScore);
            spawnCollectible(); // Spawn a new one
            
            // Add a new enemy every 500 points to increase difficulty
            if (localScore % 500 === 0) {
                spawnEnemy();
            }
        }
      }

      // Render
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, w, h);

      // Draw paper texture dots (grid)
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      for(let x = 20; x < w; x+=40) {
          for(let y = 20; y < h; y+=40) {
              ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI*2); ctx.fill();
          }
      }

      // Occasionally recalculate jitter to make the drawing "boil"
      if (frameCount % 6 === 0) {
          jitterOffset = Math.random();
      }

      // Render Smokes
      for (const s of smokes) drawSmoke(s);

      // Render Collectibles (Stars)
      for (const c of collectibles) {
          drawCrayonCircle(c.x, c.y, c.radius, COLORS.star);
      }

      // Render Enemies
      for (const e of enemies) drawEnemy(e);

      // Render Player
      drawPlayer(player);

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans select-none" style={{ backgroundColor: COLORS.bg }}>
      <canvas ref={canvasRef} className="absolute inset-0 z-0 cursor-none" />

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between">
        
        {/* Top Header */}
        <div className="flex justify-between items-start">
            <Link href="/" className="pointer-events-auto">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-slate-700 bg-white shadow-[4px_4px_0px_#334155] text-slate-800 font-bold"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </motion.div>
            </Link>

            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-3 px-6 py-3 rounded-2xl border-4 border-slate-700 bg-white shadow-[6px_6px_0px_#334155]"
            >
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span className="text-3xl font-black text-slate-800 tabular-nums tracking-tighter">
                    {score.toString().padStart(4, '0')}
                </span>
            </motion.div>
        </div>

        {/* Bottom Controls Help */}
        <div className="flex justify-between items-end">
            <div className="p-4 rounded-xl border-2 border-slate-700 bg-white/80 backdrop-blur shadow-[4px_4px_0px_#334155] text-slate-800 font-semibold max-w-xs">
                <p className="text-sm mb-1">🎮 Arrow Keys / WASD to Steer</p>
                <p className="text-sm flex items-center gap-1">
                    <Wind className="w-4 h-4 text-slate-500" /> Spacebar to drop Smoke (Bang-gu)
                </p>
            </div>
            
            {/* Mobile Controls (Visual only, implemented physically via keyboard for this experiment, but good for design) */}
            <div className="sm:hidden flex gap-2 pointer-events-auto">
               {/* Mobile controls would go here if fully implemented */}
            </div>
        </div>
      </div>

      {/* Game Over Screen */}
      {gameOver && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm pointer-events-auto">
              <motion.div 
                  initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  className="bg-white p-8 rounded-3xl border-4 border-slate-800 shadow-[12px_12px_0px_#334155] flex flex-col items-center max-w-sm w-full"
              >
                  <h2 className="text-4xl font-black text-red-500 mb-2 uppercase tracking-tight">Ouch!</h2>
                  <p className="text-slate-600 font-bold mb-6 text-lg">You got caught.</p>
                  
                  <div className="bg-slate-100 p-4 rounded-xl w-full flex justify-between items-center mb-8 border-2 border-slate-200">
                      <span className="text-slate-500 font-bold uppercase text-sm">Final Score</span>
                      <span className="text-2xl font-black text-slate-800">{score}</span>
                  </div>

                  <button 
                      onClick={() => window.location.reload()}
                      className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-800 border-4 border-slate-800 rounded-xl font-black text-xl shadow-[4px_4px_0px_#334155] active:translate-y-1 active:shadow-[0px_0px_0px_#334155] transition-all"
                  >
                      Play Again
                  </button>
              </motion.div>
          </div>
      )}
    </div>
  );
}
