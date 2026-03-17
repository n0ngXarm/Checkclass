import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import { useState } from 'react';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={() => setError(null)} />;

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#e3f2fd' }}>
        <Typography variant="h4">👩‍🏫 ครู: {user?.title}{user?.first_name} {user?.last_name}</Typography>
        <Typography variant="body1">รหัสครู: {user?.teacher_code}</Typography>
      </Paper>
      <Typography>หน้าหลักสำหรับครู (กำลังพัฒนา)</Typography>
    </Box>
  );
};

export default TeacherDashboard;