'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { api } from '../../../lib/api';
import { Save, CheckCircle2, ArrowLeft, Pencil } from 'lucide-react';

const STATUS_OPTIONS = ['มาเรียน', 'สาย', 'ลา', 'ขาดเรียน'];
const STATUS_COLORS  = {
  'มาเรียน':  'bg-primary-100 text-primary-800 dark:text-primary-400 border-primary-300 shadow-sm',
  'สาย':      'bg-gold-100 text-gold-800 border-gold-300 shadow-sm',
  'ลา':       'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-300 shadow-sm',
  'ขาดเรียน': 'bg-brown-100 text-brown-800 border-brown-300 shadow-sm',
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
  
  const [isAlreadyChecked, setIsAlreadyChecked] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

  const load = useCallback(async () => {
    if(!classId) { router.replace('/attendance'); return; }
    try {
      const res = await api.attendance(classId, date);
      setData(res);
      const hasRecords = Object.keys(res.records || {}).length > 0;
      setIsAlreadyChecked(hasRecords);
      setIsEditing(!hasRecords);
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
    <main className="max-w-5xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-primary-600 font-medium text-sm mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> กลับหน้าเลือกห้อง
          </button>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            เช็คชื่อ — <span className="text-primary-600">{new Date(date).toLocaleDateString('th-TH', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">จำนวนนักเรียนทั้งหมด {students.length} คน</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {isAlreadyChecked && !isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn-gold flex items-center gap-2 px-6 !py-2.5 font-bold shadow-[0_8px_20px_-6px_rgba(251,191,36,0.4)] transition-all hover:scale-105">
              <Pencil className="w-5 h-5" /> แก้ไขการเช็คชื่อ
            </button>
          ) : (
            <>
              {isAlreadyChecked && (
                <button onClick={() => { setIsEditing(false); load(); }} className="btn-secondary px-6 !py-2.5 text-sm flex items-center gap-2 font-bold shadow-sm">
                  ยกเลิกการแก้ไข
                </button>
              )}
              <button type="button" onClick={() => setAll('มาเรียน')} className="btn-secondary text-sm hidden sm:flex items-center gap-2 font-bold hover:border-primary-200">
                <CheckCircle2 className="w-4 h-4 text-primary-600" /> ให้ทุกคนมาเรียน
              </button>
              <button onClick={handleSave} disabled={saving || success}
                className="btn-primary flex items-center gap-2 px-6 !py-2.5 font-bold shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] disabled:opacity-50">
                {success ? '✅ บันทึกเรียบร้อย' : saving ? '⏳ กำลังบันทึก...' : <><Save className="w-5 h-5" /> บันทึกการเช็คชื่อ</>}
              </button>
            </>
          )}
        </div>
      </div>

      {isAlreadyChecked && !isEditing && (
        <div className="mb-6 p-4 rounded-2xl bg-gold-50 dark:bg-gold-900/40 border border-gold-200 dark:border-gold-800 text-gold-800 dark:text-gold-300 flex items-center gap-4 animate-fade-in shadow-sm">
          <span className="text-3xl drop-shadow-sm">⚠️</span> 
          <div>
            <p className="font-bold text-base">ตรวจสอบแล้ว!</p>
            <p className="text-sm mt-0.5 font-medium opacity-90">มีการเช็คชื่อของห้องเรียนนี้ในวันที่เลือกไปแล้ว หากต้องการแก้ไขหรือทำรายการใหม่ให้กดปุ่ม "แก้ไขการเช็คชื่อ"</p>
          </div>
        </div>
      )}

      {error && <div className="mb-6 p-4 rounded-2xl bg-rose-50 text-rose-700 text-sm font-medium border border-rose-100 shadow-sm animate-fade-in">{error}</div>}

      <div className="card p-0 overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300 w-12">#</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">รหัส</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">ชื่อ-นามสกุล</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">สถานะ</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300 w-32">เวลามาสาย</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 dark:text-slate-300">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.map((stu, i) => {
                const e = entries[stu.student_id] || { status: 'มาเรียน', time: '', note: '' };
                const rowColor = {
                  'มาเรียน': 'hover:bg-primary-50/50',
                  'สาย':     'hover:bg-gold-50/50',
                  'ลา':      'hover:bg-slate-50/50 dark:bg-slate-800/30',
                  'ขาดเรียน':'hover:bg-brown-50/50',
                }[e.status] || '';
                return (
                  <tr key={stu.student_id} className={`transition-colors ${rowColor}`}>
                    <td className="px-4 py-3.5 text-slate-400 font-medium">{i+1}</td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-xs">{stu.student_code || stu.student_id}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-200">
                      {stu.first_name_th} {stu.last_name_th}
                      {stu.nickname && <span className="text-slate-400 font-medium text-xs ml-1.5 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">({stu.nickname})</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {STATUS_OPTIONS.map(s => (
                          <button key={s} onClick={() => setEntries(prev => ({ ...prev, [stu.student_id]: { ...e, status: s } }))}
                            disabled={!isEditing}
                            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all duration-300 ${
                              e.status === s ? STATUS_COLORS[s] + ' scale-105' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:bg-slate-800/50'
                            } ${!isEditing && e.status !== s ? 'opacity-50 hidden sm:inline-block cursor-not-allowed' : ''} ${!isEditing ? 'cursor-not-allowed' : ''}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <input type="time" value={e.time} disabled={!isEditing}
                        onChange={ev => setEntries(prev => ({ ...prev, [stu.student_id]: { ...e, time: ev.target.value } }))}
                        className="text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all shadow-sm disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800/50" />
                    </td>
                    <td className="px-4 py-3.5">
                      <input type="text" value={e.note} placeholder="เพิ่มหมายเหตุ..." disabled={!isEditing}
                        onChange={ev => setEntries(prev => ({ ...prev, [stu.student_id]: { ...e, note: ev.target.value } }))}
                        className="text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 w-full focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all shadow-sm disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800/50" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700/50">
          {students.map((stu, i) => {
            const e = entries[stu.student_id] || { status: 'มาเรียน', time: '', note: '' };
            const rowColor = {
              'มาเรียน': 'bg-primary-50/30 dark:bg-primary-900/10',
              'สาย':     'bg-gold-50/30 dark:bg-gold-900/10',
              'ลา':      'bg-slate-50/30 dark:bg-slate-800/20',
              'ขาดเรียน':'bg-brown-50/30 dark:bg-brown-900/10',
            }[e.status] || '';
            return (
              <div key={stu.student_id} className={`p-4 transition-colors ${rowColor}`}>
                <div className="flex items-start justify-between mb-3.5">
                  <div className="flex gap-3 flex-1 min-w-0 pr-2">
                    <div className="w-8 h-8 flex-shrink-0 bg-white dark:bg-slate-800 text-slate-500 font-bold rounded-full flex items-center justify-center text-xs shadow-sm border border-slate-100 dark:border-slate-700">{i+1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight truncate">
                        {stu.first_name_th} {stu.last_name_th}
                        {stu.nickname && <span className="text-slate-400 text-xs ml-1 shrink-0 font-medium">({stu.nickname})</span>}
                      </div>
                      <div className="text-sm text-slate-500 font-mono mt-0.5 truncate">{stu.student_code || stu.student_id}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-3.5">
                  {STATUS_OPTIONS.map(s => (
                    <button key={s} onClick={() => setEntries(prev => ({ ...prev, [stu.student_id]: { ...e, status: s } }))}
                      disabled={!isEditing}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all duration-300 flex items-center justify-center ${
                        e.status === s ? STATUS_COLORS[s] + ' shadow-md scale-[1.03] ring-1 ring-black/5' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      } ${!isEditing && e.status !== s ? 'opacity-40' : ''} ${!isEditing ? 'cursor-not-allowed' : ''}`}>
                      {s}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input type="time" value={e.time} disabled={!isEditing}
                    onChange={ev => setEntries(prev => ({ ...prev, [stu.student_id]: { ...e, time: ev.target.value } }))}
                    className="text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 w-28 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 shadow-sm disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800/50" />
                  <input type="text" value={e.note} placeholder="เพิ่มหมายเหตุ..." disabled={!isEditing}
                    onChange={ev => setEntries(prev => ({ ...prev, [stu.student_id]: { ...e, note: ev.target.value } }))}
                    className="text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 shadow-sm disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800/50" />
                </div>
              </div>
            );
          })}
          {students.length === 0 && (
            <div className="text-center py-10 text-slate-400 font-medium text-sm">ไม่พบข้อมูลนักเรียนในห้องเรียนนี้</div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function TakePage() {
  return (
    <div className="min-h-screen bg-[#f4f6f8] dark:bg-[#0f172a]">
      <Navbar />
      <Suspense fallback={<div className="p-16 text-center text-primary-500 font-medium flex justify-center"><span className="animate-spin w-6 h-6 border-2 border-primary-200 border-t-primary-600 rounded-full"></span></div>}>
        <TakeContent />
      </Suspense>
    </div>
  );
}
