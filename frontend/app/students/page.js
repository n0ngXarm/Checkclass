'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Users, Plus, Pencil, Trash2, Search } from 'lucide-react';

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
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">จัดการนักเรียน</h1>
              <p className="text-xs text-slate-500">{students.length} คน</p>
            </div>
          </div>
          <Link href="/students/add" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> เพิ่มนักเรียน
          </Link>
        </div>

        {/* Filters */}
        <div className="card mb-5 py-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" className="input pl-9" placeholder="ค้นหาชื่อ, รหัส..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="select w-auto min-w-40" value={classId} onChange={e => setClassId(e.target.value)}>
              <option value="">ทุกห้อง</option>
              {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_code} {c.room}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-slate-400">กำลังโหลด...</div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center text-slate-400">ไม่พบข้อมูลนักเรียน</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 font-medium text-slate-600 w-12">#</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">รหัส</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">ชื่อ-นามสกุล</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">ห้อง</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">สาขา</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {students.map((s, i) => (
                    <tr key={s.student_id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-400">{i+1}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.student_id}</td>
                      <td className="px-4 py-3 font-medium">{s.first_name_th} {s.last_name_th}</td>
                      <td className="px-4 py-3 text-slate-600">{s.class_code} {s.room}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{s.dept_name_th}</td>
                      <td className="px-4 py-3 text-right flex justify-end gap-2">
                        <Link href={`/students/${s.id}/edit`}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(s.id, s.first_name_th + ' ' + s.last_name_th)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
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
