import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Loading from './components/common/Loading';

// Pages
import Login from './pages/Login';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherAttendance from './pages/teacher/Attendance';
import StudentHistory from './pages/student/History';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: {
    fontFamily: '"Sarabun", "Roboto", sans-serif',
  },
});

const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) return <Loading />;
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f5f5f5' }}>
        <Routes>
          {/* Teacher Routes */}
          <Route path="/teacher/dashboard" element={
            <PrivateRoute allowedRoles={['teacher', 'admin']}>
              <TeacherDashboard />
            </PrivateRoute>
          } />
          <Route path="/teacher/attendance" element={
            <PrivateRoute allowedRoles={['teacher', 'admin']}>
              <TeacherAttendance />
            </PrivateRoute>
          } />
          
          {/* Student Routes */}
          <Route path="/student/history" element={
            <PrivateRoute allowedRoles={['student']}>
              <StudentHistory />
            </PrivateRoute>
          } />
          
          {/* Default redirect based on role */}
          <Route path="/" element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;