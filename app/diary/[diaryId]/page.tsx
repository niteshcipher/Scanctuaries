"use client";

import { useState, useEffect, useRef, use } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Lock,
  ShieldAlert,
  Feather,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Search,
  Edit3,
  Check,
  X,
  FileText,
  ImageIcon,
  Image as LucideImage,
  PenTool,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Entry {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  isCapsule: boolean;
  unlockDate: string | null;
  isLocked: boolean;
  createdAt: string;
  authorId: string;
  author: { name: string };
}

/**
 * ❄️ Serene Falling Snow & Golden Bokeh Sparks Canvas for Diary Page
 */
function DiarySnowfall() {
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

    const flakeCount = 38;
    const flakes = Array.from({ length: flakeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 0.8,
      d: Math.random() * flakeCount,
      speedY: Math.random() * 0.45 + 0.2,
      speedX: Math.random() * 0.25 - 0.12,
      opacity: Math.random() * 0.5 + 0.15,
      isGolden: Math.random() > 0.65,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < flakeCount; i++) {
        const f = flakes[i];
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, false);
        if (f.isGolden) {
          ctx.fillStyle = `rgba(253, 224, 71, ${f.opacity * 0.8})`;
          ctx.shadowColor = "rgba(245, 158, 11, 0.6)";
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity * 0.6})`;
          ctx.shadowColor = "rgba(255, 255, 255, 0.3)";
          ctx.shadowBlur = 3;
        }
        ctx.fill();

        f.y += f.speedY;
        f.x += Math.sin(f.d) * 0.3 + f.speedX;
        f.d += 0.012;

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
      style={{ opacity: 0.75 }}
    />
  );
}

/**
 * 📖 Authentic 3D Book Page Flip Animation Variants
 */
const pageFlipVariants: Variants = {
  enter: (direction: number) => ({
    rotateY: direction > 0 ? 55 : -55,
    x: direction > 0 ? 40 : -40,
    opacity: 0,
    transformOrigin: direction > 0 ? "0% 50%" : "100% 50%",
    filter: "brightness(0.92)",
  }),
  center: {
    rotateY: 0,
    x: 0,
    opacity: 1,
    transformOrigin: "50% 50%",
    filter: "brightness(1)",
    transition: {
      duration: 0.38,
      ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
    },
  },
  exit: (direction: number) => ({
    rotateY: direction > 0 ? -55 : 55,
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    transformOrigin: direction > 0 ? "100% 50%" : "0% 50%",
    filter: "brightness(0.88)",
    transition: {
      duration: 0.32,
      ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
    },
  }),
};

export default function DynamicBookWorkspace({
  params,
}: {
  params: Promise<{ diaryId: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const diaryId = resolvedParams.diaryId;

  // Ledger state variables
  const [entries, setEntries] = useState<Entry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("none");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageDirection, setPageDirection] = useState<number>(0);

  // Mobile View Mode Layout Selector ("write" vs "read")
  const [mobileActiveTab, setMobileActiveTab] = useState<"write" | "read">("read");

  // Search & Navigation tracking states
  const [searchQuery, setSearchQuery] = useState("");
  const [jumpPageStr, setJumpPageStr] = useState("");

  const goToNextPage = () => {
    if (currentPage < filteredEntries.length - 1 && !isEditing) {
      setPageDirection(1);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0 && !isEditing) {
      setPageDirection(-1);
      setCurrentPage((prev) => Math.max(0, prev - 1));
    }
  };

  // Inline Edit management panel tracking states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editError, setEditError] = useState("");

  // Deletion tracking state
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Form write state elements
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [isCapsule, setIsCapsule] = useState(false);
  const [unlockDate, setUnlockDate] = useState("");
  const [formError, setFormError] = useState("");
  const [writing, setWriting] = useState(false);

  const fetchEntries = async () => {
    try {
      const res = await fetch(`/api/entries?diaryId=${diaryId}`, {
        method: "GET",
        credentials: "same-origin",
      });

      if (!res.ok) throw new Error("Could not parse repository content.");
      const data = await res.json();
      setEntries(data.entries || []);

      if (data.currentUserId) {
        setCurrentUserId(data.currentUserId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (diaryId) fetchEntries();
  }, [diaryId]);

  const handleWriteEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setWriting(true);
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          diaryId,
          title,
          content,
          imageUrl: imageUrl.trim() || null,
          isCapsule,
          unlockDate: isCapsule ? unlockDate : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failure");

      setTitle("");
      setContent("");
      setImageUrl("");
      setShowImageInput(false);
      setIsCapsule(false);
      setUnlockDate("");
      await fetchEntries();
      setCurrentPage(0);
      setMobileActiveTab("read");
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setWriting(false);
    }
  };

  const handleSaveChangesEdit = async () => {
    if (!currentActiveEntry) return;
    setEditError("");
    try {
      const res = await fetch("/api/entries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          entryId: currentActiveEntry.id,
          title: editTitle,
          content: editContent,
          imageUrl: editImageUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update structural fault.");

      setIsEditing(false);
      await fetchEntries();
    } catch (err: any) {
      setEditError(err.message);
    }
  };

  const handleDeleteEntry = async () => {
    if (!currentActiveEntry) return;
    try {
      const res = await fetch(`/api/entries`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ entryId: currentActiveEntry.id }),
      });

      if (!res.ok) throw new Error("Could not erase specified sheet mapping.");

      setIsConfirmingDelete(false);
      if (currentPage > 0 && currentPage === filteredEntries.length - 1) {
        setCurrentPage((prev) => prev - 1);
      }
      await fetchEntries();
    } catch (err) {
      console.error(err);
    }
  };

  const startEditingMode = () => {
    if (!currentActiveEntry) return;
    setEditTitle(currentActiveEntry.title);
    setEditContent(currentActiveEntry.content);
    setEditImageUrl(currentActiveEntry.imageUrl || "");
    setIsEditing(true);
  };

  const filteredEntries = entries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBookPages = Math.max(1, filteredEntries.length);
  const currentActiveEntry = filteredEntries[currentPage];

  const handlePageJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPageNum = parseInt(jumpPageStr, 10);
    if (!isNaN(targetPageNum) && targetPageNum >= 1 && targetPageNum <= totalBookPages) {
      setPageDirection(targetPageNum - 1 > currentPage ? 1 : -1);
      setCurrentPage(targetPageNum - 1);
      setJumpPageStr("");
    }
  };

  return (
    <div className="relative min-h-screen text-[#FAF7F2] font-sans selection:bg-amber-400/40 overflow-x-hidden flex flex-col justify-between">
      {/* ❄️ Full-bleed Snowy Winter Street Background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 pointer-events-none scale-105 opacity-85"
        style={{
          backgroundImage: `url('/landing-bg.jpg')`,
        }}
      />

      {/* 🌌 Luminous Twilight Overlay with Deep Contrast */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(14, 11, 10, 0.85) 0%, 
              rgba(22, 17, 14, 0.70) 45%, 
              rgba(14, 11, 10, 0.82) 80%, 
              rgba(9, 7, 7, 0.92) 100%
            )
          `,
          backdropFilter: "blur(1px)",
        }}
      />

      {/* 🏮 Ambient Streetlight Radial Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[8%] left-[25%] w-[550px] h-[550px] rounded-full bg-amber-500/16 blur-[130px] mix-blend-screen animate-pulse duration-1000" />
        <div className="absolute bottom-[15%] right-[20%] w-[580px] h-[480px] rounded-full bg-orange-600/12 blur-[150px] mix-blend-screen" />
      </div>

      {/* Subtle organic paper grain texture overlay */}
      <div
        className="fixed inset-0 z-0 opacity-12 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(#ffffff 0.75px, transparent 0.75px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* ❄️ Serene Falling Snow & Bokeh Particles */}
      <DiarySnowfall />

      {/* 🌸 STICKY TOP BRAND BAR */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-black/60 border-b border-amber-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-6xl w-full mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          
          {/* Top Row: Back Button + Tablet/Desktop Tab Switcher */}
          <div className="flex items-center justify-between gap-3 w-full sm:w-auto">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-stone-300 hover:text-white transition flex items-center gap-1.5 text-xs font-serif font-medium cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 active:scale-95 shrink-0"
            >
              <ArrowLeft size={13} className="text-amber-400" />
              <span>Sanctuary Bookshelf</span>
            </button>

            {/* Mobile Mode Switcher for Tablet screens (sm to lg) */}
            <div className="hidden sm:flex lg:hidden bg-black/60 p-1 rounded-full border border-amber-500/30 text-xs font-serif shrink-0">
              <button
                onClick={() => setMobileActiveTab("write")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition cursor-pointer ${
                  mobileActiveTab === "write"
                    ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs"
                    : "text-amber-200/60 hover:text-white"
                }`}
              >
                <PenTool size={11} />
                <span>Inscribe</span>
              </button>
              <button
                onClick={() => setMobileActiveTab("read")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-medium transition cursor-pointer ${
                  mobileActiveTab === "read"
                    ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs"
                    : "text-amber-200/60 hover:text-white"
                }`}
              >
                <BookOpen size={11} />
                <span>Read ({filteredEntries.length})</span>
              </button>
            </div>
          </div>

          {/* Full-width segmented Tab switcher on Mobile phones (< 640px) */}
          <div className="flex sm:hidden w-full bg-black/60 p-1 rounded-full border border-amber-500/30 text-xs font-serif">
            <button
              onClick={() => setMobileActiveTab("write")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full font-medium transition cursor-pointer ${
                mobileActiveTab === "write"
                  ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs"
                  : "text-amber-200/60 hover:text-white"
              }`}
            >
              <PenTool size={12} />
              <span>Inscribe Page</span>
            </button>
            <button
              onClick={() => setMobileActiveTab("read")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full font-medium transition cursor-pointer ${
                mobileActiveTab === "read"
                  ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs"
                  : "text-amber-200/60 hover:text-white"
              }`}
            >
              <BookOpen size={12} />
              <span>Read Leaves ({filteredEntries.length})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-56 md:w-64 font-sans">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-300/50"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
              placeholder="Search written memories..."
              className="w-full bg-black/40 border border-amber-500/25 rounded-full pl-8 pr-4 py-1.5 text-xs text-white placeholder:text-stone-500 focus:outline-hidden focus:border-amber-400 transition"
            />
          </div>
        </div>
      </header>

      {/* 📖 FIXED-SIZE LEATHER SANCTUARY BOOK WITH SCROLLABLE PAGES */}
      <main className="relative z-10 max-w-6xl w-full mx-auto px-2 sm:px-6 py-3 sm:py-6 flex-1 flex flex-col justify-center">
        
        {/* Leather Hardcover Wrapper */}
        <section className="w-full relative p-1.5 sm:p-3.5 bg-gradient-to-b from-[#2E221B] via-[#221813] to-[#160E0A] rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_50px_rgba(245,158,11,0.12)] border border-amber-600/35">
          
          {/* Subtle Outer Leather Edge Sheens */}
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/25 to-transparent rounded-l-2xl pointer-events-none z-30" />
          <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-black/25 to-transparent rounded-r-2xl pointer-events-none z-30" />

          {/* Inner Fixed-Height Parchment Spread */}
          <div className="bg-gradient-to-b from-[#FFFDF9] via-[#FAF6EE] to-[#F5ECE0] text-[#3D342F] rounded-xl sm:rounded-2xl overflow-hidden relative shadow-inner h-[calc(100dvh-200px)] min-h-[460px] max-h-[720px] flex flex-col">
            
            {/* Spine Depth Gradients */}
            <div className="absolute left-0 top-0 bottom-0 w-4 sm:w-8 bg-gradient-to-r from-stone-900/10 to-transparent pointer-events-none z-20" />
            <div className="absolute right-0 top-0 bottom-0 w-4 sm:w-8 bg-gradient-to-l from-stone-900/10 to-transparent pointer-events-none z-20" />
            
            {/* Center Spine Divider on Desktop */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-stone-900/12 to-transparent pointer-events-none z-30" />
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-stone-900/15 z-20" />

            {/* Book Pages Container (Desktop: 2 columns; Mobile: 1 column switched via tabs) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 w-full h-full divide-y lg:divide-y-0 lg:divide-x divide-stone-300/40">

              {/* 🖋️ LEFT PAGE: Inscription Slate (Scrollable Form Content) */}
              <div
                className={`p-4 sm:p-7 md:p-8 flex-col justify-between h-full relative z-10 overflow-hidden ${
                  mobileActiveTab === "write" ? "flex" : "hidden lg:flex"
                }`}
              >
                {/* Fixed Top Page Heading */}
                <div className="flex items-center space-x-2 text-amber-800 pb-3 border-b border-stone-300/50 shrink-0">
                  <Feather size={18} className="text-amber-700" />
                  <h2 className="font-serif text-base sm:text-lg font-semibold tracking-wide text-[#3D342F]">
                    Inscribe New Memory Page
                  </h2>
                </div>

                {/* Scrollable Form Body */}
                <form
                  onSubmit={handleWriteEntry}
                  className="flex-1 overflow-y-auto py-3 pr-1 sm:pr-2 space-y-3.5 custom-scrollbar"
                >
                  {formError && (
                    <p className="text-xs font-serif text-rose-800 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                      {formError}
                    </p>
                  )}

                  <div className="space-y-1">
                    <label
                      htmlFor="entry-title"
                      className="text-[10px] font-sans font-bold tracking-widest text-[#7B6D65] uppercase"
                    >
                      Title of Memory
                    </label>
                    <input
                      id="entry-title"
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. First frost on the windowpane..."
                      className="w-full bg-transparent text-[#3D342F] font-serif text-base sm:text-lg border-b border-stone-300 focus:outline-hidden focus:border-amber-600 pb-1.5 transition placeholder:text-stone-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="entry-content"
                      className="text-[10px] font-sans font-bold tracking-widest text-[#7B6D65] uppercase"
                    >
                      Reflections &amp; Thoughts
                    </label>
                    <textarea
                      id="entry-content"
                      required
                      rows={5}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Pour your thoughts down across the pages..."
                      className="w-full bg-transparent text-sm text-[#3D342F] focus:outline-hidden resize-none pt-1 border-none notebook-lines opacity-90 placeholder:text-stone-400 min-h-[120px]"
                    />
                  </div>

                  {/* Photographic Memory Attachment */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowImageInput(!showImageInput)}
                      className="inline-flex items-center gap-1.5 text-xs text-[#7B6D65] hover:text-amber-800 transition font-sans font-medium cursor-pointer select-none"
                    >
                      <ImageIcon size={14} className="text-amber-700" />
                      <span>{showImageInput ? "Remove Photo Link" : "Attach Photo Address"}</span>
                    </button>

                    <AnimatePresence>
                      {showImageInput && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 overflow-hidden pl-1"
                        >
                          <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://example.com/photo.jpg"
                            className="w-full bg-white/70 border border-stone-300 rounded-xl px-3 py-2 font-sans text-xs focus:outline-hidden focus:border-amber-600 text-[#3D342F]"
                          />
                          {imageUrl.trim() && (
                            <div className="w-24 h-16 rounded-lg overflow-hidden border border-stone-300 bg-stone-100 relative shadow-xs">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={imageUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Time Capsule Lock Option */}
                  <div className="pt-1 space-y-2">
                    <label className="flex items-center space-x-2 text-xs text-[#7B6D65] font-sans font-medium cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        checked={isCapsule}
                        onChange={(e) => setIsCapsule(e.target.checked)}
                        className="rounded border-stone-300 text-amber-700 focus:ring-0 cursor-pointer w-4 h-4 accent-amber-600"
                      />
                      <span className="group-hover:text-amber-900 transition">
                        Seal into Time Capsule
                      </span>
                    </label>

                    <AnimatePresence>
                      {isCapsule && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pl-6 overflow-hidden"
                        >
                          <label
                            htmlFor="unlock-date"
                            className="block text-[10px] font-sans uppercase text-[#7B6D65] font-bold mb-1"
                          >
                            Unlocks on Date
                          </label>
                          <input
                            id="unlock-date"
                            type="date"
                            required={isCapsule}
                            value={unlockDate}
                            onChange={(e) => setUnlockDate(e.target.value)}
                            className="bg-white/80 border border-stone-300 rounded-xl px-3 py-1.5 font-sans text-xs focus:outline-hidden text-[#3D342F]"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Inscribe Submit Button */}
                  <button
                    type="submit"
                    disabled={writing}
                    className="w-full bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-serif font-semibold text-xs uppercase tracking-widest py-3 rounded-xl transition cursor-pointer shadow-md disabled:opacity-50 mt-2 active:scale-98"
                  >
                    {writing ? "Securing Memory..." : "Press Ink into Page"}
                  </button>
                </form>

                {/* Left Page Leaf Footer Note */}
                <div className="pt-2.5 border-t border-stone-300/40 text-[10px] font-mono text-[#7B6D65] flex items-center justify-between shrink-0">
                  <span>✦ encrypted volume</span>
                  <span>Left Page</span>
                </div>
              </div>

              {/* 📖 RIGHT PAGE: Dynamic Sheet Ledger (Scrollable Reader / Editor with 3D Page Flip & Slide Gestures) */}
              <div
                className={`p-4 sm:p-7 md:p-8 flex-col justify-between h-full relative z-10 overflow-hidden ${
                  mobileActiveTab === "read" ? "flex" : "hidden lg:flex"
                }`}
                style={{ perspective: 1200 }}
              >
                <AnimatePresence mode="wait" custom={pageDirection}>
                  {loading ? (
                    <div className="h-full flex items-center justify-center font-serif italic text-stone-400">
                      Leafing through volume pages...
                    </div>
                  ) : filteredEntries.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <FileText size={30} className="text-stone-300 mb-3" strokeWidth={1.5} />
                      <h4 className="font-serif text-lg text-[#3D342F] font-semibold mb-1">
                        No Memories Found
                      </h4>
                      <p className="text-xs font-serif text-[#7B6D65] max-w-xs italic leading-relaxed">
                        {searchQuery
                          ? "No matching entries match your search query."
                          : "This volume leaf is completely clear. Inscribe your first moment on the left page."}
                      </p>
                    </div>
                  ) : (
                    <motion.div
                      key={currentPage}
                      custom={pageDirection}
                      variants={pageFlipVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      drag={!isEditing && filteredEntries.length > 1 ? "x" : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.22}
                      onDragEnd={(_e, { offset, velocity }) => {
                        const swipeConfidenceThreshold = 10000;
                        const swipePower = Math.abs(offset.x) * velocity.x;

                        if (offset.x < -40 || swipePower < -swipeConfidenceThreshold) {
                          goToNextPage();
                        } else if (offset.x > 40 || swipePower > swipeConfidenceThreshold) {
                          goToPrevPage();
                        }
                      }}
                      className="h-full flex flex-col justify-between w-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
                    >
                      {/* Fixed Top Meta Row */}
                      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-stone-300/50 pb-2.5 shrink-0">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-900/80 uppercase tracking-wider font-semibold">
                            <Calendar size={11} className="text-amber-700" />
                            <span>
                              {new Date(currentActiveEntry.createdAt).toLocaleDateString(undefined, {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-serif text-[#7B6D65] italic">
                            <User size={11} className="text-stone-400" />
                            <span>By {currentActiveEntry.author.name}</span>
                          </div>
                        </div>

                        {/* Edit / Erase / Time Capsule Pill + Slide Hint */}
                        <div className="flex items-center gap-1.5 font-sans">
                          {!isEditing && filteredEntries.length > 1 && (
                            <span className="hidden sm:inline-flex text-[10px] font-mono text-[#7B6D65]/70 italic select-none mr-1">
                              ↔ slide leaf
                            </span>
                          )}
                          {currentActiveEntry.authorId === currentUserId &&
                            !currentActiveEntry.isLocked &&
                            !isEditing && (
                              <>
                                <button
                                  onClick={startEditingMode}
                                  className="text-[10px] text-[#7B6D65] hover:text-amber-800 flex items-center gap-1 uppercase font-bold tracking-wider transition border border-stone-300 bg-white/70 px-2.5 py-1 rounded-lg cursor-pointer"
                                >
                                  <Edit3 size={11} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => setIsConfirmingDelete(!isConfirmingDelete)}
                                  className={`text-[10px] flex items-center gap-1 uppercase font-bold tracking-wider transition border px-2.5 py-1 rounded-lg cursor-pointer ${
                                    isConfirmingDelete
                                      ? "bg-rose-50 border-rose-300 text-rose-700"
                                      : "text-[#7B6D65] border-stone-300 hover:border-rose-300 hover:text-rose-700 bg-white/70"
                                  }`}
                                >
                                  <Trash2 size={11} />
                                  <span>Erase</span>
                                </button>
                              </>
                            )}

                          {currentActiveEntry.isCapsule && (
                            <span className="bg-amber-100 text-amber-900 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-300">
                              <Lock size={10} />
                              <span>Capsule</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Scrollable Entry Body / Editing Workspace */}
                      <div className="flex-1 overflow-y-auto py-3 pr-1 sm:pr-2 space-y-4 custom-scrollbar">
                        {/* Delete Confirmation Drawer */}
                        <AnimatePresence>
                          {isConfirmingDelete && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-2.5 font-sans overflow-hidden"
                            >
                              <p className="font-bold text-rose-800 text-xs">
                                Tear this page out permanently?
                              </p>
                              <p className="text-rose-600 text-[11px] leading-relaxed">
                                This inscribed moment will be permanently erased from this volume.
                              </p>
                              <div className="flex gap-2 justify-end text-[10px] font-bold uppercase tracking-wider">
                                <button
                                  onClick={() => setIsConfirmingDelete(false)}
                                  className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 rounded-md text-stone-700 transition cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleDeleteEntry}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md transition cursor-pointer flex items-center gap-1"
                                >
                                  <Trash2 size={10} /> Burn Page
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Edit Mode Panel */}
                        {isEditing ? (
                          <div className="space-y-3 bg-white/60 p-3.5 border border-stone-300 rounded-xl font-sans">
                            {editError && (
                              <p className="text-[11px] font-medium text-rose-700">{editError}</p>
                            )}
                            <div>
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Update title..."
                                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-sm font-serif text-[#3D342F] focus:outline-hidden focus:border-amber-600"
                              />
                            </div>
                            <div>
                              <textarea
                                rows={5}
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                placeholder="Re-ink thoughts..."
                                className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs sm:text-sm font-serif text-[#3D342F] focus:outline-hidden resize-none leading-relaxed"
                              />
                            </div>
                            <div>
                              <input
                                type="url"
                                value={editImageUrl}
                                onChange={(e) => setEditImageUrl(e.target.value)}
                                placeholder="Photo link..."
                                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-sans text-[#3D342F] focus:outline-hidden focus:border-amber-600"
                              />
                            </div>
                            <div className="flex justify-end gap-2 text-xs uppercase tracking-wider font-bold">
                              <button
                                onClick={() => {
                                  setIsEditing(false);
                                  setIsConfirmingDelete(false);
                                }}
                                className="px-3 py-1 border border-stone-300 rounded-xl text-stone-600 transition cursor-pointer flex items-center gap-1"
                              >
                                <X size={12} /> Cancel
                              </button>
                              <button
                                onClick={handleSaveChangesEdit}
                                className="px-3 py-1 bg-gradient-to-r from-amber-600 to-rose-600 text-white rounded-xl transition cursor-pointer flex items-center gap-1"
                              >
                                <Check size={12} /> Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Entry Title */}
                            <h3 className="font-serif text-xl sm:text-2xl text-[#3D342F] font-semibold tracking-wide leading-tight break-words">
                              {currentActiveEntry.title}
                            </h3>

                            {/* Attached Image Snapshot */}
                            {currentActiveEntry.imageUrl && !currentActiveEntry.isLocked && (
                              <div className="my-3 p-2.5 bg-white border border-stone-200 rounded-md shadow-md max-w-xs sm:max-w-sm mx-auto select-none">
                                <div className="w-full h-36 sm:h-44 rounded-md overflow-hidden bg-stone-100 border border-stone-200 relative">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={currentActiveEntry.imageUrl}
                                    alt={currentActiveEntry.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <p className="text-[10px] font-sans text-stone-400 text-center italic mt-2 flex items-center justify-center gap-1">
                                  <LucideImage size={10} /> Photographic Snapshot
                                </p>
                              </div>
                            )}

                            {/* Entry Content Body */}
                            <div className="text-sm sm:text-base text-[#3D342F] font-serif leading-relaxed w-full min-w-0">
                              {currentActiveEntry.isLocked ? (
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start space-x-3">
                                  <ShieldAlert size={17} className="text-amber-700 shrink-0 mt-0.5" />
                                  <div className="font-sans">
                                    <h5 className="text-xs font-bold uppercase text-amber-900 tracking-wider mb-1">
                                      Locked Time Capsule
                                    </h5>
                                    <p className="text-xs italic text-[#7B6D65] leading-relaxed break-words">
                                      {currentActiveEntry.content}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <p className="whitespace-pre-wrap break-words pt-1 notebook-lines opacity-90">
                                  {currentActiveEntry.content}
                                </p>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Right Page Leaf Footer Note */}
                      <div className="pt-2.5 border-t border-stone-300/40 text-right text-[10px] font-mono text-[#7B6D65] uppercase tracking-wider shrink-0">
                        Right Leaf {currentPage + 1} of {totalBookPages}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* 🧭 BOTTOM PAGINATION & PAGE FLIP CONTROLS */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-3 sm:px-6 py-3 font-sans border-t border-amber-500/20 backdrop-blur-md bg-black/40">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Quick Page Jump */}
          <form
            onSubmit={handlePageJumpSubmit}
            className="flex items-center gap-2 text-stone-300 font-medium order-2 sm:order-1"
          >
            <span className="text-[11px]">Go to leaf:</span>
            <input
              type="text"
              placeholder="No."
              value={jumpPageStr}
              onChange={(e) => setJumpPageStr(e.target.value)}
              className="w-11 bg-black/50 border border-amber-500/30 rounded-lg text-center py-1 text-white text-xs font-bold focus:outline-hidden focus:border-amber-400"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg uppercase tracking-wider font-semibold text-[10px] transition cursor-pointer"
            >
              Jump
            </button>
          </form>

          {/* Previous / Next Page Flip Controls */}
          <div className="flex items-center gap-2 sm:gap-4 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              disabled={currentPage === 0 || filteredEntries.length === 0 || isEditing}
              onClick={goToPrevPage}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 disabled:opacity-30 disabled:hover:bg-white/10 transition cursor-pointer active:scale-95 text-xs font-medium"
            >
              <ChevronLeft size={14} className="text-amber-400" />
              <span>Flip Back</span>
            </button>

            <span className="text-[11px] font-mono text-amber-200/90 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 whitespace-nowrap">
              {filteredEntries.length === 0
                ? "0 / 0"
                : `Leaf ${currentPage + 1} of ${totalBookPages}`}
            </span>

            <button
              disabled={
                currentPage >= filteredEntries.length - 1 ||
                filteredEntries.length === 0 ||
                isEditing
              }
              onClick={goToNextPage}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 disabled:opacity-30 disabled:hover:bg-white/10 transition cursor-pointer active:scale-95 text-xs font-medium"
            >
              <span>Flip Forward</span>
              <ChevronRight size={14} className="text-amber-400" />
            </button>
          </div>

        </div>
      </footer>
    </div>
  );
}