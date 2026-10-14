"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Feather,
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  Heart,
  X,
  BookOpen,
  Calendar,
  Users,
  Compass,
  Smile,
  Check,
  Coffee,
  Quote,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

/**
 * ❄️ Smooth Falling Snow & Golden Bokeh Sparks Canvas
 * Creates organic, serene drifting snowflakes and warm glowing ember particles
 * that illuminate the snowy street scene.
 */
function SnowfallEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle pool: gentle snowflakes + warm amber bokeh sparks
    const flakeCount = 44;
    const flakes = Array.from({ length: flakeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.0 + 0.8,
      d: Math.random() * flakeCount,
      speedY: Math.random() * 0.5 + 0.2,
      speedX: Math.random() * 0.25 - 0.12,
      opacity: Math.random() * 0.55 + 0.25,
      isGolden: Math.random() > 0.65, // Warm golden street light spark!
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < flakeCount; i++) {
        const f = flakes[i];
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, false);
        if (f.isGolden) {
          ctx.fillStyle = `rgba(253, 224, 71, ${f.opacity * 0.9})`;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity * 0.75})`;
        }
        ctx.fill();

        // Organic falling motion with sinusoidal drift
        f.y += f.speedY;
        f.x += Math.sin(f.d) * 0.3 + f.speedX;
        f.d += 0.012;

        // Loop seamlessly
        if (f.y > height + 10) {
          f.y = -10;
          f.x = Math.random() * width;
        }
        if (f.x > width + 10) f.x = -10;
        if (f.x < -10) f.x = width + 10;
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-1 pointer-events-none"
      style={{ opacity: 0.85, willChange: "transform", transform: "translateZ(0)" }}
    />
  );
}

export default function LandingAuth() {
  const router = useRouter();

  // Auth modal states
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Interactive sample entry tab
  const [activeTab, setActiveTab] = useState<"today" | "capsule" | "circle">("today");

  // Interactive Checklist in Hero Notebook
  const [checklist, setChecklist] = useState<boolean[]>([true, true, true, false]);
  const toggleCheck = (idx: number) => {
    setChecklist((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const openAuth = (loginMode: boolean = true) => {
    setIsLogin(loginMode);
    setError("");
    setShowAuthForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          setError("Invalid email or password.");
          setLoading(false);
          return;
        }

        router.push("/dashboard");
        router.refresh();
      } else {
        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await regRes.json();

        if (!regRes.ok) {
          throw new Error(data.error || "Registration failed.");
        }

        // Auto sign in upon registration
        const loginRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (loginRes?.error) {
          setIsLogin(true);
          setError("Account created! Please log in.");
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen text-[#FAF7F2] font-sans selection:bg-amber-400/40 overflow-x-hidden">
      {/* ❄️ Full-bleed Snowy Winter Street Background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none scale-105 opacity-90"
        style={{
          backgroundImage: `url('/landing-bg.jpg')`,
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      />

      {/* 🌌 Luminous Twilight Overlay with Deep Contrast */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(14, 11, 10, 0.78) 0%, 
              rgba(22, 17, 14, 0.58) 45%, 
              rgba(14, 11, 10, 0.72) 80%, 
              rgba(9, 7, 7, 0.86) 100%
            )
          `,
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      />

      {/* 🏮 Warm Streetlight Ambient Blooming Glows (Hardware Accelerated via Pure Radial Gradients - zero blur lag) */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 15%, rgba(245, 158, 11, 0.18) 0%, transparent 45%),
            radial-gradient(circle at 50% 45%, rgba(234, 88, 12, 0.12) 0%, transparent 40%),
            radial-gradient(circle at 80% 85%, rgba(217, 119, 6, 0.14) 0%, transparent 45%)
          `,
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      />

      {/* Subtle organic paper grain texture overlay */}
      <div 
        className="fixed inset-0 z-0 opacity-12 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(#ffffff 0.75px, transparent 0.75px)`,
          backgroundSize: "24px 24px",
          willChange: "transform",
          transform: "translateZ(0)",
        }}
      />

      {/* ❄️ Smooth Falling Snow & Golden Bokeh Sparks */}
      <SnowfallEffect />

      {/* 🌸 SCREEN 1: HERO & COZY JOURNAL DESK (Full Screen) */}
      <div className="min-h-screen flex flex-col justify-between relative z-10 w-full">
        {/* 🌸 NAVIGATION BAR */}
        <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-5 pb-3 sm:pt-7 sm:pb-4 flex items-center justify-between shrink-0">
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-3 group cursor-pointer select-none" 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          {/* Logo Title & Subtitle */}
          <div className="flex flex-col">
            <span className="font-serif text-xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] leading-none">
              Volume Sanctuary
            </span>
            <span className="text-[9px] sm:text-[10px] md:text-xs font-sans uppercase tracking-[0.25em] text-amber-200/90 font-medium mt-1">
              Private Journal &amp; Haven
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium tracking-wide text-amber-100/75">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-amber-300 font-semibold border-b-2 border-amber-400 pb-0.5 transition-colors cursor-pointer"
          >
            home
          </a>
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="hover:text-amber-200 hover:scale-105 transition-all cursor-pointer"
          >
            journal
          </a>
          <a
            href="#preview"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("preview")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="hover:text-amber-200 hover:scale-105 transition-all cursor-pointer"
          >
            poetry
          </a>
          <a
            href="#notes"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("notes")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="hover:text-amber-200 hover:scale-105 transition-all cursor-pointer"
          >
            reflections
          </a>
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="hover:text-amber-200 hover:scale-105 transition-all cursor-pointer"
          >
            about
          </a>
        </nav>

        {/* Right Action Button */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => openAuth(true)}
            className="relative group overflow-hidden bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white px-6 py-2.5 rounded-full text-xs md:text-sm font-semibold tracking-wide shadow-[0_4px_20px_rgba(245,158,11,0.35)] hover:shadow-[0_6px_28px_rgba(245,158,11,0.55)] transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
            <span>Sign In</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </header>

        {/* 🌸 HERO SECTION (Centered in Screen 1) */}
        <section id="home" className="flex-1 flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl mx-auto px-6 md:px-12 py-4 sm:py-6 gap-10 lg:gap-8">
        
        {/* Left Column: Whimsical Calligraphy & Poetic Invitation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full lg:w-1/2 flex flex-col items-start text-left"
        >
         

          {/* Main Hero Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-normal text-white leading-[1.12] mb-6 tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
            life is a <br />
            <span className="font-serif italic text-amber-100/90 drop-shadow-[0_0_25px_rgba(245,158,11,0.25)]">collection of</span> <br />
            <span className="font-serif italic font-medium inline-flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-200 to-amber-100 drop-shadow-[0_2px_18px_rgba(245,158,11,0.35)]">
              little moments.
              <span className="font-sans text-3xl md:text-4xl text-amber-400 font-light">♡</span>
            </span>
          </h1>

          {/* Delicate Divider & Quote */}
          <div className="flex items-center gap-3 w-52 my-3">
            <div className="h-px bg-linear-to-r from-transparent via-amber-300/40 to-transparent grow" />
            <span className="text-amber-300 text-sm">🌸</span>
            <div className="h-px bg-linear-to-r from-transparent via-amber-300/40 to-transparent grow" />
          </div>

          <p className="text-base sm:text-lg text-amber-100/90 max-w-md leading-relaxed italic mb-8 font-serif drop-shadow-sm">
            “not every day is good, but there is something good in every day. ♡”
          </p>

          {/* Pill CTA Button */}
          <div className="flex flex-wrap items-center gap-5">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => openAuth(false)}
              className="relative group overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide shadow-[0_8px_30px_rgba(245,158,11,0.45)] hover:shadow-[0_12px_40px_rgba(245,158,11,0.65)] flex items-center gap-3 transition-all cursor-pointer"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
              <span>embrace life</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </motion.button>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("features");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-amber-200/90 hover:text-white text-sm font-serif italic underline underline-offset-4 px-2 py-2 cursor-pointer transition-colors"
            >
              explore the sanctuary →
            </button>
          </div>

          {/* Tranquil Metrics Counter */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-6 text-xs text-amber-100/70 font-mono">
            <div>100% encrypted &amp; private</div>
          </div>
        </motion.div>

        {/* Right Column: Floating Scrapbook & Cozy Journal Desktop Composition */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full lg:w-1/2 relative flex items-center justify-center min-h-[480px]"
        >
          {/* Ambient Golden Radial Glow behind the Notebook */}
          <div 
            className="absolute -inset-6 rounded-3xl -z-10 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.22) 0%, rgba(234, 88, 12, 0.1) 40%, transparent 70%)",
              willChange: "transform",
              transform: "translateZ(0)",
            }}
          />

          {/* Main Spiral Notebook Card with Warm Parchment Aesthetic */}
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            style={{ willChange: "transform" }}
            className="w-full max-w-md bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F5ECE0] rounded-2xl p-7 shadow-[0_25px_60px_rgba(0,0,0,0.65),0_0_40px_rgba(245,158,11,0.22)] border border-amber-300/50 relative z-10 transition-all hover:shadow-[0_30px_70px_rgba(0,0,0,0.75),0_0_50px_rgba(245,158,11,0.32)]"
          >
            {/* Golden Metallic Spiral Binding Rings at Top */}
            <div className="flex justify-between items-center px-4 -mt-10 mb-5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-2.5 h-6 rounded-full bg-gradient-to-b from-amber-400 via-amber-100 to-amber-600 shadow-md border border-amber-300/40" />
                  <div className="w-3 h-3 rounded-full bg-[#EFE6D8] -mt-1 border border-amber-400/30 shadow-inner" />
                </div>
              ))}
            </div>

            {/* Notebook Content */}
            <div className="pt-2 pb-4">
              <div className="flex items-center justify-between border-b border-amber-900/15 pb-3 mb-4">
                <span className="font-handwriting text-2xl text-amber-800 font-semibold tracking-wide flex items-center gap-1.5">
                  <span>note to self: ♡</span>
                </span>
                <span className="text-[11px] font-mono text-amber-800/90 bg-amber-100/90 px-2.5 py-0.5 rounded-md border border-amber-300/50 shadow-xs">
                  today&apos;s quiet page
                </span>
              </div>

              {/* Interactive Checklist: Clicking toggles items smoothly! */}
              <div className="notebook-lines py-1">
                <ul className="space-y-3.5 text-sm text-[#3D342F]/90 font-serif">
                  {[
                    "be kind to the parts of you still learning",
                    "be patient with quiet seasons of growth",
                    "be proud of how far you've traveled",
                    "write down one thought meant just for you",
                  ].map((item, idx) => (
                    <motion.li
                      key={idx}
                      whileHover={{ x: 3 }}
                      onClick={() => toggleCheck(idx)}
                      className={`flex items-center gap-2.5 cursor-pointer select-none transition-colors ${
                        checklist[idx] ? "text-[#3D342F]/90" : "text-[#7B6D65]/70 italic"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-sm border flex items-center justify-center text-[10px] font-bold transition-all ${
                          checklist[idx]
                            ? "border-amber-500 bg-amber-400/25 text-amber-700 shadow-xs scale-105"
                            : "border-amber-700/30 bg-transparent text-transparent hover:border-amber-500"
                        }`}
                      >
                        ✓
                      </span>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Pen / Footer Detail */}
            <div className="pt-3 border-t border-amber-900/15 flex items-center justify-between text-xs text-[#7B6D65]">
              <div className="flex items-center gap-2">
                <Coffee size={14} className="text-amber-600" />
                <span className="italic text-amber-900/80">warm tea &amp; quiet heart</span>
              </div>
              <span className="font-serif text-amber-700 font-medium">Page 1 of forever</span>
            </div>
          </motion.div>

          {/* Sticky Note 1: Washi Tape "today is a good day ♡" */}
          <motion.div
            animate={{ rotate: [-3, -1, -3], y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-3 md:-bottom-4 left-0 md:-left-6 bg-[#FFF9E6] p-3.5 rounded-md shadow-[0_10px_30px_rgba(0,0,0,0.35)] border border-amber-300/80 z-20 max-w-[170px]"
          >
            {/* Washi Tape */}
            <div className="washi-tape w-16 h-4 absolute -top-2 left-1/2 -translate-x-1/2 rotate-1" />
            <p className="font-handwriting text-base text-amber-900 leading-snug">
              &quot;today is a good day to begin again.&quot;
            </p>
            <span className="text-xs text-amber-700 block mt-1 text-right font-handwriting">♡ cozy notes</span>
          </motion.div>

          {/* Sticky Note 2: Book stack badge (Top Right) */}
          <motion.div
            animate={{ rotate: [4, 6, 4], y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
            className="absolute -top-6 -right-2 md:-right-6 bg-gradient-to-br from-amber-50/95 to-amber-100/95 backdrop-blur-md p-3.5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.35)] border border-amber-300/60 z-20 text-xs font-serif text-[#3D342F]"
          >
            <div className="washi-tape w-12 h-3.5 absolute -top-1.5 left-1/2 -translate-x-1/2 -rotate-2" />
            <div className="flex items-center gap-2 mb-1">
              
              <span className="font-semibold text-emerald-800">keep growing</span>
            </div>
            <p className="text-[11px] text-amber-900/80 italic">breathe · go at your own pace</p>
          </motion.div>
        </motion.div>
      </section>

        {/* 📜 SMOOTH INFINITE MARQUEE POETIC RIBBON (Bottom of Screen 1) */}
        <div className="relative w-full py-3 sm:py-3.5 overflow-hidden border-y border-amber-400/20 bg-black/45 backdrop-blur-md z-10 shadow-inner shrink-0">
          <motion.div 
            className="flex whitespace-nowrap gap-12 text-xs md:text-sm font-serif tracking-[0.25em] uppercase text-amber-200/85"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
          >
            <span>✦ whispered memories ✦ encrypted thoughts ✦ peaceful mornings ✦ untouched by algorithms ✦ your quiet haven ✦ cozy midnight tea ✦ stories preserved forever ✦</span>
            <span>✦ whispered memories ✦ encrypted thoughts ✦ peaceful mornings ✦ untouched by algorithms ✦ your quiet haven ✦ cozy midnight tea ✦ stories preserved forever ✦</span>
          </motion.div>
        </div>
      </div>

      {/* 🌸 SCREEN 2: THE CHAPTERS OF YOU (Features - Full Screen) */}
      <section id="features" className="min-h-screen flex flex-col justify-center items-center relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-10 md:mb-14"
        >
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-300 bg-amber-400/15 border border-amber-400/30 px-3.5 py-1 rounded-full mb-3 backdrop-blur-md">
            <Feather size={12} className="text-amber-400" />
            <span>crafted for stillness</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-white font-normal tracking-tight mb-4 drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)]">
            A sanctuary untouched by noise
          </h2>
          <p className="text-amber-100/80 font-serif text-base md:text-lg italic leading-relaxed">
            No public vanity metrics. No follower counts. Just a cozy desk where your memories are protected like cherished keepsakes.
          </p>
        </motion.div>

        {/* Feature Cards Grid: Nocturnal Frosted Glass with Warm Amber Glow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Private Ledger */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative bg-gradient-to-b from-[#1C1715]/85 via-[#161210]/90 to-[#0F0D0C]/95 backdrop-blur-xl p-8 rounded-2xl border border-amber-500/25 hover:border-amber-400/60 shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(245,158,11,0.22)] transition-all duration-500 group overflow-hidden"
          >
            {/* Ambient hover glow inside card */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

            <div className="washi-tape w-20 h-4 absolute -top-2 left-8 rotate-1" />
            <div className="w-13 h-13 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300 mb-6 shadow-inner group-hover:scale-110 group-hover:bg-amber-500/25 transition-all duration-300">
              <Lock size={22} strokeWidth={1.8} />
            </div>
            <h3 className="text-xl font-serif font-semibold text-white group-hover:text-amber-200 transition-colors mb-3">
              The Secret Ledger
            </h3>
            <p className="text-sm text-stone-300 leading-relaxed font-serif">
              Write the truths you can never say out loud. Encrypted, personal, and forever sheltered from prying eyes.
            </p>
          </motion.div>

          {/* Card 2: Intertwined Circles */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative bg-gradient-to-b from-[#1C1715]/85 via-[#161210]/90 to-[#0F0D0C]/95 backdrop-blur-xl p-8 rounded-2xl border border-amber-500/25 hover:border-amber-400/60 shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(245,158,11,0.22)] transition-all duration-500 group overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

            <div className="washi-tape w-20 h-4 absolute -top-2 left-8 -rotate-2" />
            <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 mb-6 shadow-inner group-hover:scale-110 group-hover:bg-emerald-500/25 transition-all duration-300">
              <Users size={22} strokeWidth={1.8} />
            </div>
            <h3 className="text-xl font-serif font-semibold text-white group-hover:text-amber-200 transition-colors mb-3">
              Intertwined Diaries
            </h3>
            <p className="text-sm text-stone-300 leading-relaxed font-serif">
              Invite your soulmate or closest friends via private invite codes. Share a combined timeline without feed algorithms.
            </p>
          </motion.div>

          {/* Card 3: Time Capsule Seals */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative bg-gradient-to-b from-[#1C1715]/85 via-[#161210]/90 to-[#0F0D0C]/95 backdrop-blur-xl p-8 rounded-2xl border border-amber-500/25 hover:border-amber-400/60 shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(245,158,11,0.22)] transition-all duration-500 group overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

            <div className="washi-tape w-20 h-4 absolute -top-2 left-8 rotate-1" />
            <div className="w-13 h-13 rounded-2xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center text-rose-300 mb-6 shadow-inner group-hover:scale-110 group-hover:bg-rose-500/25 transition-all duration-300">
              <Calendar size={22} strokeWidth={1.8} />
            </div>
            <h3 className="text-xl font-serif font-semibold text-white group-hover:text-amber-200 transition-colors mb-3">
              Time Capsule Letters
            </h3>
            <p className="text-sm text-stone-300 leading-relaxed font-serif">
              Seal a letter to yourself next year or on a special anniversary. It remains locked until the destined date arrives.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 🌸 SCREEN 3: INTERACTIVE GLIMPSE OF THE JOURNAL (Scroll Preview - Full Screen) */}
      <section id="preview" className="min-h-screen flex flex-col justify-center items-center relative z-10 w-full max-w-5xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="bg-gradient-to-b from-[#1A1614]/90 via-[#14100E]/95 to-[#0D0A09]/95 backdrop-blur-2xl rounded-3xl border border-amber-500/30 p-6 md:p-12 shadow-[0_30px_80px_rgba(0,0,0,0.7),0_0_50px_rgba(245,158,11,0.14)] relative overflow-hidden"
        >
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-amber-500/20 gap-4">
            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-amber-300 flex items-center gap-1.5">
                
                <span>Interactive Desk</span>
              </span>
              <h3 className="text-2xl font-serif text-white font-medium mt-1">
                A peek into your future diary
              </h3>
            </div>

            {/* Tab switchers with glowing pill */}
            <div className="inline-flex bg-black/50 p-1.5 rounded-full border border-amber-500/25 text-xs font-serif backdrop-blur-md">
              <button
                type="button"
                onClick={() => setActiveTab("today")}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeTab === "today"
                    ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/30 font-medium"
                    : "text-amber-200/60 hover:text-white"
                }`}
              >
                Today&apos;s Entry
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("capsule")}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeTab === "capsule"
                    ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/30 font-medium"
                    : "text-amber-200/60 hover:text-white"
                }`}
              >
                Time Capsule
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("circle")}
                className={`px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                  activeTab === "circle"
                    ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-amber-500/30 font-medium"
                    : "text-amber-200/60 hover:text-white"
                }`}
              >
                Shared Circle
              </button>
            </div>
          </div>

          {/* Dynamic Content View */}
          <AnimatePresence mode="wait">
            {activeTab === "today" && (
              <motion.div
                key="today"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="py-8 font-serif leading-relaxed"
              >
                <div className="flex items-center justify-between text-xs text-amber-300/80 mb-4 font-mono">
                  <span>October 14th · Late Afternoon Amber Light</span>
                  <span className="bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 px-2.5 py-0.5 rounded-full">🌿 Mood: Peaceful</span>
                </div>
                <h4 className="text-2xl md:text-3xl text-white font-normal mb-4">
                  The snowy street, the golden lamp, and learning to let go
                </h4>
                <p className="text-stone-300 text-base md:text-lg mb-6 leading-relaxed">
                  “I sat by the frosted window watching the soft snow drift beneath the amber streetlamp. The world outside fell completely quiet, wrapped in gentle winter stillness. It occurred to me that I spend so much time planning for tomorrow that I forget the gentle gift of right now. Today, I just listened to the quiet.”
                </p>
              </motion.div>
            )}

            {activeTab === "capsule" && (
              <motion.div
                key="capsule"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="py-8 font-serif leading-relaxed"
              >
                <div className="flex items-center justify-between text-xs text-amber-300/80 mb-4 font-mono">
                  <span> Sealed Capsule Letter</span>
                  <span className="text-amber-400 bg-amber-400/15 px-2.5 py-0.5 rounded-full border border-amber-400/30">Unlocks: New Year 2027</span>
                </div>
                <h4 className="text-2xl md:text-3xl text-white font-normal mb-4">
                  A letter to who you are becoming
                </h4>
                <div className="bg-amber-950/25 p-6 rounded-xl border border-dashed border-amber-400/40 text-amber-100 italic text-sm md:text-base leading-relaxed">
                  &quot;Dear future me, did you remember to be kinder to yourself? Did you drink enough warm tea on cold nights? I hope whatever storm you were enduring when you wrote this has long turned into gentle, peaceful rain.&quot;
                </div>
              </motion.div>
            )}

            {activeTab === "circle" && (
              <motion.div
                key="circle"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="py-8 font-serif leading-relaxed"
              >
                <div className="flex items-center justify-between text-xs text-amber-300/80 mb-4 font-mono">
                  <span>Circle: The Teahouse Society</span>
                  <span className="bg-purple-500/15 border border-purple-400/30 text-purple-300 px-2.5 py-0.5 rounded-full">3 Soulmates Connected</span>
                </div>
                <h4 className="text-2xl md:text-3xl text-white font-normal mb-4">
                  Shared timeline with no algorithm
                </h4>
                <p className="text-stone-300 text-base md:text-lg mb-6 leading-relaxed">
                  Only your invited circle sees entries posted to this diary. No ads, no recommendations, no unsolicited comments. Just genuine, sacred connection across distance.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* 🌸 SCREEN 4: DAILY REFLECTIONS & QUOTES (Full Screen) */}
      <section id="notes" className="min-h-screen flex flex-col justify-center items-center relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-16">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-12"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-amber-300 bg-amber-400/15 px-3 py-1 rounded-full border border-amber-400/30">
            notes on parchment
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-normal text-white mt-3 drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)]">
            Quiet thoughts for peaceful mornings
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="bg-gradient-to-b from-[#1C1715]/85 to-[#120F0E]/95 border border-amber-500/25 hover:border-amber-400/60 p-6 rounded-2xl shadow-lg hover:shadow-[0_12px_35px_rgba(245,158,11,0.18)] transition-all group"
          >
            <span className="text-2xl mb-3 block">☕</span>
            <p className="font-serif italic text-base text-amber-100/90 mb-3 leading-relaxed group-hover:text-white transition-colors">
              &quot;Some thoughts are meant to rest between two covers, far from the gaze of the world.&quot;
            </p>
            <span className="text-xs text-amber-400/80 font-mono">— On Sanctuary</span>
          </motion.div>

          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="bg-gradient-to-b from-[#1C1715]/85 to-[#120F0E]/95 border border-amber-500/25 hover:border-amber-400/60 p-6 rounded-2xl shadow-lg hover:shadow-[0_12px_35px_rgba(245,158,11,0.18)] transition-all group"
          >
            <span className="text-2xl mb-3 block">🌿</span>
            <p className="font-serif italic text-base text-amber-100/90 mb-3 leading-relaxed group-hover:text-white transition-colors">
              &quot;You don&apos;t have to write poetry every day. Sometimes writing &apos;I survived today&apos; is enough.&quot;
            </p>
            <span className="text-xs text-amber-400/80 font-mono">— On Forgiveness</span>
          </motion.div>

          <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className="bg-gradient-to-b from-[#1C1715]/85 to-[#120F0E]/95 border border-amber-500/25 hover:border-amber-400/60 p-6 rounded-2xl shadow-lg hover:shadow-[0_12px_35px_rgba(245,158,11,0.18)] transition-all group"
          >
            <span className="text-2xl mb-3 block">🕯️</span>
            <p className="font-serif italic text-base text-amber-100/90 mb-3 leading-relaxed group-hover:text-white transition-colors">
              &quot;Years from now, you will look back on these scattered lines and marvel at how gently you grew.&quot;
            </p>
            <span className="text-xs text-amber-400/80 font-mono">— On Remembrance</span>
          </motion.div>
        </div>
      </section>

      {/* 🌸 SCREEN 5: CALL TO SANCTUARY & FOOTER (Full Screen) */}
      <section id="about" className="min-h-screen flex flex-col justify-between items-center relative z-10 w-full pt-16 md:pt-20 pb-8 bg-gradient-to-b from-transparent via-[#0F0D0C]/85 to-[#0F0D0C] border-t border-amber-500/20">
        <div className="flex-1 flex flex-col justify-center items-center max-w-4xl mx-auto px-6 text-center w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-3xl block mb-4 animate-bounce" style={{ animationDuration: "3s" }}></span>
            <h2 className="text-4xl md:text-5xl font-serif text-white font-normal mb-4 drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)]">
              Begin your quiet story today
            </h2>
            <p className="text-amber-100/80 font-serif text-lg italic max-w-lg mx-auto mb-8">
              Open your notebook, brew a warm cup, and let your thoughts find their restful sanctuary.
            </p>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => openAuth(false)}
              className="relative group overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white px-9 py-4 rounded-full text-base font-semibold shadow-[0_8px_35px_rgba(245,158,11,0.5)] hover:shadow-[0_12px_45px_rgba(245,158,11,0.7)] transition-all cursor-pointer inline-flex items-center gap-3"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
              <span>Open Your Sanctuary</span>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </motion.button>
          </motion.div>
        </div>

        {/* Footer Info */}
        <div className="w-full max-w-4xl mx-auto px-6 pt-6 border-t border-amber-500/15 flex flex-col sm:flex-row items-center justify-between text-xs text-amber-200/60 font-serif gap-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-amber-300 font-medium">Volume Sanctuary</span>
              <span>· A tranquil journal for meaningful memories</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => openAuth(true)}
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition cursor-pointer text-amber-200 hover:text-white"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => openAuth(true)}
                aria-label="Mail"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition cursor-pointer text-amber-200 hover:text-white"
              >
                <Mail size={14} />
              </button>
            </div>
          </div>
        </section>

      {/* 🌸 AUTHENTICATION MODAL */}
      <AnimatePresence>
        {showAuthForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthForm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-md bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F5ECE0] rounded-3xl p-8 shadow-2xl border border-amber-300/60 z-10 overflow-hidden"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowAuthForm(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center justify-center transition cursor-pointer"
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>

              {/* Modal Header */}
              <div className="text-center mb-6">
                <span className="text-2xl mb-1 inline-block">🌸</span>
                <h3 className="text-2xl font-serif text-amber-950 font-normal">
                  {isLogin ? "Welcome to Your Sanctuary" : "Begin Your Journal"}
                </h3>
                <p className="text-xs text-amber-800/80 font-serif italic mt-1">
                  {isLogin
                    ? "Enter your tranquil space to continue writing"
                    : "Create a peaceful sanctuary for your memories"}
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-serif text-center">
                  {error}
                </div>
              )}

              {/* Google OAuth Login Button */}
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="w-full bg-white hover:bg-stone-50 text-stone-700 border border-amber-300/40 text-xs font-medium py-3 rounded-xl transition flex items-center justify-center gap-3 shadow-xs cursor-pointer mb-5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.92 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.78 2.93c.88-2.64 3.38-4.45 6.83-4.45z"/>
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.39-4.87 3.39-8.48z"/>
                  <path fill="#FBBC05" d="M5.17 10.49l-3.78-2.93C.51 9.24 0 10.57 0 12s.51 2.76 1.39 4.44l3.78-2.93c-.22-.66-.34-1.37-.34-2.07s.12-1.41.34-2.07z"/>
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.1.74-2.51 1.18-4.3 1.18-3.45 0-5.95-1.81-6.83-4.45L1.39 16.9C3.37 20.33 7.35 23 12 23z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex py-2 items-center text-[10px] uppercase text-amber-900/50 tracking-widest font-mono">
                <div className="grow border-t border-amber-900/15"></div>
                <span className="shrink mx-3">or continue with email</span>
                <div className="grow border-t border-amber-900/15"></div>
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4 mt-3">
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-serif text-amber-950 mb-1">
                      Your Name or Pen Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Maya"
                        className="w-full bg-[#FAF7F2] border border-amber-300/40 rounded-xl px-4 py-2.5 text-xs text-amber-950 focus:outline-hidden focus:border-amber-500 transition font-serif"
                      />
                      <User size={14} className="absolute right-3.5 top-3 text-amber-700/50" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-serif text-amber-950 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full bg-[#FAF7F2] border border-amber-300/40 rounded-xl px-4 py-2.5 text-xs text-amber-950 focus:outline-hidden focus:border-amber-500 transition font-serif"
                    />
                    <Mail size={14} className="absolute right-3.5 top-3 text-amber-700/50" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-serif text-amber-950 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#FAF7F2] border border-amber-300/40 rounded-xl px-4 py-2.5 text-xs text-amber-950 focus:outline-hidden focus:border-amber-500 transition font-serif"
                    />
                    <Lock size={14} className="absolute right-3.5 top-3 text-amber-700/50" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white py-3 rounded-xl text-xs font-semibold tracking-wide transition shadow-md shadow-amber-500/25 hover:shadow-lg cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loading
                    ? "Opening pages..."
                    : isLogin
                    ? "Enter Sanctuary"
                    : "Create Journal"}
                </button>
              </form>

              {/* Switch Tab Option */}
              <div className="mt-6 pt-4 border-t border-amber-900/15 text-center text-xs font-serif text-amber-900/80">
                {isLogin ? (
                  <p>
                    New to this quiet space?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(false);
                        setError("");
                      }}
                      className="text-amber-700 hover:text-amber-900 hover:underline cursor-pointer font-semibold ml-1"
                    >
                      Create an account
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have a journal?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(true);
                        setError("");
                      }}
                      className="text-amber-700 hover:text-amber-900 hover:underline cursor-pointer font-semibold ml-1"
                    >
                      Sign in here
                    </button>
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}