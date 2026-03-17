import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  HowToReg as AttendanceIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayAttendance: 0,
    recentAttendance: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // ดึงจำนวนนักเรียนทั้งหมด
      const studentsRes = await api.get('/students.php');
      const totalStudents = studentsRes.data.length;
      
      // ดึงข้อมูลการเช็คชื่อวันนี้
      const today = new Date().toISOString().split('T')[0];
      const attendanceRes = await api.get(`/attendance.php?date=${today}`);
      const todayAttendance = attendanceRes.data.filter(a => a.status).length;
      
      // ดึงประวัติล่าสุด 5 รายการ
      const historyRes = await api.get('/history.php');
      const recent = historyRes.data.slice(0, 5);
      
      setStats({
        totalStudents,
        todayAttendance,
        recentAttendance: recent,
      });
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="กำลังโหลดแดชบอร์ด..." />;
  if (error) return <Error message={error} onRetry={fetchDashboardData} />;

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Header */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#1976d2', color: 'white' }}>
        <Typography variant="h4" gutterBottom>
          👩‍🏫 ยินดีต้อนรับ, {user?.title}{user?.first_name} {user?.last_name}
        </Typography>
        <Typography variant="body1">
          รหัสครู: {user?.teacher_code}
        </Typography>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ color: '#1976d2', fontSize: 40, mr: 2 }} />
                <Typography variant="h5">นักเรียนทั้งหมด</Typography>
              </Box>
              <Typography variant="h2" align="center">
                {stats.totalStudents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttendanceIcon sx={{ color: '#1976d2', fontSize: 40, mr: 2 }} />
                <Typography variant="h5">เช็คชื่อวันนี้</Typography>
              </Box>
              <Typography variant="h2" align="center">
                {stats.todayAttendance}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom>
        การดำเนินการด่วน
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<AttendanceIcon />}
            onClick={() => navigate('/teacher/attendance')}
            sx={{ py: 2 }}
          >
            เช็คชื่อวันนี้
          </Button>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<HistoryIcon />}
            onClick={() => navigate('/teacher/history')}
            sx={{ py: 2 }}
          >
            ดูประวัติทั้งหมด
          </Button>
        </Grid>
      </Grid>

      {/* Recent Attendance */}
      <Typography variant="h5" gutterBottom>
        ประวัติล่าสุด
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>วันที่</TableCell>
              <TableCell>เวลา</TableCell>
              <TableCell>รหัสนักศึกษา</TableCell>
              <TableCell>ชื่อ-นามสกุล</TableCell>
              <TableCell>สถานะ</TableCell>
              <TableCell>หมายเหตุ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.recentAttendance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  ยังไม่มีประวัติการเช็คชื่อ
                </TableCell>
              </TableRow>
            ) : (
              stats.recentAttendance.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.check_date}</TableCell>
                  <TableCell>{item.check_time}</TableCell>
                  <TableCell>{item.student_code}</TableCell>
                  <TableCell>
                    {item.title}{item.first_name} {item.last_name}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.status}
                      size="small"
                      sx={{
                        bgcolor: 
                          item.status === 'มา' ? '#d4edda' :
                          item.status === 'สาย' ? '#fff3cd' :
                          item.status === 'ขาด' ? '#f8d7da' : '#d1ecf1',
                        color: 
                          item.status === 'มา' ? '#155724' :
                          item.status === 'สาย' ? '#856404' :
                          item.status === 'ขาด' ? '#721c24' : '#0c5460',
                      }}
                    />
                  </TableCell>
                  <TableCell>{item.note || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TeacherDashboard;