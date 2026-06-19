"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Lock, ShieldAlert, Feather, ChevronLeft, ChevronRight, Calendar, User, Search, Edit3, Check, X, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

interface Entry {
  id: string;
  title: string;
  content: string;
  isCapsule: boolean;
  unlockDate: string | null;
  isLocked: boolean;
  createdAt: string;
  authorId: string;
  author: { name: string };
}

export default function DynamicBookWorkspace({ params }: { params: Promise<{ diaryId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const diaryId = resolvedParams.diaryId;

  // Ledger state variables
  const [entries, setEntries] = useState<Entry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  // Search & Navigation tracking states
  const [searchQuery, setSearchQuery] = useState("");
  const [jumpPageStr, setJumpPageStr] = useState("");

  // Inline Edit management panel tracking states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editError, setEditError] = useState("");

  // Form write state elements
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isCapsule, setIsCapsule] = useState(false);
  const [unlockDate, setUnlockDate] = useState("");
  const [formError, setFormError] = useState("");
  const [writing, setWriting] = useState(false);

  const fetchEntries = async () => {
    try {
      const res = await fetch(`/api/entries?diaryId=${diaryId}`);
      if (!res.ok) throw new Error("Could not parse repository content.");
      const data = await res.json();
      setEntries(data.entries || []);

      // Extract current active user identity track from browser token payload wrapper
      const tokenPayload = document.cookie.split("; ").find(row => row.startsWith("token="))?.split("=")[1];
      if (tokenPayload) {
        try {
          const decoded = JSON.parse(window.atob(tokenPayload.split('.')[1]));
          setCurrentUserId(decoded.userId);
        } catch {}
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
        body: JSON.stringify({ diaryId, title, content, isCapsule, unlockDate: isCapsule ? unlockDate : null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failure");

      setTitle(""); setContent(""); setIsCapsule(false); setUnlockDate("");
      await fetchEntries();
      setCurrentPage(0);
    } catch (err: any) { setFormError(err.message); } finally { setWriting(false); }
  };

  // Process patch update for historical entries edits
  const handleSaveChangesEdit = async () => {
    if (!currentActiveEntry) return;
    setEditError("");
    try {
      const res = await fetch("/api/entries/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: currentActiveEntry.id, title: editTitle, content: editContent })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update structural fault.");

      setIsEditing(false);
      await fetchEntries();
    } catch (err: any) { setEditError(err.message); }
  };

  // Initialize edit configuration states automatically
  const startEditingMode = () => {
    if (!currentActiveEntry) return;
    setEditTitle(currentActiveEntry.title);
    setEditContent(currentActiveEntry.content);
    setIsEditing(true);
  };

  // Client-Side Search Processing filter mapping
  const filteredEntries = entries.filter(entry => 
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBookPages = Math.max(1, filteredEntries.length);
  const currentActiveEntry = filteredEntries[currentPage];

  // Direct Jump execution wrapper
  const handlePageJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPageNum = parseInt(jumpPageStr, 10);
    if (!isNaN(targetPageNum) && targetPageNum >= 1 && targetPageNum <= totalBookPages) {
      setCurrentPage(targetPageNum - 1);
      setJumpPageStr("");
    }
  };

  return (
    <main className="min-h-screen w-full bg-diary-cream p-3 sm:p-6 md:p-8 text-diary-charcoal flex flex-col justify-between gap-6">
      
      {/* Top Header Panel controls */}
      <header className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <button 
          onClick={() => router.push("/dashboard")}
          className="text-stone-500 hover:text-diary-sage transition flex items-center space-x-2 text-xs uppercase tracking-widest font-bold cursor-pointer self-start sm:self-center"
        >
          <ArrowLeft size={14} /> <span>Dashboard Hub</span>
        </button>

        {/* Minimal Search Field Module */}
        <div className="relative w-full sm:w-64 self-start sm:self-center">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input 
            type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(0); }}
            placeholder="Search words or titles..."
            className="w-full bg-diary-paper border border-stone-200/60 rounded-xl pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-diary-sage text-stone-800 shadow-2xs"
          />
        </div>
      </header>

      {/* OPEN BOOK MASTER LAYOUT MATRIX */}
      <section className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 bg-diary-paper border-2 sm:border-4 border-stone-300/40 rounded-2xl sm:rounded-3xl shadow-xl min-h-130 lg:min-h-145 relative overflow-hidden">
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-linear-to-r from-stone-200/80 via-stone-300 to-stone-200/80 shadow-inner z-10" />

        {/* ========================================================= */}
        {/* LEFT PAGE LAYOUT: The Inscription Canvas                 */}
        {/* ========================================================= */}
        <div className="p-5 sm:p-8 md:p-10 flex flex-col justify-between bg-linear-to-l from-stone-50/40 via-diary-paper to-diary-paper border-b lg:border-b-0 lg:border-r border-stone-100">
          <div className="space-y-6 w-full">
            <div className="flex items-center space-x-2 text-diary-sage"> <Feather size={20} /> <h2 className="font-serif text-lg sm:text-xl tracking-wide font-semibold">Inscribe New Memory Page</h2> </div>

            <form onSubmit={handleWriteEntry} className="space-y-4">
              {formError && <p className="text-xs text-red-500 bg-red-50 p-2.5 rounded-lg border border-red-100">{formError}</p>}
              <div className="space-y-1">
                <label htmlFor="entry-title" className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Header Title</label>
                <input id="entry-title" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title of this moment..." className="w-full bg-transparent text-stone-800 font-serif text-lg sm:text-xl border-b border-stone-200/60 focus:outline-none focus:border-diary-sage pb-2 transition" />
              </div>
              <div className="space-y-1">
                <label htmlFor="entry-content" className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Body Thoughts</label>
                <textarea id="entry-content" required rows={6} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Pour your thoughts down across the pages..." className="w-full bg-transparent text-sm text-stone-600 focus:outline-none resize-none pt-1 leading-8 bg-[linear-gradient(transparent_95%25,#E5E5E5_95%25)] bg-size-[100%_2rem]" />
              </div>
              <div className="pt-2 space-y-3">
                <label className="flex items-center space-x-3 text-xs tracking-wider text-stone-400 font-bold uppercase cursor-pointer select-none">
                  <input type="checkbox" checked={isCapsule} onChange={(e) => setIsCapsule(e.target.checked)} className="rounded border-stone-300 text-diary-sage focus:ring-0 cursor-pointer w-4 h-4" />
                  <span>Seal into Dynamic Time Capsule</span>
                </label>
                <AnimatePresence>
                  {isCapsule && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="pl-7">
                      <label htmlFor="unlock-date" className="block text-[10px] uppercase text-stone-400 font-bold mb-1">Target Unlock Date</label>
                      <input id="unlock-date" type="date" required={isCapsule} value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} className="bg-diary-cream border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none text-stone-600 font-medium" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button type="submit" disabled={writing} className="w-full bg-diary-sage hover:bg-diary-sage/90 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition cursor-pointer shadow-sm disabled:opacity-50">{writing ? "Securing Memory..." : "Press Ink into Page"}</button>
            </form>
          </div>
          <div className="pt-6 border-t border-stone-100 text-[11px] text-stone-400 flex items-center justify-between italic mt-6 lg:mt-0"> <span>* Stamped with local metadata parameters.</span> <span>Page L-Canvas</span> </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT PAGE LAYOUT: Dynamic Virtual Sheet Ledger Rendering */}
        {/* ========================================================= */}
        <div className="p-5 sm:p-8 md:p-10 flex flex-col justify-between bg-linear-to-r from-stone-50/40 via-diary-paper to-diary-paper min-h-95 sm:min-h-112.5 lg:min-h-0 w-full overflow-y-auto">
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="h-full min-h-62.5 flex items-center justify-center font-serif italic text-stone-400">Leafing through notebook logs...</div>
            ) : filteredEntries.length === 0 ? (
              <div className="h-full min-h-62.5 flex flex-col items-center justify-center text-center p-4">
                <FileText size={24} className="text-stone-300 mb-2" />
                <h4 className="font-serif text-base text-stone-700 mb-1">No Memories Found</h4>
                <p className="text-xs text-stone-400 max-w-xs italic leading-relaxed">No matching entries line up with your active parameters.</p>
              </div>
            ) : (
              <motion.div key={currentPage} initial={{ opacity: 0, rotateY: 15 }} animate={{ opacity: 1, rotateY: 0 }} exit={{ opacity: 0, rotateY: -15 }} className="h-full flex flex-col justify-between space-y-6 w-full">
                
                {/* Book Page Ribbon Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-stone-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-stone-400 uppercase font-bold tracking-widest">
                      <Calendar size={12} className="text-diary-sage" />
                      <span>{new Date(currentActiveEntry.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-stone-400 uppercase font-bold tracking-widest">
                      <User size={12} className="text-stone-300" /> <span>By {currentActiveEntry.author.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-start">
                    {/* Render Edit Control Action if the viewer matches the original author node key */}
                    {currentActiveEntry.authorId === currentUserId && !currentActiveEntry.isLocked && !isEditing && (
                      <button onClick={startEditingMode} className="text-[10px] text-stone-400 hover:text-diary-sage flex items-center gap-1 uppercase font-bold tracking-wider transition border border-stone-200/50 hover:border-diary-sage/40 bg-white/50 px-2 py-1 rounded-md cursor-pointer shadow-3xs">
                        <Edit3 size={11} /> Edit Page
                      </button>
                    )}
                    {currentActiveEntry.isCapsule && (
                      <span className="bg-diary-blush/20 text-stone-700 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-diary-blush/30"> <Lock size={10} /> Time Capsule </span>
                    )}
                  </div>
                </div>

                {/* Main Dynamic Workspace Area Container */}
                <div className="flex-1 py-2 w-full min-w-0">
                  {isEditing ? (
                    /* EDIT MODE FRAMEWORK INTERACTIVE ROW WINDOW */
                    <div className="space-y-4 bg-stone-50/60 p-4 border border-stone-200/60 rounded-xl shadow-2xs">
                      {editError && <p className="text-[11px] text-red-500 font-medium">{editError}</p>}
                      <div>
                        <label htmlFor="entry-title" className="sr-only">Entry title</label>
                        <input 
                          id="entry-title"
                          type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Entry title"
                          title="Entry title"
                          className="w-full bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-base font-serif text-stone-800 focus:outline-none focus:border-diary-sage"
                        />
                      </div>
                      <div>
                        <label htmlFor="entry-content" className="sr-only">Entry content</label>
                        <textarea 
                          id="entry-content"
                          rows={6} value={editContent} onChange={(e) => setEditContent(e.target.value)}
                          placeholder="Write your memory..."
                          title="Entry content"
                          className="w-full bg-white border border-stone-200 rounded-lg p-3 text-sm text-stone-600 focus:outline-none resize-none leading-relaxed"
                        />
                      </div>
                      <div className="flex justify-end gap-2 text-xs uppercase tracking-wider font-bold">
                        <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 border border-stone-200 hover:bg-stone-100 rounded-lg text-stone-500 transition cursor-pointer flex items-center gap-1"><X size={12} /> Cancel</button>
                        <button onClick={handleSaveChangesEdit} className="px-3 py-1.5 bg-diary-sage hover:bg-diary-sage/90 text-white rounded-lg transition cursor-pointer flex items-center gap-1"><Check size={12} /> Save Ink</button>
                      </div>
                    </div>
                  ) : (
                    /* RENDER / DISPLAY MEMORY LAYER */
                    <>
                      <h3 className="font-serif text-xl sm:text-2xl text-stone-800 mb-4 font-semibold tracking-wide leading-tight wrap-break-word">{currentActiveEntry.title}</h3>
                      <div className="text-sm text-stone-600 font-serif w-full min-w-0">
                        {currentActiveEntry.isLocked ? (
                          <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-xl flex items-start space-x-3 mt-1 select-none shadow-xs">
                            <ShieldAlert size={18} className="text-diary-blush mt-0.5 shrink-0" />
                            <div>
                              <h5 className="text-xs font-bold uppercase text-stone-500 tracking-wider mb-1">Locked Memory Vault</h5>
                              <p className="text-xs italic text-stone-400 font-medium wrap-break-word">{currentActiveEntry.content}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap wrap-break-word pt-1" style={{ lineHeight: '2rem', backgroundImage: 'linear-gradient(transparent 95%, #F0ECE3 95%)', backgroundSize: '100% 2rem', backgroundAttachment: 'local' }}>
                            {currentActiveEntry.content}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="text-right text-[10px] uppercase font-bold tracking-widest text-stone-400 border-t border-stone-50 pt-3 mt-4"> Page Leaf {currentPage + 1} of {totalBookPages} </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* FOOTER NAVIGATION & JUMP PANEL CONTROLS */}
      <footer className="max-w-6xl w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mt-2 border-t border-stone-200/40 pt-4">
        
        {/* Quick Page Direct Jump Form Selector */}
        <form onSubmit={handlePageJumpSubmit} className="flex items-center gap-2 text-xs font-medium text-stone-500 order-2 md:order-1">
          <span>Go to page:</span>
          <input 
            type="text" placeholder="No." value={jumpPageStr} onChange={(e) => setJumpPageStr(e.target.value)}
            className="w-10 bg-diary-paper border border-stone-200 rounded-lg text-center py-1 text-stone-800 font-bold focus:outline-none focus:border-diary-sage shadow-3xs"
          />
          <button type="submit" className="px-2 py-1 border border-stone-200 hover:border-diary-sage bg-white text-stone-600 rounded-lg uppercase tracking-wider font-bold text-[10px] transition cursor-pointer shadow-3xs">Jump</button>
        </form>

        {/* Dynamic Symmetrical Flip Buttons Ribbon */}
        <div className="flex justify-center items-center gap-3 sm:gap-6 order-1 md:order-2 w-full md:w-auto">
          <button
            disabled={currentPage === 0 || filteredEntries.length === 0 || isEditing}
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            className="flex items-center gap-1 px-3 py-2 border border-stone-200 rounded-xl text-[11px] sm:text-xs uppercase tracking-wider font-bold bg-diary-paper hover:border-diary-sage text-stone-600 disabled:opacity-40 disabled:hover:border-stone-200 transition shadow-xs cursor-pointer select-none"
          >
            <ChevronLeft size={14} /> <span className="hidden sm:inline">Flip Back</span>
          </button>

          <span className="text-[10px] sm:text-xs font-medium text-stone-400 bg-diary-paper/40 px-2.5 sm:px-3 py-1.5 rounded-md border border-stone-100 whitespace-nowrap select-none">
            {filteredEntries.length === 0 ? "Empty Ledger" : `Leaf Sheet ${currentPage + 1} / ${totalBookPages}`}
          </span>

          <button
            disabled={currentPage >= filteredEntries.length - 1 || filteredEntries.length === 0 || isEditing}
            onClick={() => setCurrentPage(prev => Math.min(filteredEntries.length - 1, prev + 1))}
            className="flex items-center gap-1 px-3 py-2 border border-stone-200 rounded-xl text-[11px] sm:text-xs uppercase tracking-wider font-bold bg-diary-paper hover:border-diary-sage text-stone-600 disabled:opacity-40 disabled:hover:border-stone-200 transition shadow-xs cursor-pointer select-none"
          >
            <span className="hidden sm:inline">Flip Forward</span> <ChevronRight size={14} />
          </button>
        </div>
      </footer>
    </main>
  );
}