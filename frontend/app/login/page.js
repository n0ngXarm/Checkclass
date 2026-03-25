'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-800 via-primary-900 to-slate-900 flex items-center justify-center p-4 selection:bg-gold-50 dark:bg-slate-8000/30 selection:text-gold-100">
      
      {/* Decorative background blur */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary-600/20 to-transparent pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 backdrop-blur-md rounded-3xl mb-5 border border-white/10 shadow-[0_0_40px_rgba(37,99,235,0.3)]">
            <BookCheck className="w-10 h-10 text-gold-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ระบบเช็คชื่อ <span className="text-gold-400">IT</span></h1>
          <p className="text-primary-200 mt-2 font-medium">แผนกเทคโนโลยีสารสนเทศ</p>
        </div>

        {/* Card */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/20 dark:border-slate-700 p-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 tracking-tight">เข้าสู่ระบบ</h2>

          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-sm flex items-center gap-3 animate-fade-in">
              <span className="text-lg">❌</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 ml-1">รหัสครู</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <input
                  type="text"
                  className="input pl-11 py-3 text-base shadow-sm"
                  placeholder="เช่น T001"
                  value={teacherCode}
                  onChange={e => setTeacherCode(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5 ml-1">รหัสผ่าน</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pl-11 pr-11 py-3 text-base shadow-sm"
                  placeholder="รหัสผ่าน"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-600 transition-colors focus:outline-none">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3.5 text-base mt-2 flex items-center justify-center gap-2 font-semibold shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)]">
              {loading ? (
                <><span className="animate-spin text-lg">⏳</span> กำลังเข้าสู่ระบบ...</>
              ) : (
                <>เข้าสู่ระบบ</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-primary-300/80 text-sm mt-8 font-medium">
          © {new Date().getFullYear()} ระบบเช็คชื่อนักเรียน IT
        </p>
      </div>
    </div>
  );
}
