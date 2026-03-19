'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';

const BADGE = {
  'มาเรียน': 'badge-present', 'สาย': 'badge-late',
  'ขาดเรียน': 'badge-absent', 'ลา': 'badge-leave'
};

export default function DailyReportPage() {
  const router = useRouter();
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0]);
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.classes().then(r => setClasses(r.classes || [])).catch(() => router.replace('/login'));
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
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
  const present= (counts['มาเรียน']||0) + (counts['สาย']||0);
  const pct    = total > 0 ? Math.round(present / total * 100) : 0;

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-slate-800 mb-6">รายงานประจำวัน</h1>

        <div className="card mb-5">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">วันที่</label>
              <input type="date" className="input w-44" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ห้องเรียน</label>
              <select className="select w-48" value={classId} onChange={e => setClassId(e.target.value)}>
                <option value="">ทุกห้อง</option>
                {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code} {c.room}</option>)}
              </select>
            </div>
            {data?.records?.length > 0 && (
              <button onClick={exportCSV} className="btn-secondary text-sm">📥 Export CSV</button>
            )}
          </div>
        </div>

        {/* Stats */}
        {total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { label:'ทั้งหมด', val: total, color:'text-slate-800' },
              { label:'มาเรียน', val: counts['มาเรียน']||0, color:'text-green-700' },
              { label:'ขาดเรียน', val: counts['ขาดเรียน']||0, color:'text-red-700' },
              { label:'สาย', val: counts['สาย']||0, color:'text-yellow-700' },
            ].map(s => (
              <div key={s.label} className="card text-center py-4">
                <div className={`text-3xl font-bold ${s.color}`}>{s.val}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          {loading ? (
            <div className="py-10 text-center text-slate-400">กำลังโหลด...</div>
          ) : !data?.records?.length ? (
            <div className="py-10 text-center text-slate-400">ไม่พบข้อมูลในวันที่เลือก</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 font-medium text-slate-600 w-10">#</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">รหัส</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">ชื่อ-นามสกุล</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">ห้อง</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">เวลา</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.records.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-slate-400">{i+1}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{r.student_id}</td>
                      <td className="px-4 py-2.5 font-medium">{r.first_name_th} {r.last_name_th}</td>
                      <td className="px-4 py-2.5 text-slate-600">{r.class_code} {r.room}</td>
                      <td className="px-4 py-2.5 text-slate-500">{r.check_in_time || '–'}</td>
                      <td className="px-4 py-2.5">
                        <span className={BADGE[r.status] || 'badge-absent'}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
