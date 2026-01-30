"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, TrendingDown, Zap, Skull, ScanLine, Activity } from 'lucide-react';

export default function InsightsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    setLoading(true);
    setData(null); // Reset to show loading animation
    try {
      const res = await fetch('/api/insights');
      const response = await res.json();
      if (response.json) setData(response.json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Score Color Helper
  const getScoreColor = (score) => {
    if (score > 80) return "text-emerald-400 border-emerald-500/50 shadow-emerald-900/20";
    if (score > 50) return "text-yellow-400 border-yellow-500/50 shadow-yellow-900/20";
    return "text-red-500 border-red-500/50 shadow-red-900/20";
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white p-6 pb-32 flex flex-col relative overflow-hidden font-sans selection:bg-purple-500/30">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-900/10 via-black to-black pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-center mb-10 relative z-10">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter flex items-center gap-2">
            <ScanLine className="text-purple-500" />
            ROAST<span className="text-zinc-600">.LOG</span>
          </h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest pl-1">AI Financial Forensics</p>
        </div>
      </header>

      {/* --- CENTRAL INTERACTION AREA --- */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 max-w-2xl mx-auto w-full">
        
        {/* STATE 1: EMPTY (Call to Action) */}
        {!data && !loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mb-8 relative">
                {/* Pulsing Rings */}
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
                <button 
                    onClick={generateInsight}
                    className="relative w-32 h-32 rounded-full bg-gradient-to-br from-white to-zinc-400 text-black flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-110 transition-transform duration-300 group"
                >
                    <Sparkles size={40} className="group-hover:rotate-12 transition-transform" />
                </button>
            </div>
            <h2 className="text-2xl font-bold mb-2">Ready for the Truth?</h2>
            <p className="text-zinc-500 max-w-xs mx-auto">
                Tap the button to run a deep-scan on your spending habits.
            </p>
          </motion.div>
        )}

        {/* STATE 2: LOADING (Scanning Animation) */}
        {loading && (
          <div className="flex flex-col items-center">
             <div className="w-24 h-24 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-8" />
             <p className="text-purple-400 font-mono text-sm uppercase tracking-widest animate-pulse">
                Analysing Transactions...
             </p>
          </div>
        )}

        {/* STATE 3: THE REPORT (Result) */}
        {data && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-6"
          >
             {/* 1. Score Header */}
             <div className="flex items-center justify-between p-6 rounded-[2rem] bg-[#0A0A0A] border border-white/10">
                <div>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Financial Health</p>
                    <h2 className={`text-5xl font-black ${getScoreColor(data.score).split(' ')[0]}`}>
                        {data.score}/100
                    </h2>
                </div>
                <div className="p-4 rounded-full bg-white/5">
                    <Activity size={32} className={getScoreColor(data.score).split(' ')[0]} />
                </div>
             </div>

             {/* 2. The Roast (Quote Style) */}
             <div className="p-8 rounded-[2rem] bg-gradient-to-br from-purple-900/30 to-black border border-purple-500/30 relative overflow-hidden">
                <Skull className="absolute -right-4 -bottom-4 text-purple-500/10 rotate-12" size={120} />
                <div className="relative z-10">
                    <p className="text-purple-300 font-serif italic text-xl leading-relaxed">
                        "{data.roast}"
                    </p>
                </div>
             </div>

             {/* 3. The Diagnosis (Red Card) */}
             <div className="p-6 rounded-[2rem] bg-[#0A0A0A] border border-red-500/20 relative overflow-hidden group hover:border-red-500/40 transition-colors">
                 <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                 <div className="flex items-center gap-3 mb-4">
                     <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                         <TrendingDown size={20} />
                     </div>
                     <h3 className="text-lg font-bold text-red-100">The Leak: {data.leak}</h3>
                 </div>
                 <p className="text-zinc-400 leading-relaxed text-sm">
                     {data.leakDesc}
                 </p>
             </div>

             {/* 4. The Solution (Green Card) */}
             <div className="p-6 rounded-[2rem] bg-[#0A0A0A] border border-emerald-500/20 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                 <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                 <div className="flex items-center gap-3 mb-4">
                     <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                         <Zap size={20} />
                     </div>
                     <h3 className="text-lg font-bold text-emerald-100">Fix: {data.fix}</h3>
                 </div>
                 <p className="text-zinc-400 leading-relaxed text-sm">
                     {data.fixDesc}
                 </p>
             </div>

             {/* Retry Button */}
             <button 
                onClick={generateInsight}
                className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
             >
                <RefreshCw size={16} /> Run New Scan
             </button>

          </motion.div>
        )}

      </div>
    </div>
  );
}