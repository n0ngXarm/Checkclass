import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Person as TeacherIcon,
  MeetingRoom as RoomIcon,
  Category as CategoryIcon,
  Engineering as EngIcon,
  Business as BusIcon,
  Science as SciIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';

const Departments = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    dept_name: '',
    dept_group: 'ช่างอุตสาหกรรม',
    dept_code: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0,
  });

  useEffect(() => {
    fetchDepartments();
    fetchStats();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/departments.php');
      setDepartments(response.data || []);
    } catch (error) {
      showMessage('error', 'ไม่สามารถโหลดข้อมูลแผนกได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard.php');
      setStats({
        totalTeachers: response.data.overview.total_teachers,
        totalStudents: response.data.overview.total_students,
        totalClasses: response.data.overview.total_classes,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  if (loading && departments.length === 0) return <Loading message="กำลังโหลดข้อมูลแผนก..." />;
  if (message.type === 'error' && departments.length === 0) return <Error message={message.text} onRetry={fetchDepartments} />;

  const handleOpenDialog = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        dept_name: dept.dept_name,
        dept_group: dept.dept_group || 'ช่างอุตสาหกรรม',
        dept_code: dept.dept_code || '',
      });
    } else {
      setEditingDept(null);
      setFormData({
        dept_name: '',
        dept_group: 'ช่างอุตสาหกรรม',
        dept_code: '',
      });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      if (editingDept) {
        await api.put(`/departments.php?id=${editingDept.dept_id}`, formData);
        showMessage('success', 'อัปเดตข้อมูลแผนกเรียบร้อย');
      } else {
        await api.post('/departments.php', formData);
        showMessage('success', 'เพิ่มแผนกเรียบร้อย');
      }
      
      fetchDepartments();
      setOpenDialog(false);
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (deptId) => {
    if (!window.confirm('แน่ใจว่าต้องการลบแผนกนี้?\nการลบจะส่งผลต่อห้องเรียน ครู และนักเรียนในแผนก')) return;
    
    try {
      await api.delete(`/departments.php?id=${deptId}`);
      showMessage('success', 'ลบแผนกเรียบร้อย');
      fetchDepartments();
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'ไม่สามารถลบข้อมูลได้');
    }
  };

  const getGroupIcon = (group) => {
    switch(group) {
      case 'ช่างอุตสาหกรรม':
        return <EngIcon sx={{ color: '#3b82f6' }} />;
      case 'บริหารธุรกิจ':
        return <BusIcon sx={{ color: '#10b981' }} />;
      case 'สามัญ':
        return <SciIcon sx={{ color: '#8b5cf6' }} />;
      default:
        return <CategoryIcon sx={{ color: '#6b7280' }} />;
    }
  };

  const getGroupColor = (group) => {
    switch(group) {
      case 'ช่างอุตสาหกรรม':
        return '#3b82f6';
      case 'บริหารธุรกิจ':
        return '#10b981';
      case 'สามัญ':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.dept_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.dept_group?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTeachers = departments.reduce((sum, dept) => sum + (dept.teacher_count || 0), 0);
  const totalStudents = departments.reduce((sum, dept) => sum + (dept.student_count || 0), 0);
  const totalClasses = departments.reduce((sum, dept) => sum + (dept.class_count || 0), 0);

  return (
    <Box sx={{ p: 3 }}>
      {loading && departments.length > 0 && (
        <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }} />
      )}
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          🏢 จัดการแผนก
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          เพิ่มแผนก
        </Button>
      </Box>

      {/* Messages */}
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CategoryIcon sx={{ color: '#3b82f6', mr: 1 }} />
                <Typography variant="h6">แผนกทั้งหมด</Typography>
              </Box>
              <Typography variant="h3">{departments.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PeopleIcon sx={{ color: '#10b981', mr: 1 }} />
                <Typography variant="h6">นักเรียน</Typography>
              </Box>
              <Typography variant="h3">{stats.totalStudents}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TeacherIcon sx={{ color: '#f59e0b', mr: 1 }} />
                <Typography variant="h6">ครู</Typography>
              </Box>
              <Typography variant="h3">{stats.totalTeachers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <RoomIcon sx={{ color: '#8b5cf6', mr: 1 }} />
                <Typography variant="h6">ห้องเรียน</Typography>
              </Box>
              <Typography variant="h3">{stats.totalClasses}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="ค้นหาชื่อแผนก..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </Paper>

      {/* Departments Grid */}
      <Box mt={2}>
        <Grid container spacing={3}>
          {filteredDepartments.map((dept) => (
            <Grid item xs={12} md={6} lg={4} key={dept.dept_id}>
              <Card sx={{ 
                height: '100%',
                borderLeft: `4px solid ${getGroupColor(dept.dept_group)}`,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: getGroupColor(dept.dept_group), mr: 2 }}>
                      {getGroupIcon(dept.dept_group)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {dept.dept_name}
                      </Typography>
                      <Chip
                        label={dept.dept_group}
                        size="small"
                        sx={{ 
                          bgcolor: `${getGroupColor(dept.dept_group)}20`,
                          color: getGroupColor(dept.dept_group),
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                  </Box>

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="primary">
                          {dept.teacher_count || 0}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ครู
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="success.main">
                          {dept.student_count || 0}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          นักเรียน
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="warning.main">
                          {dept.class_count || 0}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ห้องเรียน
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                    <Tooltip title="แก้ไข">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(dept)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="ลบ">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(dept.dept_id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Add/Edit Department Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDept ? '✏️ แก้ไขข้อมูลแผนก' : '➕ เพิ่มแผนกใหม่'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ชื่อแผนก"
                value={formData.dept_name}
                onChange={(e) => setFormData({ ...formData, dept_name: e.target.value })}
                required
                size="small"
                placeholder="เช่น ช่างเทคโนโลยีสารสนเทศ"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="รหัสแผนก"
                value={formData.dept_code}
                onChange={(e) => setFormData({ ...formData, dept_code: e.target.value })}
                size="small"
                placeholder="เช่น IT, MECH, ELEC"
                helperText="รหัสย่อสำหรับอ้างอิง (ไม่จำเป็น)"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>กลุ่มแผนก</InputLabel>
                <Select
                  value={formData.dept_group}
                  label="กลุ่มแผนก"
                  onChange={(e) => setFormData({ ...formData, dept_group: e.target.value })}
                >
                  <MenuItem value="ช่างอุตสาหกรรม">ช่างอุตสาหกรรม</MenuItem>
                  <MenuItem value="บริหารธุรกิจ">บริหารธุรกิจ</MenuItem>
                  <MenuItem value="สามัญ">สามัญสัมพันธ์</MenuItem>
                  <MenuItem value="อื่นๆ">อื่นๆ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>ยกเลิก</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Departments;