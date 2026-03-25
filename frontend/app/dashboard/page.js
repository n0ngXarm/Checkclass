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
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-0.5">{title}</p>
        <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100/50 dark:border-slate-700/50">
        <p className="font-semibold text-slate-800 dark:text-slate-100 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <span className="text-sm text-slate-600 dark:text-slate-300">{entry.name}:</span>
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
    <div className="min-h-screen bg-[#f4f6f8] dark:bg-[#0f172a]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-32 flex flex-col items-center justify-center text-slate-400 animate-pulse-subtle">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-5 shadow-sm"></div>
        <p className="font-semibold text-lg text-primary-800 dark:text-primary-400/60 tracking-tight">กำลังโหลดแผงควบคุม...</p>
      </div>
    </div>
  );

  if(error) return (
    <div className="min-h-screen bg-[#f4f6f8] dark:bg-[#0f172a]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-brown-50 dark:bg-slate-800 text-brown-700 p-6 rounded-3xl flex flex-col items-center justify-center text-center max-w-lg mx-auto border border-brown-200 shadow-sm animate-fade-in-up">
           <XCircle className="w-14 h-14 mb-4 text-brown-500 drop-shadow-sm" />
           <p className="font-semibold text-lg">{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f6f8] dark:bg-[#0f172a]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 animate-fade-in-up">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-900 to-primary-700 dark:from-primary-400 dark:to-primary-200 tracking-tight">แผงควบคุม</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-gold-400 shadow-sm"></span>
              {data?.semester?.semester_name_th || 'ยังไม่ได้ตั้งค่าภาคเรียน'} • {new Date().toLocaleDateString('th-TH', { dateStyle: 'long' })}
            </p>
          </div>
          <Link href="/attendance" className="group rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] hover:shadow-[0_8px_25px_-4px_rgba(16,185,129,0.6)] hover:-translate-y-0.5 min-w-[200px] px-10 py-3.5 text-lg">
            เช็คชื่อวันนี้ <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard title="นักเรียนทั้งหมด" value={data?.total_students ?? '–'} icon={Users}
            color="text-slate-700 dark:text-slate-200" bg="bg-slate-100 dark:bg-slate-800" gradient="bg-gradient-to-b from-slate-400 to-slate-500" />
          <StatCard title="มาเรียนวันนี้" value={data?.present_today ?? '–'} icon={CheckCircle}
            color="text-primary-700" bg="bg-primary-100" gradient="bg-gradient-to-b from-primary-500 to-primary-600" />
          <StatCard title="มาสายวันนี้" value={data?.late_today ?? '–'} icon={Clock}
            color="text-gold-600" bg="bg-gold-100" gradient="bg-gradient-to-b from-gold-400 to-gold-500" />
          <StatCard title="ขาดเรียนวันนี้" value={data?.absent_today ?? '–'} icon={XCircle}
            color="text-brown-700" bg="bg-brown-100" gradient="bg-gradient-to-b from-brown-500 to-brown-700" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chart */}
          <div className="lg:col-span-2 card flex flex-col hover:shadow-xl transition-shadow duration-500">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                 <div className="p-3 bg-primary-50 dark:bg-slate-800 rounded-2xl text-primary-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] border border-primary-100/50">
                   <TrendingUp className="w-6 h-6" />
                 </div>
                 <div>
                   <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">แนวโน้มการเข้าเรียน</h2>
                   <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">ข้อมูลย้อนหลัง 7 วันล่าสุด</p>
                 </div>
               </div>
            </div>
            {data?.trends?.length > 0 ? (
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={data.trends.map(t => ({
                    date: t.date ? new Date(t.date).toLocaleDateString('th-TH', { day:'numeric', month:'short' }) : t.date,
                    มาเรียน: Number(t.present),
                    มาสาย: Number(t.late),
                    ขาดเรียน: Number(t.absent),
                  }))} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"   stopColor="#2563eb" stopOpacity={0.25} />
                        <stop offset="95%"  stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gLate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"   stopColor="#d97706" stopOpacity={0.25} />
                        <stop offset="95%"  stopColor="#d97706" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gAbsent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"   stopColor="#78350f" stopOpacity={0.2} />
                        <stop offset="95%"  stopColor="#78350f" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={12} minTickGap={15} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dx={-5} width={40} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 600 }} />
                    <Area type="monotone" dataKey="มาเรียน" stroke="#2563eb" fill="url(#gPresent)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0, fill: '#1d4ed8' }} />
                    <Area type="monotone" dataKey="มาสาย" stroke="#d97706" fill="url(#gLate)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0, fill: '#b45309' }} />
                    <Area type="monotone" dataKey="ขาดเรียน" stroke="#78350f" fill="url(#gAbsent)" strokeWidth={3} activeDot={{ r: 6, strokeWidth: 0, fill: '#451a03' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 min-h-[300px] border-2 border-dashed border-slate-200/60 rounded-3xl bg-slate-50/50 dark:bg-slate-800/30">
                <BarChart2 className="w-14 h-14 mb-4 text-slate-300" />
                <p className="font-semibold text-lg">ยังไม่มีข้อมูลการเช็คชื่อในภาคเรียนนี้</p>
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-3 flex items-center gap-3">
               <div className="w-2.5 h-7 bg-gradient-to-b from-gold-400 to-gold-600 rounded-full shadow-sm"></div>
               เมนูด่วน
            </h2>
            {[
              { href: '/attendance', label: 'เริ่มเช็คชื่อวันนี้', desc: new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' }), color: 'bg-gradient-to-br from-primary-600 to-primary-800', shadow: 'shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)]' },
              { href: '/reports?tab=daily', label: 'รายงานประจำวัน', desc: 'ดูสรุปการเข้าเรียนของวันนี้', color: 'bg-gradient-to-br from-gold-500 to-gold-600', shadow: 'shadow-[0_8px_20px_-6px_rgba(251,191,36,0.4)]' },
              { href: '/students', label: 'จัดการข้อมูลนักเรียน', desc: `ดูแลนักเรียน ${data?.total_students ?? 0} คน`, color: 'bg-gradient-to-br from-brown-600 to-brown-800', shadow: 'shadow-[0_8px_20px_-6px_rgba(146,64,14,0.4)]' },
              { href: '/reports?tab=individual', label: 'รายงานรายบุคคล', desc: 'ตรวจสอบประวัติรายบุคคล', color: 'bg-gradient-to-br from-slate-700 to-slate-900', shadow: 'shadow-[0_8px_20px_-6px_rgba(15,23,42,0.4)]' },
            ].map((item, idx) => (
              <Link key={item.href} href={item.href}
                className={`${item.color} text-white rounded-3xl p-5 flex items-center justify-between transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 shadow-xl ${item.shadow} group relative overflow-hidden ring-1 ring-white/10`}>
                <div className="absolute -right-8 -top-8 w-28 h-28 bg-white/20 rounded-full blur-2xl transition-all duration-500 group-hover:bg-white/30 group-hover:scale-110"></div>
                <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-black/10 rounded-full blur-xl"></div>
                <div className="relative z-10">
                  <div className="font-bold text-lg tracking-tight shadow-sm">{item.label}</div>
                  <div className="text-sm text-white/90 font-medium mt-1">{item.desc}</div>
                </div>
                <div className="relative z-10 w-11 h-11 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md group-hover:bg-white/30 transition-all shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]">
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
