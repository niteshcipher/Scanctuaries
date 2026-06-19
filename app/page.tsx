"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Flower } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LandingAuth() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form input bindings
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

      // If login or registration is successful, forward directly onto the Dashboard hub
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-diary-cream selection:bg-diary-blush/30">
      
      {/* Aesthetic App Branding Emblem Header */}
      <header className="mb-8 text-center flex flex-col items-center">
        <motion.div 
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="text-diary-sage mb-2"
        >
          <Flower size={32} strokeWidth={1.5} />
        </motion.div>
        <h1 className="font-serif text-4xl text-diary-charcoal/90 tracking-wide">Our Quiet Space</h1>
        <p className="text-xs text-diary-sage/80 mt-1 italic tracking-wider">A private, shared sanctuary for two</p>
      </header>

      {/* The Central Interactive Linen Paper Card Layout Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-diary-paper border border-stone-200/50 rounded-2xl p-8 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-diary-sage/20 via-diary-blush/40 to-diary-sage/20" />

        <h2 className="font-serif text-2xl text-stone-700 text-center mb-6">
          {isLogin ? "Welcome Back" : "Begin Your Journey"}
        </h2>

        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500/80 bg-red-50 border border-red-100 p-3 rounded-lg mb-4 text-center font-medium">
            {error}
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label className="block text-xs uppercase tracking-widest text-stone-400 font-medium mb-1">Preferred Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-diary-cream/40 border border-stone-200/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-diary-sage/60 transition"
                  placeholder="What should they call you?"
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-400 font-medium mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-diary-cream/40 border border-stone-200/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-diary-sage/60 transition"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-stone-400 font-medium mb-1">Secret Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-diary-cream/40 border border-stone-200/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-diary-sage/60 transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-diary-sage hover:bg-diary-sage/90 text-zinc-600 rounded-xl py-3 text-sm font-medium transition duration-200 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-6 shadow-sm shadow-diary-sage/10"
          >
            <span>{loading ? "Gently stepping in..." : isLogin ? "Enter Sanctuary" : "Create Workspace"}</span>
          </button>
        </form>

        <div className="border-t border-stone-100 mt-6 pt-4 text-center">
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-xs text-stone-400 hover:text-diary-sage transition underline underline-offset-4 cursor-pointer"
          >
            {isLogin ? "New here? Create a dual diary setup" : "Already sharing a diary? Step inside"}
          </button>
        </div>
      </motion.div>
    </main>
  );
}