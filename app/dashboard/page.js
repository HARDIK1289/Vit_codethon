"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, Lock, AlertCircle, TrendingUp, Zap, Calendar, AlertTriangle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

// Helper component for counting up numbers
function Counter({ value }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (start === end) return;
    
    let totalDuration = 1000;
    let incrementTime = (totalDuration / Math.abs(end)) * 10;
    if (incrementTime < 5) incrementTime = 5; 

    let timer = setInterval(() => {
      // Logic to handle counting towards negative numbers
      if (start < end) start += Math.ceil(Math.abs(end) / 50);
      else if (start > end) start -= Math.ceil(Math.abs(end) / 50);
      
      // Snap to finish
      if ((end > 0 && start >= end) || (end < 0 && start <= end)) {
        start = end;
        clearInterval(timer);
      }
      setCount(start);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toLocaleString()}</span>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(async (res) => {
        if (res.status === 404) {
          router.push('/onboarding');
          return null; 
        }
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => {
        if (data) {
          setData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Dashboard Error:", err);
        setLoading(false); 
      });
  }, [router]);

  if (loading) return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-mono animate-pulse">LOADING TELEMETRY...</div>;
  
  if (!data) return null;

  const { budget, status, goals } = data;
  
  // --- DYNAMIC VISUAL LOGIC ---
  const isDebt = status.dailySafeSpend < 0; // Are we in the negatives?
  const isLowFunds = !isDebt && status.dailySafeSpend < 500; // Are we just broke?
  
  // Determine Theme
  let theme = {
    gradient: "from-emerald-500/20 to-purple-900/20",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    icon: <Zap size={20} className="text-emerald-400" />,
    label: "Safe Spendable Today",
    glow: "bg-emerald-500/20"
  };

  if (isLowFunds) {
    theme = {
        gradient: "from-orange-600/20 to-black",
        border: "border-orange-500/30",
        text: "text-orange-400",
        icon: <AlertCircle size={20} className="text-orange-400" />,
        label: "Funds Low",
        glow: "bg-orange-500/20"
    };
  }

  if (isDebt) {
    theme = {
        gradient: "from-red-900/40 via-red-950 to-black",
        border: "border-red-500 animate-pulse", // Pulses when in debt
        text: "text-red-500",
        icon: <ShieldAlert size={20} className="text-red-500 animate-bounce" />,
        label: "⚠️ LIMIT BREACHED",
        glow: "bg-red-600/30"
    };
  }

  const allocationData = [
    { name: 'Locked', value: budget.committed, color: '#27272a' },
    { name: 'Spendable', value: budget.initialSpendable, color: isDebt ? '#ef4444' : '#10b981' }, 
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-32 overflow-hidden relative">
      
      {/* Background Ambience */}
      <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] opacity-20 pointer-events-none ${isDebt ? 'bg-red-600' : 'bg-blue-600'}`} />

      {/* HEADER */}
      <header className="relative z-10 mb-8 flex justify-between items-end border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Command Center</h1>
          <p className="text-zinc-500 text-sm">Real-time financial status.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
           <Calendar size={14} className="text-zinc-400" />
           <span className="text-xs font-mono text-zinc-300">{new Date().toLocaleDateString()}</span>
        </div>
      </header>

      {/* 1. HERO CARD (Dynamic State) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative w-full p-1 rounded-[2.5rem] bg-gradient-to-br ${theme.gradient} mb-8`}
      >
        {/* The Glow Effect */}
        <div className={`absolute inset-0 blur-2xl opacity-50 ${theme.glow}`} />

        <div className={`bg-[#0A0A0A] rounded-[2.3rem] p-8 md:p-12 relative overflow-hidden border ${theme.border}`}>
            
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-full bg-white/5 border border-white/10">
                            {theme.icon}
                        </div>
                        <span className={`font-bold uppercase tracking-widest text-xs ${theme.text}`}>
                            {theme.label}
                        </span>
                    </div>
                    
                    {/* BIG NUMBER */}
                    <h2 className={`text-7xl md:text-8xl font-black tracking-tighter drop-shadow-2xl ${isDebt ? 'text-red-500' : 'text-white'}`}>
                        ₹<Counter value={status.dailySafeSpend} />
                    </h2>
                    
                    <p className="text-zinc-500 mt-2 max-w-md text-sm md:text-base">
                        {isDebt ? (
                            <span className="text-red-400 font-bold">
                                You are over budget by ₹{Math.abs(status.dailySafeSpend)}. Stop spending immediately.
                            </span>
                        ) : (
                            <>
                                Based on <span className="text-white font-bold">₹{status.remainingSpendable.toLocaleString()}</span> remaining for the next <span className="text-white font-bold">{status.daysLeft} days</span>.
                            </>
                        )}
                    </p>
                </div>

                {/* Status Badge */}
                <div className={`px-6 py-3 rounded-2xl border backdrop-blur-md flex flex-col items-center min-w-[140px] bg-white/5 ${isDebt ? 'border-red-500/50 bg-red-900/10' : 'border-white/10'}`}>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Condition</span>
                    <span className={`text-xl font-black ${theme.text}`}>
                        {isDebt ? "CRITICAL" : isLowFunds ? "LOW" : "STABLE"}
                    </span>
                </div>
            </div>
        </div>
      </motion.div>

      {/* 2. SECONDARY STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <KpiCard 
            title="Total Spent" 
            value={`₹${status.totalSpent.toLocaleString()}`} 
            icon={<TrendingUp size={20} className="text-blue-400" />} 
            delay={0.1}
        />
        <KpiCard 
            title="Fixed Bills" 
            value={`₹${budget.committed.toLocaleString()}`} 
            icon={<Lock size={20} className="text-zinc-400" />} 
            delay={0.2}
        />
        <KpiCard 
            title="Income" 
            value={`₹${budget.income.toLocaleString()}`} 
            icon={<Wallet size={20} className="text-emerald-400" />} 
            delay={0.3}
            className="col-span-2 md:col-span-1"
        />
      </div>

      {/* 3. CHARTS & GOALS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="p-8 rounded-[2rem] bg-zinc-900/30 border border-white/5 h-[350px] relative"
        >
          <h3 className="font-bold text-lg mb-6 text-zinc-300">Wallet Share</h3>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie 
                data={allocationData} 
                cx="50%" cy="50%" 
                innerRadius={60} 
                outerRadius={80} 
                paddingAngle={5} 
                dataKey="value"
                stroke="none"
              >
                {allocationData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', borderRadius: '12px', border: '1px solid #333' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value) => `₹${value.toLocaleString()}`}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
             <span className="text-xs text-zinc-500 font-bold uppercase">Ratio</span>
          </div>
        </motion.div>

        {/* Goals */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 p-8 rounded-[2rem] bg-zinc-900/30 border border-white/5"
        >
           <h3 className="font-bold text-lg mb-6 text-zinc-300">Active Goals</h3>
           <div className="space-y-6">
             {goals.length === 0 ? (
                <div className="text-center py-10 text-zinc-600 border border-dashed border-white/5 rounded-xl">
                    No active goals.
                </div>
             ) : (
                 goals.map((g, i) => (
                   <div key={i} className="group">
                     <div className="flex justify-between text-sm mb-2 font-medium">
                       <span className="text-zinc-200">{g.name}</span>
                       <span className="text-zinc-500">₹{g.savedAmount.toLocaleString()} / ₹{g.targetAmount.toLocaleString()}</span>
                     </div>
                     <div className="h-3 w-full bg-black rounded-full overflow-hidden border border-white/5">
                       <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(g.savedAmount/g.targetAmount)*100}%` }}
                            transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                            className="h-full bg-zinc-200 rounded-full" 
                       />
                     </div>
                   </div>
                 ))
             )}
           </div>
        </motion.div>

      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, delay, className }) {
  return (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={`p-6 rounded-[2rem] bg-zinc-900/30 border border-white/5 hover:bg-zinc-800/50 transition-colors ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-white/5">{icon}</div>
        <span className="text-zinc-500 text-xs uppercase font-bold tracking-wider">{title}</span>
      </div>
      <h3 className="text-2xl font-black text-white">{value}</h3>
    </motion.div>
  );
}