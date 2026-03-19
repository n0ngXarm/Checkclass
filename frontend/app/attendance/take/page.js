'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import { Save, CheckCircle2, ArrowLeft } from 'lucide-react';

const STATUS_OPTIONS = ['มาเรียน', 'สาย', 'ลา', 'ขาดเรียน'];
const STATUS_COLORS  = {
  'มาเรียน':  'bg-green-100 text-green-800 border-green-300',
  'สาย':      'bg-yellow-100 text-yellow-800 border-yellow-300',
  'ลา':       'bg-blue-100 text-blue-800 border-blue-300',
  'ขาดเรียน': 'bg-red-100 text-red-800 border-red-300',
};

function TakeContent() {
  const router      = useRouter();
  const params      = useSearchParams();
  const classId     = params.get('class_id');
  const date        = params.get('date') || new Date().toISOString().split('T')[0];

  const [data, setData]       = useState(null);
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    if(!classId) { router.replace('/attendance'); return; }
    try {
      const res = await api.attendance(classId, date);
      setData(res);
      const init = {};
      res.students.forEach(s => {
        const existing = res.records?.[s.student_id];
        init[s.student_id] = {
          status: existing?.status || 'มาเรียน',
          time:   existing?.check_in_time || '',
          note:   existing?.note || '',
        };
      });
      setEntries(init);
    } catch(e) {
      if(e.message.includes('401')) router.replace('/login');
      setError(e.message);
    } finally { setLoading(false); }
  }, [classId, date, router]);

  useEffect(() => { load(); }, [load]);

  function setAll(status) {
    setEntries(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(id => { next[id] = { ...next[id], status }; });
      return next;
    });
  }

  async function handleSave() {
    setSaving(true); setError('');
    try {
      await api.saveAttendance({
        class_id: Number(classId),
        date,
        entries: Object.entries(entries).map(([student_id, e]) => ({
          student_id, status: e.status, time: e.time, note: e.note,
        })),
      });
      setSuccess(true);
      setTimeout(() => router.replace('/attendance'), 1500);
    } catch(e) { setError(e.message); }
    finally { setSaving(false); }
  }

  if(loading) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">กำลังโหลด...</div>
  );

  const students = data?.students || [];

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-sm mb-1">
            <ArrowLeft className="w-4 h-4" /> กลับ
          </button>
          <h1 className="text-xl font-bold text-slate-800">
            เช็คชื่อ — {new Date(date).toLocaleDateString('th-TH', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </h1>
          <p className="text-sm text-slate-500">{students.length} คน</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setAll('มาเรียน')} className="btn-secondary text-sm flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" /> ทุกคนมาเรียน
          </button>
          <button onClick={handleSave} disabled={saving || success}
            className="btn-primary flex items-center gap-2">
            {success ? '✅ บันทึกแล้ว' : saving ? 'กำลังบันทึก...' : <><Save className="w-4 h-4" /> บันทึก</>}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 font-medium text-slate-600 w-12">#</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">รหัส</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">ชื่อ-นามสกุล</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">สถานะ</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 w-32">เวลามาสาย</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.map((stu, i) => {
                const e = entries[stu.student_id] || { status: 'มาเรียน', time: '', note: '' };
                const rowColor = {
                  'มาเรียน': 'hover:bg-green-50',
                  'สาย':     'hover:bg-yellow-50',
                  'ลา':      'hover:bg-blue-50',
                  'ขาดเรียน':'hover:bg-red-50',
                }[e.status] || '';
                return (
                  <tr key={stu.student_id} className={`transition-colors ${rowColor}`}>
                    <td className="px-4 py-2.5 text-slate-400">{i+1}</td>
                    <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">{stu.student_id}</td>
                    <td className="px-4 py-2.5 font-medium">
                      {stu.first_name_th} {stu.last_name_th}
                      {stu.nickname && <span className="text-slate-400 font-normal text-xs ml-1">({stu.nickname})</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {STATUS_OPTIONS.map(s => (
                          <button key={s} onClick={() => setEntries(prev => ({ ...prev, [stu.student_id]: { ...e, status: s } }))}
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all ${
                              e.status === s ? STATUS_COLORS[s] + ' ring-2 ring-offset-1 ring-current' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                            }`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <input type="time" value={e.time}
                        onChange={ev => setEntries(prev => ({ ...prev, [stu.student_id]: { ...e, time: ev.target.value } }))}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </td>
                    <td className="px-4 py-2.5">
                      <input type="text" value={e.note} placeholder="หมายเหตุ"
                        onChange={ev => setEntries(prev => ({ ...prev, [stu.student_id]: { ...e, note: ev.target.value } }))}
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {students.length === 0 && (
            <div className="text-center py-12 text-slate-400">ไม่พบนักเรียนในห้องนี้</div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function TakePage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="p-16 text-center text-slate-400">กำลังโหลด...</div>}>
        <TakeContent />
      </Suspense>
    </>
  );
}
