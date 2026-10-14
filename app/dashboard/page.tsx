"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  BookOpen,
  Key,
  ArrowRight,
  Compass,
  LogOut,
  CheckCircle,
  Users,
  ShieldAlert,
  Check,
  UserMinus,
  Trash2,
  Hourglass,
  Bell,
  Feather,
  Sparkles,
  Copy,
  EyeOff,
  Eye,
  Library,
  Lock,
  ChevronRight,
  FolderOpen,
} from "lucide-react";
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
      
      // Update management view
      setMgmtData(prev => {
        if (!prev) return null;
        if (action === "ACCEPT") {
          const acceptedReq = prev.requests.find(r => r.user.id === targetUserId);
          return {
            ...prev,
            requests: prev.requests.filter(r => r.user.id !== targetUserId),
            members: acceptedReq ? [...prev.members, acceptedReq.user] : prev.members
          };
        } else {
          return {
            ...prev,
            members: prev.members.filter(m => m.id !== targetUserId)
          };
        }
      });

      // Update incoming list
      setIncomingRequests(prev => prev.filter(r => !(r.diaryId === diaryId && r.user.id === targetUserId)));
    } catch (err: any) { setError(err.message); }
  };

  const handleDeleteDiary = async (diaryId: string) => {
    setError(""); setSuccessMsg("");
    try {
      const res = await fetch(`/api/diaries?diaryId=${diaryId}`, { 
        method: "DELETE",
        credentials: "same-origin"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not delete diary");

      setSuccessMsg("Volume erased permanently.");
      setDiaries(prev => prev.filter(d => d.id !== diaryId));
      setConfirmDeleteId(null);
      if (selectedMgmtDiary === diaryId) {
        setSelectedMgmtDiary(null);
        setMgmtData(null);
      }
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
      if (!res.ok) throw new Error(data.error || "Could not complete binding");

      setSuccessMsg(`"${diaryTitle}" bound successfully.`);
      setDiaryTitle(""); setActiveAction("none");
      fetchDashboardData();
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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }); 
    router.push("/"); 
  };

  return (
    <div className="relative min-h-screen text-[#FAF7F2] font-sans selection:bg-amber-400/40 overflow-x-hidden">
      {/* ❄️ Full-bleed Snowy Winter Street Background matching landing page */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none scale-105 opacity-85"
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
              rgba(14, 11, 10, 0.82) 0%, 
              rgba(22, 17, 14, 0.65) 45%, 
              rgba(14, 11, 10, 0.78) 80%, 
              rgba(9, 7, 7, 0.90) 100%
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
            radial-gradient(circle at 20% 10%, rgba(245, 158, 11, 0.18) 0%, transparent 45%),
            radial-gradient(circle at 85% 40%, rgba(234, 88, 12, 0.12) 0%, transparent 40%),
            radial-gradient(circle at 30% 90%, rgba(217, 119, 6, 0.14) 0%, transparent 45%)
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

      

      {/* 🌸 PROPER NAVBAR (Matching brand identity, responsive logo, clean styling) */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-black/50 border-b border-amber-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-3.5 sm:py-4 flex items-center justify-between gap-3">
          
          {/* Brand Logo Identity */}
          <div 
            onClick={() => router.push("/dashboard")} 
            className="flex items-center gap-2.5 sm:gap-3.5 group cursor-pointer select-none min-w-0"
          >
            

            {/* Brand Typography */}
            <div className="flex flex-col min-w-0">
              <span className="font-serif text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] leading-none truncate">
                Volume Sanctuary
              </span>
              <span className="text-[9px] sm:text-[10px] md:text-xs font-sans uppercase tracking-[0.25em] text-amber-200/90 font-medium mt-1 truncate">
                Sanctuary Desk
              </span>
            </div>
          </div>

          {/* Quick Notification Pill (if pending requests) */}
          {incomingRequests.length > 0 && (
            <div className="hidden sm:flex items-center">
              <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-medium flex items-center gap-1.5 animate-pulse">
                <Bell size={12} />
                <span>{incomingRequests.length} Knock{incomingRequests.length > 1 ? "s" : ""}</span>
              </span>
            </div>
          )}

          {/* Right Action Controls: Encrypted Pill + Sign Out Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            

            <button 
              onClick={handleLogout}
              className="relative group overflow-hidden bg-white/10 hover:bg-rose-500/20 text-stone-200 hover:text-white border border-white/15 hover:border-rose-400/50 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-300 shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <LogOut size={13} className="transition-transform group-hover:-translate-x-0.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* 🌸 MAIN DASHBOARD CONTENT */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-12 pt-6 sm:pt-8 pb-28 space-y-10 sm:space-y-12">
        
        {/* Welcome Banner */}
        <section className="text-center max-w-2xl mx-auto space-y-3 pt-2">
          <motion.h1 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.05 }} 
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)] leading-tight"
          >
            Your Private Bookshelf
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 14 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }} 
            className="text-xs sm:text-sm md:text-base font-serif italic text-amber-100/80 max-w-md mx-auto leading-relaxed"
          >
            Pour down your passing moments, lock secure time capsules, and flip across shared leaves with your inner circle.
          </motion.p>
        </section>

        {/* Action Toggle Buttons (Create / Join) */}
        <section className="max-w-xl mx-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <button 
              onClick={() => { setActiveAction(activeAction === "create" ? "none" : "create"); setError(""); setSuccessMsg(""); }}
              className={`py-3.5 sm:py-4 px-5 rounded-2xl border font-serif text-sm font-semibold tracking-wide transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-lg active:scale-98 ${
                activeAction === "create" 
                  ? "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white border-amber-300/60 shadow-[0_4px_25px_rgba(245,158,11,0.4)]" 
                  : "bg-[#1C1715]/80 hover:bg-[#251E1B]/90 border-amber-500/25 hover:border-amber-400/60 text-stone-200 hover:text-white backdrop-blur-md"
              }`}
            >
              <PlusCircle size={17} className="text-amber-300" />
              <span>Bind New Volume</span>
            </button>

            <button 
              onClick={() => { setActiveAction(activeAction === "join" ? "none" : "join"); setError(""); setSuccessMsg(""); }}
              className={`py-3.5 sm:py-4 px-5 rounded-2xl border font-serif text-sm font-semibold tracking-wide transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer shadow-lg active:scale-98 ${
                activeAction === "join" 
                  ? "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white border-amber-300/60 shadow-[0_4px_25px_rgba(245,158,11,0.4)]" 
                  : "bg-[#1C1715]/80 hover:bg-[#251E1B]/90 border-amber-500/25 hover:border-amber-400/60 text-stone-200 hover:text-white backdrop-blur-md"
              }`}
            >
              <Key size={17} className="text-amber-300" />
              <span>Join Circle</span>
            </button>
          </div>

          {/* Form Drawers */}
          <AnimatePresence mode="popLayout">
            {activeAction === "create" && (
              <motion.form 
                initial={{ opacity: 0, scale: 0.98, y: -10 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.98, y: -10 }} 
                onSubmit={handleCreateDiary} 
                className="bg-gradient-to-b from-[#1C1715]/90 via-[#161210]/95 to-[#0F0D0C]/95 backdrop-blur-xl p-6 rounded-2xl border border-amber-500/35 space-y-4 shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500" />
                <div className="flex items-center gap-2 text-amber-300 font-serif text-xs font-medium tracking-wide">
                  <Feather size={14} className="text-amber-400" /> 
                  <span>Name Your New Sanctuary Volume</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input 
                    type="text" 
                    required 
                    value={diaryTitle} 
                    onChange={(e) => setDiaryTitle(e.target.value)} 
                    placeholder="e.g. Midnight Letters, Winter Solace..." 
                    className="flex-1 bg-black/40 border border-amber-500/30 rounded-xl px-4 py-3 font-serif text-sm text-white placeholder:text-stone-500 focus:outline-hidden focus:border-amber-400 transition" 
                  />
                  <button 
                    type="submit" 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-serif font-semibold text-xs uppercase tracking-wider px-6 py-3 rounded-xl cursor-pointer transition shadow-md shadow-amber-500/30 whitespace-nowrap active:scale-95"
                  >
                    Bind Volume
                  </button>
                </div>
              </motion.form>
            )}

            {activeAction === "join" && (
              <motion.form 
                initial={{ opacity: 0, scale: 0.98, y: -10 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.98, y: -10 }} 
                onSubmit={handleJoinDiary} 
                className="bg-gradient-to-b from-[#1C1715]/90 via-[#161210]/95 to-[#0F0D0C]/95 backdrop-blur-xl p-6 rounded-2xl border border-amber-500/35 space-y-4 shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-400 via-orange-400 to-amber-500" />
                <div className="flex items-center gap-2 text-amber-300 font-serif text-xs font-medium tracking-wide">
                  <Key size={14} className="text-amber-400" /> 
                  <span>Enter Sanctuary Invite Code</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input 
                    type="text" 
                    required 
                    value={inviteCode} 
                    onChange={(e) => setInviteCode(e.target.value)} 
                    placeholder="Enter 6-character code" 
                    className="flex-1 bg-black/40 border border-amber-500/30 rounded-xl px-4 py-3 font-mono text-sm tracking-widest uppercase text-white placeholder:text-stone-500 focus:outline-hidden focus:border-amber-400 transition" 
                  />
                  <button 
                    type="submit" 
                    className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-serif font-semibold text-xs uppercase tracking-wider px-6 py-3 rounded-xl cursor-pointer transition shadow-md shadow-amber-500/30 whitespace-nowrap active:scale-95"
                  >
                    Send Knock
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Feedback Messages */}
          <AnimatePresence mode="popLayout">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -5 }} 
                className="text-xs font-serif text-rose-200 bg-rose-950/60 border border-rose-500/40 p-3.5 rounded-xl text-center shadow-md backdrop-blur-md"
              >
                {error}
              </motion.div>
            )}
            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -5 }} 
                className="text-xs font-serif text-emerald-200 bg-emerald-950/60 border border-emerald-500/40 p-3.5 rounded-xl flex items-center justify-center gap-2 font-medium shadow-md backdrop-blur-md"
              >
                <CheckCircle size={15} className="text-emerald-400 shrink-0" /> 
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* PRIMARY ACTIVE VOLUMES SHELF */}
        <section className="space-y-6">
          <div className="flex justify-between items-center border-b border-amber-500/20 pb-3">
            <h3 className="font-serif text-xl font-medium text-white flex items-center gap-2.5">
              <Compass size={19} className="text-amber-400" /> 
              <span>Active Notebooks</span>
            </h3>
            <span className="font-mono text-xs text-amber-300/80 bg-amber-400/15 border border-amber-400/30 px-3 py-1 rounded-full">
              {diaries.length} {diaries.length === 1 ? "Volume Open" : "Volumes Open"}
            </span>
          </div>

          {diaries.length === 0 ? (
            <div className="bg-[#1C1715]/60 backdrop-blur-md border border-dashed border-amber-500/30 rounded-2xl p-14 text-center text-amber-100/60 text-sm italic font-serif shadow-lg leading-relaxed max-w-md mx-auto">
              Your desk bookshelf looks completely clear.<br />
              Bind a new volume or enter a shared circle above to begin writing.
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
                    whileHover={{ y: -5 }}
                    className="relative bg-gradient-to-b from-[#1C1715]/85 via-[#161210]/90 to-[#0F0D0C]/95 backdrop-blur-xl border border-amber-500/25 hover:border-amber-400/60 p-6 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(245,158,11,0.2)] flex flex-col justify-between space-y-5 group overflow-hidden transition-all duration-300"
                  >
                    {/* Glowing Book Spine Accent */}
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 via-orange-400 to-amber-600 group-hover:from-amber-300 group-hover:to-amber-500 transition-all duration-300" />
                    
                    <div className="flex justify-between items-start pl-2">
                      <div className="flex-1 mr-2 min-w-0">
                        <h4 
                          onClick={() => router.push(`/diary/${diary.id}`)}
                          className="font-serif text-xl font-medium text-white group-hover:text-amber-200 transition duration-200 flex items-center gap-2 leading-tight cursor-pointer truncate"
                        >
                          <span>{diary.title}</span>
                          <ArrowRight size={15} className="opacity-0 group-hover:opacity-100 transform -translate-x-1 group-hover:translate-x-0 transition duration-300 text-amber-400 shrink-0" />
                        </h4>
                        
                        {/* Copyable Invite Code */}
                        <div 
                          onClick={() => handleCopyCode(diary.inviteCode)}
                          className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 bg-black/40 hover:bg-black/60 rounded-md border border-amber-500/20 text-xs font-mono uppercase tracking-wider text-amber-200/80 cursor-pointer transition select-none group/code shadow-xs"
                          title="Click to copy invite code"
                        >
                          <span>Code: {diary.inviteCode}</span>
                          {isCopied ? (
                            <Check size={12} className="text-emerald-400 animate-scale" />
                          ) : (
                            <Copy size={12} className="text-amber-400/40 group-hover/code:text-amber-300 transition" />
                          )}
                          {isOwner && (
                            <span className="text-amber-400 font-sans font-medium ml-1 lowercase italic tracking-normal opacity-90">
                              (owner)
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Icon Buttons */}
                      <div className="flex items-center gap-1.5 z-10">
                        <button
                          onClick={() => router.push(`/diary/${diary.id}`)}
                          title="Open Notebook"
                          className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 transition cursor-pointer"
                        >
                          <BookOpen size={14} />
                        </button>

                        {isOwner && (
                          <>
                            <button 
                              title="Circle Members Management" 
                              onClick={() => handleOpenManagement(diary.id)} 
                              className={`p-2 rounded-xl border transition cursor-pointer ${
                                selectedMgmtDiary === diary.id 
                                  ? "bg-amber-500 text-white border-amber-400 shadow-md shadow-amber-500/30" 
                                  : "border-amber-500/25 hover:border-amber-400/60 text-stone-300 hover:text-white bg-black/30"
                              }`}
                            >
                              <Users size={14} />
                            </button>
                            <button 
                              title="Erase Volume" 
                              onClick={() => setConfirmDeleteId(isDeleting ? null : diary.id)} 
                              className={`p-2 rounded-xl border transition cursor-pointer ${
                                isDeleting 
                                  ? "bg-rose-500/30 border-rose-400 text-rose-300" 
                                  : "border-amber-500/25 hover:border-rose-400/60 text-stone-400 hover:text-rose-400 bg-black/30"
                              }`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Delete Confirmation Drawer */}
                    <AnimatePresence>
                      {isDeleting && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: "auto" }} 
                          exit={{ opacity: 0, height: 0 }} 
                          className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-3.5 space-y-3 font-sans relative z-10 overflow-hidden backdrop-blur-md"
                        >
                          <div className="text-xs">
                            <p className="font-bold text-rose-200">Are you completely sure?</p>
                            <p className="text-rose-300/80 mt-1 leading-normal">
                              Erasure is permanent. This will completely destroy all written entries for all members in this volume.
                            </p>
                          </div>
                          <div className="flex gap-2 justify-end text-xs font-semibold uppercase tracking-wider">
                            <button 
                              onClick={() => setConfirmDeleteId(null)} 
                              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-stone-200 transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleDeleteDiary(diary.id)} 
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition cursor-pointer flex items-center gap-1.5"
                            >
                              <Trash2 size={12} /> 
                              <span>Erase</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Management Drawer */}
                    <AnimatePresence>
                      {selectedMgmtDiary === diary.id && mgmtData && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: "auto" }} 
                          exit={{ opacity: 0, height: 0 }} 
                          className="border-t border-amber-500/20 pt-4 space-y-4 font-sans text-xs relative z-10 overflow-hidden"
                        >
                          {/* Pending Requests */}
                          <div>
                            <h5 className="text-[10px] font-bold uppercase tracking-widest text-amber-300/80 mb-2 flex items-center gap-1.5">
                              <ShieldAlert size={13} className="text-amber-400" /> 
                              <span>Pending Circle Knocks</span>
                            </h5>
                            {mgmtData.requests.length === 0 ? (
                              <p className="text-xs italic text-stone-400 pl-1">No pending requests.</p>
                            ) : (
                              <div className="space-y-2">
                                {mgmtData.requests.map((req) => (
                                  <div key={req.id} className="flex justify-between items-center bg-black/40 p-2.5 border border-amber-500/20 rounded-xl">
                                    <span className="font-medium text-white truncate max-w-[70%] font-serif">
                                      {req.user.name}
                                    </span>
                                    <button 
                                      title="Accept entrance request" 
                                      onClick={() => handleManageAction(diary.id, req.user.id, "ACCEPT")} 
                                      className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-emerald-600 text-white rounded-lg cursor-pointer hover:opacity-90 transition shadow-xs flex items-center gap-1 font-sans text-xs"
                                    >
                                      <Check size={12} /> Accept
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Connected Members */}
                          <div>
                            <h5 className="text-[10px] font-bold uppercase tracking-widest text-amber-300/80 mb-2 flex items-center gap-1.5">
                              <Users size={13} className="text-amber-400" /> 
                              <span>Connected Friends</span>
                            </h5>
                            {mgmtData.members.length === 0 ? (
                              <p className="text-xs italic text-stone-400 pl-1">No friends connected yet.</p>
                            ) : (
                              <div className="space-y-2">
                                {mgmtData.members.map((mem) => (
                                  <div key={mem.id} className="flex justify-between items-center bg-black/40 p-2.5 border border-amber-500/20 rounded-xl">
                                    <span className="font-medium text-white font-serif">{mem.name}</span>
                                    <button 
                                      onClick={() => handleManageAction(diary.id, mem.id, "KICK")} 
                                      className="px-2 py-1 border border-rose-500/30 hover:bg-rose-500/20 text-rose-300 rounded-lg cursor-pointer flex items-center gap-1 text-[11px] font-medium transition"
                                    >
                                      <UserMinus size={12} /> Revoke
                                    </button>
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

        {/* BOTTOM UTILITY PANELS (Incoming Knocks & Outbound History) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-amber-500/20">
          
          {/* Incoming Ledger Knocks */}
          <div className="bg-gradient-to-b from-[#1C1715]/85 to-[#0F0D0C]/95 border border-amber-500/25 rounded-2xl p-6 space-y-4 shadow-lg backdrop-blur-xl">
            <h3 className="font-serif text-base font-semibold text-white flex items-center gap-2">
              <Bell size={16} className="text-amber-400" /> 
              <span>Incoming Circle Knocks</span>
            </h3>
            {incomingRequests.length === 0 ? (
              <p className="text-xs italic text-stone-400">No circle access requests pending.</p>
            ) : (
              <div className="space-y-2.5">
                {incomingRequests.map((req) => (
                  <div key={req.id} className="bg-black/40 p-3.5 rounded-xl border border-amber-500/20 flex justify-between items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-stone-400 font-sans">
                        Knock for <span className="font-serif font-bold text-white">&quot;{req.diary.title}&quot;</span>
                      </p>
                      <p className="text-xs font-serif text-amber-300 mt-0.5 truncate">— {req.user.name}</p>
                    </div>
                    <button 
                      onClick={() => handleManageAction(req.diaryId, req.user.id, "ACCEPT")} 
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-emerald-600 hover:opacity-90 text-white rounded-lg text-xs font-sans font-semibold transition flex items-center gap-1 cursor-pointer shadow-xs shrink-0"
                    >
                      <Check size={12} /> Accept
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outbound Knock History */}
          <div className="bg-gradient-to-b from-[#1C1715]/85 to-[#0F0D0C]/95 border border-amber-500/25 rounded-2xl p-6 space-y-4 shadow-lg backdrop-blur-xl">
            <button 
              onClick={() => setShowOutboundLogs(!showOutboundLogs)}
              className="w-full flex justify-between items-center text-left font-serif text-base font-semibold text-white cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Hourglass size={16} className="text-amber-400" /> 
                <span>Outbound Knock History</span>
              </div>
              <div className="text-amber-300/60 group-hover:text-amber-200 transition flex items-center gap-1 font-sans text-xs font-normal">
                {showOutboundLogs ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{showOutboundLogs ? "Hide" : "Show"}</span>
              </div>
            </button>
            
            <AnimatePresence>
              {showOutboundLogs && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2.5 overflow-hidden pt-1"
                >
                  {sentRequests.length === 0 ? (
                    <p className="text-xs italic text-stone-400">No outbound requests pending.</p>
                  ) : (
                    sentRequests.map((req) => {
                      const hasDiaryData = req.diary && req.diary.id;
                      const isRequestExpanded = expandedSentRequestId === req.id;
                      const diaryMembers = viewedSentRequestMembers[req.diary?.id] || [];
                      const isMembersLoading = loadingSentRequestMembers[req.diary?.id];

                      return (
                        <div key={req.id} className="bg-black/40 rounded-xl border border-amber-500/20 p-3.5 space-y-2.5">
                          <div className="flex justify-between items-center gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-serif text-sm font-semibold text-white truncate">
                                {req.diary?.title || "Shared Space"}
                              </p>
                              <p className="text-xs font-mono text-stone-400 mt-0.5">Code: {req.diary?.inviteCode}</p>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full font-sans font-semibold text-[10px] tracking-wider uppercase border shrink-0 ${
                              req.status === "PENDING" ? "bg-amber-500/15 border-amber-400/40 text-amber-300" :
                              req.status === "ACCEPTED" ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-300" : "bg-rose-500/15 border-rose-400/40 text-rose-300"
                            }`}>
                              {req.status}
                            </span>
                          </div>

                          {hasDiaryData && (
                            <div className="pt-2 border-t border-amber-500/15 flex flex-col">
                              <button 
                                type="button"
                                onClick={() => fetchSentRequestMembers(req.id, req.diary.id)}
                                className="text-[11px] text-amber-300 hover:text-white font-sans font-medium flex items-center gap-1 self-start transition cursor-pointer"
                              >
                                <Users size={12} /> {isRequestExpanded ? "Hide Circle" : "View Circle Members"}
                              </button>

                              <AnimatePresence>
                                {isRequestExpanded && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: "auto" }} 
                                    exit={{ opacity: 0, height: 0 }} 
                                    className="pt-2 pl-2 space-y-1 font-sans text-xs text-stone-300 overflow-hidden"
                                  >
                                    {isMembersLoading ? (
                                      <span className="italic text-stone-400 text-xs animate-pulse">Scanning volume ledger...</span>
                                    ) : diaryMembers.length === 0 ? (
                                      <span className="italic text-stone-400 text-xs">No participants registered.</span>
                                    ) : (
                                      <div className="space-y-1">
                                        {diaryMembers.map((member, idx) => (
                                          <div key={member.id || idx} className="flex items-center gap-1.5 font-serif text-xs text-white">
                                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" /> 
                                            <span>{member.name}</span>
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

      </main>
    </div>
  );
}