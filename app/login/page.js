"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
      const result = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      if (result?.error) {
        setError("Invalid username or password");
        setLoading(false);
      } else {
        // CORRECTED: Always go to dashboard. Dashboard will handle the rest.
        router.refresh();
        router.push("/dashboard"); 
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6 relative overflow-hidden">
       <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[150px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/[0.02] backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Username</label>
            <input name="username" type="text" required placeholder="Enter your username" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Password</label>
            <input name="password" type="password" required placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>

          <button disabled={loading} type="submit" className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all mt-4 flex justify-center items-center gap-2">
            {loading ? "Accessing Engine..." : "Sign In"} <ArrowRight size={18} />
          </button>
        </form>
        
        <p className="text-center text-zinc-600 text-sm mt-8">
          New here? <Link href="/signup" className="text-white font-medium hover:underline">Create an account</Link>
        </p>
      </motion.div>
    </div>
  );
}