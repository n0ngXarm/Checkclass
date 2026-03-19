'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { BookCheck, User, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [teacherCode, setTeacherCode] = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(teacherCode, password);
      if(res.success) {
        localStorage.setItem('teacher', JSON.stringify({ name: res.teacher_name, code: res.teacher_code }));
        router.replace('/dashboard');
      } else {
        setError(res.error || 'ข้อมูลไม่ถูกต้อง');
      }
    } catch(err) {
      setError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur rounded-3xl mb-4">
            <BookCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">ระบบเช็คชื่อ IT</h1>
          <p className="text-blue-200 mt-1">แผนกเทคโนโลยีสารสนเทศ</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">เข้าสู่ระบบ</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <span>❌</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">รหัสครู</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="เช่น T001"
                  value={teacherCode}
                  onChange={e => setTeacherCode(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">ทดสอบ: T001, T002</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="รหัสผ่าน"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">ทดสอบ: 1234</p>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2 flex items-center justify-center gap-2">
              {loading ? (
                <><span className="animate-spin">⏳</span> กำลังเข้าสู่ระบบ...</>
              ) : (
                <>เข้าสู่ระบบ</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-blue-300 text-xs mt-6">
          © {new Date().getFullYear()} ระบบเช็คชื่อนักเรียน IT
        </p>
      </div>
    </div>
  );
}
