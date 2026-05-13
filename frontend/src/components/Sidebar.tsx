"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Upload, BookOpen, Layers, MessageSquare, Sparkles, Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: BookOpen },
    { href: '/upload', label: 'Upload Notes', icon: Upload },
    { href: '/quiz', label: 'Quizzes', icon: Layers },
    { href: '/flashcards', label: 'Flashcards', icon: Sparkles },
    { href: '/chat', label: 'AI Chat', icon: MessageSquare },
  ];

  // Close sidebar on route change on mobile
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-6 right-6 z-[60] p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/20 dark:bg-black/40 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-r border-gray-200 dark:border-white/10 p-6 flex flex-col gap-6 fixed h-full z-50 shadow-[20px_0_40px_rgba(0,0,0,0.05)] transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
          Neuro<span className="text-blue-600">Learn</span>
        </h1>
        <ThemeToggle />
      </div>
      <nav className="flex flex-col gap-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold' 
                  : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Icon size={20} /> {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
    </>
  );
}
