"use client";
import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, BarChart3, ChevronRight, Lock, Activity } from 'lucide-react';

export default function HomePage() {
  const containerRef = useRef(null);
  
  // Staggered animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <main className="relative min-h-screen bg-[#050505] overflow-x-hidden selection:bg-purple-500/30">
      
      {/* Background Gradients (Added for depth) */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-purple-900/10 via-black to-black pointer-events-none" />
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-6 backdrop-blur-md bg-black/20 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg rotate-12 flex items-center justify-center">
             <Zap size={18} className="text-white fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">ClearSpend</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Login</Link>
          <Link href="/login">
            <button className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 group hover:bg-zinc-200 transition-colors">
              Join the Future <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            Financial Intelligence. Remastered.
          </div>
          
          <h1 className="text-6xl md:text-[5.5rem] font-bold leading-[1.1] tracking-tight mb-8 text-white">
            Your Money. <br /> 
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">On Autopilot.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-500 mb-12 leading-relaxed">
            Stop checking balances. Start following the flow. Our behavior-aware engine 
            secures your commitments and calculates your daily spendable limit in real-time.
          </p>
        </motion.div>

        {/* --- REPLACED SECTION: THE "LOCKED" INTERFACE --- */}
        <motion.div 
          initial={{ opacity: 0, y: 40, rotateX: 15 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="w-full max-w-4xl perspective-1000 mb-24 relative z-10"
        >
          <div className="relative group cursor-pointer" onClick={() => window.location.href = '/login'}>
            
            {/* 1. Animated Glow Behind */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 animate-pulse"></div>
            
            {/* 2. Main Card Body */}
            <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl">
              
              {/* Scanline Effect */}
              <motion.div 
                initial={{ top: "-10%" }}
                animate={{ top: "110%" }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-[2px] bg-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.5)] z-20 pointer-events-none"
              />

              <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                
                {/* Left Side: Encrypted Data */}
                <div className="space-y-4 text-center md:text-left flex-1">
                  <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">
                    <Lock size={14} className="text-purple-500" /> 
                    Secure Enclave
                  </div>
                  
                  <div className="relative py-2">
                    {/* The Blurred Number */}
                    <h2 className="text-6xl md:text-7xl font-black text-white/10 blur-md select-none tracking-tighter scale-105">
                      ₹1,250
                    </h2>
                    
                    {/* The Overlay Badge */}
                    <div className="absolute inset-0 flex items-center justify-center md:justify-start">
                        <div className="px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2 group-hover:bg-white/10 transition-colors">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-white text-xs font-bold uppercase tracking-widest">Login to Reveal</span>
                        </div>
                    </div>
                  </div>
                  
                  <p className="text-zinc-600 text-sm max-w-sm mx-auto md:mx-0">
                    Your Daily Safe Spend is dynamically calculated based on your recurring bills and income.
                  </p>
                </div>

                {/* Right Side: The "Initialize" Action */}
                <div className="relative">
                   <div className="w-full md:w-64 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between px-6 group-hover:border-purple-500/30 transition-colors">
                        <div className="flex flex-col">
                            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Status</span>
                            <span className="text-white font-mono font-bold flex items-center gap-2">
                                <Activity size={16} className="text-purple-500" /> Standby
                            </span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ChevronRight size={20} />
                        </div>
                   </div>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
        {/* --- END REPLACED SECTION --- */}

        {/* Feature Cards Grid */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
        >
          <SpotlightCard 
            icon={<ShieldCheck size={28} className="text-purple-500" />}
            title="Commitment Lock"
            desc="Automatic logical isolation of rent, EMIs, and bills before you even see your balance."
          />
          <SpotlightCard 
            icon={<Zap size={28} className="text-yellow-500" />}
            title="Dynamic Pacing"
            desc="Real-time speed limits for your spending. Adaptive to your lifestyle and daily habits."
          />
          <SpotlightCard 
            icon={<BarChart3 size={28} className="text-blue-500" />}
            title="Behavior AI"
            desc="Agentic analysis that understands your psychology. Not just 'what', but 'why'."
          />
        </motion.div>
      </section>
    </main>
  );
}

// Spotlight Card Component (Custom Interactive UI)
function SpotlightCard({ icon, title, desc }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className="relative group h-full p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] overflow-hidden"
    >
      <div 
        className="pointer-events-none absolute -inset-px transition duration-300"
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,0.06), transparent 40%)`,
          opacity
        }}
      />
      <div className="relative z-10">
        <div className="mb-6 p-3 w-fit rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
        <p className="text-zinc-500 leading-relaxed italic">"{desc}"</p>
      </div>
    </div>
  );
}