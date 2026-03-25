'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { api } from '../../../lib/api';
import { UserPlus } from 'lucide-react';

export default function AddStudentPage() {
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ student_id:'', first_name_th:'', last_name_th:'', class_id:'', student_number:'', gender:'' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    api.classes().then(r => setClasses(r.classes || [])).catch(() => router.replace('/login'));
  }, [router]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.createStudent(form);
      router.replace('/students');
    } catch(e) { setError(e.message); setSaving(false); }
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] dark:bg-[#0f172a]">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-10 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">เพิ่มนักเรียน</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">กรอกข้อมูลเพื่อเพิ่มนักเรียนใหม่เข้าสู่ระบบ</p>
          </div>
        </div>

        <div className="card border border-white/40 dark:border-slate-700 ring-1 ring-slate-100 dark:ring-slate-700 shadow-xl">
          {error && <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-sm font-medium animate-fade-in flex items-center gap-2"><span className="text-lg">❌</span> {error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { key:'student_id', label:'รหัสนักเรียน', type:'text', required:true },
              { key:'first_name_th', label:'ชื่อ (ภาษาไทย)', type:'text', required:true },
              { key:'last_name_th', label:'นามสกุล (ภาษาไทย)', type:'text', required:true },
              { key:'student_number', label:'เลขที่', type:'number' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 ml-1">{f.label}</label>
                <input type={f.type} className="input py-3 font-medium text-slate-700 dark:text-slate-200 shadow-sm" value={form[f.key]} required={f.required}
                  onChange={e => set(f.key, e.target.value)} />
              </div>
            ))}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 ml-1">ห้องเรียน</label>
              <select className="select py-3 font-medium text-slate-700 dark:text-slate-200 shadow-sm" value={form.class_id} required onChange={e => set('class_id', e.target.value)}>
                <option value="" className="text-slate-400">— เลือกระบุห้องเรียน —</option>
                {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code} ห้อง {c.room}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 ml-1">เพศ</label>
              <select className="select py-3 font-medium text-slate-700 dark:text-slate-200 shadow-sm" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="">ไม่ระบุ</option>
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
              </select>
            </div>
            <div className="flex gap-4 pt-4 mt-2">
              <button type="button" onClick={() => router.back()} className="btn-secondary flex-1 py-3.5 font-bold shadow-sm">ยกเลิก</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 py-3.5 font-bold shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] disabled:opacity-50 flex justify-center items-center gap-2">
                {saving ? <><span className="animate-spin inline-block">⏳</span> กำลังบันทึก...</> : 'บันทึกข้อมูลนักเรียน'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
