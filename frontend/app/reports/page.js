'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { api } from '../../lib/api';
import { User, TrendingUp, Calendar, FileText, Search } from 'lucide-react';
import CustomDatePicker from '../../components/CustomDatePicker';

const BADGE = {
  'มาเรียน': 'badge-present', 'สาย': 'badge-late',
  'ขาดเรียน': 'badge-absent', 'ลา': 'badge-leave'
};

function DailyReport({ router }) {
  const [date, setDate]       = useState('');
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด');

  useEffect(() => {
    setDate(new Date().toISOString().split('T')[0]);
    api.classes().then(r => setClasses(r.classes || [])).catch(() => router.replace('/login'));
  }, [router]);

  const load = useCallback(async () => {
    if (!date) return;
    setLoading(true); setFilterStatus('ทั้งหมด');
    try { setData(await api.reportDaily(date, classId)); }
    catch(e) { if(e.message.includes('401')) router.replace('/login'); }
    finally { setLoading(false); }
  }, [date, classId, router]);

  useEffect(() => { load(); }, [load]);

  function exportCSV() {
    if(!data?.records?.length) return;
    const rows = [['#','รหัส','ชื่อ','นามสกุล','ห้อง','เวลา','สถานะ','หมายเหตุ']];
    data.records.forEach((r, i) => {
      rows.push([i+1, r.student_id, r.first_name_th, r.last_name_th,
        `${r.class_code} ${r.room}`, r.check_in_time||'', r.status, r.note||'']);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8'}));
    a.download = `daily_${date}.csv`; a.click();
  }

  const counts = data?.counts || {};
  const total  = data?.total || 0;
  
  const filteredRecords = data?.records ? (filterStatus === 'ทั้งหมด' ? data.records : data.records.filter(r => r.status === filterStatus)) : [];

  return (
    <div className="animate-fade-in-up">
      <div className="card mb-6 border border-white/40 dark:border-slate-700 ring-1 ring-slate-100 dark:ring-slate-700 shadow-xl bg-white dark:bg-slate-800 rounded-3xl !p-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 ml-1">วันที่</label>
            <CustomDatePicker dateString={date} onChange={setDate} className="input py-3 shadow-sm font-medium text-slate-700 dark:text-slate-200" />
          </div>
          <div className="flex-1 min-w-[220px]">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 ml-1">ห้องเรียน</label>
            <select className="select py-3 shadow-sm font-medium text-slate-700 dark:text-slate-200" value={classId} onChange={e => setClassId(e.target.value)}>
              <option value="" className="text-slate-400">ทุกห้องเรียนทั้งหมด</option>
              {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code} ห้อง {c.room}</option>)}
            </select>
          </div>
          {data?.records?.length > 0 && (
            <div className="pt-2">
              <button onClick={exportCSV} className="btn-secondary !px-6 !py-3 flex items-center gap-2 font-bold shadow-sm hover:border-primary-300 hover:text-primary-700">
                <span className="text-lg">📥</span> Export CSV
              </button>
            </div>
          )}
        </div>
      </div>

      {total > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label:'ทั้งหมด', val: total, color:'text-slate-800 dark:text-slate-100' },
            { label:'มาเรียน', val: counts['มาเรียน']||0, color:'text-emerald-600 dark:text-emerald-400', bg:'bg-emerald-50 dark:bg-emerald-900/20' },
            { label:'สาย', val: counts['สาย']||0, color:'text-gold-600 dark:text-gold-400', bg:'bg-gold-50 dark:bg-gold-900/20' },
            { label:'ขาดเรียน', val: counts['ขาดเรียน']||0, color:'text-rose-600 dark:text-rose-400', bg:'bg-rose-50 dark:bg-rose-900/20' },
          ].map((s, idx) => (
            <button key={s.label} onClick={() => setFilterStatus(s.label)}
              className={`card text-center py-5 border outline-none cursor-pointer focus:ring-2 focus:ring-primary-500/50 ${filterStatus === s.label ? 'ring-2 ring-primary-500 dark:ring-primary-400 border-transparent shadow-lg bg-slate-50/50 dark:bg-slate-800' : 'border-slate-100 dark:border-slate-700 shadow-md'} flex flex-col items-center justify-center relative overflow-hidden group`}>
              <div className={`absolute inset-0 transition-opacity duration-300 ${filterStatus === s.label ? 'opacity-100 ' + (s.bg || 'bg-slate-50 dark:bg-slate-800/50') : 'opacity-0 group-hover:opacity-100 ' + (s.bg || 'bg-slate-50 dark:bg-slate-800/50')}`}></div>
              <div className={`relative z-10 text-4xl font-black tracking-tight transition-transform duration-300 group-hover:scale-110 ${s.color}`}>{s.val}</div>
              <div className="relative z-10 text-sm font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{s.label}</div>
            </button>
          ))}
        </div>
      )}

      <div className="card !p-0 overflow-hidden shadow-xl border border-slate-100/50 dark:border-slate-700/50">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-4 shadow-sm"></div>
            <p className="font-semibold text-lg text-primary-800 dark:text-primary-400/60">กำลังโหลดข้อมูลรายงาน...</p>
          </div>
        ) : !data?.records?.length ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
             <span className="text-5xl mb-4 grayscale opacity-50">📂</span>
             <p className="font-bold text-lg text-slate-600 dark:text-slate-300">ไม่พบข้อมูลเช็คชื่อในวันที่เลือก</p>
             <p className="text-sm font-medium mt-1">ลองเปลี่ยนวันที่ หรือระบุห้องเรียนอื่น</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#f8fafc] dark:bg-[#0f172a] border-b border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="text-center px-4 py-4 w-16">#</th>
                    <th className="text-left px-4 py-4">รหัสนักเรียน</th>
                    <th className="text-left px-4 py-4">ชื่อ-นามสกุล</th>
                    <th className="text-left px-4 py-4">ห้องเรียน</th>
                    <th className="text-left px-4 py-4">เวลามาถึง</th>
                    <th className="text-center px-4 py-4">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {filteredRecords.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-slate-400 font-medium">ไม่มีข้อมูลในสถานะที่เลือก</td></tr>
                  ) : filteredRecords.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3.5 text-center text-slate-400 font-medium">{i+1}</td>
                      <td className="px-4 py-3.5"><span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md shadow-sm">{r.student_id}</span></td>
                      <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-100 tracking-tight">{r.first_name_th} {r.last_name_th}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-600 dark:text-slate-300">{r.class_code} <span className="opacity-60 text-xs ml-0.5">({r.room})</span></td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 font-medium">{r.check_in_time ? <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-xs border border-slate-200 dark:border-slate-700 shadow-sm">{r.check_in_time}</span> : <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`${BADGE[r.status] || 'badge-absent'} shadow-sm`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-slate-100/80 dark:divide-slate-700/50">
              {filteredRecords.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-medium">ไม่มีข้อมูลในสถานะที่เลือก</div>
              ) : filteredRecords.map((r, i) => (
                <div key={i} className="p-4 flex flex-col gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold flex items-center justify-center text-xs shrink-0 shadow-sm border border-slate-200/50 dark:border-slate-700">{i+1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight truncate">{r.first_name_th} {r.last_name_th}</div>
                        <div className="text-sm font-mono text-slate-500 dark:text-slate-400 mt-0.5 truncate">{r.student_id}</div>
                      </div>
                    </div>
                    <span className={`${BADGE[r.status] || 'badge-absent'} shrink-0 shadow-sm text-xs px-2.5 py-1`}>{r.status}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm font-medium bg-slate-50 dark:bg-slate-800/50 px-3 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700 mt-1 gap-2">
                    <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="opacity-50 text-xs text-slate-400 shrink-0">ห้อง</span> 
                      <span className="truncate">{r.class_code} ({r.room})</span>
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-400 text-xs hidden sm:inline">เวลาถึง:</span>
                      {r.check_in_time ? <span className="bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm text-xs font-mono">{r.check_in_time}</span> : <span className="text-slate-300 dark:text-slate-600">—</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function IndividualReport({ router }) {
  const [studentId, setStudentId] = useState('');
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const search = useCallback(async () => {
    if(!studentId.trim()) return;
    setLoading(true); setError(''); setData(null);
    try { setData(await api.reportIndividual(studentId.trim())); }
    catch(e) {
      if(e.message.includes('401')) { router.replace('/login'); return; }
      if(e.message.includes('404')) setError('ไม่พบนักเรียนรหัสนี้');
      else setError(e.message);
    } finally { setLoading(false); }
  }, [studentId, router]);

  const c = data?.counts || {};
  const pct = data?.pct ?? 0;

  return (
    <div className="animate-fade-in-up">
      <div className="card mb-6 border border-white/40 dark:border-slate-700 ring-1 ring-slate-100 dark:ring-slate-700 shadow-xl bg-white dark:bg-slate-800 rounded-3xl !p-6">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 ml-1">ค้นหานักเรียน <span className="text-slate-400 font-normal ml-2 opacity-80">(กด Enter เพื่อค้นหา)</span></label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" className="input flex-1 py-3 text-base shadow-sm font-medium text-slate-700 dark:text-slate-200" placeholder="รหัสนักเรียน เช่น 67001..."
            value={studentId} onChange={e => setStudentId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()} />
          <button onClick={search} disabled={loading || !studentId.trim()} className="btn-primary sm:w-32 py-3 font-bold text-base shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] disabled:shadow-none flex justify-center items-center">
            {loading ? <span className="animate-spin text-lg inline-block">⏳</span> : 'ค้นหา'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 font-medium text-sm animate-fade-in flex items-center gap-2">
          <span className="text-lg">❌</span> {error}
        </div>
      )}

      {data && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="card flex flex-col md:flex-row items-center md:items-start gap-6 border border-white/40 dark:border-slate-700 shadow-lg">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-50 border border-primary-200 rounded-full flex items-center justify-center shadow-inner shrink-0">
              <User className="w-10 h-10 text-primary-500" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                {data.student.first_name_th} {data.student.last_name_th}
              </h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold font-mono shadow-sm">รหัส {data.student.student_id}</span>
                <span className="bg-primary-50 dark:bg-slate-800 border border-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">แผนก {data.student.dept_name_th}</span>
                <span className="bg-gold-50 dark:bg-slate-800 border border-gold-200 text-gold-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">ห้อง {data.student.class_code} {data.student.room}</span>
              </div>
            </div>
            <div className="text-center md:text-right w-full md:w-auto mt-4 md:mt-0 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="text-4xl font-black text-primary-600 drop-shadow-sm leading-none">{pct}%</div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-wider">อัตราการเข้าเรียน</div>
              <div className="h-2.5 w-full md:w-32 mt-3 rounded-full bg-slate-200 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-gold-50 dark:bg-slate-8000' : 'bg-rose-500'}`} style={{width:`${pct}%`}} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label:'ทั้งหมดที่เรียน', val: c.total||0, icon:'🕒' },
              { label:'มาเรียน', val: c['มาเรียน']||0, color:'text-emerald-600', icon:'✅' },
              { label:'ขาดเรียน', val: c['ขาดเรียน']||0, color:'text-rose-600', icon:'❌' },
              { label:'สาย', val: c['สาย']||0, color:'text-gold-600', icon:'⚠️' },
            ].map(s => (
              <div key={s.label} className="card text-center py-5 shadow-md border border-slate-100/60 dark:border-slate-700/60 bg-white dark:bg-slate-800">
                 <div className="text-xl mb-1 opacity-80">{s.icon}</div>
                <div className={`text-3xl font-black tracking-tight ${s.color||'text-slate-800 dark:text-slate-100'}`}>{s.val}</div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="card p-0 overflow-hidden shadow-xl border border-slate-100/50 dark:border-slate-700/50">
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 text-sm tracking-wide">
              <span>📋</span> ประวัติการเข้าเรียนล่าสุด
            </div>
            <>
              <div className="hidden md:block overflow-x-auto max-h-[400px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white dark:bg-slate-800 shadow-[0_1px_0px_#f1f5f9] dark:shadow-[0_1px_0px_#1e293b] z-10">
                    <tr className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-wider">
                      <th className="text-left px-6 py-4">วันที่</th>
                      <th className="text-left px-6 py-4">สถานะ</th>
                      <th className="text-left px-6 py-4">เวลาลงชื่อ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80 dark:divide-slate-700/50">
                    {data.records.length === 0 ? (
                      <tr><td colSpan={3} className="text-center py-12 text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-800/30">ยังไม่มีประวัติการเช็คชื่อ</td></tr>
                    ) : data.records.map((r, i) => (
                      <tr key={i} className="hover:bg-primary-50/30 transition-colors">
                        <td className="px-6 py-3.5 font-medium text-slate-700 dark:text-slate-200">
                          {new Date(r.date).toLocaleDateString('th-TH', { weekday:'short', year:'numeric', month:'short', day:'numeric' })}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`${BADGE[r.status]||'badge-absent'} shadow-sm`}>{r.status}</span>
                        </td>
                        <td className="px-6 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {r.check_in_time ? <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">{r.check_in_time}</span> : <span className="text-slate-300">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y divide-slate-100/80 dark:divide-slate-700/50 max-h-[400px] overflow-y-auto w-full">
                {data.records.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-800/30">ยังไม่มีประวัติการเช็คชื่อ</div>
                ) : data.records.map((r, i) => (
                  <div key={i} className="p-4 flex justify-between items-center gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">
                        {new Date(r.date).toLocaleDateString('th-TH', { weekday:'short', year:'numeric', month:'short', day:'numeric' })}
                      </div>
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 truncate">
                        <span className="opacity-70 shrink-0">⌚</span> {r.check_in_time ? <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{r.check_in_time}</span> : '—'}
                      </div>
                    </div>
                    <span className={`${BADGE[r.status]||'badge-absent'} shrink-0 shadow-sm text-xs px-3 py-1`}>{r.status}</span>
                  </div>
                ))}
              </div>
            </>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [tab, setTab] = useState('daily');

  useEffect(() => {
    if (tabParam === 'individual' || tabParam === 'daily') setTab(tabParam);
  }, [tabParam]);

  const handleTabChange = (t) => {
    setTab(t);
    router.replace(`/reports?tab=${t}`, { scroll: false });
  };

  return (
      <main className="max-w-6xl mx-auto px-4 py-8 animate-fade-in-up">
        {/* Header & Tabs */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-inner">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">รายงานและสถิติ</h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">ดูรายงานการเข้าเรียนแบบรายวันหรือรายบุคคล</p>
            </div>
          </div>
          
          <div className="flex p-1 bg-slate-200/50 rounded-xl w-full max-w-sm">
            <button 
              onClick={() => handleTabChange('daily')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${tab === 'daily' ? 'bg-white dark:bg-slate-800 text-primary-700 shadow-sm ring-1 ring-black/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 hover:bg-white/50'}`}>
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" /> ประจำวัน
              </div>
            </button>
            <button 
              onClick={() => handleTabChange('individual')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${tab === 'individual' ? 'bg-white dark:bg-slate-800 text-gold-700 shadow-sm ring-1 ring-black/5' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 hover:bg-white/50'}`}>
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-4 h-4" /> รายบุคคล
              </div>
            </button>
          </div>
        </div>

        {/* Render Active Tab */}
        {tab === 'daily' && <DailyReport router={router} />}
        {tab === 'individual' && <IndividualReport router={router} />}
        
      </main>
  );
}

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-[#f4f6f8] dark:bg-[#0f172a]">
      <Navbar />
      <Suspense fallback={<div className="p-16 text-center text-primary-500 font-medium flex justify-center"><span className="animate-spin w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full"></span></div>}>
        <ReportsContent />
      </Suspense>
    </div>
  );
}
