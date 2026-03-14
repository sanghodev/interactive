"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowUpRight, Beaker, Calendar, Download } from "lucide-react";
import Link from "next/link"; // Import next/link

// Mock data for the design experiments archive
const experiments = [
  {
    id: "01",
    title: "Cinematic Video Landing",
    description: "Full-screen interactive video background showcasing immersive, narrative-driven landing page experiences with custom controls.",
    date: "Feb 20, 2026",
    image: "/thumbnails/01.jpg",
    category: "Video Cinematic",
    tags: ["Framer Motion", "Video Overlay"],
  },
  {
    id: "02",
    title: "GSAP Scroll Scrubbing",
    description: "Hardware accelerated video manipulation tying browser scroll events to the timeline of a cinematic MP4.",
    date: "Feb 20, 2026",
    image: "/thumbnails/02.jpg",
    category: "GSAP Scroll",
    tags: ["ScrollTrigger", "Video Scrubbing"],
  },
  {
    id: "03",
    title: "Advanced GSAP Landing",
    description: "Highly professional immersive landing sequence utilizing dynamic clip-path masking and staggered typographic reveals.",
    date: "Feb 20, 2026",
    image: "/thumbnails/03.jpg",
    category: "GSAP Scroll",
    tags: ["Clip-Path", "Stagger"],
  },
  {
    id: "04",
    title: "Vector Pipeline",
    description: "Solving the blurred pixel issue by animating mathematically pure, infinitely scalable SVG graphics with DrawSVG techniques.",
    date: "Feb 20, 2026",
    image: "/thumbnails/04.jpg",
    category: "GSAP Scroll",
    tags: ["SVG Pipeline", "DrawSVG"],
  },
  {
    id: "05",
    title: "Unicorn Studio WebGL",
    description: "Integrating powerful, real-time WebGL canvases within a Next.js environment for unprecedented 3D interactivity.",
    date: "Feb 20, 2026",
    image: "/thumbnails/05.jpg",
    category: "WebGL & Canvas",
    tags: ["Unicorn Studio", "Embed"],
  },
  {
    id: "06",
    title: "Mesmerizing WebGL",
    description: "A hallucinatory descent blending a deeply colorful canvas particle system with custom physics-based cursor masking.",
    date: "Feb 20, 2026",
    image: "/thumbnails/06.jpg",
    category: "WebGL & Canvas",
    tags: ["Custom Cursor", "Hypnotic"],
  },
  {
    id: "07",
    title: "Professional WebGL Landing",
    description: "A highly refined, minimalist layout framing an immersive WebGL background, tailored for enterprise and premium SaaS aesthetics.",
    date: "Feb 20, 2026",
    image: "/thumbnails/07.jpg",
    category: "WebGL & Canvas",
    tags: ["Enterprise UI", "Minimal"],
  },
  {
    id: "08",
    title: "Ultimate UI/UX Masterpiece",
    description: "The pinnacle of the archive. A high-end editorial and modern luxury aesthetic utilizing advanced Framer Motion interactions over a volumetric WebGL deep canvas.",
    date: "Feb 20, 2026",
    image: "/thumbnails/08.jpg",
    category: "WebGL & Canvas",
    tags: ["Editorial", "Volumetric"],
  },
  {
    id: "09",
    title: "Light Theme Video Elements",
    description: "A stark shift focusing on airy, pure white typography and soft frosted glass elements over an ethereal video background to evoke calmness.",
    date: "Feb 21, 2026",
    image: "/thumbnails/09.jpg",
    category: "Video Cinematic",
    tags: ["Light Theme", "Glassmorphism"],
  },
  {
    id: "10",
    title: "Kinetic Video Masking",
    description: "An aggressive brutalist design featuring scroll-linked exponential scaling of typography, operating as a transparent multiplier mask over video.",
    date: "Feb 21, 2026",
    image: "/thumbnails/10.jpg",
    category: "GSAP Scroll",
    tags: ["Kinetic Mask", "Blend Modes"],
  },
  {
    id: "11",
    title: "Canvas Video Distortion",
    description: "An avant-garde exploration dropping down to HTML5 canvas core logic. Reads live MP4 memory to mathematically split RGB channels based on mouse velocity.",
    date: "Feb 21, 2026",
    image: "/thumbnails/11.jpg",
    category: "WebGL & Canvas",
    tags: ["Pixel Sorting", "HTML5 Canvas"],
  },
  {
    id: "12",
    title: "Floating Video Glass",
    description: "An ultra-premium tactile experience utilizing Framer Motion's physical springs. The video acts as both an ambient aura and crisp 3D PIP content.",
    date: "Feb 21, 2026",
    image: "/thumbnails/12.jpg",
    category: "Physics & UI",
    tags: ["3D Tilt", "Springs"],
  },
  {
    id: "13",
    title: "Cinematic Viewfinder",
    description: "An immersive scroll-driven experience that expands a tiny CSS clip-path circle into a massive edge-to-edge widescreen video reveal.",
    date: "Feb 21, 2026",
    image: "/thumbnails/13.jpg",
    category: "Video Cinematic",
    tags: ["Scroll Reveal", "Clip-Path"],
  },
  {
    id: "14",
    title: "Fractured Prism Parallax",
    description: "A mesmerizing CSS experiment utilizing extreme backdrop-filters (blur, invert, hue-rotate) on polygon clip-paths. Dozens of glass shards parallax over a continuous background stream.",
    date: "Feb 23, 2026",
    image: "/thumbnails/14.jpg",
    category: "Physics & UI",
    tags: ["Backdrop Filters", "Parallax"],
  },
  {
    id: "15",
    title: "Magnetic Smooth Fluidity",
    description: "Overrides native scrolling using Lenis for buttery momentum physics. Features GSAP magnetic hover buttons and deep editorial spacing over responsive video parallax.",
    date: "Feb 24, 2026",
    image: "/thumbnails/15.jpg",
    category: "Physics & UI",
    tags: ["Lenis Engine", "Magnetic Hook"],
  },
  {
    id: "16",
    title: "Lenis Velocity & Horizontal Track",
    description: "A G-Force physics simulation that skews and stretches elements based on real-time scroll velocity, transitioning into a massive, buttery smooth horizontal scroll hijack sequence.",
    date: "Feb 24, 2026",
    image: "/thumbnails/16.jpg",
    category: "Physics & UI",
    tags: ["Velocity Skew", "Horizontal Track"],
  },
  {
    id: "17",
    title: "Chroma Velocity",
    description: "Utilizing CSS mix-blend-modes and Framer Motion to paint generative, massive fluid light spheres over monochrome video plates. Features 3D pointer-reactive parallax typography.",
    date: "Feb 24, 2026",
    image: "/thumbnails/17.jpg",
    category: "Video Cinematic",
    tags: ["Fluid Colors", "Interactive Type"],
  },
  {
    id: "18",
    title: "Fragment GLSL 018",
    description: "A profound WebGL interactive experience built with React Three Fiber. Utilizes custom vertex and fragment shaders to directly manipulate and distort video pixels based on pointer coordinates.",
    date: "Feb 24, 2026",
    image: "/thumbnails/18.jpg",
    category: "WebGL & Canvas",
    tags: ["R3F", "GLSL Shaders"],
  },
  {
    id: "19",
    title: "Particle Continuum",
    description: "A profound WebGL Interactive Point Cloud. 90,000 individual particles mathematically generate a procedural evolving color spectrum. Hover to initiate a dynamic, physics-based magnetic repulsion system.",
    date: "Feb 24, 2026",
    image: "/thumbnails/19.png",
    category: "WebGL & Canvas",
    tags: ["Point Cloud", "GLSL Particles"],
  },
  {
    id: "20",
    title: "Temporal Mosaic",
    description: "An advanced WebGL temporal displacement experiment. Using 3 independent video buffers with unique time offsets, the shader isolates RGB channels across a perfectly ratio-preserved 3-column mosaic grid.",
    date: "Feb 24, 2026",
    image: "/thumbnails/20.png",
    category: "WebGL & Canvas",
    tags: ["Time Displacement", "GLSL Shaders"],
  },
  {
    id: "21",
    title: "SVG Topology Morph",
    description: "A high-performance vector manipulation experiment exploring mathematical path interpolation and organic geometry morphing using Framer Motion.",
    date: "Mar 05, 2026",
    image: "/thumbnails/21.png",
    category: "Physics & UI",
    tags: ["SVG Morphing", "Path Animation"],
  },
  {
    id: "22",
    title: "Kinetic Fluid Typography",
    description: "An aggressive exploration of typographic fluidity where character glyphs operate as physical entities within a proximity-based displacement field.",
    date: "Mar 05, 2026",
    image: "/thumbnails/22.png",
    category: "Physics & UI",
    tags: ["Kinetic Type", "Physics Engine"],
  },
  {
    id: "23",
    title: "Magnetic 3D Perspective",
    description: "An immersive 3D typography grid that pivots and tilts in real-time, responding to cursor coordinates to create a high-end volumetric perspective effect.",
    date: "Mar 05, 2026",
    image: "/thumbnails/23.png",
    category: "Physics & UI",
    tags: ["3D Perspective", "Magnetic Hook"],
  },
  {
    id: "24",
    title: "Stark Minimalism Typo",
    description: "A high-end Swiss-style editorial experiment exploring the relationship between negative space, rigid grid systems, and scroll-driven typographic rhythm.",
    date: "Mar 05, 2026",
    image: "/thumbnails/24.png",
    category: "Typography",
    tags: ["Minimalism", "Swiss Design"],
  },
  {
    id: "25",
    title: "Ethereal Drift",
    description: "A high-performance, lightweight cosmic experience. Using CSS blurs and sparse particle systems to create a mysterious 'unknown' atmosphere without system overhead.",
    date: "Mar 05, 2026",
    image: "/thumbnails/25.png",
    category: "Graphics & Motion",
    tags: ["Lightweight", "Ethereal", "Cosmos"],
  },
  {
    id: "26",
    title: "Infinite Path",
    description: "An infinite hand-drawn line animation that flows vertically with organic swaying and pen-like jitter. Exploring the concept of persistent human effort and mechanical repetition.",
    date: "Mar 05, 2026",
    image: "/thumbnails/26.png",
    category: "Graphics & Motion",
    tags: ["Hand-drawn", "Procedural", "Infinite"],
  },
  {
    id: "27",
    title: "Guided Path",
    description: "A reactive version of the infinite path where the line's trajectory is guided by mouse movement. A collaborative drawing experience between human and code.",
    date: "Mar 05, 2026",
    image: "/thumbnails/27.png",
    category: "Graphics & Motion",
    tags: ["Interactive", "Canvas", "Flow"],
  },
  {
    id: "28",
    title: "Chromatic Resonance",
    description: "Autonomous light tendrils dance through space with HSL color cycling, trail persistence, and orbital mouse attraction. A living canvas of bioluminescent beauty.",
    date: "Mar 06, 2026",
    image: "/thumbnails/28.png",
    category: "Graphics & Motion",
    tags: ["Generative", "Tendrils", "Chromatic"],
  },
  {
    id: "29",
    title: "Dual Identity",
    description: "A premium transition experience between two contrasting personas. Explores the duality of self through a mouse-driven horizontal reveal.",
    date: "Mar 10, 2026",
    image: "/thumbnails/29.png",
    category: "Interactions",
    tags: ["Landing Page", "Motion", "Duality"],
    downloadUrl: "/downloads/exp29.zip"
  },
  {
    id: "30",
    title: "Pixel Reveal",
    description: "A dynamic noise-driven pixel transition between dual identities. Uses canvas rendering and procedural waves to break the boundary of self.",
    date: "Mar 13, 2026",
    image: "/thumbnails/30.png",
    category: "Graphics & Motion",
    tags: ["Canvas", "Procedural", "Transition"],
    downloadUrl: "/downloads/exp30.zip"
  },
  {
    id: "31",
    title: "Perlin Reveal",
    description: "An advanced procedural transition utilizing 2D Perlin Noise. Explores dynamic, grid-based assembly where pixels harmonize through programmed randomness.",
    date: "Mar 13, 2026",
    image: "/thumbnails/31.png",
    category: "Interactions",
    tags: ["Canvas", "Perlin Noise", "Algorithm"],
    downloadUrl: "/downloads/exp31.zip"
  }
];

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function DesignArchive() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeTag, setActiveTag] = useState<string>("All");
  const [isReady, setIsReady] = useState(false);

  // Restore scroll position as early as possible
  useLayoutEffect(() => {
    if (typeof window !== "undefined") {
      window.history.scrollRestoration = "manual";
      const savedScrollPos = sessionStorage.getItem("design-archive-scroll");
      if (savedScrollPos) {
        const timeoutId = setTimeout(() => {
          window.scrollTo(0, parseInt(savedScrollPos));
          setIsReady(true);
        }, 50); // Minimal delay for DOM stability
        return () => clearTimeout(timeoutId);
      } else {
        setIsReady(true);
      }
    }
  }, []);

  // Save scroll position on click for maximum reliability
  const handleCardClick = () => {
    sessionStorage.setItem("design-archive-scroll", window.scrollY.toString());
  };

  const categories = ["All", "WebGL & Canvas", "Physics & UI", "GSAP Scroll", "Video Cinematic"];

  // Dynamically extract tags based ONLY on the currently active category
  const activeTags = activeCategory === "All"
    ? []
    : ["All", ...Array.from(new Set(experiments.filter((e) => e.category === activeCategory).flatMap((exp) => exp.tags)))];

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    setActiveTag("All"); // Reset sub-category when changing main category
  };

  // Filter based on both tiers
  const filteredExperiments = experiments.filter((exp) => {
    const matchCategory = activeCategory === "All" || exp.category === activeCategory;
    const matchTag = activeTag === "All" || exp.tags.includes(activeTag);
    return matchCategory && matchTag;
  });

  return (
    <div className="relative min-h-screen bg-[#050505] selection:bg-indigo-500/30 text-neutral-100 pb-32">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] mix-blend-screen" />
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-cyan-600/10 blur-[100px] mix-blend-screen" />

        {/* Subtle grid texture overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <main className="relative z-10 w-full max-w-[100rem] mx-auto px-6 sm:px-8 lg:px-12 pt-8 md:pt-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel mb-4">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] sm:text-xs font-medium tracking-widest uppercase text-neutral-300">Design Laboratory</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-neutral-200 to-neutral-500">
              Interactive Design
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">
              Archive & Experiments
            </span>
          </h1>

          <p className="text-sm md:text-base text-neutral-400 leading-relaxed font-light max-w-2xl">
            A curated sanctuary of UI/UX explorations, micro-interactions, and visual experiments.
            Organized by core technology and interaction models.
          </p>
        </motion.div>

        {/* Sticky Header: Title & Categories */}
        <div className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 py-4 -mx-6 px-6 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12 mb-8">
          <div className="flex flex-col gap-4 w-full">
            {/* Top Row: Title (Left) & Categories (Right) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-cyan-500 rounded-full" />
                <h2 className="text-xl font-bold tracking-tight text-white whitespace-nowrap">
                  Interactive Design Archive
                </h2>
              </div>

              {/* Category Row (Primary) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-wrap gap-2 lg:justify-end"
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 ${activeCategory === cat
                      ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                      : "bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/15 hover:text-white hover:border-white/20"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </motion.div>
            </div>

            {/* Bottom Row: Sub-Category Row (Secondary - Centered) */}
            <div className="flex justify-center w-full">
              <AnimatePresence mode="wait">
                {activeCategory !== "All" && activeTags.length > 0 && (
                  <motion.div
                    key={`subnav-${activeCategory}`}
                    initial={{ opacity: 0, x: -10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: -10, filter: "blur(4px)", transition: { duration: 0.2 } }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="flex flex-wrap gap-2 items-center justify-center pt-2 border-t border-white/5 w-full"
                  >
                    <div className="w-4 h-px bg-white/20 mr-1 hidden sm:block" />
                    {activeTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setActiveTag(tag)}
                        className={`px-3 py-1 rounded-full text-[10px] font-medium tracking-wide transition-all duration-300 ${activeTag === tag
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/50"
                          : "bg-transparent border border-white/5 text-neutral-500 hover:text-neutral-300 hover:border-white/20"
                          }`}
                      >
                        {tag}
                      </button>
                    ))}
                    <div className="w-4 h-px bg-white/20 ml-1 hidden sm:block" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isReady ? "visible" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6"
        >
          <AnimatePresence initial={false}>
            {filteredExperiments.map((exp) => (
              <motion.div
                key={exp.id}
                layout
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)", transition: { duration: 0.3 } }}
                className="group flex flex-col h-full relative"
              >
                {/* Main Card Navigation Link (Overlay) */}
                <Link
                  href={`/experiments/${exp.id}`}
                  onClick={handleCardClick}
                  className="absolute inset-0 z-20"
                />

                {/* Card Container */}
                <div className="relative glass-panel rounded-[1.5rem] overflow-hidden shadow-2xl transition-all duration-700 ease-out flex-grow group-hover:shadow-indigo-500/10 group-hover:-translate-y-2 border border-white/5 group-hover:border-white/10 group-hover:bg-white/[0.03] flex flex-col h-full pointer-events-none">

                  {/* Image Section */}
                  <div className="relative h-48 sm:h-56 xl:h-64 w-full overflow-hidden bg-neutral-900">
                    <motion.img
                      src={exp.image}
                      alt={exp.title}
                      className="object-cover w-full h-full z-10 relative opacity-80 transition-transform duration-[1.5s] ease-[0.16,1,0.3,1] group-hover:scale-110 group-hover:opacity-100"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/20 to-transparent z-20" />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
                      <span className="self-start px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase rounded bg-white/10 backdrop-blur-md text-white border border-white/20">
                        {exp.category}
                      </span>
                    </div>

                    {/* Hover Arrow & Download Button */}
                    <div className="absolute top-4 right-4 z-30 flex gap-2 pointer-events-auto">
                      {exp.downloadUrl && (
                        <motion.a
                          href={exp.downloadUrl}
                          download
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-10 h-10 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 flex items-center justify-center opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
                        >
                          <Download className="w-5 h-5 text-emerald-300" />
                        </motion.a>
                      )}
                      <div className="w-10 h-10 rounded-full bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 flex items-center justify-center opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-lg group-hover:shadow-indigo-500/20">
                        <ArrowUpRight className="w-5 h-5 text-indigo-300" />
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 relative z-30 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-indigo-300 transition-colors duration-300">
                      {exp.title}
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-6 flex-grow">
                      {exp.description}
                    </p>

                    {/* Footer tags & metadata */}
                    <div className="flex flex-col gap-4 mt-auto">
                      <div className="flex flex-wrap gap-1.5">
                        {exp.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 text-[10px] font-medium tracking-wide rounded-md bg-white/5 text-neutral-300 border border-white/5">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-medium text-neutral-500 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {exp.date.split(",")[0]}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Beaker className="w-3.5 h-3.5" />
                          EXP-{exp.id}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Footer Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-32 pt-10 border-t border-white/5 text-center flex flex-col items-center justify-center"
        >
          <div className="w-12 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full mb-6" />
          <p className="text-neutral-500 text-sm">
            Experimentation is the foundation of innovation. <br className="sm:hidden" />
            Designed and built for continuous learning.
          </p>
        </motion.div>
      </main>

      {/* Animated Fixed Bottom Blur / Gradient Overlay */}
      <motion.div
        animate={{
          background: [
            "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
            "linear-gradient(to top, rgba(25,5,45,0.95) 0%, rgba(0,0,0,0) 100%)",
            "linear-gradient(to top, rgba(5,35,45,0.95) 0%, rgba(0,0,0,0) 100%)",
            "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
          ],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="fixed bottom-0 left-0 w-full h-40 sm:h-64 pointer-events-none z-50 backdrop-blur-[10px]"
        style={{
          maskImage: "linear-gradient(to top, black 10%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, black 10%, transparent 100%)",
        }}
      >
        {/* Pixelated/Noise Texture Overlay */}
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E")' }}
        />
      </motion.div>
    </div>
  );
}
