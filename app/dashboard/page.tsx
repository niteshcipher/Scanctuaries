"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Key, ArrowRight, Compass, LogOut, CheckCircle, Users, ShieldAlert, Check, X, UserMinus, Trash2, Hourglass, Bell } from "lucide-react";
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
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  const [diaryTitle, setDiaryTitle] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [activeAction, setActiveAction] = useState<"none" | "create" | "join">("none");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [selectedMgmtDiary, setSelectedMgmtDiary] = useState<string | null>(null);
  const [mgmtData, setMgmtData] = useState<ManagementData | null>(null);
  
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/diaries", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        if (data.diaries) setDiaries(data.diaries);
        if (data.sentRequests) setSentRequests(data.sentRequests);
        if (data.incomingRequests) setIncomingRequests(data.incomingRequests);

        if (data.currentUserId) {
          setCurrentUserId(data.currentUserId);
        }
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

  const handleOpenManagement = async (diaryId: string) => {
    if (selectedMgmtDiary === diaryId) {
      setSelectedMgmtDiary(null);
      setMgmtData(null);
      return;
    }
    setError(""); setSuccessMsg("");
    try {
      const res = await fetch(`/api/diaries/manage?diaryId=${diaryId}`);
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
        body: JSON.stringify({ code: inviteCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not complete request");

      setSuccessMsg(data.message);
      setInviteCode(""); setActiveAction("none");
      fetchDashboardData(); 
    } catch (err: any) { setError(err.message); }
  };

  if (loading) {
    return <div className="min-h-screen bg-diary-cream flex items-center justify-center font-serif text-stone-500 italic">Entering sanctuaries...</div>;
  }

  return (
    <main className="min-h-screen w-full bg-diary-cream p-6 md:p-12 text-diary-charcoal selection:bg-diary-blush/30">
      <nav className="max-w-4xl mx-auto flex justify-between items-center mb-16">
        <div className="flex items-center space-x-2 text-diary-sage">
          <Compass size={22} />
          <span className="font-serif text-lg tracking-wide">My Sanctuaries</span>
        </div>
        <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); }} className="text-stone-900 hover:text-diary-blush transition flex items-center space-x-1 text-xs uppercase tracking-widest font-medium cursor-pointer">
          <LogOut size={14} /> <span>Exit Space</span>
        </button>
      </nav>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        
        {/* LEFT COLUMN: Actions, Incoming Requests & Sent Requests Monitor */}
        <div className="md:col-span-1 space-y-6">
          <div className="space-y-4">
            <h2 className="font-serif text-xl text-stone-900 mb-4">Workspace Options</h2>
            <button onClick={() => { setActiveAction(activeAction === "create" ? "none" : "create"); setError(""); setSuccessMsg(""); }} className={`w-full text-left p-4 rounded-xl border transition flex items-center space-x-3 cursor-pointer ${activeAction === "create" ? "bg-diary-sage text-white border-diary-sage" : "bg-diary-paper border-stone-200/60"}`}>
              <PlusCircle size={20} /> <span className="text-sm font-medium">Create Shared Diary</span>
            </button>
            <button onClick={() => { setActiveAction(activeAction === "join" ? "none" : "join"); setError(""); setSuccessMsg(""); }} className={`w-full text-left p-4 rounded-xl border transition flex items-center space-x-3 cursor-pointer ${activeAction === "join" ? "bg-diary-sage text-white border-diary-sage" : "bg-diary-paper border-stone-200/60"}`}>
              <Key size={20} /> <span className="text-sm font-medium">Enter Invitation Code</span>
            </button>
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
          {successMsg && <p className="text-xs text-diary-sage bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 flex items-center gap-1.5 font-medium"><CheckCircle size={14} /> {successMsg}</p>}

          {/* NEW DASHBOARD MODULE: Incoming Requests From Others Container */}
          <div className="bg-diary-paper border border-stone-200/60 rounded-xl p-4 space-y-3 shadow-xs">
            <h3 className="font-serif text-sm font-bold tracking-wide text-stone-700 flex items-center gap-1.5">
              <Bell size={14} className="text-diary-sage" /> Incoming Requests
            </h3>
            {incomingRequests.length === 0 ? (
              <p className="text-xs italic text-stone-400 pl-1">No incoming knocks pending.</p>
            ) : (
              <div className="space-y-2">
                {incomingRequests.map((req) => (
                  <div key={req.id} className="text-xs bg-diary-cream/50 p-3 rounded-lg border border-stone-200/30 space-y-2">
                    <div>
                      <p className="text-stone-500 font-medium">wants to join <span className="text-stone-800 font-bold">"{req.diary.title}"</span></p>
                      <p className="text-[11px] text-stone-600 font-serif mt-0.5">— {req.user.name} ({req.user.email})</p>
                    </div>
                    <div className="flex justify-end gap-2 pt-1 border-t border-stone-200/30">
                      <button 
                        onClick={() => handleManageAction(req.diaryId, req.user.id, "ACCEPT")} 
                        className="px-2 py-1 bg-diary-sage hover:bg-diary-sage/90 text-white rounded-md text-[10px] uppercase tracking-wider font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={10} /> Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sent Request Layout Tracker Box */}
          <div className="bg-diary-paper border border-stone-200/60 rounded-xl p-4 space-y-3 shadow-xs">
            <h3 className="font-serif text-sm font-bold tracking-wide text-stone-700 flex items-center gap-1.5">
              <Hourglass size={14} className="text-diary-sage" /> Sent Requests Log
            </h3>
            {sentRequests.length === 0 ? (
              <p className="text-xs italic text-stone-400 pl-1">No outbound knocks sent yet.</p>
            ) : (
              <div className="space-y-2">
                {sentRequests.map((req) => (
                  <div key={req.id} className="text-xs flex justify-between items-center bg-diary-cream/50 p-2.5 rounded-lg border border-stone-200/30">
                    <div>
                      <p className="font-medium text-stone-800 truncate max-w-30">{req.diary.title}</p>
                      <p className="text-[10px] text-stone-400">Code: {req.diary.inviteCode}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wide ${
                      req.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                      req.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Notebooks Feed Matrix */}
        <div className="md:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeAction === "create" && (
              <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleCreateDiary} className="bg-diary-paper p-6 rounded-xl border border-stone-200/50 space-y-4 shadow-sm">
                <h3 className="font-serif text-lg">Name Your Sanctuary</h3>
                <input type="text" required value={diaryTitle} onChange={(e) => setDiaryTitle(e.target.value)} placeholder="e.g., Our Little Universe..." className="w-full bg-diary-cream/40 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-diary-sage text-stone-800" />
                <button type="submit" className="bg-diary-sage hover:bg-diary-sage/90 text-white text-xs uppercase tracking-widest font-medium px-4 py-2.5 rounded-lg cursor-pointer transition">Generate Diary</button>
              </motion.form>
            )}
            {activeAction === "join" && (
              <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleJoinDiary} className="bg-diary-paper p-6 rounded-xl border border-stone-200/50 space-y-4 shadow-sm bag">
                <h3 className="font-serif text-lg">Connect with a Partner</h3>
                <input type="text" required value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="Paste 6-character code" className="w-full bg-diary-cream/40 border border-stone-200 rounded-xl px-4 py-2.5 text-sm tracking-widest uppercase focus:outline-none focus:border-diary-sage text-stone-800" />
                <button type="submit" className="bg-diary-sage hover:bg-diary-sage/90 text-white text-xs uppercase tracking-widest font-medium px-4 py-2.5 rounded-lg cursor-pointer transition">Send Entrance Request</button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <h3 className="font-serif text-xl text-stone-700">Your Active Notebooks</h3>
            {diaries.length === 0 ? (
              <div className="bg-diary-paper/60 border border-dashed border-stone-200 rounded-xl p-12 text-center text-stone-400 text-sm italic">No active spaces open yet.</div>
            ) : (
              <div className="space-y-4">
                {diaries.map((diary) => {
                  const isOwner = diary.creatorId === currentUserId;
                  const isDeleting = confirmDeleteId === diary.id;

                  return (
                    <div key={diary.id} className="bg-diary-paper border border-stone-200/60 p-6 rounded-xl shadow-sm flex flex-col space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="cursor-pointer flex-1" onClick={() => router.push(`/diary/${diary.id}`)}>
                          <h4 className="font-serif text-xl text-stone-800 hover:text-diary-sage transition flex items-center gap-2">{diary.title} <ArrowRight size={16} className="inline opacity-40" /></h4>
                          <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-1">Code: {diary.inviteCode} {isOwner && <span className="text-diary-sage font-bold ml-1.5">(Creator)</span>}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          {isOwner && (
                            <>
                              <button title="Open diary member management" onClick={() => handleOpenManagement(diary.id)} className="p-2 border border-stone-100 hover:border-diary-sage rounded-xl transition text-stone-400 hover:text-diary-sage cursor-pointer">
                                <Users size={16} />
                              </button>
                              
                              <button title="Delete diary container" onClick={() => setConfirmDeleteId(isDeleting ? null : diary.id)} className={`p-2 border rounded-xl transition cursor-pointer ${isDeleting ? "bg-rose-50 border-rose-200 text-rose-600" : "border-stone-100 hover:border-rose-200 text-stone-400 hover:text-rose-600"}`}>
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Confirm Deletion Double Handshake Guard Panel */}
                      <AnimatePresence>
                        {isDeleting && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                              <p className="text-xs font-bold text-rose-800">Are you absolutely sure?</p>
                              <p className="text-[11px] text-rose-600/80">Deleting this sanctuary will instantly erase all nested timeline memories for both users permanently.</p>
                            </div>
                            <div className="flex gap-2 self-end sm:self-center">
                              <button onClick={() => setConfirmDeleteId(null)} className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-lg text-stone-700 text-xs font-bold transition cursor-pointer">Cancel</button>
                              <button onClick={() => handleDeleteDiary(diary.id)} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"><Trash2 size={12} /> Confirm Erase</button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Administrative management drop drawer */}
                      <AnimatePresence>
                        {selectedMgmtDiary === diary.id && mgmtData && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="border-t border-stone-100 pt-4 space-y-4 overflow-hidden">
                            <div>
                              <h5 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 flex items-center gap-1"><ShieldAlert size={12} /> Pending Knocks</h5>
                              {mgmtData.requests.length === 0 ? <p className="text-xs italic text-stone-400 pl-2">No pending entrance requests.</p> : (
                                mgmtData.requests.map((req) => (
                                  <div key={req.id} className="flex justify-between items-center bg-diary-cream/40 p-3 rounded-lg border border-stone-200/30">
                                    <span className="text-sm font-medium text-stone-700">{req.user.name} ({req.user.email})</span>
                                    <div className="flex gap-2">
                                      <button title="Accept entrance request" onClick={() => handleManageAction(diary.id, req.user.id, "ACCEPT")} className="p-1.5 bg-diary-sage text-white rounded-md cursor-pointer"><Check size={14} /></button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                            <div>
                              <h5 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 flex items-center gap-1"><Users size={12} /> Connected Members</h5>
                              {mgmtData.members.length === 0 ? <p className="text-xs italic text-stone-400 pl-2">Sole diary workspace. No partners connected yet.</p> : (
                                mgmtData.members.map((mem) => (
                                  <div key={mem.id} className="flex justify-between items-center bg-diary-cream/40 p-3 rounded-lg border border-stone-200/30">
                                    <span className="text-sm font-medium text-stone-700">{mem.name}</span>
                                    <button onClick={() => handleManageAction(diary.id, mem.id, "KICK")} className="p-1.5 border border-red-200 hover:bg-red-50 text-red-500 rounded-md cursor-pointer flex items-center gap-1 text-xs font-medium"><UserMinus size={14} /> Revoke Access</button>
                                  </div>
                                ))
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}