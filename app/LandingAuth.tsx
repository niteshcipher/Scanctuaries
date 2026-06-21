"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Feather, ArrowLeft, Mail, Lock, User, Sparkles, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LandingAuth() {
  const router = useRouter();
  
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-diary-cream text-diary-charcoal relative font-serif antialiased overflow-x-hidden selection:bg-diary-blush/30">
      
      {/* Editorial Decorative Background Details */}
      <div className="absolute inset-4 md:inset-6 border border-diary-charcoal/5 pointer-events-none rounded-sm" />
      <div className="absolute top-0 right-0 w-125 h-125 bg-diary-blush/10 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-125 h-125 bg-diary-sage/5 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <AnimatePresence mode="wait">
        {!showAuthForm ? (
          /* ================= ORIGINAL MARKETING VIEW ================= */
          <motion.div
            key="marketing"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-3xl text-center flex flex-col items-center z-10 py-12"
          >
            <div className="flex flex-col items-center space-y-2 mb-8">
              <motion.div 
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="text-diary-sage mb-2"
              >
                <Feather size={36} strokeWidth={1.2} />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-normal tracking-wide text-diary-charcoal">
                Our Quiet Space
              </h1>
              <p className="text-xs tracking-widest font-mono text-diary-sage uppercase font-medium">
                A private journal shared with close friends
              </p>
            </div>

            <p className="text-lg md:text-xl text-diary-charcoal/80 max-w-lg mx-auto leading-relaxed italic mb-12">
              “For the thoughts too deep for public feeds, and the memories meant to be kept close.”
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mb-12">
              <div className="bg-diary-paper border border-diary-charcoal/5 p-6 rounded-xl shadow-[0_4px_24px_rgba(31,36,33,0.02)]">
                <div className="w-8 h-8 rounded-full bg-diary-cream flex items-center justify-center mb-3">
                  <Feather size={16} className="text-diary-sage" />
                </div>
                <h3 className="font-serif text-base font-semibold text-diary-charcoal mb-1">Intertwined Diaries</h3>
                <p className="text-sm text-diary-charcoal/65 leading-relaxed">
                  Write down your own separate days or read across your friends' collective timelines.
                </p>
              </div>
              
              <div className="bg-diary-paper border border-diary-charcoal/5 p-6 rounded-xl shadow-[0_4px_24px_rgba(31,36,33,0.02)]">
                <div className="w-8 h-8 rounded-full bg-diary-cream flex items-center justify-center mb-3">
                  <Lock size={16} className="text-diary-blush" />
                </div>
                <h3 className="font-serif text-base font-semibold text-diary-charcoal mb-1">Time Capsules</h3>
                <p className="text-sm text-diary-charcoal/65 leading-relaxed">
                  Seal group letters completely away to unlock together on custom future calendar dates.
                </p>
              </div>

              <div className="bg-diary-paper border border-diary-charcoal/5 p-6 rounded-xl shadow-[0_4px_24px_rgba(31,36,33,0.02)]">
                <div className="w-8 h-8 rounded-full bg-diary-cream flex items-center justify-center mb-3">
                  <Sparkles size={16} className="text-diary-sage" />
                </div>
                <h3 className="font-serif text-base font-semibold text-diary-charcoal mb-1">Total Privacy</h3>
                <p className="text-sm text-diary-charcoal/65 leading-relaxed">
                  No public algorithms, no global noise, and zero tracking. Just a quiet space for your inner circle.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md">
              <button
                onClick={() => { setIsLogin(true); setShowAuthForm(true); }}
                className="w-full sm:w-1/2 bg-diary-charcoal hover:bg-diary-charcoal/90 text-diary-cream font-medium px-6 py-3.5 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm font-sans tracking-wide"
              >
                Log In
              </button>
              <button
                onClick={() => { setIsLogin(false); setShowAuthForm(true); }}
                className="w-full sm:w-1/2 bg-diary-paper border border-diary-charcoal/20 hover:bg-diary-cream/50 text-diary-charcoal font-medium px-6 py-3.5 rounded-xl transition shadow-xs cursor-pointer text-sm font-sans tracking-wide"
              >
                Create Account
              </button>
            </div>
          </motion.div>
        ) : (
          /* ================= NEW BEAUTIFUL HIGH-ATTRACTIVE SPLIT-PANE VIEW ================= */
          <motion.div
            key="auth"
            initial={{ opacity: 0, scale: 0.99, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.99, y: 10 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-full max-w-4xl bg-diary-paper border border-diary-charcoal/10 rounded-2xl shadow-[0_20px_50px_rgba(31,36,33,0.06)] overflow-hidden grid grid-cols-1 md:grid-cols-12 z-10 relative min-h-137.5"
          >
            {/* Left Aesthetic Pane (Hidden on Mobile) */}
            <div className="hidden md:flex md:col-span-5 bg-linear-to-br from-diary-charcoal to-[#2a302c] p-10 flex-col justify-between text-diary-cream relative">
              <div className="absolute inset-0 bg-[radial-gradient(#5f7259_1px,transparent_1px)] bg-size-[16px_16px] opacity-10" />
              
              <button
                onClick={() => setShowAuthForm(false)}
                className="text-diary-cream/60 hover:text-diary-cream transition flex items-center gap-2 font-sans text-xs font-medium tracking-wider uppercase cursor-pointer z-10 w-fit"
              >
                <ArrowLeft size={14} /> Go Back
              </button>

              <div className="space-y-4 z-10">
                <div className="w-10 h-10 rounded-xl bg-diary-sage/20 border border-diary-sage/30 flex items-center justify-center text-diary-sage">
                  <Feather size={20} />
                </div>
                <h3 className="text-3xl font-normal leading-tight tracking-wide">
                  {isLogin ? "Welcome back to the collection." : "Begin a new volume together."}
                </h3>
                <p className="text-sm text-diary-cream/70 font-sans leading-relaxed">
                  {isLogin 
                    ? "Your words are safely preserved. Inscribe your secret credentials to unfold your archive."
                    : "Create your workspace ledge, invite your companions, and capture moments in absolute stillness."}
                </p>
              </div>

              <div className="text-xs font-mono text-diary-cream/40 z-10">
                Volume I • Op. 01
              </div>
            </div>

            {/* Right Interactive Form Pane */}
            <div className="col-span-1 md:col-span-7 p-8 md:p-12 flex flex-col justify-center relative bg-white">
              {/* Mobile Only Go Back Button */}
              <button
                onClick={() => setShowAuthForm(false)}
                className="md:hidden absolute top-6 left-6 text-diary-charcoal/50 hover:text-diary-charcoal transition flex items-center gap-1 font-sans text-xs font-medium cursor-pointer"
              >
                <ArrowLeft size={14} /> Go Back
              </button>

              <div className="max-w-md w-full mx-auto">
                {/* Visual Novel Headers */}
                <div className="mb-8 text-center md:text-left">
                  <span className="font-mono text-[10px] tracking-widest text-diary-sage uppercase font-bold block mb-1">
                    {isLogin ? "SECURE ACCESS" : "LEDGER REGISTRATION"}
                  </span>
                  <h2 className="text-3xl font-normal text-diary-charcoal tracking-wide">
                    {isLogin ? "Sign In" : "Get Started"}
                  </h2>
                </div>

                {error && (
                  <motion.p 
                    initial={{ opacity: 0, x: -5 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className="text-xs font-sans text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl mb-6 text-center font-medium flex items-center justify-center gap-2"
                  >
                    <span>{error}</span>
                  </motion.p>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 font-sans text-sm">
                  <AnimatePresence mode="popLayout">
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="flex flex-col"
                      >
                        <label className="text-xs font-semibold text-diary-charcoal/70 mb-1.5 flex items-center gap-1.5">
                          <User size={14} className="text-diary-charcoal/40" /> Your Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-diary-cream/30 border border-diary-charcoal/10 rounded-xl px-4 py-3 font-serif placeholder-diary-charcoal/30 focus:outline-none focus:border-diary-sage focus:bg-white transition shadow-xs focus:shadow-md"
                          placeholder="What should your friends call you?"
                          required
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-diary-charcoal/70 mb-1.5 flex items-center gap-1.5">
                      <Mail size={14} className="text-diary-charcoal/40" /> Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-diary-cream/30 border border-diary-charcoal/10 rounded-xl px-4 py-3 font-serif placeholder-diary-charcoal/30 focus:outline-none focus:border-diary-sage focus:bg-white transition shadow-xs focus:shadow-md"
                      placeholder="you@example.com"
                      required
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-diary-charcoal/70 mb-1.5 flex items-center gap-1.5">
                      <Lock size={14} className="text-diary-charcoal/40" /> Security Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-diary-cream/30 border border-diary-charcoal/10 rounded-xl px-4 py-3 font-serif placeholder-diary-charcoal/30 focus:outline-none focus:border-diary-sage focus:bg-white transition shadow-xs focus:shadow-md"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-diary-sage hover:bg-diary-sage/90 text-white font-medium text-sm py-3.5 rounded-xl transition duration-200 cursor-pointer disabled:opacity-40 mt-8 shadow-md shadow-diary-sage/10 active:scale-[0.99] transform"
                  >
                    <span>{loading ? "Writing to ledger..." : isLogin ? "Enter Sanctuary" : "Complete Registration"}</span>
                  </button>
                </form>

                {/* Footer Switch Link */}
                <div className="border-t border-diary-charcoal/5 mt-8 pt-6 text-center">
                  <button
                    type="button"
                    onClick={() => { setIsLogin(!isLogin); setError(""); }}
                    className="text-xs text-diary-charcoal/50 hover:text-diary-sage transition cursor-pointer font-sans group"
                  >
                    {isLogin ? (
                      <>
                        New around here? <span className="text-diary-sage font-medium group-hover:underline underline-offset-2">Create an account instead</span>
                      </>
                    ) : (
                      <>
                        Already sharing a diary? <span className="text-diary-sage font-medium group-hover:underline underline-offset-2">Log in here</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}