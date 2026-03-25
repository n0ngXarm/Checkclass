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
    <div className="min-h-screen bg-[#f4f6f8] dark:bg-[#0f172a]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 text-white">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">จัดการข้อมูลนักเรียน</h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">ทั้งหมด <span className="text-primary-600 font-bold">{students.length}</span> คนในระบบ</p>
            </div>
          </div>
          <Link href="/students/add" className="btn-primary group !px-5 !py-3 flex items-center gap-2 font-bold shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)]">
            <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" /> เพิ่มนักเรียนใหม่
          </Link>
        </div>

        {/* Filters */}
        <div className="card !p-5 mb-6 border border-white/40 dark:border-slate-700 ring-1 ring-slate-100 dark:ring-slate-700 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
              <input type="text" className="input pl-11 py-3 text-base shadow-sm" placeholder="ค้นหาชื่อ, รหัสนักเรียน..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="select sm:w-64 py-3 text-base shadow-sm font-medium text-slate-700 dark:text-slate-200" value={classId} onChange={e => setClassId(e.target.value)}>
              <option value="" className="text-slate-400">ทุกห้องเรียน</option>
              {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code} {c.room}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card !p-0 overflow-hidden shadow-xl border border-slate-100/50 dark:border-slate-700/50">
          {loading ? (
             <div className="py-24 flex flex-col items-center justify-center text-slate-400">
               <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-4 shadow-sm"></div>
               <p className="font-semibold text-lg text-primary-800 dark:text-primary-400/60">กำลังโหลดข้อมูล...</p>
             </div>
          ) : students.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-800/30">
               <UserMinus className="w-14 h-14 mb-4 text-slate-300 drop-shadow-sm" />
               <p className="font-bold text-lg text-slate-700 dark:text-slate-200">ไม่พบข้อมูลนักเรียน</p>
               <p className="text-sm font-medium mt-1">ลองเปลี่ยนเงื่อนไขการค้นหา หรือเพิ่มนักเรียนใหม่</p>
            </div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#f8fafc] dark:bg-[#0f172a] border-b border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4 w-16 text-center">#</th>
                      <th className="px-6 py-4">รหัสนักเรียน</th>
                      <th className="px-6 py-4">ชื่อ-นามสกุล</th>
                      <th className="px-6 py-4">ห้องเรียน</th>
                      <th className="px-6 py-4">สาขาวิชา</th>
                      <th className="px-6 py-4 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80 dark:divide-slate-700/50">
                    {students.map((s, i) => (
                      <tr key={s.student_id} className="group hover:bg-primary-50/30 transition-colors">
                        <td className="px-6 py-4 text-center text-slate-400 font-medium">{i+1}</td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-lg shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                            {s.student_code || s.student_id}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 tracking-tight">{s.first_name_th} {s.last_name_th}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-primary-50 dark:bg-slate-800 text-primary-700 border border-primary-100/60 shadow-sm">
                            {s.class_code} {s.room}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium text-xs truncate max-w-[150px]" title={s.dept_name_th}>{s.dept_name_th}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/students/${s.student_id}/edit`}
                              className="flex items-center justify-center w-8 h-8 rounded-lg bg-gold-50 text-gold-600 dark:bg-gold-500/10 dark:text-gold-400 hover:bg-gold-500 hover:text-white dark:hover:bg-gold-500 dark:hover:text-white transition-all duration-300 hover:scale-[1.15] hover:-translate-y-0.5 hover:shadow-[0_8px_16px_-4px_rgba(251,191,36,0.5)] border border-gold-200 dark:border-gold-500/20" title="แก้ไข">
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <button onClick={() => handleDelete(s.student_id, s.first_name_th + ' ' + s.last_name_th)}
                              className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white transition-all duration-300 hover:scale-[1.15] hover:-translate-y-0.5 hover:shadow-[0_8px_16px_-4px_rgba(225,29,72,0.5)] border border-rose-200 dark:border-rose-500/20" title="ลบ">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden divide-y divide-slate-100/80 dark:divide-slate-700/50">
                {students.map((s, i) => (
                  <div key={s.student_id} className="p-4 flex flex-col gap-3 group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex justify-between items-start mb-1 gap-4">
                      <div className="flex gap-3 items-center flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold flex items-center justify-center text-xs shrink-0 shadow-sm border border-slate-200/50 dark:border-slate-700">{i+1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-800 dark:text-slate-100 text-base leading-tight truncate">{s.first_name_th} {s.last_name_th}</div>
                          <div className="text-sm font-mono text-slate-500 dark:text-slate-400 mt-0.5 truncate">{s.student_code || s.student_id}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-primary-50 dark:bg-slate-800 text-primary-700 border border-primary-100/60 shadow-sm shrink-0">
                        {s.class_code} {s.room}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm truncate max-w-[200px]" title={s.dept_name_th}>
                        {s.dept_name_th}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                      <Link href={`/students/${s.student_id}/edit`} className="btn-secondary !p-2 !px-4 text-xs font-bold hover:text-gold-600 hover:border-gold-300 shrink-0">
                        <Pencil className="w-3.5 h-3.5 mr-1.5" /> แก้ไข
                      </Link>
                      <button onClick={() => handleDelete(s.student_id, s.first_name_th + ' ' + s.last_name_th)} className="btn-secondary !p-2 !px-4 text-xs font-bold hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 shrink-0">
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> ลบ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
