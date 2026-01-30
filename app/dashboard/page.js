"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { Wallet, Lock, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (data?.error) return <div className="p-10 text-center text-red-400">Error loading engine.</div>;

  const { budget, status, goals } = data;

  // Chart Data Preparation
  const allocationData = [
    { name: 'Locked (Bills)', value: budget.committed, color: '#3f3f46' }, // Zinc-700
    { name: 'Spendable', value: budget.initialSpendable, color: '#10b981' }, // Emerald-500
  ];

  return (
    <div className="min-h-screen bg-[#050505] p-6 pb-24 text-white">
      
      {/* HEADER */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            Command Center
          </h1>
          <p className="text-zinc-500 mt-1">Real-time financial telemetry.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
          <Calendar size={14} className="text-zinc-400" />
          <span className="text-sm font-mono text-zinc-300">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard 
          title="Safe Daily Cap" 
          value={`₹${Math.floor(status.dailySafeSpend)}`} 
          sub={`For the next ${status.daysLeft} days`}
          icon={<TrendingUp size={24} className="text-emerald-400" />}
          highlight
        />
        <KpiCard 
          title="Remaining Budget" 
          value={`₹${status.remainingSpendable}`} 
          sub={`of ₹${budget.initialSpendable} starting`}
          icon={<Wallet size={24} className="text-blue-400" />}
        />
        <KpiCard 
          title="Locked & Committed" 
          value={`₹${budget.committed}`} 
          sub="Unavailable for spending"
          icon={<Lock size={24} className="text-red-400" />}
        />
        <KpiCard 
          title="Total Spent" 
          value={`₹${status.totalSpent}`} 
          sub="This month so far"
          icon={<AlertCircle size={24} className="text-orange-400" />}
        />
      </div>

      {/* MAIN VISUALIZATION ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* CHART: Budget Split */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-1 p-6 rounded-[2rem] bg-white/[0.02] border border-white/10 relative overflow-hidden"
        >
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" /> Allocation Matrix
          </h3>
          <div className="h-[250px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
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
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', borderRadius: '12px', border: '1px solid #333' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="text-xs text-zinc-500 block">Total Income</span>
                <span className="text-xl font-bold font-mono">₹{budget.income}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* GOALS PROGRESS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 p-6 rounded-[2rem] bg-white/[0.02] border border-white/10"
        >
           <h3 className="font-bold mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" /> Goals Velocity
          </h3>
          
          <div className="space-y-6 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            {goals.length === 0 ? (
              <div className="text-zinc-600 italic text-sm">No active goals tracking.</div>
            ) : (
              goals.map((goal, i) => {
                const percent = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
                return (
                  <div key={i} className="group">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-zinc-300">{goal.name}</span>
                      <span className="font-mono text-zinc-500">
                        ₹{goal.savedAmount} / <span className="text-zinc-600">₹{goal.targetAmount}</span>
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </motion.div>
      </div>

    </div>
  );
}

// Sub-component: Stats Card
function KpiCard({ title, value, sub, icon, highlight }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-6 rounded-[2rem] border backdrop-blur-sm relative overflow-hidden group ${highlight ? 'bg-white/5 border-emerald-500/30' : 'bg-white/[0.02] border-white/5'}`}
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl ${highlight ? 'bg-emerald-500/10' : 'bg-white/5'}`}>
            {icon}
          </div>
          {highlight && <div className="animate-pulse w-2 h-2 bg-emerald-500 rounded-full" />}
        </div>
        <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mb-1">{title}</p>
        <h3 className="text-3xl font-black tracking-tight mb-2">{value}</h3>
        <p className={`text-xs ${highlight ? 'text-emerald-400' : 'text-zinc-600'}`}>{sub}</p>
      </div>
      
      {/* Hover Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
}

// Sub-component: Skeleton Loader
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#050505] p-6 animate-pulse">
      <div className="h-10 w-48 bg-white/10 rounded-xl mb-10" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1,2,3,4].map(i => <div key={i} className="h-40 bg-white/5 rounded-[2rem]" />)}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="h-80 bg-white/5 rounded-[2rem]" />
        <div className="col-span-2 h-80 bg-white/5 rounded-[2rem]" />
      </div>
    </div>
  )
}