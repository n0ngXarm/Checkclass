'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
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
    <>
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <UserPlus className="w-6 h-6 text-indigo-600" />
          <h1 className="text-xl font-bold text-slate-800">เพิ่มนักเรียน</h1>
        </div>

        <div className="card">
          {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key:'student_id', label:'รหัสนักเรียน', type:'text', required:true },
              { key:'first_name_th', label:'ชื่อ (ภาษาไทย)', type:'text', required:true },
              { key:'last_name_th', label:'นามสกุล (ภาษาไทย)', type:'text', required:true },
              { key:'student_number', label:'เลขที่', type:'number' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                <input type={f.type} className="input" value={form[f.key]} required={f.required}
                  onChange={e => set(f.key, e.target.value)} />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ห้องเรียน</label>
              <select className="select" value={form.class_id} required onChange={e => set('class_id', e.target.value)}>
                <option value="">— เลือกห้องเรียน —</option>
                {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code} {c.room}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">เพศ</label>
              <select className="select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="">ไม่ระบุ</option>
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => router.back()} className="btn-secondary flex-1">ยกเลิก</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'กำลังบันทึก...' : 'เพิ่มนักเรียน'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
