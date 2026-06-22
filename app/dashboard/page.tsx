"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, BookOpen, Key, ArrowRight, Compass, LogOut, CheckCircle, Users, ShieldAlert, Check, UserMinus, Trash2, Hourglass, Bell, Feather, Sparkles, Copy, ChevronDown, EyeOff, Eye, Library } from "lucide-react";
import { useRouter } from "next/navigation";

interface Diary {
  id: string;
  title: string;
  inviteCode: string;
  creatorId: string;
}

interface SentRequest {
  id: string;
  status: string;
  diary: {
    id: string;
    title: string;
    inviteCode: string;
  };
}

interface IncomingRequest {
  id: string;
  diaryId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  diary: {
    title: string;
  };
}

interface ManagementData {
  diaryId: string;
  requests: any[];
  members: any[];
}

export default function Dashboard() {
  const router = useRouter();
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [sentRequests, setSentRequests] = useState<SentRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("none");
  const [loading, setLoading] = useState(true);
  
  const [diaryTitle, setDiaryTitle] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [activeAction, setActiveAction] = useState<"none" | "create" | "join">("none");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [selectedMgmtDiary, setSelectedMgmtDiary] = useState<string | null>(null);
  const [mgmtData, setMgmtData] = useState<ManagementData | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  // Custom interactive layout toggles
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showOutboundLogs, setShowOutboundLogs] = useState(false);
  
  // Track open member drawers inside the sent/outbound requests module
  const [viewedSentRequestMembers, setViewedSentRequestMembers] = useState<{ [key: string]: any[] }>({});
  const [loadingSentRequestMembers, setLoadingSentRequestMembers] = useState<{ [key: string]: boolean }>({});
  const [expandedSentRequestId, setExpandedSentRequestId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      // ✅ FIXED: Explicitly defined credentials parameter so Auth.js tokens are carried across
      const res = await fetch("/api/diaries", { 
        method: "GET",
        credentials: "same-origin"
      });
      
      if (res.status === 401) {
        router.push("/");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        if (data.diaries) setDiaries(data.diaries);
        if (data.sentRequests) setSentRequests(data.sentRequests);
        if (data.incomingRequests) setIncomingRequests(data.incomingRequests);
        if (data.currentUserId) setCurrentUserId(data.currentUserId);
      }
    } catch (err) {
      console.error("Failed fetching layout resources", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const fetchSentRequestMembers = async (requestId: string, diaryId: string) => {
    if (expandedSentRequestId === requestId) {
      setExpandedSentRequestId(null);
      return;
    }
    
    setExpandedSentRequestId(requestId);
    if (viewedSentRequestMembers[diaryId]) return;

    setLoadingSentRequestMembers(prev => ({ ...prev, [diaryId]: true }));
    try {
      const res = await fetch(`/api/diaries/manage?diaryId=${diaryId}`, { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setViewedSentRequestMembers(prev => ({ ...prev, [diaryId]: data.members || [] }));
      }
    } catch (err) {
      console.error("Could not trace workspace members", err);
    } finally {
      setLoadingSentRequestMembers(prev => ({ ...prev, [diaryId]: false }));
    }
  };

  const handleOpenManagement = async (diaryId: string) => {
    if (selectedMgmtDiary === diaryId) {
      setSelectedMgmtDiary(null);
      setMgmtData(null);
      return;
    }
    setError(""); setSuccessMsg("");
    try {
      const res = await fetch(`/api/diaries/manage?diaryId=${diaryId}`, { credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setSelectedMgmtDiary(diaryId);
        setMgmtData({ diaryId, requests: data.requests || [], members: data.members || [] });
      }
    } catch (err) { console.error(err); }
  };

  const handleManageAction = async (diaryId: string, targetUserId: string, action: "ACCEPT" | "KICK") => {
    setError(""); setSuccessMsg("");
    try {
      const res = await fetch("/api/diaries/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ diaryId, targetUserId, action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failure");

      setSuccessMsg(data.message);
      setSelectedMgmtDiary(null); setMgmtData(null);
      fetchDashboardData();
    } catch (err: any) { setError(err.message); }
  };

  const handleDeleteDiary = async (diaryId: string) => {
    setError(""); setSuccessMsg("");
    try {
      const res = await fetch("/api/diaries/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ diaryId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deletion failure");

      setSuccessMsg(data.message);
      setConfirmDeleteId(null);
      fetchDashboardData();
    } catch (err: any) { setError(err.message); }
  };

  const handleCreateDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccessMsg("");
    try {
      const res = await fetch("/api/diaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ title: diaryTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create diary");

      setDiaries([...diaries, data.diary]);
      setSuccessMsg(`Sanctuary created! Share code: ${data.diary.inviteCode}`);
      setDiaryTitle(""); setActiveAction("none");
    } catch (err: any) { setError(err.message); }
  };

  const handleJoinDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccessMsg("");
    try {
      const res = await fetch("/api/diaries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ code: inviteCode.trim().toUpperCase(), action: "JOIN"}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not complete request");

      setSuccessMsg(data.message);
      setInviteCode(""); setActiveAction("none");
      fetchDashboardData(); 
    } catch (err: any) { setError(err.message); }
  };

  return (
    <main className="min-h-screen w-full bg-diary-cream p-4 sm:p-6 md:p-12 text-diary-charcoal relative font-serif antialiased overflow-x-hidden selection:bg-diary-blush/30">
      
      <div className="absolute inset-4 md:inset-6 border border-diary-charcoal/5 pointer-events-none rounded-sm z-0" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-diary-blush/10 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-12 left-10 w-120 h-120 bg-diary-sage/5 rounded-full blur-3xl opacity-40 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-10 md:space-y-14">
        
        {/* TOP LEVEL NAVIGATION HEADER */}
        <nav className="flex justify-between items-center border-b border-diary-charcoal/5 pb-5">
          <div className="flex items-center space-x-2.5 text-diary-sage group">
            <Library size={20} strokeWidth={1.5} className="group-hover:rotate-6 transition duration-300" />
            <span className="font-serif text-sm uppercase tracking-widest font-bold text-diary-charcoal/40">Sanctuary Desk</span>
          </div>
          <button 
            // ✅ FIXED: Clean routing destination for the updated Auth.js manual signout endpoint route
            onClick={async () => { 
              await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }); 
              router.push("/"); 
            }} 
            className="text-diary-charcoal/50 hover:text-diary-blush transition flex items-center space-x-1.5 font-sans text-xs uppercase tracking-widest font-bold cursor-pointer bg-diary-paper/40 hover:bg-diary-paper px-3 py-1.5 rounded-lg border border-diary-charcoal/5 shadow-3xs"
          >
            <LogOut size={13} /> <span>Exit Space</span>
          </button>
        </nav>

        {/* HERO APP NAME IDENTITY AND WELCOME SECTOR */}
        <header className="text-center max-w-2xl mx-auto space-y-3.5 py-2">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-1.5 px-3 py-1 bg-diary-sage/10 text-diary-sage rounded-full text-[10px] font-sans uppercase tracking-widest font-bold border border-diary-sage/10 shadow-3xs">
            <Sparkles size={11} className="animate-pulse" /> Shared Memory Ledger
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-diary-charcoal leading-tight">
            Volume Sanctuary
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xs sm:text-sm font-serif italic text-diary-charcoal/50 max-w-md mx-auto leading-relaxed">
            Pour down your passing moments, lock secure time capsules, and flip across shared leaves with your inner circle.
          </motion.p>
        </header>

        {/* CORE INTERACTIVE ACCESS MODULES */}
        <section className="max-w-xl mx-auto space-y-5">
          <div className="grid grid-cols-2 gap-3.5">
            <button 
              onClick={() => { setActiveAction(activeAction === "create" ? "none" : "create"); setError(""); setSuccessMsg(""); }}
              className={`py-4 rounded-xl border font-sans text-xs uppercase tracking-wider font-bold transition duration-300 flex flex-col items-center gap-2 cursor-pointer shadow-3xs ${activeAction === "create" ? "bg-diary-sage text-white border-diary-sage shadow-md" : "bg-[#FDF7F2] border-diary-charcoal/10 hover:border-diary-sage/30 hover:bg-diary-paper text-diary-charcoal"}`}
            >
              <PlusCircle size={18} strokeWidth={1.75} />
              <span>Create Diary</span>
            </button>
            <button 
              onClick={() => { setActiveAction(activeAction === "join" ? "none" : "join"); setError(""); setSuccessMsg(""); }}
              className={`py-4 rounded-xl border font-sans text-xs uppercase tracking-wider font-bold transition duration-300 flex flex-col items-center gap-2 cursor-pointer shadow-3xs ${activeAction === "join" ? "bg-diary-sage text-white border-diary-sage shadow-md" : "bg-[#FDF7F2] border-diary-charcoal/10 hover:border-diary-sage/30 hover:bg-diary-paper text-diary-charcoal"}`}
            >
              <Key size={18} strokeWidth={1.75} />
              <span>Join Circle</span>
            </button>
          </div>

          <AnimatePresence mode="popLayout">
            {activeAction === "create" && (
              <motion.form initial={{ opacity: 0, scale: 0.98, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -8 }} onSubmit={handleCreateDiary} className="bg-diary-paper p-5 rounded-2xl border border-diary-charcoal/10 space-y-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-diary-sage" />
                <div className="flex items-center gap-2 text-diary-sage font-sans text-[10px] font-bold uppercase tracking-widest">
                  <Feather size={14} /> <span>Bind a New Sanctuary Volume</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input type="text" required value={diaryTitle} onChange={(e) => setDiaryTitle(e.target.value)} placeholder="Give your volume a name... (e.g., Midnight Letters)" className="flex-1 bg-[#FDF7F2] border border-diary-charcoal/10 rounded-xl px-4 py-2.5 font-serif text-xs focus:outline-none focus:border-diary-sage focus:bg-white transition" />
                  <button type="submit" className="bg-diary-charcoal hover:bg-diary-sage hover:text-white text-white text-[10px] font-sans font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl cursor-pointer transition shadow-3xs whitespace-nowrap">Create Ledger</button>
                </div>
              </motion.form>
            )}

            {activeAction === "join" && (
              <motion.form initial={{ opacity: 0, scale: 0.98, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -8 }} onSubmit={handleJoinDiary} className="bg-diary-paper p-5 rounded-2xl border border-diary-charcoal/10 space-y-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-diary-blush" />
                <div className="flex items-center gap-2 text-diary-blush font-sans text-[10px] font-bold uppercase tracking-widest">
                  <Key size={14} /> <span>Connect to a Shared Volume</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input type="text" required value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="Paste the unique 6-character code" className="flex-1 bg-[#FDF7F2] border border-diary-charcoal/10 rounded-xl px-4 py-2.5 font-mono text-xs tracking-widest uppercase focus:outline-none focus:border-diary-sage focus:bg-white transition" />
                  <button type="submit" className="bg-diary-charcoal hover:bg-diary-sage hover:text-white text-white text-[10px] font-sans font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl cursor-pointer transition shadow-3xs whitespace-nowrap">Send Knock</button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            {error && (
              <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-xs font-sans font-medium text-red-700 bg-red-50/80 p-3 rounded-xl border border-red-200 text-center shadow-3xs">
                {error}
              </motion.p>
            )}
            {successMsg && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-xs font-sans text-diary-sage bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 flex items-center justify-center gap-2 font-semibold shadow-3xs">
                <CheckCircle size={14} className="text-emerald-600 shrink-0" /> 
                <span className="flex-1 text-center leading-normal">{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* PRIMARY ACTIVE SHELF GRID */}
        <section className="space-y-5">
          <div className="flex justify-between items-center border-b border-diary-charcoal/5 pb-2">
            <h3 className="font-serif text-lg font-medium text-diary-charcoal/90 flex items-center gap-2">
              <Compass size={18} strokeWidth={1.5} className="text-diary-sage" /> Active Notebooks
            </h3>
            <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-diary-charcoal/40 bg-diary-charcoal/5 px-2.5 py-1 rounded-md">
              {diaries.length} Volumes Open
            </span>
          </div>

          {diaries.length === 0 ? (
            <div className="bg-diary-paper/30 border border-dashed border-diary-charcoal/10 rounded-2xl p-14 text-center text-diary-charcoal/40 text-xs italic font-serif shadow-3xs leading-relaxed max-w-md mx-auto">
              Your desk bookshelves look completely clear.<br />Choose an option above to bind or join a shared private space.
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {diaries.map((diary) => {
                const isOwner = diary.creatorId === currentUserId;
                const isDeleting = confirmDeleteId === diary.id;
                const isCopied = copiedCode === diary.inviteCode;

                return (
                  <motion.div 
                    key={diary.id} 
                    layout
                    whileHover={{ y: -3 }}
                    className="bg-[#FDF7F2] border border-diary-charcoal/5 p-5 rounded-2xl shadow-3xs hover:shadow-xs flex flex-col justify-between space-y-4 group relative overflow-hidden transition duration-300"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-linear-to-b from-diary-sage/20 via-diary-blush/20 to-diary-sage/20 group-hover:from-diary-sage group-hover:via-diary-sage group-hover:to-diary-sage transition-all duration-300" />
                    
                    <div className="flex justify-between items-start pl-2">
                      <div className="flex-1 mr-2 min-w-0">
                        <h4 
                          onClick={() => router.push(`/diary/${diary.id}`)}
                          className="font-serif text-lg font-semibold text-diary-charcoal group-hover:text-diary-sage transition duration-200 flex items-center gap-1.5 leading-tight cursor-pointer truncate"
                        >
                          {diary.title} 
                          <ArrowRight size={13} className="inline opacity-0 group-hover:opacity-100 transform translate-x-1 group-hover:translate-x-0 transition duration-300" />
                        </h4>
                        
                        <div 
                          onClick={() => handleCopyCode(diary.inviteCode)}
                          className="inline-flex items-center gap-1.5 mt-2 px-2 py-1 bg-diary-paper/70 hover:bg-diary-paper rounded-md border border-diary-charcoal/5 text-[10px] font-mono uppercase tracking-wider text-diary-charcoal/50 cursor-pointer transition select-none group/code shadow-3xs"
                          title="Click to copy invite code"
                        >
                          <span>Code: {diary.inviteCode}</span>
                          {isCopied ? (
                            <Check size={11} className="text-emerald-600 animate-scale" />
                          ) : (
                            <Copy size={11} className="text-diary-charcoal/20 group-hover/code:text-diary-sage transition" />
                          )}
                          {isOwner && <span className="text-diary-sage font-sans font-bold ml-1 lowercase italic tracking-normal border-none p-0 bg-transparent opacity-80">(owner)</span>}
                        </div>
                      </div>
                      
                      <div className="flex gap-1 z-10 font-sans">
                        {isOwner && (
                          <>
                            <button title="Members Management" onClick={() => handleOpenManagement(diary.id)} className={`p-1.5 border rounded-lg transition cursor-pointer ${selectedMgmtDiary === diary.id ? "bg-diary-sage text-white border-diary-sage shadow-3xs" : "border-diary-charcoal/10 hover:border-diary-sage text-diary-charcoal/40 hover:text-diary-sage bg-diary-paper/60"}`}>
                              <Users size={13} />
                            </button>
                            <button title="Erase Sanctuary Container" onClick={() => setConfirmDeleteId(isDeleting ? null : diary.id)} className={`p-1.5 border rounded-lg transition cursor-pointer ${isDeleting ? "bg-rose-50 border-rose-200 text-rose-600 shadow-3xs" : "border-diary-charcoal/10 hover:border-rose-200 text-diary-charcoal/40 hover:text-rose-600 bg-diary-paper/60"}`}>
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isDeleting && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-rose-50/70 border border-rose-100 rounded-xl p-3 space-y-3 font-sans relative z-10 overflow-hidden">
                          <div className="text-[11px]">
                            <p className="font-bold text-rose-800">Are you completely sure?</p>
                            <p className="text-rose-600/90 mt-0.5 leading-normal">Erasures are permanent. This will completely destroy all stored timelines and entries for all members.</p>
                          </div>
                          <div className="flex gap-1.5 justify-end text-[10px] font-bold uppercase tracking-wider">
                            <button onClick={() => setConfirmDeleteId(null)} className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 rounded-md text-stone-700 transition cursor-pointer">Cancel</button>
                            <button onClick={() => handleDeleteDiary(diary.id)} className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md transition cursor-pointer flex items-center gap-1"><Trash2 size={10} /> Erase</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {selectedMgmtDiary === diary.id && mgmtData && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="border-t border-diary-charcoal/5 pt-3.5 space-y-3.5 font-sans text-xs relative z-10 overflow-hidden">
                          <div>
                            <h5 className="text-[9px] font-bold uppercase tracking-widest text-diary-charcoal/40 mb-1.5 flex items-center gap-1"><ShieldAlert size={12} /> Pending Knocks</h5>
                            {mgmtData.requests.length === 0 ? <p className="text-[11px] italic text-diary-charcoal/40 pl-1">No pending knottings.</p> : (
                              <div className="space-y-1.5">
                                {mgmtData.requests.map((req) => (
                                  <div key={req.id} className="flex justify-between items-center bg-diary-paper/60 p-2 border border-diary-charcoal/5 rounded-xl shadow-3xs">
                                    <span className="font-medium text-diary-charcoal max-w-[70%] truncate font-serif">{req.user.name}</span>
                                    <button title="Accept entrance request" onClick={() => handleManageAction(diary.id, req.user.id, "ACCEPT")} className="p-1.5 bg-diary-sage text-white rounded-lg cursor-pointer hover:bg-diary-sage/90 transition shadow-3xs"><Check size={11} /></button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div>
                            <h5 className="text-[9px] font-bold uppercase tracking-widest text-diary-charcoal/40 mb-1.5 flex items-center gap-1"><Users size={12} /> Connected Circles</h5>
                            {mgmtData.members.length === 0 ? <p className="text-[11px] italic text-diary-charcoal/40 pl-1">No friends connected yet.</p> : (
                              <div className="space-y-1.5">
                                {mgmtData.members.map((mem) => (
                                  <div key={mem.id} className="flex justify-between items-center bg-diary-paper/60 p-2 border border-diary-charcoal/5 rounded-xl shadow-3xs">
                                    <span className="font-medium text-diary-charcoal font-serif">{mem.name}</span>
                                    <button onClick={() => handleManageAction(diary.id, mem.id, "KICK")} className="px-2 py-1 border border-red-200 hover:bg-red-50 text-red-500 rounded-lg cursor-pointer flex items-center gap-1 text-[10px] font-bold transition"><UserMinus size={11} /> Revoke</button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </section>

        {/* BOTTOM SECTION FOOTER UTILITIES */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-diary-charcoal/5">
          <div className="bg-diary-paper border border-diary-charcoal/5 rounded-2xl p-5 space-y-3.5 shadow-3xs relative overflow-hidden">
            <h3 className="font-serif text-sm font-bold tracking-wide text-diary-charcoal/80 flex items-center gap-1.5">
              <Bell size={14} className="text-diary-blush" /> Incoming Ledger Knocks
            </h3>
            {incomingRequests.length === 0 ? (
              <p className="text-xs italic text-diary-charcoal/40 pl-0.5">No circle access requests pending.</p>
            ) : (
              <div className="space-y-2">
                {incomingRequests.map((req) => (
                  <div key={req.id} className="bg-[#FDF7F2] p-3 rounded-xl border border-diary-charcoal/5 flex justify-between items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-sans text-diary-charcoal/40">Request into <span className="font-serif font-bold text-diary-charcoal/70">"{req.diary.title}"</span></p>
                      <p className="text-xs font-serif font-bold text-diary-sage mt-0.5 truncate">— {req.user.name}</p>
                    </div>
                    <button 
                      onClick={() => handleManageAction(req.diaryId, req.user.id, "ACCEPT")} 
                      className="px-2.5 py-1.5 bg-diary-sage hover:bg-diary-sage/90 text-white rounded-lg text-[9px] font-sans uppercase tracking-wider font-bold transition flex items-center gap-1 cursor-pointer shadow-3xs shrink-0"
                    >
                      <Check size={11} /> Accept
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-diary-paper border border-diary-charcoal/5 rounded-2xl p-5 space-y-3.5 shadow-3xs transition-all duration-300">
            <button 
              onClick={() => setShowOutboundLogs(!showOutboundLogs)}
              className="w-full flex justify-between items-center text-left font-serif text-sm font-bold tracking-wide text-diary-charcoal/80 cursor-pointer group"
            >
              <div className="flex items-center gap-1.5">
                <Hourglass size={14} className="text-diary-sage" /> Outbound Knock History
              </div>
              <div className="text-diary-charcoal/30 group-hover:text-diary-sage transition flex items-center gap-1 font-sans text-xs font-normal">
                {showOutboundLogs ? <EyeOff size={13} /> : <Eye size={13} />}
              </div>
            </button>
            
            <AnimatePresence>
              {showOutboundLogs && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden pt-1"
                >
                  {sentRequests.length === 0 ? (
                    <p className="text-xs italic text-diary-charcoal/40 pl-0.5">No pending outbound letters.</p>
                  ) : (
                    sentRequests.map((req) => {
                      const hasDiaryData = req.diary && req.diary.id;
                      const isRequestExpanded = expandedSentRequestId === req.id;
                      const diaryMembers = viewedSentRequestMembers[req.diary?.id] || [];
                      const isMembersLoading = loadingSentRequestMembers[req.diary?.id];

                      return (
                        <div key={req.id} className="bg-[#FDF7F2] rounded-xl border border-diary-charcoal/5 p-3 space-y-2 hover:border-diary-blush/20 transition">
                          <div className="flex justify-between items-center gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-serif text-xs font-bold text-diary-charcoal truncate">{req.diary?.title || "Shared Space"}</p>
                              <p className="text-[9px] font-mono text-diary-charcoal/40 mt-0.5">Code: {req.diary?.inviteCode}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-md font-sans font-bold text-[8px] tracking-wider uppercase border shrink-0 ${
                              req.status === "PENDING" ? "bg-amber-50 border-amber-100 text-amber-700" :
                              req.status === "ACCEPTED" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"
                            }`}>
                              {req.status}
                            </span>
                          </div>

                          {hasDiaryData && (
                            <div className="pt-1.5 border-t border-diary-charcoal/5 flex flex-col">
                              <button 
                                type="button"
                                onClick={() => fetchSentRequestMembers(req.id, req.diary.id)}
                                className="text-[9px] text-diary-sage hover:text-diary-charcoal font-sans font-bold uppercase tracking-wider flex items-center gap-1 self-start transition cursor-pointer"
                              >
                                <Users size={11} /> {isRequestExpanded ? "Hide Circle" : "View Circle Members"}
                              </button>

                              <AnimatePresence>
                                {isRequestExpanded && (
                                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="pt-1.5 pl-1.5 space-y-1 font-sans text-[11px] text-diary-charcoal/70 overflow-hidden">
                                    {isMembersLoading ? (
                                      <span className="italic text-diary-charcoal/40 text-[10px] animate-pulse">Scanning volume ledger...</span>
                                    ) : diaryMembers.length === 0 ? (
                                      <span className="italic text-diary-charcoal/40 text-[10px]">No participants registered.</span>
                                    ) : (
                                      <div className="space-y-0.5">
                                        {diaryMembers.map((member, idx) => (
                                          <div key={member.id || idx} className="flex items-center gap-1 font-serif text-[11px] text-diary-charcoal font-medium">
                                            <span className="w-1 h-1 bg-diary-sage rounded-full" /> {member.name}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

      </div>
    </main>
  );
}