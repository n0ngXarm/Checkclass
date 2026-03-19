'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { api } from '../../lib/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Users, CheckCircle, Clock, XCircle, TrendingUp, ArrowRight, BarChart2 } from 'lucide-react';
import Link from 'next/link';

function StatCard({ title, value, icon: Icon, color, bg, gradient }) {
  return (
    <div className={`card group relative overflow-hidden flex items-center gap-4 border-none !p-5`}>
      <div className={`absolute top-0 left-0 w-1.5 h-full ${gradient}`}></div>
      <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
        <Icon className={`w-7 h-7 ${color}`} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-0.5">{title}</p>
        <p className="text-3xl font-bold text-slate-800 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100/50">
        <p className="font-semibold text-slate-800 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <span className="text-sm text-slate-600">{entry.name}:</span>
            <span className="text-sm font-bold" style={{ color: entry.color }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

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
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-32 flex flex-col items-center justify-center text-slate-400 animate-pulse-subtle">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="font-medium text-lg">กำลังโหลดแผงควบคุม...</p>
      </div>
    </div>
  );

  if(error) return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl flex flex-col items-center justify-center text-center max-w-lg mx-auto border border-rose-100 shadow-sm animate-fade-in-up">
           <XCircle className="w-12 h-12 mb-3 text-rose-500" />
           <p className="font-medium">{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 animate-fade-in-up">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">แผงควบคุม</h1>
            <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-500"></span>
              {data?.semester?.semester_name_th || 'ยังไม่ได้ตั้งค่าภาคเรียน'} • {new Date().toLocaleDateString('th-TH', { dateStyle: 'long' })}
            </p>
          </div>
          <Link href="/attendance" className="btn-primary group">
            เช็คชื่อวันนี้ <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard title="นักเรียนทั้งหมด" value={data?.total_students ?? '–'} icon={Users}
            color="text-blue-600" bg="bg-blue-50" gradient="bg-gradient-to-b from-blue-400 to-blue-600" />
          <StatCard title="มาเรียนวันนี้" value={data?.present_today ?? '–'} icon={CheckCircle}
            color="text-emerald-600" bg="bg-emerald-50" gradient="bg-gradient-to-b from-emerald-400 to-emerald-600" />
          <StatCard title="มาสายวันนี้" value={data?.late_today ?? '–'} icon={Clock}
            color="text-amber-500" bg="bg-amber-50" gradient="bg-gradient-to-b from-amber-400 to-amber-500" />
          <StatCard title="ขาดเรียนวันนี้" value={data?.absent_today ?? '–'} icon={XCircle}
            color="text-rose-500" bg="bg-rose-50" gradient="bg-gradient-to-b from-rose-400 to-rose-600" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chart */}
          <div className="lg:col-span-2 card !p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                   <TrendingUp className="w-5 h-5" />
                 </div>
                 <div>
                   <h2 className="text-lg font-bold text-slate-800 tracking-tight">แนวโน้มการเข้าเรียน</h2>
                   <p className="text-xs text-slate-500 font-medium mt-0.5">ข้อมูลย้อนหลัง 7 วันล่าสุด</p>
                 </div>
               </div>
            </div>
            {data?.trends?.length > 0 ? (
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.trends.map(t => ({
                    date: t.date ? new Date(t.date).toLocaleDateString('th-TH', { day:'numeric', month:'short' }) : t.date,
                    มาเรียน: Number(t.present),
                    ขาดเรียน: Number(t.absent),
                  }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"   stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%"  stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gAbsent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"   stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%"  stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px', fontWeight: 500 }} />
                    <Area type="monotone" dataKey="มาเรียน" stroke="#10b981" fill="url(#gPresent)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                    <Area type="monotone" dataKey="ขาดเรียน" stroke="#f43f5e" fill="url(#gAbsent)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0, fill: '#f43f5e' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 min-h-[300px] border-2 border-dashed border-slate-100 rounded-2xl">
                <BarChart2 className="w-12 h-12 mb-3 text-slate-300" />
                <p className="font-medium">ยังไม่มีข้อมูลการเช็คชื่อในภาคเรียนนี้</p>
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-2 flex items-center gap-2">
               <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
               เมนูด่วน
            </h2>
            {[
              { href: '/attendance', label: 'เริ่มเช็คชื่อวันนี้', desc: new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' }), color: 'bg-gradient-to-br from-indigo-500 to-blue-600', shadow: 'shadow-indigo-500/20' },
              { href: '/reports/daily', label: 'รายงานประจำวัน', desc: 'ดูสรุปการเข้าเรียนของวันนี้', color: 'bg-gradient-to-br from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
              { href: '/students', label: 'จัดการข้อมูลนักเรียน', desc: `ดูแลนักเรียน ${data?.total_students ?? 0} คน`, color: 'bg-gradient-to-br from-blue-500 to-cyan-600', shadow: 'shadow-blue-500/20' },
              { href: '/reports/individual', label: 'รายงานรายบุคคล', desc: 'ตรวจสอบประวัติรายบุคคล', color: 'bg-gradient-to-br from-slate-700 to-slate-800', shadow: 'shadow-slate-500/20' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className={`${item.color} text-white rounded-2xl p-5 flex items-center justify-between transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 shadow-lg ${item.shadow} group relative overflow-hidden`}>
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-xl transition-all duration-500 group-hover:bg-white/20"></div>
                <div className="relative z-10">
                  <div className="font-bold text-lg">{item.label}</div>
                  <div className="text-sm text-white/80 font-medium mt-1">{item.desc}</div>
                </div>
                <div className="relative z-10 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
