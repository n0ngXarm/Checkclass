import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost/attendance_system/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ต้องเป็น true
});

// เพิ่ม token ในทุก request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// จัดการ response error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;