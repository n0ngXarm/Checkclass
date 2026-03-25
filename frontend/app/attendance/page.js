'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { api } from '../../lib/api';
import { ClipboardList, ArrowRight } from 'lucide-react';
import CustomDatePicker from '../../components/CustomDatePicker';

export default function AttendancePage() {
  const router = useRouter();
  const [classes, setClasses]   = useState([]);
  const [classId, setClassId]   = useState('');
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.classes()
      .then(r => { setClasses(r.classes || []); })
      .catch(err => { if(err.message.includes('401')) router.replace('/login'); })
      .finally(() => setLoading(false));
  }, [router]);

  function handleSubmit(e) {
    e.preventDefault();
    if(!classId) return;
    router.push(`/attendance/take?class_id=${classId}&date=${date}`);
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] dark:bg-[#0f172a]">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10 animate-fade-in-up">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
            <ClipboardList className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">เลือกห้องเรียนเพื่อเช็คชื่อ</h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">ระบุห้องเรียนและวันที่ที่คุณต้องการบันทึกข้อมูล</p>
          </div>
        </div>

        <div className="card border border-white/40 dark:border-slate-700 ring-1 ring-slate-100 dark:ring-slate-700 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 ml-1">ห้องเรียน</label>
              <select className="select py-3 font-medium text-slate-700 dark:text-slate-200 focus:bg-white dark:bg-slate-800 shadow-sm" value={classId} onChange={e => setClassId(e.target.value)} required>
                <option value="" className="text-slate-400">— กรุณาเลือกห้องเรียน —</option>
                {classes.map(c => (
                  <option key={c.class_id} value={c.class_id}>
                    {c.class_code} ห้อง {c.room} · แผนก {c.dept_name_th}
                  </option>
                ))}
              </select>
              {loading && <p className="text-xs font-medium text-primary-500 mt-2 ml-1 flex items-center gap-1.5"><span className="animate-spin inline-block">⏳</span> กำลังโหลดข้อมูล...</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2 ml-1">วันที่เช็คชื่อ</label>
              <CustomDatePicker dateString={date} onChange={setDate} className="input py-3 font-medium text-slate-700 dark:text-slate-200 shadow-sm" />
            </div>

            <div className="pt-2">
              <button type="submit" disabled={!classId}
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 font-bold text-base shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
                ไปหน้าบันทึกการเช็คชื่อ <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
