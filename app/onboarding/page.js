"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { UploadCloud, ArrowRight, DollarSign, List, Target, Plus, Trash2, X, Calendar } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Modal States
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Temporary Form Data for Modals
  const [newCommitment, setNewCommitment] = useState({ name: '', amount: '', type: 'bill' });
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', months: '' });

  // Main Data
  const [budgetData, setBudgetData] = useState({
    income: "",
    commitments: [],
    goals: [] 
  });

  // --- HANDLERS ---

  const handleAddCommitment = () => {
    if (newCommitment.name && newCommitment.amount) {
      setBudgetData(prev => ({
        ...prev,
        commitments: [...prev.commitments, { ...newCommitment, amount: Number(newCommitment.amount) }]
      }));
      setNewCommitment({ name: '', amount: '', type: 'bill' }); // Reset
      setShowCommitmentModal(false);
    }
  };

  const handleAddGoal = () => {
    if (newGoal.name && newGoal.targetAmount && newGoal.months) {
      setBudgetData(prev => ({
        ...prev,
        goals: [...prev.goals, { 
            name: newGoal.name, 
            targetAmount: Number(newGoal.targetAmount), 
            months: Number(newGoal.months) 
        }]
      }));
      setNewGoal({ name: '', targetAmount: '', months: '' }); // Reset
      setShowGoalModal(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch('/api/onboarding/parse', { method: 'POST', body: formData });
      const data = await res.json();
      
      if (data.success) {
        setBudgetData(prev => ({
          ...prev,
          income: data.data.suggestedIncome || "",
          commitments: data.data.detectedCommitments || []
        }));
        setStep(2); 
      } else {
        // Fallback silently to step 2 if parse fails
        setStep(2);
      }
    } catch (err) {
      console.error(err);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!budgetData.income) {
      alert("Please enter your monthly income."); // Minimal validation alert is okay, or use a toast
      return;
    }

    setLoading(true);
    const payload = {
      income: budgetData.income,
      commitments: budgetData.commitments,
      goals: budgetData.goals
    };

    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.refresh(); 
        router.push('/dashboard');
      } else {
        console.error("Save failed");
      }
    } catch (err) {
      console.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative">
      
      <div className="w-full max-w-2xl relative z-10">
        {/* Progress Bar */}
        <div className="flex justify-between mb-8 px-4">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${step >= num ? 'bg-white text-black border-white' : 'border-zinc-800 text-zinc-800'}`}>
                {num}
              </div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {num === 1 ? 'Scan' : num === 2 ? 'Lock' : 'Dream'}
              </span>
            </div>
          ))}
        </div>

        {/* Wizard Card */}
        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden min-h-[550px] flex flex-col shadow-2xl">
           <AnimatePresence mode='wait'>
             
             {/* STEP 1: UPLOAD */}
             {step === 1 && (
               <motion.div
                 key="step1"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="flex flex-col items-center text-center h-full justify-center flex-1"
               >
                 <div className="w-24 h-24 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                   <UploadCloud size={40} className="text-white" />
                 </div>
                 <h2 className="text-3xl font-bold mb-3">Feed the Engine</h2>
                 <p className="text-zinc-500 mb-8 max-w-md leading-relaxed">
                   Upload your last 6 months' bank statement (PDF). We'll detect your income, recurring bills, and spending patterns automatically.
                 </p>
                 
                 <label className="cursor-pointer group relative overflow-hidden rounded-xl bg-white text-black font-bold px-10 py-5 flex items-center gap-3 hover:scale-105 transition-transform">
                   {loading ? "Analyzing Matrix..." : "Upload Statement"}
                   <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={loading} />
                   {!loading && <ArrowRight size={18} />}
                   {loading && <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />}
                 </label>
                 
                 <button onClick={() => setStep(2)} className="mt-8 text-xs font-bold text-zinc-600 hover:text-white uppercase tracking-widest transition-colors">
                   Skip AI Analysis
                 </button>
               </motion.div>
             )}

             {/* STEP 2: BUDGET & COMMITMENTS */}
             {step === 2 && (
               <motion.div
                 key="step2"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="space-y-8 flex-1 flex flex-col"
               >
                 <h2 className="text-2xl font-bold flex items-center gap-3">
                   <List className="text-purple-500" /> Income & Locks
                 </h2>
                 
                 {/* Income Input */}
                 <div className="space-y-3">
                   <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Monthly Take-Home Income</label>
                   <div className="relative group">
                     <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={18} />
                     <input 
                       type="number" 
                       value={budgetData.income}
                       onChange={(e) => setBudgetData({...budgetData, income: e.target.value})}
                       placeholder="50000"
                       className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-mono text-lg"
                     />
                   </div>
                 </div>

                 {/* Detected Commitments List */}
                 <div className="space-y-3 flex-1 flex flex-col min-h-0">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Recurring Commitments</label>
                      <button 
                        onClick={() => setShowCommitmentModal(true)}
                        className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors"
                      >
                        <Plus size={12}/> Add
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                      {budgetData.commitments.map((c, i) => (
                        <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5 group hover:border-white/20 transition-colors">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{c.name}</span>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wide bg-black/40 px-2 py-0.5 rounded w-fit mt-1">{c.type}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-white font-mono">₹{c.amount}</span>
                            <button 
                              onClick={() => {
                                const newC = [...budgetData.commitments];
                                newC.splice(i, 1);
                                setBudgetData({...budgetData, commitments: newC});
                              }}
                              className="text-zinc-600 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {budgetData.commitments.length === 0 && (
                        <div className="h-full flex items-center justify-center border border-dashed border-white/10 rounded-xl">
                          <p className="text-zinc-600 text-sm">No locked commitments yet.</p>
                        </div>
                      )}
                    </div>
                 </div>

                 <button onClick={() => setStep(3)} className="w-full py-4 bg-white text-black font-bold rounded-xl mt-auto hover:bg-zinc-200 transition-colors">
                   Next Step
                 </button>
               </motion.div>
             )}

             {/* STEP 3: GOALS */}
             {step === 3 && (
               <motion.div
                 key="step3"
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="flex flex-col h-full flex-1"
               >
                 <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
                   <Target className="text-emerald-500" /> Future Goals
                 </h2>
                 
                 <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 custom-scrollbar">
                    {budgetData.goals.length === 0 ? (
                       <div className="flex flex-col items-center justify-center text-center space-y-4 h-40 border border-dashed border-white/10 rounded-xl">
                         <p className="text-zinc-500 text-sm">No future goals set.</p>
                       </div>
                    ) : (
                      budgetData.goals.map((g, i) => (
                        <div key={i} className="p-5 rounded-xl border border-white/10 bg-white/5 flex justify-between items-center group relative overflow-hidden">
                           {/* Subtle background progress bar effect (static for now) */}
                           <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500/20" />
                           
                          <div>
                            <h4 className="font-bold text-lg">{g.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-zinc-400">Target: <span className="text-white">₹{g.targetAmount}</span></span>
                                <span className="text-zinc-600 text-[10px]">•</span>
                                <span className="text-xs text-zinc-400">{g.months} months</span>
                            </div>
                          </div>
                          <div className="text-right">
                             <div className="text-emerald-400 font-mono font-bold text-lg">
                                ~₹{Math.ceil(g.targetAmount / g.months)}
                             </div>
                             <div className="text-[10px] text-zinc-500 uppercase">Per Month</div>
                          </div>
                        </div>
                      ))
                    )}
                    
                    <button 
                      onClick={() => setShowGoalModal(true)}
                      className="w-full p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-emerald-500/10 hover:border-emerald-500/30 cursor-pointer transition-all flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm"
                    >
                      <Plus size={16} /> Add New Goal
                    </button>
                 </div>

                 <div className="mt-auto pt-4 border-t border-white/5">
                    <button 
                      onClick={handleFinalSubmit}
                      disabled={loading} 
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2"
                    >
                      {loading ? (
                        <>Initializing Engine...</>
                      ) : (
                        <>Launch Dashboard <ArrowRight size={18} /></>
                      )}
                    </button>
                    <button onClick={() => setStep(2)} className="w-full mt-4 text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-wider">
                      Back to Commitments
                    </button>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {/* Commitment Modal */}
        {showCommitmentModal && (
            <Modal title="Add Commitment" onClose={() => setShowCommitmentModal(false)}>
                <div className="space-y-4">
                    <Input label="Name" value={newCommitment.name} onChange={e => setNewCommitment({...newCommitment, name: e.target.value})} placeholder="Netflix, Rent, etc." />
                    <Input label="Monthly Amount" type="number" value={newCommitment.amount} onChange={e => setNewCommitment({...newCommitment, amount: e.target.value})} placeholder="0.00" />
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Type</label>
                        <div className="flex gap-2">
                            {['bill', 'subscription', 'emi'].map(t => (
                                <button 
                                    key={t}
                                    onClick={() => setNewCommitment({...newCommitment, type: t})}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-colors ${newCommitment.type === t ? 'bg-white text-black' : 'bg-white/5 text-zinc-500 hover:bg-white/10'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={handleAddCommitment} className="w-full py-3 bg-white text-black font-bold rounded-xl mt-4">Add Lock</button>
                </div>
            </Modal>
        )}

        {/* Goal Modal */}
        {showGoalModal && (
            <Modal title="Add Future Goal" onClose={() => setShowGoalModal(false)}>
                <div className="space-y-4">
                    <Input label="Goal Name" value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} placeholder="MacBook, Trip, etc." />
                    <Input label="Total Target Amount" type="number" value={newGoal.targetAmount} onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})} placeholder="50000" />
                    <Input label="Months to Achieve" type="number" value={newGoal.months} onChange={e => setNewGoal({...newGoal, months: e.target.value})} placeholder="6" />
                    <button onClick={handleAddGoal} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl mt-4 shadow-lg shadow-emerald-900/20">Set Goal</button>
                </div>
            </Modal>
        )}
      </AnimatePresence>

    </div>
  );
}

// --- SUB-COMPONENTS ---

function Modal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-sm bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 relative z-10 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">{title}</h3>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                        <X size={16} />
                    </button>
                </div>
                {children}
            </motion.div>
        </div>
    )
}

function Input({ label, type = "text", value, onChange, placeholder }) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">{label}</label>
            <input 
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
            />
        </div>
    )
}