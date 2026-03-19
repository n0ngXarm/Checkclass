'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Users, CheckCircle, Clock, XCircle, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function StatCard({ title, value, icon: Icon, color, bg }) {
  return (
    <div className={`card flex items-center gap-4 border-l-4 ${color}`}>
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData]     = useState(null);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.dashboard();
      setData(res);
    } catch(err) {
      if(err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        router.replace('/login');
      } else {
        setError(err.message);
      }
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  if(loading) return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="animate-spin text-4xl mb-2">⏳</div>
        <p>กำลังโหลด...</p>
      </div>
    </>
  );

  if(error) return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-red-500">{error}</div>
    </>
  );

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">แผงควบคุม</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {data?.semester?.semester_name_th || 'ยังไม่ได้ตั้งค่าภาคเรียน'} • {new Date().toLocaleDateString('th-TH')}
            </p>
          </div>
          <Link href="/attendance" className="btn-primary flex items-center gap-2">
            เช็คชื่อวันนี้ <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="นักเรียนทั้งหมด" value={data?.total_students ?? '–'} icon={Users}
            color="border-blue-500" bg="bg-blue-50 text-blue-600" />
          <StatCard title="มาเรียนวันนี้" value={data?.present_today ?? '–'} icon={CheckCircle}
            color="border-green-500" bg="bg-green-50 text-green-600" />
          <StatCard title="มาสายวันนี้" value={data?.late_today ?? '–'} icon={Clock}
            color="border-yellow-500" bg="bg-yellow-50 text-yellow-600" />
          <StatCard title="ขาดเรียนวันนี้" value={data?.absent_today ?? '–'} icon={XCircle}
            color="border-red-500" bg="bg-red-50 text-red-600" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-slate-800">แนวโน้มการเข้าเรียน 7 วันล่าสุด</h2>
            </div>
            {data?.trends?.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data.trends.map(t => ({
                  date: t.date ? new Date(t.date).toLocaleDateString('th-TH', { day:'numeric', month:'short' }) : t.date,
                  มาเรียน: Number(t.present),
                  ขาดเรียน: Number(t.absent),
                }))}>
                  <defs>
                    <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"   stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%"  stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gAbsent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"   stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%"  stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="มาเรียน" stroke="#22c55e" fill="url(#gPresent)" strokeWidth={2} />
                  <Area type="monotone" dataKey="ขาดเรียน" stroke="#ef4444" fill="url(#gAbsent)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                ยังไม่มีข้อมูลการเช็คชื่อในภาคเรียนนี้
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="card flex flex-col gap-3">
            <h2 className="font-semibold text-slate-800 mb-1">เมนูด่วน</h2>
            {[
              { href: '/attendance', label: 'เช็คชื่อวันนี้', desc: new Date().toLocaleDateString('th-TH'), color: 'bg-blue-600 hover:bg-blue-700' },
              { href: '/reports/daily', label: 'รายงานประจำวัน', desc: 'ดูสรุปรายวัน', color: 'bg-green-600 hover:bg-green-700' },
              { href: '/students', label: 'จัดการนักเรียน', desc: `${data?.total_students ?? 0} คนในระบบ`, color: 'bg-indigo-600 hover:bg-indigo-700' },
              { href: '/reports/individual', label: 'รายงานรายบุคคล', desc: 'ตรวจสอบรายคน', color: 'bg-slate-600 hover:bg-slate-700' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className={`${item.color} text-white rounded-xl p-4 flex items-center justify-between transition-colors`}>
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-75 mt-0.5">{item.desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 opacity-75" />
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
