'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
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
  const teacher = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('teacher') || '{}' : '{}');

  async function handleLogout() {
    try { await api.logout(); } catch {}
    localStorage.removeItem('teacher');
    router.replace('/login');
  }

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-blue-700 text-lg">
            <BookCheck className="w-7 h-7" />
            <span className="hidden sm:block">ระบบเช็คชื่อ IT</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User dropdown */}
          <div className="hidden md:block relative">
            <button onClick={() => setUserMenu(!userMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-sm text-slate-700 font-medium">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {(teacher.name || 'T').charAt(0)}
              </div>
              <span className="hidden lg:block">{teacher.name || 'ครู'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {userMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                <div className="px-4 py-2 border-b border-slate-100 text-xs text-slate-500">{teacher.code}</div>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4" /> ออกจากระบบ
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-slate-50">
                <Icon className="w-4 h-4" /> {item.label}
              </Link>
            );
          })}
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50">
            <LogOut className="w-4 h-4" /> ออกจากระบบ
          </button>
        </div>
      )}
    </nav>
  );
}
