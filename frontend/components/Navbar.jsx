'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import {
  BookCheck, LayoutDashboard, ClipboardList,
  Users, BarChart2, LogOut, Menu, X, ChevronDown, Sun, Moon
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'หน้าหลัก',  icon: LayoutDashboard },
  { href: '/attendance', label: 'เช็คชื่อ', icon: ClipboardList },
  { href: '/students',   label: 'นักเรียน', icon: Users },
  { href: '/reports',    label: 'รายงาน',   icon: BarChart2 },
];

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const [open, setOpen]           = useState(false);
  const [userMenu, setUserMenu]   = useState(false);
  const [teacher, setTeacher]     = useState({});
  const [mounted, setMounted]     = useState(false);
  const [isDark, setIsDark]       = useState(false);

  useEffect(() => {
    setTeacher(JSON.parse(localStorage.getItem('teacher') || '{}'));
    setIsDark(document.documentElement.classList.contains('dark'));
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };

  async function handleLogout() {
    try { await api.logout(); } catch {}
    localStorage.removeItem('teacher');
    router.replace('/login');
  }

  return (
    <nav className="sticky top-0 z-50 glass-header animate-fade-in-up">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary-800 dark:text-primary-300 text-lg group transition-all">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-800 p-1.5 rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.3)] dark:shadow-[0_4px_12px_rgba(37,99,235,0.4)] border border-primary-400/50 dark:border-primary-500/50 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-5deg]">
              <BookCheck className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:block tracking-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">ระบบเช็คชื่อ <span className="text-gold-500 dark:text-gold-400 drop-shadow-sm">IT</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden group
                    ${active 
                      ? 'text-primary-700 dark:text-primary-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] border border-primary-200/50 dark:border-primary-500/30' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400'}`}>
                  {active && <div className="absolute inset-0 bg-gradient-to-r from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 -z-10"></div>}
                  {!active && <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 opacity-0 group-hover:opacity-50 dark:group-hover:opacity-40 transition-opacity duration-300 rounded-xl -z-10 scale-95 group-hover:scale-100"></div>}
                  <Icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-primary-600 dark:text-primary-400 drop-shadow-[0_2px_4px_rgba(37,99,235,0.3)]' : 'text-slate-400 group-hover:text-primary-500 dark:group-hover:text-primary-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 mr-1 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-gold-50 dark:hover:bg-slate-800 hover:text-gold-500 dark:hover:text-gold-400 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
               {mounted && isDark ? <Sun className="w-5 h-5 drop-shadow-sm" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User dropdown */}
            <div className="hidden md:block relative">
              <button onClick={() => setUserMenu(!userMenu)}
                className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm text-sm text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 group">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-500 dark:to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-[0_4px_10px_rgba(37,99,235,0.4)] border border-primary-400/30 transition-transform duration-300 group-hover:scale-105">
                  {mounted ? (teacher.name || 'T').charAt(0) : 'T'}
                </div>
                <span className="hidden lg:block transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-300">{mounted ? (teacher.name || 'ครู') : 'ครู'}</span>
                <ChevronDown className={`w-4 h-4 transition-all duration-300 text-slate-400 group-hover:text-primary-500 ${userMenu ? 'rotate-180 text-primary-600 dark:text-primary-400 translate-y-0.5' : ''}`} />
              </button>
              {userMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-slate-50 mb-1 bg-slate-50/50 dark:bg-slate-800/30 mx-2 rounded-xl">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{mounted ? (teacher.name || 'ผู้ใช้งาน') : 'ผู้ใช้งาน'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{mounted ? teacher.code : ''}</p>
                  </div>
                  <div className="px-2 pt-1">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-600 rounded-lg hover:bg-rose-50 hover:text-rose-700 transition-colors">
                      <LogOut className="w-4 h-4" /> ออกจากระบบ
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800/50 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20" onClick={() => setOpen(!open)}>
              {open ? <X className="w-6 h-6 text-primary-600" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-4 space-y-2 shadow-xl animate-fade-in absolute w-full left-0 z-40">
          <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
             <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                {mounted ? (teacher.name || 'T').charAt(0) : 'T'}
              </div>
              <div>
                 <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{mounted ? (teacher.name || 'ครู') : 'ครู'}</p>
                 <p className="text-xs text-slate-500 dark:text-slate-400">{mounted ? teacher.code : ''}</p>
              </div>
          </div>
          <div className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
                    ${active ? 'bg-primary-50 dark:bg-slate-800 text-primary-700 border border-primary-100/50' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800/50 hover:text-primary-600'}`}>
                  <Icon className={`w-5 h-5 ${active ? 'text-primary-600' : 'text-slate-400'}`} /> {item.label}
                </Link>
              );
            })}
          </div>
          <div className="px-4 py-2 mt-2">
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors">
              <LogOut className="w-5 h-5 opacity-80" /> ออกจากระบบ
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
