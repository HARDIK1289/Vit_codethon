"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Zap, BrainCircuit, Home } from 'lucide-react'; // Added Home Icon
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const [hoveredTab, setHoveredTab] = useState(null);

  // We hide the navbar on Login/Signup, but we SHOW it on '/' if logged in? 
  // Actually, standard practice is to hide this dock on the landing page ('/') 
  // so the landing page feels like a "Cover".
  // But we need it on Dashboard/Pacing/Insights.
  const hiddenRoutes = ['/', '/login', '/signup', '/onboarding'];
  
  // Checks if the current path is in the hidden list
  if (hiddenRoutes.includes(pathname)) return null;

  const navItems = [
    // NEW: Link to Home (The Launchpad)
    { name: 'Launchpad', path: '/', icon: <Home size={22} /> }, 
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={22} /> },
    { name: 'Velocity', path: '/pacing', icon: <Zap size={22} /> },
    { name: 'AI Coach', path: '/insights', icon: <BrainCircuit size={22} /> },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-2 px-3 py-3 rounded-[2rem] bg-[#0A0A0A]/80 border border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/50"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className="relative"
              onMouseEnter={() => setHoveredTab(item.name)}
              onMouseLeave={() => setHoveredTab(null)}
            >
              {/* Tooltip (Name Reveal) */}
              <AnimatePresence>
                {hoveredTab === item.name && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: -12, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-black text-[10px] font-bold rounded-lg whitespace-nowrap pointer-events-none shadow-lg"
                  >
                    {item.name}
                    {/* Tiny triangle pointer */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}>
                
                {/* Active Pill Glow */}
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-white/10 rounded-full border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                
                <div className="relative z-10">
                  {item.icon}
                </div>
              </div>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}