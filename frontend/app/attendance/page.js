'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { api } from '../../lib/api';
import { ClipboardList, ArrowRight } from 'lucide-react';

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
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">เช็คชื่อ</h1>
            <p className="text-sm text-slate-500">เลือกห้องเรียนและวันที่</p>
          </div>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">ห้องเรียน</label>
              <select className="select" value={classId} onChange={e => setClassId(e.target.value)} required>
                <option value="">— เลือกห้องเรียน —</option>
                {classes.map(c => (
                  <option key={c.class_id} value={c.class_id}>
                    {c.class_code} {c.room} · {c.dept_name_th}
                  </option>
                ))}
              </select>
              {loading && <p className="text-xs text-slate-400 mt-1">กำลังโหลด...</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">วันที่เช็คชื่อ</label>
              <input type="date" className="input" value={date}
                onChange={e => setDate(e.target.value)} required />
            </div>

            <button type="submit" disabled={!classId}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              ไปหน้าเช็คชื่อ <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
