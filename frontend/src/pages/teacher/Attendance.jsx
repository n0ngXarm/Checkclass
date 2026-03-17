import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';

const TeacherAttendance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [filterClass, setFilterClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
    fetchTodayAttendance();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [filterClass]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/students.php');
      const uniqueClasses = [...new Set(res.data.map(s => s.class).filter(Boolean))];
      setClasses(uniqueClasses);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const url = filterClass ? `/students.php?class=${encodeURIComponent(filterClass)}` : '/students.php';
      const res = await api.get(url);
      setStudents(res.data);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('ไม่สามารถโหลดรายชื่อนักเรียนได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const res = await api.get(`/attendance.php?date=${currentDate}`);
      const data = {};
      res.data.forEach(item => {
        data[item.student_id] = {
          status: item.status || 'มา',
          note: item.note || '',
        };
      });
      setAttendanceData(data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleNoteChange = (studentId, note) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], note }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const attendance = Object.entries(attendanceData)
        .filter(([studentId]) => studentId && studentId !== 'null' && studentId !== 'undefined')
        .map(([studentId, data]) => ({
          student_id: parseInt(studentId),
          status: data.status || 'มา',
          note: data.note || '',
        }))
        .filter(item => !isNaN(item.student_id));

      if (attendance.length === 0) {
        setError('กรุณาเลือกนักเรียนอย่างน้อย 1 คน');
        setSaving(false);
        return;
      }

      await api.post('/attendance.php', {
        date: currentDate,
        attendance,
      });

      setSuccess('บันทึกการเช็คชื่อเรียบร้อย');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving attendance:', err);
      setError('ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAll = (status) => {
    const newData = { ...attendanceData };
    students.forEach(student => {
      newData[student.student_id] = {
        ...newData[student.student_id],
        status: status,
      };
    });
    setAttendanceData(newData);
  };

  const getStatusCount = () => {
    const counts = { มา: 0, สาย: 0, ขาด: 0, ลา: 0 };
    Object.entries(attendanceData).forEach(([id, item]) => {
      if (id && id !== 'null' && id !== 'undefined' && item.status) {
        counts[item.status]++;
      }
    });
    return counts;
  };

  const counts = getStatusCount();

  if (loading) return <Loading message="กำลังโหลดข้อมูล..." />;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        📝 เช็คชื่อนักเรียน
      </Typography>

      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Class Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>กรองตามชั้นเรียน</InputLabel>
              <Select
                value={filterClass}
                label="กรองตามชั้นเรียน"
                onChange={(e) => setFilterClass(e.target.value)}
              >
                <MenuItem value="">ทั้งหมด</MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchStudents}
              fullWidth
            >
              โหลดใหม่
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Quick Mark */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          ทำเครื่องหมายทั้งหมด
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleMarkAll('มา')}
            sx={{ color: '#155724', borderColor: '#155724' }}
          >
            ✅ มา
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleMarkAll('สาย')}
            sx={{ color: '#856404', borderColor: '#856404' }}
          >
            ⏰ สาย
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleMarkAll('ขาด')}
            sx={{ color: '#721c24', borderColor: '#721c24' }}
          >
            ❌ ขาด
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleMarkAll('ลา')}
            sx={{ color: '#0c5460', borderColor: '#0c5460' }}
          >
            📝 ลา
          </Button>
        </Box>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: '#d4edda' }}>
            <CardContent>
              <Typography variant="h6" align="center">✅ มา</Typography>
              <Typography variant="h3" align="center">{counts.มา}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: '#fff3cd' }}>
            <CardContent>
              <Typography variant="h6" align="center">⏰ สาย</Typography>
              <Typography variant="h3" align="center">{counts.สาย}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: '#f8d7da' }}>
            <CardContent>
              <Typography variant="h6" align="center">❌ ขาด</Typography>
              <Typography variant="h3" align="center">{counts.ขาด}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card sx={{ bgcolor: '#d1ecf1' }}>
            <CardContent>
              <Typography variant="h6" align="center">📝 ลา</Typography>
              <Typography variant="h3" align="center">{counts.ลา}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Attendance Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          รายชื่อนักเรียน วันที่ {currentDate}
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>รหัสนักศึกษา</TableCell>
                <TableCell>ชื่อ-นามสกุล</TableCell>
                <TableCell>ชั้นเรียน</TableCell>
                <TableCell>สถานะ</TableCell>
                <TableCell>หมายเหตุ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    ไม่พบนักเรียน
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student, index) => (
                  <TableRow key={student.student_id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{student.student_code}</TableCell>
                    <TableCell>
                      {student.title}{student.first_name} {student.last_name}
                    </TableCell>
                    <TableCell>{student.class || '-'}</TableCell>
                    <TableCell>
                      <FormControl fullWidth size="small">
                        <Select
                          value={attendanceData[student.student_id]?.status || 'มา'}
                          onChange={(e) => handleStatusChange(student.student_id, e.target.value)}
                          sx={{
                            bgcolor: 
                              attendanceData[student.student_id]?.status === 'มา' ? '#d4edda' :
                              attendanceData[student.student_id]?.status === 'สาย' ? '#fff3cd' :
                              attendanceData[student.student_id]?.status === 'ขาด' ? '#f8d7da' : '#d1ecf1',
                          }}
                        >
                          <MenuItem value="มา">✅ มา</MenuItem>
                          <MenuItem value="สาย">⏰ สาย</MenuItem>
                          <MenuItem value="ขาด">❌ ขาด</MenuItem>
                          <MenuItem value="ลา">📝 ลา</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="หมายเหตุ"
                        value={attendanceData[student.student_id]?.note || ''}
                        onChange={(e) => handleNoteChange(student.student_id, e.target.value)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving || students.length === 0}
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึกการเช็คชื่อ'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default TeacherAttendance;