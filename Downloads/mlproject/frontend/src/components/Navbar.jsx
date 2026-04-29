import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, History, GitCompare, Bell, BookOpen } from 'lucide-react';

export default function Navbar() {
  const [time, setTime] = useState(new Date());
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'History', path: '/history', icon: <History size={18} /> },
    { name: 'Compare', path: '/compare', icon: <GitCompare size={18} /> },
    { name: 'Alerts', path: '/alerts', icon: <Bell size={18} /> },
    { name: 'Report', path: '/report', icon: <BookOpen size={18} /> }
  ];

  const istFormat = time.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });

  // NSE timings: 9:15 AM to 3:30 PM IST (approx check)
  const hour = time.getUTCHours() + 5; // roughly
  const isOpen = (hour >= 9 && hour <= 15);

  return (
    <nav className="w-full bg-[#0A0E1A] border-b border-[#1E2D4F] text-text px-6 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-2">
        <Activity className="text-accent" />
        <span className="font-bold text-lg tracking-wide">StockSense AI <span className="text-xs bg-surface2 px-2 py-0.5 rounded text-muted ml-2">v2.0 BETA</span></span>
      </div>

      <div className="hidden md:flex space-x-6">
        {links.map(l => (
          <Link key={l.path} to={l.path} className={`flex items-center space-x-2 text-sm font-medium transition-all ${location.pathname === l.path ? 'text-accent border-b-2 border-accent pb-1' : 'text-textMuted hover:text-text'}`}>
            {l.icon}
            <span>{l.name}</span>
          </Link>
        ))}
      </div>

      <div className="flex flex-col items-end text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="text-textMuted">{istFormat} IST</span>
        </div>
        <div className="flex items-center space-x-1 mt-1">
          <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-bullish animate-pulse' : 'bg-bearish'}`} />
          <span className={isOpen ? 'text-bullish' : 'text-bearish'}>
            {isOpen ? 'NSE LIVE' : 'NSE CLOSED'}
          </span>
        </div>
      </div>
    </nav>
  );
}
