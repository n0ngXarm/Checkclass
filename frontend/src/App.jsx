import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Loading from './components/common/Loading';

// Public Pages
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminTeachers from './pages/admin/Teachers';
import AdminStudents from './pages/admin/Students';
import AdminClasses from './pages/admin/Classes';
import AdminDepartments from './pages/admin/Departments';
import AdminReports from './pages/admin/Reports';
import AdminApprovals from './pages/admin/Approvals';
import AdminSettings from './pages/admin/Settings';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherAttendanceHistory from './pages/teacher/AttendanceHistory';
import TeacherClasses from './pages/teacher/Classes';
import TeacherStudents from './pages/teacher/Students';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentHistory from './pages/student/History';
import StudentProfile from './pages/student/Profile';
import StudentRegistration from './pages/student/Registration';

const theme = createTheme({
  palette: {
    primary: { main: '#2563eb' },
    secondary: { main: '#7c3aed' },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
  },
  typography: {
    fontFamily: '"Prompt", "Sarabun", "Roboto", sans-serif',
  },
});

const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) return <Loading />;
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(user?.role_id)) {
    // Redirect to appropriate dashboard based on role
    if (user?.role_id === 1) return <Navigate to="/admin/dashboard" />;
    if (user?.role_id === 2) return <Navigate to="/teacher/dashboard" />;
    if (user?.role_id === 3) return <Navigate to="/student/dashboard" />;
    return <Navigate to="/login" />;
  }
  
  return children;
};

const AppContent = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Header onMenuClick={handleDrawerToggle} />
      <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          ml: { sm: '240px' },
          mt: '64px',
          bgcolor: '#f8fafc',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Routes>
          {/* Admin Routes (role_id=1) */}
          <Route path="/admin/dashboard" element={
            <PrivateRoute allowedRoles={[1]}>
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/teachers" element={
            <PrivateRoute allowedRoles={[1]}>
              <AdminTeachers />
            </PrivateRoute>
          } />
          <Route path="/admin/students" element={
            <PrivateRoute allowedRoles={[1]}>
              <AdminStudents />
            </PrivateRoute>
          } />
          <Route path="/admin/classes" element={
            <PrivateRoute allowedRoles={[1]}>
              <AdminClasses />
            </PrivateRoute>
          } />
          <Route path="/admin/departments" element={
            <PrivateRoute allowedRoles={[1]}>
              <AdminDepartments />
            </PrivateRoute>
          } />
          <Route path="/admin/reports" element={
            <PrivateRoute allowedRoles={[1]}>
              <AdminReports />
            </PrivateRoute>
          } />
          <Route path="/admin/approvals" element={
            <PrivateRoute allowedRoles={[1]}>
              <AdminApprovals />
            </PrivateRoute>
          } />
          <Route path="/admin/settings" element={
            <PrivateRoute allowedRoles={[1]}>
              <AdminSettings />
            </PrivateRoute>
          } />

          {/* Teacher Routes (role_id=2) */}
          <Route path="/teacher/dashboard" element={
            <PrivateRoute allowedRoles={[2]}>
              <TeacherDashboard />
            </PrivateRoute>
          } />
          <Route path="/teacher/attendance" element={
            <PrivateRoute allowedRoles={[2]}>
              <TeacherAttendance />
            </PrivateRoute>
          } />
          <Route path="/teacher/history" element={
            <PrivateRoute allowedRoles={[2]}>
              <TeacherAttendanceHistory />
            </PrivateRoute>
          } />
          <Route path="/teacher/classes" element={
            <PrivateRoute allowedRoles={[2]}>
              <TeacherClasses />
            </PrivateRoute>
          } />
          <Route path="/teacher/students" element={
            <PrivateRoute allowedRoles={[2]}>
              <TeacherStudents />
            </PrivateRoute>
          } />

          {/* Student Routes (role_id=3) */}
          <Route path="/student/dashboard" element={
            <PrivateRoute allowedRoles={[3]}>
              <StudentDashboard />
            </PrivateRoute>
          } />
          <Route path="/student/history" element={
            <PrivateRoute allowedRoles={[3]}>
              <StudentHistory />
            </PrivateRoute>
          } />
          <Route path="/student/profile" element={
            <PrivateRoute allowedRoles={[3]}>
              <StudentProfile />
            </PrivateRoute>
          } />
          <Route path="/student/registration" element={
            <PrivateRoute allowedRoles={[3]}>
              <StudentRegistration />
            </PrivateRoute>
          } />

          {/* Default redirect based on role */}
          <Route path="/" element={
            <Navigate to={
              user?.role_id === 1 ? '/admin/dashboard' :
              user?.role_id === 2 ? '/teacher/dashboard' :
              '/student/dashboard'
            } />
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;