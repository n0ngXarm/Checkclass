'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { api } from '../../lib/api';
import Link from 'next/link';
import { BarChart2, FileText, User } from 'lucide-react';

export default function ReportsPage() {
  const router = useRouter();
  useEffect(() => { api.me().catch(() => router.replace('/login')); }, [router]);
  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <BarChart2 className="w-7 h-7 text-green-600" />
          <h1 className="text-2xl font-bold text-slate-800">รายงาน</h1>
        </div>
        <div className="grid gap-4">
          <Link href="/reports/daily"
            className="card flex items-center gap-4 hover:border-green-300 hover:shadow-md transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">รายงานประจำวัน</h2>
              <p className="text-sm text-slate-500">สรุปการเข้าเรียนรายวัน พร้อม export CSV</p>
            </div>
          </Link>
          <Link href="/reports/individual"
            className="card flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">รายงานรายบุคคล</h2>
              <p className="text-sm text-slate-500">ประวัติการเช็คชื่อและสถิติของนักเรียนแต่ละคน</p>
            </div>
          </Link>
        </div>
      </main>
    </>
  );
}
