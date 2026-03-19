'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import {
  BookCheck, LayoutDashboard, ClipboardList,
  Users, BarChart2, LogOut, Menu, X, ChevronDown
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

  useEffect(() => {
    setTeacher(JSON.parse(localStorage.getItem('teacher') || '{}'));
    setMounted(true);
  }, []);

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
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-indigo-700 text-lg hover:opacity-80 transition-opacity">
            <div className="bg-indigo-100 p-1.5 rounded-xl">
              <BookCheck className="w-6 h-6 text-indigo-700" />
            </div>
            <span className="hidden sm:block">ระบบเช็คชื่อ IT</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                    ${active 
                      ? 'bg-indigo-50/80 text-indigo-700 shadow-sm border border-indigo-100' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
                  <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-500'}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User dropdown */}
          <div className="hidden md:block relative">
            <button onClick={() => setUserMenu(!userMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors text-sm text-slate-700 font-medium focus:outline-none">
              <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md">
                {mounted ? (teacher.name || 'T').charAt(0) : 'T'}
              </div>
              <span className="hidden lg:block">{mounted ? (teacher.name || 'ครู') : 'ครู'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${userMenu ? 'rotate-180' : ''}`} />
            </button>
            {userMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-100/60 mb-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">{mounted ? (teacher.name || 'ผู้ใช้งาน') : 'ผู้ใช้งาน'}</p>
                  <p className="text-xs text-slate-500 truncate">{mounted ? teacher.code : ''}</p>
                </div>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors">
                  <LogOut className="w-4 h-4" /> ออกจากระบบ
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-2 shadow-xl animate-fade-in absolute w-full left-0">
          <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-slate-50/50 rounded-xl border border-slate-100">
             <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                {mounted ? (teacher.name || 'T').charAt(0) : 'T'}
              </div>
              <div>
                 <p className="text-sm font-semibold text-slate-800">{mounted ? (teacher.name || 'ครู') : 'ครู'}</p>
                 <p className="text-xs text-slate-500">{mounted ? teacher.code : ''}</p>
              </div>
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
                <Icon className={`w-5 h-5 ${active ? 'text-indigo-600' : 'text-slate-400'}`} /> {item.label}
              </Link>
            );
          })}
          <div className="h-px bg-slate-100 my-2"></div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors">
            <LogOut className="w-5 h-5 opacity-80" /> ออกจากระบบ
          </button>
        </div>
      )}
    </nav>
  );
}
