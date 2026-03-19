'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { User, TrendingUp } from 'lucide-react';

const BADGE = {
  'มาเรียน': 'badge-present', 'สาย': 'badge-late',
  'ขาดเรียน': 'badge-absent', 'ลา': 'badge-leave'
};

export default function IndividualReportPage() {
  const router = useRouter();
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
  const pctColor = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold text-slate-800">รายงานรายบุคคล</h1>
        </div>

        <div className="card mb-5">
          <label className="block text-sm font-medium text-slate-700 mb-2">รหัสนักเรียน</label>
          <div className="flex gap-3">
            <input type="text" className="input flex-1" placeholder="เช่น 67001..."
              value={studentId} onChange={e => setStudentId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()} />
            <button onClick={search} disabled={loading || !studentId.trim()} className="btn-primary px-6">
              {loading ? 'ค้นหา...' : 'ค้นหา'}
            </button>
          </div>
        </div>

        {error && <div className="card mb-5 p-4 text-red-700 bg-red-50">{error}</div>}

        {data && (
          <>
            {/* Profile card */}
            <div className="card mb-5 flex flex-wrap items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                <User className="w-7 h-7 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-800">
                  {data.student.first_name_th} {data.student.last_name_th}
                </h2>
                <p className="text-sm text-slate-500">
                  {data.student.student_id} · {data.student.class_code} {data.student.room} · {data.student.dept_name_th}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-800">{pct}%</div>
                <div className="text-xs text-slate-500">อัตราการเข้าเรียน</div>
                <div className={`h-1.5 w-24 mt-2 rounded-full ${pct >= 80 ? 'bg-green-100' : pct >= 60 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                  <div className={`h-full rounded-full ${pctColor} transition-all`} style={{width:`${pct}%`}} />
                </div>
              </div>
            </div>

            {/* Stat mini cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { label:'ทั้งหมด', val: c.total||0 },
                { label:'มาเรียน', val: c['มาเรียน']||0, cls:'text-green-700' },
                { label:'ขาดเรียน', val: c['ขาดเรียน']||0, cls:'text-red-700' },
                { label:'สาย', val: c['สาย']||0, cls:'text-yellow-700' },
              ].map(s => (
                <div key={s.label} className="card text-center py-3">
                  <div className={`text-2xl font-bold ${s.cls||'text-slate-800'}`}>{s.val}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* History table */}
            <div className="card p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 font-medium text-slate-700 text-sm">ประวัติการเข้าเรียน</div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="sticky top-0">
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-2.5 font-medium text-slate-600">วันที่</th>
                      <th className="text-left px-4 py-2.5 font-medium text-slate-600">สถานะ</th>
                      <th className="text-left px-4 py-2.5 font-medium text-slate-600">เวลา</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.records.length === 0 ? (
                      <tr><td colSpan={3} className="text-center py-8 text-slate-400">ยังไม่มีประวัติ</td></tr>
                    ) : data.records.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 text-slate-700">
                          {new Date(r.date).toLocaleDateString('th-TH', { weekday:'short', year:'numeric', month:'short', day:'numeric' })}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={BADGE[r.status]||'badge-absent'}>{r.status}</span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-500">{r.check_in_time || '–'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
