'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { api } from '../../lib/api';
import Link from 'next/link';
import { Users, Plus, Pencil, Trash2, Search, UserMinus } from 'lucide-react';

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [classes, setClasses]   = useState([]);
  const [classId, setClassId]   = useState('');
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    try {
      const params = {};
      if(classId) params.class_id = classId;
      if(search)  params.search   = search;
      const [stu, cls] = await Promise.all([api.students(params), api.classes()]);
      setStudents(stu.students || []);
      setClasses(cls.classes || []);
    } catch(e) {
      if(e.message.includes('401')) router.replace('/login');
    } finally { setLoading(false); }
  }, [classId, search, router]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id, name) {
    if(!confirm(`ยืนยันการลบ ${name}?`)) return;
    try { await api.deleteStudent(id); load(); }
    catch(e) { alert(e.message); }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">จัดการข้อมูลนักเรียน</h1>
              <p className="text-sm font-medium text-slate-500 mt-0.5">ทั้งหมด {students.length} คนในระบบ</p>
            </div>
          </div>
          <Link href="/students/add" className="btn-primary group">
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" /> เพิ่มนักเรียนใหม่
          </Link>
        </div>

        {/* Filters */}
        <div className="card !p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" className="input pl-10" placeholder="ค้นหาชื่อ, รหัสนักเรียน..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="select sm:w-64" value={classId} onChange={e => setClassId(e.target.value)}>
              <option value="">ทุกห้องเรียน</option>
              {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code} {c.room}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card !p-0 overflow-hidden shadow-xl shadow-slate-200/40 border-slate-200/60">
          {loading ? (
             <div className="py-24 flex flex-col items-center justify-center text-slate-400">
               <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
               <p className="font-medium">กำลังโหลดข้อมูล...</p>
             </div>
          ) : students.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400">
               <UserMinus className="w-12 h-12 mb-3 text-slate-300" />
               <p className="font-medium text-lg">ไม่พบข้อมูลนักเรียน</p>
               <p className="text-sm mt-1">ลองเปลี่ยนเงื่อนไขการค้นหา หรือเพิ่มนักเรียนใหม่</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-medium">
                  <tr>
                    <th className="px-6 py-4 w-16 text-center rounded-tl-2xl">#</th>
                    <th className="px-6 py-4">รหัสนักเรียน</th>
                    <th className="px-6 py-4">ชื่อ-นามสกุล</th>
                    <th className="px-6 py-4">ห้องเรียน</th>
                    <th className="px-6 py-4">สาขาวิชา</th>
                    <th className="px-6 py-4 text-center rounded-tr-2xl">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {students.map((s, i) => (
                    <tr key={s.student_id} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 text-center text-slate-400 font-medium">{i+1}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-sm">
                          {s.student_code || s.student_id}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{s.first_name_th} {s.last_name_th}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700">
                          {s.class_code} {s.room}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs truncate max-w-[150px]" title={s.dept_name_th}>{s.dept_name_th}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/students/${s.student_id}/edit`}
                            className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-all hover:scale-110 hover:shadow-sm" title="แก้ไข">
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button onClick={() => handleDelete(s.student_id, s.first_name_th + ' ' + s.last_name_th)}
                            className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all hover:scale-110 hover:shadow-sm" title="ลบ">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
