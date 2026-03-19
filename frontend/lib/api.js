// lib/api.js — Centralized API client for PHP backend
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/attendance_system';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}/${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  let data;
  try { data = await res.json(); } catch { data = {}; }

  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth
  login: (teacher_code, password) =>
    request('api/auth/login.php', { method: 'POST', body: JSON.stringify({ teacher_code, password }) }),
  logout: () => request('api/auth/logout.php', { method: 'POST' }),
  me:     () => request('api/auth/me.php'),

  // Dashboard
  dashboard: () => request('api/dashboard.php'),

  // Classes
  classes: () => request('api/classes.php'),

  // Students
  students: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`api/students.php${q ? '?' + q : ''}`);
  },
  createStudent: (data) =>
    request('api/students.php', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id, data) =>
    request(`api/students.php?id=${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudent: (id) =>
    request(`api/students.php?id=${id}`, { method: 'DELETE' }),

  // Attendance
  attendance: (class_id, date) =>
    request(`api/attendance.php?class_id=${class_id}&date=${date}`),
  saveAttendance: (data) =>
    request('api/attendance.php', { method: 'POST', body: JSON.stringify(data) }),

  // Reports
  reportDaily: (date, class_id = 0) =>
    request(`api/reports/daily.php?date=${date}&class_id=${class_id}`),
  reportIndividual: (student_id) =>
    request(`api/reports/individual.php?student_id=${student_id}`),
};
