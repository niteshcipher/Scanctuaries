"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Lock, ShieldAlert, Feather, ChevronLeft, ChevronRight, Calendar, User, Search, Edit3, Check, X, FileText, ImageIcon, Image as LucideImage, PenTool, Trash2 } from "lucide-react";
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

export default function DynamicBookWorkspace({ params }: { params: Promise<{ diaryId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const diaryId = resolvedParams.diaryId;

  // Ledger state variables
  const [entries, setEntries] = useState<Entry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("none");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  // Mobile View Mode Layout Selector
  const [mobileActiveTab, setMobileActiveTab] = useState<"write" | "read">("write");

  // Search & Navigation tracking states
  const [searchQuery, setSearchQuery] = useState("");
  const [jumpPageStr, setJumpPageStr] = useState("");

  // Inline Edit management panel tracking states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editError, setEditError] = useState("");

  // Deletion tracking state unified cleanly
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
      // ✅ FIXED: Added credentials configuration to pass Auth.js cookies safely
      const res = await fetch(`/api/entries?diaryId=${diaryId}`, {
        method: "GET",
        credentials: "same-origin",
      });
      
      if (!res.ok) throw new Error("Could not parse repository content.");
      const data = await res.json();
      setEntries(data.entries || []);

      // ✅ FIXED: Relying on backend session data payload instead of outdated manual client-side JWT token parsing
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
      // ✅ FIXED: Appended credentials framework parameters to execution mapping
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
          unlockDate: isCapsule ? unlockDate : null 
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failure");

      setTitle(""); setContent(""); setImageUrl(""); setShowImageInput(false); setIsCapsule(false); setUnlockDate("");
      await fetchEntries();
      currentPage === 0 ? fetchEntries() : setCurrentPage(0); // Safely reset to page one
      setMobileActiveTab("read");
    } catch (err: any) { setFormError(err.message); } finally { setWriting(false); }
  };

  const handleSaveChangesEdit = async () => {
    if (!currentActiveEntry) return;
    setEditError("");
    try {
      // ✅ FIXED: Appended credentials framework parameters to update mapping
      const res = await fetch("/api/entries/edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ 
          entryId: currentActiveEntry.id, 
          title: editTitle, 
          content: editContent,
          imageUrl: editImageUrl.trim() || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update structural fault.");

      setIsEditing(false);
      await fetchEntries();
    } catch (err: any) { setEditError(err.message); }
  };

  const handleDeleteEntry = async () => {
    if (!currentActiveEntry) return;
    try {
      // ✅ FIXED: Appended credentials framework parameters to deletion mapping
      const res = await fetch(`/api/entries`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ entryId: currentActiveEntry.id })
      });
      
      if (!res.ok) throw new Error("Could not erase specified sheet mapping.");
      
      setIsConfirmingDelete(false);
      if (currentPage > 0 && currentPage === filteredEntries.length - 1) {
        setCurrentPage(prev => prev - 1);
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

  const filteredEntries = entries.filter(entry => 
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBookPages = Math.max(1, filteredEntries.length);
  const currentActiveEntry = filteredEntries[currentPage];

  const handlePageJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPageNum = parseInt(jumpPageStr, 10);
    if (!isNaN(targetPageNum) && targetPageNum >= 1 && targetPageNum <= totalBookPages) {
      setCurrentPage(targetPageNum - 1);
      setJumpPageStr("");
    }
  };

  return (
    <main className="min-h-screen w-full bg-diary-cream p-3 sm:p-6 md:p-8 text-diary-charcoal flex flex-col justify-between gap-6 relative font-serif antialiased overflow-x-hidden selection:bg-diary-blush/30">
      
      <div className="absolute inset-4 md:inset-6 border border-diary-charcoal/5 pointer-events-none rounded-sm z-0" />

      {/* Top Header Panel */}
      <header className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
        <button 
          onClick={() => router.push("/dashboard")}
          className="text-diary-charcoal/60 hover:text-diary-sage transition flex items-center space-x-2 text-xs uppercase tracking-widest font-sans font-bold cursor-pointer self-start sm:self-center"
        >
          <ArrowLeft size={14} /> <span>Dashboard Hub</span>
        </button>

        <div className="flex lg:hidden bg-linear-to-b from-[#8C6D58]/10 to-[#594235]/10 p-1 rounded-xl border border-diary-charcoal/5 font-sans w-full sm:w-auto">
          <button
            onClick={() => setMobileActiveTab("write")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition duration-200 cursor-pointer ${mobileActiveTab === "write" ? "bg-diary-sage text-white shadow-xs" : "text-diary-charcoal/60 hover:text-diary-sage"}`}
          >
            <PenTool size={14} /> Inscribe Page
          </button>
          <button
            onClick={() => setMobileActiveTab("read")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition duration-200 cursor-pointer ${mobileActiveTab === "read" ? "bg-diary-sage text-white shadow-xs" : "text-diary-charcoal/60 hover:text-diary-sage"}`}
          >
            <BookOpen size={14} /> Read Ledger
          </button>
        </div>

        <div className="relative w-full sm:w-64 self-start sm:self-center font-sans">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-diary-charcoal/30" />
          <input 
            type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(0); }}
            placeholder="Search words or titles..."
            className="w-full bg-[#FDF7F2] border border-diary-charcoal/10 rounded-xl pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-diary-sage text-diary-charcoal shadow-2xs transition"
          />
        </div>
      </header>

      {/* LEATHER COVER WRAPPING */}
      <section className="max-w-6xl w-full mx-auto relative p-1.5 sm:p-3 bg-linear-to-b from-[#8C6D58] via-[#735643] to-[#594235] rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_rgba(115,86,67,0.18)] z-10 border border-[#594235]/40">
        
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-linear-to-r from-black/15 to-transparent rounded-l-2xl pointer-events-none z-30" />
        <div className="absolute right-0 top-0 bottom-0 w-3 bg-linear-to-l from-black/15 to-transparent rounded-r-2xl pointer-events-none z-30" />

        <div className="bg-[#FDF7F2] rounded-xl sm:rounded-2xl overflow-hidden min-h-130 lg:min-h-155 relative shadow-inner">
          
          <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-10 bg-linear-to-r from-diary-charcoal/4 to-transparent pointer-events-none z-20" />
          <div className="absolute right-0 top-0 bottom-0 w-6 sm:w-10 bg-linear-to-l from-diary-charcoal/4 to-transparent pointer-events-none z-20" />
          
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 bg-linear-to-r from-transparent via-black/10 to-transparent pointer-events-none z-30" />
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-diary-charcoal/5 z-20" />

          <div className="flex flex-col lg:grid lg:grid-cols-2 w-full h-full">

            {/* LEFT SIDE: Inscription Slate */}
            <div className={`p-5 sm:p-8 md:p-10 flex-col justify-between border-b lg:border-b-0 lg:border-r border-diary-charcoal/5 relative z-10 ${mobileActiveTab === "write" ? "flex" : "hidden lg:flex"}`}>
              <div className="space-y-6 w-full">
                <div className="flex items-center space-x-2.5 text-diary-sage"> 
                  <Feather size={20} strokeWidth={1.5} /> 
                  <h2 className="font-serif text-lg tracking-wide font-semibold text-diary-charcoal">Inscribe New Memory Page</h2> 
                </div>

                <form onSubmit={handleWriteEntry} className="space-y-4">
                  {formError && <p className="text-xs font-sans text-red-700 bg-red-50 p-3 rounded-xl border border-red-200">{formError}</p>}
                  
                  <div className="space-y-1.5">
                    <label htmlFor="entry-title" className="text-[10px] font-sans font-bold tracking-widest text-diary-charcoal/40 uppercase">Header Title</label>
                    <input id="entry-title" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title of this moment..." className="w-full bg-transparent text-diary-charcoal font-serif text-lg border-b border-diary-charcoal/10 focus:outline-none focus:border-diary-sage pb-2 transition placeholder:text-diary-charcoal/20" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="entry-content" className="text-[10px] font-sans font-bold tracking-widest text-diary-charcoal/40 uppercase">Body Thoughts</label>
                    <textarea 
                      id="entry-content" 
                      required 
                      rows={6} 
                      value={content} 
                      onChange={(e) => setContent(e.target.value)} 
                      placeholder="Pour your thoughts down across the pages..." 
                      className="w-full bg-transparent text-sm text-diary-charcoal/80 focus:outline-none resize-none pt-1 border-none notebook-lines opacity-85 placeholder:text-diary-charcoal/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowImageInput(!showImageInput)}
                      className="inline-flex items-center gap-1.5 text-xs text-diary-charcoal/50 hover:text-diary-sage transition font-sans font-semibold cursor-pointer select-none"
                    >
                      <ImageIcon size={14} /> {showImageInput ? "Remove Image Layer" : "Attach Photographic Memory"}
                    </button>
                    
                    <AnimatePresence>
                      {showImageInput && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden pl-1">
                          <input 
                            type="url" 
                            value={imageUrl} 
                            onChange={(e) => setImageUrl(e.target.value)} 
                            placeholder="Paste photo web link address..." 
                            className="w-full bg-[#FDF7F2] border border-diary-charcoal/10 rounded-xl px-3 py-2 font-sans text-xs focus:outline-none focus:border-diary-sage text-diary-charcoal shadow-2xs"
                          />
                          {imageUrl.trim() && (
                            <div className="w-24 h-16 rounded-lg overflow-hidden border border-diary-charcoal/10 bg-[#FDF7F2] relative shadow-2xs">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={imageUrl} alt="Attached Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="pt-1 space-y-3">
                    <label className="flex items-center space-x-3 text-xs tracking-wider text-diary-charcoal/50 font-sans font-bold uppercase cursor-pointer select-none group">
                      <input type="checkbox" checked={isCapsule} onChange={(e) => setIsCapsule(e.target.checked)} className="rounded border-diary-charcoal/20 text-diary-sage focus:ring-0 cursor-pointer w-4 h-4 accent-diary-sage" />
                      <span className="group-hover:text-diary-sage transition">Seal into Dynamic Time Capsule</span>
                    </label>
                    
                    <AnimatePresence>
                      {isCapsule && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="pl-7 overflow-hidden">
                          <label htmlFor="unlock-date" className="block text-[10px] font-sans uppercase text-diary-charcoal/40 font-bold mb-1.5">Target Unlock Date</label>
                          <input id="unlock-date" type="date" required={isCapsule} value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)} className="bg-diary-cream border border-diary-charcoal/10 rounded-xl px-3 py-2 font-sans text-xs focus:outline-none text-diary-charcoal/80 font-medium shadow-2xs" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button type="submit" disabled={writing} className="w-full bg-diary-sage hover:bg-diary-sage/90 text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl transition cursor-pointer shadow-md disabled:opacity-50 mt-2">
                    {writing ? "Securing Memory..." : "Press Ink into Page"}
                  </button>
                </form>
              </div>
              <div className="pt-6 border-t border-diary-charcoal/5 text-[11px] font-sans text-diary-charcoal/40 flex items-center justify-between italic mt-6 lg:mt-0"> <span>* Custom encryption enabled.</span> <span>Left Page</span> </div>
            </div>

            {/* RIGHT SIDE: Dynamic Sheet Ledger */}
            <div className={`p-5 sm:p-8 md:p-10 flex flex-col justify-between w-full h-full relative z-10 ${mobileActiveTab === "read" ? "flex" : "hidden lg:flex"}`}>
              <AnimatePresence mode="wait">
                {loading ? (
                  <div className="h-full min-h-62.5 flex items-center justify-center font-serif italic text-diary-charcoal/40">Leafing through notebook logs...</div>
                ) : filteredEntries.length === 0 ? (
                  <div className="h-full min-h-62.5 flex flex-col items-center justify-center text-center p-4">
                    <FileText size={28} className="text-diary-charcoal/15 mb-3" strokeWidth={1.5} />
                    <h4 className="font-serif text-base text-diary-charcoal/80 font-semibold mb-1">No Memories Found</h4>
                    <p className="text-xs font-sans text-diary-charcoal/40 max-w-xs italic leading-relaxed">No matching entries line up with your active parameters.</p>
                  </div>
                ) : (
                  <motion.div key={currentPage} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.25 }} className="h-full flex flex-col justify-between space-y-6 w-full">
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b border-diary-charcoal/5 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-sans text-diary-charcoal/50 uppercase font-bold tracking-widest">
                          <Calendar size={12} className="text-diary-sage" />
                          <span>{new Date(currentActiveEntry.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-sans text-diary-charcoal/50 uppercase font-bold tracking-widest">
                          <User size={12} className="text-diary-charcoal/30" /> <span>By {currentActiveEntry.author.name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-start font-sans">
                        {/* Verify authorship matches before displaying edit tools */}
                        {currentActiveEntry.authorId === currentUserId && !currentActiveEntry.isLocked && !isEditing && (
                          <>
                            <button onClick={startEditingMode} className="text-[10px] text-diary-charcoal/50 hover:text-diary-sage flex items-center gap-1 uppercase font-bold tracking-wider transition border border-diary-charcoal/10 bg-[#FDF7F2] px-2.5 py-1 rounded-lg cursor-pointer shadow-3xs">
                              <Edit3 size={11} /> Edit
                            </button>
                            <button onClick={() => setIsConfirmingDelete(!isConfirmingDelete)} className={`text-[10px] flex items-center gap-1 uppercase font-bold tracking-wider transition border px-2.5 py-1 rounded-lg cursor-pointer shadow-3xs ${isConfirmingDelete ? "bg-rose-50 border-rose-200 text-rose-600" : "text-diary-charcoal/50 border-diary-charcoal/10 hover:border-rose-300 hover:text-rose-600 bg-[#FDF7F2]"}`}>
                              <Trash2 size={11} /> Erase
                            </button>
                          </>
                        )}
                        {currentActiveEntry.isCapsule && (
                          <span className="bg-diary-blush/10 text-diary-charcoal text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-diary-blush/20 shadow-3xs"> 
                            <Lock size={10} className="text-diary-blush" /> Time Capsule 
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 py-2 w-full min-w-0 space-y-4">
                      
                      <AnimatePresence>
                        {isConfirmingDelete && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-rose-50/70 border border-rose-100 rounded-xl p-3.5 space-y-3 font-sans overflow-hidden">
                            <div className="text-xs">
                              <p className="font-bold text-rose-800">Tear this page out permanently?</p>
                              <p className="text-rose-600/90 mt-0.5 leading-normal text-[11px]">This action cannot be undone. This inscribed memory will be entirely wiped from the sanctuary history maps.</p>
                            </div>
                            <div className="flex gap-2 justify-end text-[10px] font-bold uppercase tracking-wider">
                              <button onClick={() => setIsConfirmingDelete(false)} className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 rounded-md text-stone-700 transition cursor-pointer">Cancel</button>
                              <button onClick={handleDeleteEntry} className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md transition cursor-pointer flex items-center gap-1"><Trash2 size={10} /> Burn Page</button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {isEditing ? (
                        <div className="space-y-4 bg-diary-cream/30 p-4 border border-diary-charcoal/10 rounded-xl shadow-2xs font-sans">
                          {editError && <p className="text-[11px] font-medium text-red-700">{editError}</p>}
                          <div>
                            <input 
                              type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Update header title..."
                              title="Entry Title"
                              className="w-full bg-white border border-diary-charcoal/10 rounded-xl px-4 py-2 text-base font-serif text-diary-charcoal focus:outline-none focus:border-diary-sage transition"
                            />
                          </div>
                          <div>
                            <textarea 
                              rows={6} value={editContent} onChange={(e) => setEditContent(e.target.value)}
                              placeholder="Re-ink your thoughts..."
                              title="Entry Content"
                              className="w-full bg-white border border-diary-charcoal/10 rounded-xl p-4 text-sm font-serif text-diary-charcoal/80 focus:outline-none resize-none leading-relaxed transition shadow-inner"
                            />
                          </div>
                          <div>
                            <input 
                              type="url" value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)}
                              placeholder="Update photographic memory url link..."
                              title="Entry Image URL"
                              className="w-full bg-white border border-diary-charcoal/10 rounded-xl px-4 py-2 text-xs font-sans text-diary-charcoal focus:outline-none focus:border-diary-sage transition"
                            />
                          </div>
                          <div className="flex justify-end gap-2 text-xs uppercase tracking-wider font-bold">
                            <button onClick={() => { setIsEditing(false); setIsConfirmingDelete(false); }} className="px-3 py-1.5 border border-diary-charcoal/10 hover:bg-diary-cream rounded-xl text-diary-charcoal/50 transition cursor-pointer flex items-center gap-1"><X size={12} /> Cancel</button>
                            <button onClick={handleSaveChangesEdit} className="px-3 py-1.5 bg-diary-charcoal hover:bg-diary-sage text-white rounded-xl transition cursor-pointer flex items-center gap-1"><Check size={12} /> Save Changes</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-serif text-xl sm:text-2xl text-diary-charcoal mb-4 font-semibold tracking-wide leading-tight wrap-break-words">{currentActiveEntry.title}</h3>
                          
                          {currentActiveEntry.imageUrl && !currentActiveEntry.isLocked && (
                            <div className="my-5 p-3 bg-white border border-diary-charcoal/5 rounded-md shadow-md max-w-xs sm:max-w-sm mx-auto rotate-1 hover:rotate-0 transition duration-300 transform select-none">
                              <div className="w-full h-40 sm:h-48 rounded-md overflow-hidden bg-diary-cream border border-diary-charcoal/5 relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={currentActiveEntry.imageUrl} alt={currentActiveEntry.title} className="w-full h-full object-cover" />
                              </div>
                              <p className="text-[10px] font-sans font-medium text-diary-charcoal/30 text-center italic mt-2.5 flex items-center justify-center gap-1"><LucideImage size={10} /> Snapshot</p>
                            </div>
                          )}

                          <div className="text-sm text-diary-charcoal/80 font-serif w-full min-w-0">
                            {currentActiveEntry.isLocked ? (
                              <div className="bg-diary-cream/40 border border-diary-blush/20 p-5 rounded-2xl flex items-start space-x-3 shadow-3xs">
                                <ShieldAlert size={18} className="text-diary-blush shrink-0 mt-0.5" />
                                <div className="font-sans">
                                  <h5 className="text-xs font-bold uppercase text-diary-charcoal tracking-wider mb-1">Locked Time Capsule</h5>
                                  <p className="text-xs italic text-diary-charcoal/50 leading-relaxed wrap-break-words">{currentActiveEntry.content}</p>
                                </div>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap wrap-break-words pt-1 notebook-lines opacity-90">
                                {currentActiveEntry.content}
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="text-right text-[10px] font-sans uppercase font-bold tracking-widest text-diary-charcoal/30 border-t border-diary-charcoal/5 pt-3 mt-4"> Right Page Leaf {currentPage + 1} of {totalBookPages} </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER NAVIGATION & JUMP PANEL CONTROLS */}
      <footer className="max-w-6xl w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mt-2 border-t border-diary-charcoal/5 pt-4 font-sans">
        
        <form onSubmit={handlePageJumpSubmit} className="flex items-center gap-2 text-xs font-medium text-diary-charcoal/50 order-2 md:order-1">
          <span>Go to page:</span>
          <input 
            type="text" placeholder="No." value={jumpPageStr} onChange={(e) => setJumpPageStr(e.target.value)}
            className="w-10 bg-[#FDF7F2] border border-diary-charcoal/10 rounded-lg text-center py-1 text-diary-charcoal font-bold focus:outline-none focus:border-diary-sage shadow-3xs"
          />
          <button type="submit" className="px-2.5 py-1 border border-diary-charcoal/10 hover:border-diary-sage bg-[#FDF7F2] text-diary-charcoal/70 rounded-lg uppercase tracking-wider font-bold text-[10px] transition cursor-pointer shadow-3xs">Jump</button>
        </form>

        <div className="flex justify-center items-center gap-3 sm:gap-6 order-1 md:order-2 w-full md:w-auto text-xs font-bold uppercase tracking-wider">
          <button
            disabled={currentPage === 0 || filteredEntries.length === 0 || isEditing}
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            className="flex items-center gap-1 px-3 py-2 border border-diary-charcoal/10 rounded-xl bg-[#FDF7F2] hover:border-diary-sage text-diary-charcoal/70 disabled:opacity-40 disabled:hover:border-diary-charcoal/10 transition shadow-2xs cursor-pointer select-none"
          >
            <ChevronLeft size={14} /> <span className="hidden sm:inline">Flip Back</span>
          </button>

          <span className="font-sans font-semibold normal-case text-diary-charcoal/40 bg-diary-paper/40 px-3 py-1.5 rounded-md border border-diary-charcoal/5 whitespace-nowrap select-none text-[11px]">
            {filteredEntries.length === 0 ? "Empty Ledger" : `Leaf Sheet ${currentPage + 1} / ${totalBookPages}`}
          </span>

          <button
            disabled={currentPage >= filteredEntries.length - 1 || filteredEntries.length === 0 || isEditing}
            onClick={() => setCurrentPage(prev => Math.min(filteredEntries.length - 1, prev + 1))}
            className="flex items-center gap-1 px-3 py-2 border border-diary-charcoal/10 rounded-xl bg-[#FDF7F2] hover:border-diary-sage text-diary-charcoal/70 disabled:opacity-40 disabled:hover:border-diary-charcoal/10 transition shadow-2xs cursor-pointer select-none"
          >
            <span className="hidden sm:inline">Flip Forward</span> <ChevronRight size={14} />
          </button>
        </div>
      </footer>
    </main>
  );
}