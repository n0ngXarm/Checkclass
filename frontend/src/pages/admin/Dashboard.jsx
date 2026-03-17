import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  People as PeopleIcon,
  Person as TeacherIcon,
  School as SchoolIcon,
  Category as DeptIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';

const COLORS = ['#4caf50', '#ffc107', '#f44336', '#2196f3'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalDepartments: 0,
    pendingApprovals: 0,
    todayAttendance: { present: 0, late: 0, absent: 0, leave: 0 },
    recentActivities: [],
    departmentStats: [],
    monthlyStats: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/dashboard.php');
      setStats(prev => ({
        ...prev,
        ...response.data,
        todayAttendance: response.data.todayAttendance || prev.todayAttendance,
      }));
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setError('ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="กำลังโหลดข้อมูลแดชบอร์ด..." />;
  if (error) return <Error message={error} onRetry={fetchDashboardData} />;

  const StatCard = ({ title, value, icon, color, trend }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>{icon}</Avatar>
          <Chip icon={<TrendingUpIcon />} label={`+${trend || 0}%`} size="small" color="success" variant="outlined" />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>{value?.toLocaleString() || 0}</Typography>
        <Typography variant="body2" color="textSecondary">{title}</Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h4" gutterBottom>👑 สวัสดี, {user?.title}{user?.first_name} {user?.last_name}</Typography>
        <Typography variant="body1">ยินดีต้อนรับสู่ระบบบริหารจัดการวิทยาลัยเทคนิคเชียงใหม่</Typography>
        {(stats?.pendingApprovals || 0) > 0 && (
          <Chip icon={<WarningIcon />} label={`มีคำขอรออนุมัติ ${stats.pendingApprovals} รายการ`} color="warning" sx={{ mt: 2 }} />
        )}
      </Paper>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="นักเรียนทั้งหมด" value={stats.totalStudents} icon={<PeopleIcon />} color="#4caf50" trend={12} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="ครู/อาจารย์" value={stats.totalTeachers} icon={<TeacherIcon />} color="#2196f3" trend={5} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="ห้องเรียน" value={stats.totalClasses} icon={<SchoolIcon />} color="#ff9800" trend={8} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="แผนก" value={stats.totalDepartments} icon={<DeptIcon />} color="#9c27b0" trend={0} /></Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>สถิติการเข้าเรียนรายเดือน</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthlyStats || []}>
                <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><ChartTooltip /><Legend />
                <Line type="monotone" dataKey="present" stroke="#4caf50" name="มา" />
                <Line type="monotone" dataKey="late" stroke="#ffc107" name="สาย" />
                <Line type="monotone" dataKey="absent" stroke="#f44336" name="ขาด" />
                <Line type="monotone" dataKey="leave" stroke="#2196f3" name="ลา" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>การเข้าเรียนวันนี้</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={[
                  { name: 'มา', value: stats.todayAttendance?.present || 0 },
                  { name: 'สาย', value: stats.todayAttendance?.late || 0 },
                  { name: 'ขาด', value: stats.todayAttendance?.absent || 0 },
                  { name: 'ลา', value: stats.todayAttendance?.leave || 0 },
                ]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" label>
                  {COLORS.map((color, index) => <Cell key={`cell-${index}`} fill={color} />)}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
              {['มา', 'สาย', 'ขาด', 'ลา'].map((status, index) => (
                <Box key={status} sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: COLORS[index] }}>{status}</Typography>
                  <Typography variant="h6">{stats.todayAttendance?.[
                    status === 'มา' ? 'present' : status === 'สาย' ? 'late' : status === 'ขาด' ? 'absent' : 'leave'
                  ] || 0}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>สถิติแยกตามแผนก</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow><TableCell>แผนก</TableCell><TableCell align="right">ครู</TableCell><TableCell align="right">นักเรียน</TableCell><TableCell align="right">ห้อง</TableCell></TableRow></TableHead>
                <TableBody>{(stats.departmentStats || []).map((dept) => (
                  <TableRow key={dept.dept_name}>
                    <TableCell>{dept.dept_name}</TableCell>
                    <TableCell align="right">{dept.teachers || 0}</TableCell>
                    <TableCell align="right">{dept.students || 0}</TableCell>
                    <TableCell align="right">{dept.classes || 0}</TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>กิจกรรมล่าสุด</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow><TableCell>เวลา</TableCell><TableCell>รายละเอียด</TableCell><TableCell>สถานะ</TableCell><TableCell></TableCell></TableRow></TableHead>
                <TableBody>{(stats.recentActivities || []).map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{activity.time}</TableCell>
                    <TableCell>{activity.description}</TableCell>
                    <TableCell><Chip label={activity.status} size="small" color={activity.status === 'success' ? 'success' : 'warning'} /></TableCell>
                    <TableCell><Tooltip title="ดูเพิ่มเติม"><IconButton size="small"><MoreIcon /></IconButton></Tooltip></TableCell>
                  </TableRow>
                ))}</TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;