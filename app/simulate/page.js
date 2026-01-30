"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Terminal, Zap, ArrowLeft, Save, AlertTriangle } from 'lucide-react';

export default function SimulatorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]); // Console logs for the UI

  // Form State
  const [form, setForm] = useState({
    amount: '',
    category: 'Food & Dining',
    description: '',
  });

  const categories = [
    "Food & Dining", "Transportation", "Shopping", "Entertainment", "Healthcare", "Travel"
  ];

  const handleInject = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      amount: form.amount,
      category: form.category,
      description: form.description || `Simulated ${form.category}`,
      date: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Add to local terminal logs
        const newLog = `> [SUCCESS] Transaction ID: ${data.id} | -₹${payload.amount}`;
        setLogs(prev => [newLog, ...prev]);
        setForm({ ...form, amount: '', description: '' }); // Reset amount
      } else {
        setLogs(prev => [`> [ERROR] ${data.error}`, ...prev]);
      }
    } catch (err) {
      setLogs(prev => [`> [FATAL] Network Error`, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-6 flex flex-col items-center">
      
      {/* Navbar for Sim */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 border-b border-green-900 pb-4">
        <div className="flex items-center gap-2">
            <Terminal size={20} />
            <span className="font-bold tracking-widest">TRANSACTION_INJECTOR_V1</span>
        </div>
        <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 hover:text-white transition-colors text-sm"
        >
            <ArrowLeft size={16} /> EXIT TO DASHBOARD
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        
        {/* CONTROL PANEL (Left) */}
        <div className="border border-green-900 bg-green-900/10 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                <Zap size={18} className="text-yellow-400" /> INJECT LOAD
            </h2>
            
            <form onSubmit={handleInject} className="space-y-6">
                <div>
                    <label className="block text-xs uppercase mb-2 text-green-700">Amount (INR)</label>
                    <input 
                        type="number" 
                        required
                        value={form.amount}
                        onChange={e => setForm({...form, amount: e.target.value})}
                        className="w-full bg-black border border-green-800 p-3 text-white focus:outline-none focus:border-green-500 text-lg"
                        placeholder="0.00"
                    />
                </div>

                <div>
                    <label className="block text-xs uppercase mb-2 text-green-700">Category</label>
                    <div className="grid grid-cols-2 gap-2">
                        {categories.map(cat => (
                            <button
                                type="button"
                                key={cat}
                                onClick={() => setForm({...form, category: cat})}
                                className={`text-xs border p-2 text-left transition-all ${form.category === cat ? 'bg-green-500 text-black border-green-500 font-bold' : 'border-green-900 text-green-600 hover:border-green-700'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs uppercase mb-2 text-green-700">Description (Optional)</label>
                    <input 
                        type="text" 
                        value={form.description}
                        onChange={e => setForm({...form, description: e.target.value})}
                        className="w-full bg-black border border-green-800 p-3 text-sm text-white focus:outline-none focus:border-green-500"
                        placeholder="e.g. Starbucks Impulse"
                    />
                </div>

                <button 
                    disabled={loading}
                    type="submit"
                    className="w-full bg-green-600 text-black font-bold py-4 hover:bg-green-500 transition-colors flex justify-center items-center gap-2 uppercase tracking-wider"
                >
                    {loading ? "INJECTING..." : "EXECUTE TRANSACTION"}
                </button>
            </form>
        </div>

        {/* LOG OUTPUT (Right) */}
        <div className="flex flex-col gap-4">
            {/* Warning Box */}
            <div className="border border-yellow-900/50 bg-yellow-900/10 p-4 rounded-lg flex items-start gap-3 text-yellow-500/80 text-xs">
                <AlertTriangle size={16} className="shrink-0" />
                <p>
                    CAUTION: Data injected here affects the main engine immediately. 
                    This simulates real bank API webhooks.
                </p>
            </div>

            {/* Terminal Window */}
            <div className="flex-1 border border-green-900 bg-black p-4 font-mono text-sm overflow-y-auto h-[400px] rounded-lg relative">
                <div className="absolute top-2 right-2 text-[10px] text-green-800">SYS.LOG</div>
                <div className="space-y-2">
                    <p className="opacity-50">System Ready...</p>
                    <p className="opacity-50"> Waiting for input...</p>
                    {logs.map((log, i) => (
                        <motion.p 
                            key={i} 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }}
                            className="text-white border-l-2 border-green-500 pl-2"
                        >
                            {log}
                        </motion.p>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}