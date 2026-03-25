'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import { api } from '../../../../lib/api';
import { User, Pencil } from 'lucide-react';

export default function EditStudentPage({ params }) {
  const router = useRouter();
  const { id } = params;

  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ student_id: '', first_name_th: '', last_name_th: '', class_id: '', student_number: '', gender: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.classes(),
      api.students({ search: id }) // Fetching the student by passing ID to search param
    ]).then(([resClasses, resStudents]) => {
      setClasses(resClasses.classes || []);
      const students = resStudents.students || [];
      const std = students.find(s => String(s.student_id) === String(id)) || students[0];
      
      if (std) {
        setForm({
          student_id: std.student_code || std.student_id || '',
          first_name_th: std.first_name_th || '',
          last_name_th: std.last_name_th || '',
          class_id: std.class_id || '',
          student_number: std.student_number || '',
          gender: std.gender || ''
        });
      } else {
        setError('ไม่พบข้อมูลนักเรียนที่ต้องการแก้ไข');
      }
    }).catch(err => {
      if (err.message.includes('401')) router.replace('/login');
      else setError('ไม่สามารถโหลดข้อมูลนักเรียนได้');
    }).finally(() => {
      setLoading(false);
    });
  }, [id, router]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault(); 
    setError(''); 
    setSaving(true);
    try {
      await api.updateStudent(id, form);
      router.replace('/students');
    } catch(err) { 
      setError(err.message); 
      setSaving(false); 
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] dark:bg-[#0f172a]">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-10 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-gold-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-gold-500/30">
            <Pencil className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">แก้ไขข้อมูลนักเรียน</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">อัปเดตข้อมูลของนักเรียนในระบบ</p>
          </div>
        </div>

        <div className="card border border-white/40 dark:border-slate-700 ring-1 ring-slate-100 dark:ring-slate-700 shadow-xl">
          {error && <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-sm font-medium animate-fade-in flex items-center gap-2"><span className="text-lg">❌</span> {error}</div>}
          
          {loading ? (
             <div className="py-20 flex flex-col items-center justify-center text-slate-400">
               <div className="w-10 h-10 border-4 border-gold-100 border-t-gold-500 rounded-full animate-spin mb-4 shadow-sm"></div>
               <p className="font-semibold text-lg text-gold-700/60">กำลังโหลดข้อมูล...</p>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
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
                <button type="submit" disabled={saving} className="btn-gold flex-1 py-3.5 font-bold shadow-[0_8px_20px_-6px_rgba(251,191,36,0.4)] disabled:opacity-50 flex justify-center items-center gap-2">
                  {saving ? <><span className="animate-spin inline-block">⏳</span> กำลังบันทึก...</> : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
