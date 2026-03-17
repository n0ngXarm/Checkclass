import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Grid,
  Alert,
} from '@mui/material';
import {
  CheckCircle as PresentIcon,
  Schedule as LateIcon,
  Cancel as AbsentIcon,
  EventBusy as LeaveIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';

const StudentHistory = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    present: 0,
    late: 0,
    absent: 0,
    leave: 0,
    total: 0,
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/history.php');
      setHistory(response.data);
      
      // คำนวณสถิติ
      const counts = {
        present: 0,
        late: 0,
        absent: 0,
        leave: 0,
        total: response.data.length,
      };
      
      response.data.forEach(item => {
        if (item.status === 'มา') counts.present++;
        else if (item.status === 'สาย') counts.late++;
        else if (item.status === 'ขาด') counts.absent++;
        else if (item.status === 'ลา') counts.leave++;
      });
      
      setStats(counts);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('ไม่สามารถโหลดประวัติได้');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const colors = {
      มา: { bg: '#d4edda', color: '#155724', icon: '✅' },
      สาย: { bg: '#fff3cd', color: '#856404', icon: '⏰' },
      ขาด: { bg: '#f8d7da', color: '#721c24', icon: '❌' },
      ลา: { bg: '#d1ecf1', color: '#0c5460', icon: '📝' },
    };
    const { bg, color, icon } = colors[status] || colors['มา'];
    return (
      <Chip
        label={`${icon} ${status}`}
        size="small"
        sx={{ bgcolor: bg, color, fontWeight: 500 }}
      />
    );
  };

  const StatCard = ({ title, value, icon, bgcolor, color }) => (
    <Card sx={{ bgcolor, height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ color, fontWeight: 700 }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ color, opacity: 0.8 }}>
              {title}
            </Typography>
          </Box>
          <Box sx={{ color, opacity: 0.5 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) return <Loading message="กำลังโหลดประวัติการเข้าเรียน..." />;
  if (error) return <Error message={error} onRetry={fetchHistory} />;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#1976d2', color: 'white' }}>
        <Typography variant="h4" gutterBottom>
          📜 ประวัติการเข้าเรียน
        </Typography>
        <Typography variant="body1">
          {user?.title}{user?.first_name} {user?.last_name} - {user?.student_code}
        </Typography>
        {user?.class && (
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            ชั้น {user?.class}
          </Typography>
        )}
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="มา"
            value={stats.present}
            icon={<PresentIcon sx={{ fontSize: 40 }} />}
            bgcolor="#d4edda"
            color="#155724"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="สาย"
            value={stats.late}
            icon={<LateIcon sx={{ fontSize: 40 }} />}
            bgcolor="#fff3cd"
            color="#856404"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="ขาด"
            value={stats.absent}
            icon={<AbsentIcon sx={{ fontSize: 40 }} />}
            bgcolor="#f8d7da"
            color="#721c24"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="ลา"
            value={stats.leave}
            icon={<LeaveIcon sx={{ fontSize: 40 }} />}
            bgcolor="#d1ecf1"
            color="#0c5460"
          />
        </Grid>
      </Grid>

      {/* Attendance Rate */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          สรุปการเข้าเรียน
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" color="primary">
              {stats.total > 0 ? Math.round((stats.present + stats.late) / stats.total * 100) : 0}%
            </Typography>
            <Typography variant="body2" color="textSecondary">
              อัตราการเข้าเรียน
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" color="success.main">
              {stats.present + stats.late}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              ครั้งที่มาเรียน
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" color="error.main">
              {stats.absent + stats.leave}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              ครั้งที่ขาด/ลา
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* History Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          รายละเอียดการเข้าเรียน ({history.length} รายการ)
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>วันที่</TableCell>
                <TableCell>เวลา</TableCell>
                <TableCell>สถานะ</TableCell>
                <TableCell>หมายเหตุ</TableCell>
                <TableCell>ครูผู้บันทึก</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    ยังไม่มีประวัติการเข้าเรียน
                  </TableCell>
                </TableRow>
              ) : (
                history.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.check_date}</TableCell>
                    <TableCell>{item.check_time}</TableCell>
                    <TableCell>{getStatusChip(item.status)}</TableCell>
                    <TableCell>{item.note || '-'}</TableCell>
                    <TableCell>
                      {item.teacher_firstname} {item.teacher_lastname}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default StudentHistory;