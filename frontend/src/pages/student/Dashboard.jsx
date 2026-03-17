import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import api from '../../api/axios';
import { useEffect, useState } from 'react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (loading) return <Loading message="กำลังโหลดข้อมูลแดชบอร์ด..." />;
  if (error) return <Error message={error} onRetry={() => setError(null)} />;

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#e8f5e8' }}>
        <Typography variant="h4">🧑 นักเรียน: {user?.title}{user?.first_name} {user?.last_name}</Typography>
        <Typography variant="body1">รหัสนักศึกษา: {user?.student_code}</Typography>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">📊 สถิติการเข้าเรียน</Typography>
              <Typography variant="body2">กำลังโหลด...</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">🏫 ห้องเรียนปัจจุบัน</Typography>
              <Typography variant="body2">กำลังโหลด...</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">📝 คำขอที่รออนุมัติ</Typography>
              <Typography variant="body2">กำลังโหลด...</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;