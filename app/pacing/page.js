"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Zap, ShoppingBag, AlertTriangle, CheckCircle, Clock, Flame, TrendingUp } from 'lucide-react';

export default function PacingPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/pacing').then(res => res.json()).then(setData);
  }, []);

  if (!data) return <div className="min-h-screen bg-black text-white p-10 flex items-center justify-center font-mono animate-pulse">CALIBRATING...</div>;

  const { dailyLimit, todaySpent, remainingForToday, status, todayTxns } = data;
  
  // Calculations
  const rawPercent = dailyLimit > 0 ? (todaySpent / dailyLimit) * 100 : (todaySpent > 0 ? 100 : 0);
  const percent = Math.min(100, rawPercent);
  const dayProgress = (new Date().getHours() / 24) * 100;
  
  // Status Logic
  const isDanger = status === 'OVERSPENT';
  const barColor = isDanger ? '#ef4444' : '#10b981'; 
  const burnRateColor = percent > dayProgress ? "text-red-400" : "text-emerald-400"; // Spending faster than time passing?

  const chartData = [
    { name: 'Track', value: 100, fill: '#1a1a1a' },
    { name: 'Progress', value: percent, fill: barColor }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-32 relative overflow-hidden font-sans selection:bg-purple-500/30">
      
      {/* Background Ambience */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[600px] blur-[120px] rounded-full opacity-15 pointer-events-none transition-colors duration-1000 ${isDanger ? 'bg-red-600' : 'bg-emerald-600'}`} />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between mb-8">
        <h1 className="text-sm font-bold tracking-widest uppercase text-zinc-500 flex items-center gap-2">
            <Zap size={16} className={isDanger ? "text-red-500" : "text-emerald-500"} /> 
            Velocity Control
        </h1>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase flex items-center gap-2 ${isDanger ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDanger ? 'bg-red-500' : 'bg-emerald-500'}`} />
            {status}
        </div>
      </header>

      {/* MAIN GAUGE SECTION */}
      <div className="relative z-10 flex flex-col items-center justify-center mb-8">
        <div className="w-72 h-72 relative filter drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              cx="50%" cy="50%" 
              innerRadius="75%" outerRadius="100%" 
              barSize={18} 
              data={chartData} 
              startAngle={180} endAngle={0}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar background={{ fill: '#18181b' }} clockWise dataKey="value" cornerRadius={10} />
            </RadialBarChart>
          </ResponsiveContainer>
          
          {/* Center Data */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-12">
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Spent Today</span>
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-5xl font-black ${isDanger ? 'text-red-500' : 'text-white'} tracking-tighter`}
            >
              ₹{Math.floor(todaySpent)}
            </motion.div>
            <div className="w-8 h-1 bg-white/10 rounded-full my-3" />
            <span className="text-zinc-400 text-xs font-medium">
               Cap: <span className="text-white font-bold">₹{Math.floor(dailyLimit)}</span>
            </span>
          </div>
        </div>

        {/* Warning / Status Message */}
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            key={status} 
            className={`mt-[-20px] px-5 py-3 rounded-2xl border backdrop-blur-md flex items-center gap-3 shadow-xl ${isDanger ? 'bg-red-950/20 border-red-500/20 text-red-200' : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-200'}`}
        >
            {isDanger ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
            <span className="text-xs font-bold">
                {isDanger 
                    ? `Over by ₹${Math.abs(Math.floor(remainingForToday))}. Stop now.` 
                    : `₹${Math.floor(remainingForToday)} remaining safely.`}
            </span>
        </motion.div>
      </div>

      {/* --- NEW: TELEMETRY CARDS (Replaces the ugly bottom bar) --- */}
      <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
        
        {/* Card 1: Time Passed */}
        <div className="p-4 rounded-[1.5rem] bg-[#0A0A0A] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 h-1 bg-zinc-700 transition-all duration-1000" style={{ width: `${dayProgress}%` }} />
            <div className="flex justify-between items-start mb-2">
                <div className="p-2 rounded-full bg-zinc-800/50 text-zinc-400">
                    <Clock size={16} />
                </div>
                <span className="text-zinc-500 text-[10px] font-bold uppercase">Time</span>
            </div>
            <div className="text-2xl font-black text-white">{Math.floor(dayProgress)}%</div>
            <p className="text-[10px] text-zinc-500 mt-1">Day Elapsed</p>
        </div>

        {/* Card 2: Budget Burn */}
        <div className={`p-4 rounded-[1.5rem] bg-[#0A0A0A] border relative overflow-hidden group ${isDanger ? 'border-red-500/20' : 'border-white/5'}`}>
            <div className={`absolute top-0 left-0 h-1 transition-all duration-1000 ${isDanger ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${percent}%` }} />
            <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-full bg-opacity-10 ${isDanger ? 'bg-red-500 text-red-400' : 'bg-emerald-500 text-emerald-400'}`}>
                    <Flame size={16} />
                </div>
                <span className={`text-[10px] font-bold uppercase ${burnRateColor}`}>Burn</span>
            </div>
            <div className={`text-2xl font-black ${isDanger ? 'text-red-500' : 'text-white'}`}>
                {percent > 100 ? '100+' : Math.floor(percent)}%
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">Budget Used</p>
        </div>

      </div>

      {/* Transactions List */}
      <div className="relative z-10">
        <h3 className="text-zinc-500 text-[10px] font-bold uppercase mb-4 pl-2 tracking-widest flex items-center gap-2">
            <TrendingUp size={12} /> Live Feed
        </h3>
        
        <div className="space-y-3 pb-20">
            {todayTxns.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                    <p className="text-zinc-600 text-xs">No activity detected today.</p>
                </div>
            ) : (
                todayTxns.map((t, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex justify-between items-center p-4 bg-[#0A0A0A] border border-white/5 rounded-2xl hover:bg-white/[0.03] transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl ${isDanger ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                <ShoppingBag size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-zinc-200">{t.category}</p>
                                <p className="text-[10px] text-zinc-500">{t.description || "Uncategorized"}</p>
                            </div>
                        </div>
                        <span className="font-mono font-bold text-white text-sm">-₹{t.amount}</span>
                    </motion.div>
                ))
            )}
        </div>
      </div>

    </div>
  );
}