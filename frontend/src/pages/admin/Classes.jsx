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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel
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
  ExpandMore as ExpandMoreIcon,
  MeetingRoom as RoomIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';

const Classes = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openTeacherDialog, setOpenTeacherDialog] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({
    class_name: '',
    dept_id: '',
    academic_year: 2026,
    semester: '1',
    capacity: 40,
  });
  const [teacherForm, setTeacherForm] = useState({
    teacher_id: '',
    is_homeroom: false,
  });
  const [classTeachers, setClassTeachers] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [expandedDept, setExpandedDept] = useState(null);

  useEffect(() => {
    fetchClasses();
    fetchDepartments();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/classes.php?year=2026&semester=1');
      setClasses(response.data || []);
    } catch (error) {
      showMessage('error', 'ไม่สามารถโหลดข้อมูลห้องเรียนได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments.php');
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/teachers.php?approved=1');
      setTeachers(response.data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchClassTeachers = async (classId) => {
    try {
      const response = await api.get(`/teacher_class.php?class_id=${classId}`);
      setClassTeachers(response.data || []);
    } catch (error) {
      console.error('Error fetching class teachers:', error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  if (loading && classes.length === 0) return <Loading message="กำลังโหลดข้อมูลห้องเรียน..." />;
  if (message.type === 'error' && classes.length === 0) return <Error message={message.text} onRetry={fetchClasses} />;

  const handleOpenDialog = (cls = null) => {
    if (cls) {
      setEditingClass(cls);
      setFormData({
        class_name: cls.class_name,
        dept_id: cls.dept_id,
        academic_year: cls.academic_year,
        semester: cls.semester,
        capacity: cls.capacity || 40,
      });
    } else {
      setEditingClass(null);
      setFormData({
        class_name: '',
        dept_id: '',
        academic_year: 2026,
        semester: '1',
        capacity: 40,
      });
    }
    setOpenDialog(true);
  };

  const handleOpenTeacherDialog = async (cls) => {
    setSelectedClass(cls);
    await fetchClassTeachers(cls.class_id);
    setTeacherForm({ teacher_id: '', is_homeroom: false });
    setOpenTeacherDialog(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (editingClass) {
        await api.put(`/classes.php?id=${editingClass.class_id}`, formData);
        showMessage('success', 'อัปเดตข้อมูลห้องเรียนเรียบร้อย');
      } else {
        await api.post('/classes.php', formData);
        showMessage('success', 'เพิ่มห้องเรียนเรียบร้อย');
      }
      fetchClasses();
      setOpenDialog(false);
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async () => {
    try {
      setLoading(true);
      await api.post('/teacher_class.php', {
        class_id: selectedClass.class_id,
        teacher_id: teacherForm.teacher_id,
        academic_year: 2026,
        semester: '1',
        is_homeroom: teacherForm.is_homeroom,
      });
      showMessage('success', 'เพิ่มครูเรียบร้อย');
      fetchClassTeachers(selectedClass.class_id);
      setTeacherForm({ teacher_id: '', is_homeroom: false });
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTeacher = async (tcId) => {
    if (!window.confirm('แน่ใจว่าต้องการลบครูออกจากห้องนี้?')) return;
    try {
      await api.delete(`/teacher_class.php?id=${tcId}`);
      showMessage('success', 'ลบครูเรียบร้อย');
      fetchClassTeachers(selectedClass.class_id);
    } catch (error) {
      showMessage('error', 'ไม่สามารถลบครูได้');
    }
  };

  const handleDelete = async (classId) => {
    if (!window.confirm('แน่ใจว่าต้องการลบห้องเรียนนี้?\nการลบจะส่งผลต่อข้อมูลนักเรียนและประวัติทั้งหมด')) return;
    try {
      await api.delete(`/classes.php?id=${classId}`);
      showMessage('success', 'ลบห้องเรียนเรียบร้อย');
      fetchClasses();
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'ไม่สามารถลบข้อมูลได้');
    }
  };

  const handleAccordionChange = (deptId) => (event, isExpanded) => {
    setExpandedDept(isExpanded ? deptId : null);
  };

  const classesByDept = classes.reduce((acc, cls) => {
    const deptId = cls.dept_id;
    if (!acc[deptId]) { acc[deptId] = { dept_name: cls.dept_name, classes: [] }; }
    acc[deptId].classes.push(cls);
    return acc;
  }, {});

  const filteredClasses = Object.entries(classesByDept).map(([deptId, dept]) => ({
    dept_id: parseInt(deptId),
    dept_name: dept.dept_name,
    classes: dept.classes.filter(cls => cls.class_name.toLowerCase().includes(searchTerm.toLowerCase())),
  }));

  return (
    <Box sx={{ p: 3 }}>
      {loading && classes.length > 0 && (
        <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }} />
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">🏫 จัดการห้องเรียน</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>เพิ่มห้องเรียน</Button>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>{message.text}</Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><RoomIcon sx={{ color: '#3b82f6', mr: 1 }} /><Typography variant="h6">ห้องเรียนทั้งหมด</Typography></Box><Typography variant="h3">{classes.length}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><CategoryIcon sx={{ color: '#10b981', mr: 1 }} /><Typography variant="h6">แผนก</Typography></Box><Typography variant="h3">{departments.length}</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><PeopleIcon sx={{ color: '#f59e0b', mr: 1 }} /><Typography variant="h6">นักเรียนทั้งหมด</Typography></Box><Typography variant="h3">-</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent><Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}><TeacherIcon sx={{ color: '#8b5cf6', mr: 1 }} /><Typography variant="h6">ครูประจำชั้น</Typography></Box><Typography variant="h3">-</Typography></CardContent></Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField fullWidth variant="outlined" placeholder="ค้นหาชื่อห้องเรียน..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} size="small" />
      </Paper>

      <Box>
        {filteredClasses.map((dept) => (
          dept.classes.length > 0 && (
            <Accordion key={dept.dept_id} expanded={expandedDept === dept.dept_id} onChange={handleAccordionChange(dept.dept_id)} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Typography variant="h6" sx={{ flex: 1 }}>{dept.dept_name}</Typography>
                  <Chip label={`${dept.classes.length} ห้อง`} size="small" color="primary" sx={{ mr: 2 }} />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead><TableRow>
                      <TableCell>ชื่อห้อง</TableCell><TableCell>ปีการศึกษา</TableCell><TableCell>เทอม</TableCell>
                      <TableCell>จำนวนนักเรียน</TableCell><TableCell>ครูประจำชั้น</TableCell><TableCell>ครูที่สอน</TableCell><TableCell>จัดการ</TableCell>
                    </TableRow></TableHead>
                    <TableBody>
                      {dept.classes.map((cls) => (
                        <TableRow key={cls.class_id}>
                          <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{cls.class_name}</Typography></TableCell>
                          <TableCell>{cls.academic_year}</TableCell><TableCell>{cls.semester}</TableCell>
                          <TableCell><Chip label={cls.student_count || 0} size="small" color={cls.student_count > 0 ? 'success' : 'default'} /></TableCell>
                          <TableCell>{cls.homeroom_teacher ? <Chip label={cls.homeroom_teacher} size="small" color="info" /> : <Chip label="ไม่มี" size="small" variant="outlined" />}</TableCell>
                          <TableCell><Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>{cls.teachers?.map((teacher, idx) => <Chip key={idx} label={teacher} size="small" variant="outlined" />)}{(!cls.teachers || cls.teachers.length === 0) && <Chip label="ไม่มี" size="small" variant="outlined" />}</Box></TableCell>
                          <TableCell><Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="แก้ไข"><IconButton size="small" color="primary" onClick={() => handleOpenDialog(cls)}><EditIcon /></IconButton></Tooltip>
                            <Tooltip title="จัดการครู"><IconButton size="small" color="info" onClick={() => handleOpenTeacherDialog(cls)}><TeacherIcon /></IconButton></Tooltip>
                            <Tooltip title="ลบ"><IconButton size="small" color="error" onClick={() => handleDelete(cls.class_id)}><DeleteIcon /></IconButton></Tooltip>
                          </Box></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          )
        ))}
      </Box>

      {/* Dialogs */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingClass ? '✏️ แก้ไขข้อมูลห้องเรียน' : '➕ เพิ่มห้องเรียนใหม่'}</DialogTitle>
        <DialogContent><Grid container spacing={2} sx={{ pt: 2 }}>
          <Grid item xs={12}><TextField fullWidth label="ชื่อห้องเรียน" value={formData.class_name} onChange={(e) => setFormData({ ...formData, class_name: e.target.value })} required size="small" /></Grid>
          <Grid item xs={12}><FormControl fullWidth size="small"><InputLabel>แผนก *</InputLabel><Select value={formData.dept_id} label="แผนก *" onChange={(e) => setFormData({ ...formData, dept_id: e.target.value })} required>{departments.map((dept) => <MenuItem key={dept.dept_id} value={dept.dept_id}>{dept.dept_name}</MenuItem>)}</Select></FormControl></Grid>
          <Grid item xs={12} sm={6}><FormControl fullWidth size="small"><InputLabel>ปีการศึกษา</InputLabel><Select value={formData.academic_year} label="ปีการศึกษา" onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}><MenuItem value={2026}>2569</MenuItem><MenuItem value={2025}>2568</MenuItem></Select></FormControl></Grid>
          <Grid item xs={12} sm={6}><FormControl fullWidth size="small"><InputLabel>ภาคเรียน</InputLabel><Select value={formData.semester} label="ภาคเรียน" onChange={(e) => setFormData({ ...formData, semester: e.target.value })}><MenuItem value="1">เทอม 1</MenuItem><MenuItem value="2">เทอม 2</MenuItem></Select></FormControl></Grid>
          <Grid item xs={12}><TextField fullWidth label="จำนวนที่รับได้" type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })} size="small" /></Grid>
        </Grid></DialogContent>
        <DialogActions><Button onClick={() => setOpenDialog(false)}>ยกเลิก</Button><Button onClick={handleSave} variant="contained" disabled={loading}>{loading ? <CircularProgress size={24} /> : 'บันทึก'}</Button></DialogActions>
      </Dialog>

      <Dialog open={openTeacherDialog} onClose={() => setOpenTeacherDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>จัดการครูประจำห้อง: {selectedClass?.class_name}</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>ครูปัจจุบัน</Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}><Table size="small"><TableBody>
            {classTeachers.length === 0 ? <TableRow><TableCell colSpan={3} align="center">ไม่มีครูในห้องนี้</TableCell></TableRow> : 
              classTeachers.map((teacher) => (
                <TableRow key={teacher.tc_id}><TableCell>{teacher.academic_title}{teacher.personal_title}{teacher.first_name} {teacher.last_name}</TableCell>
                <TableCell>{teacher.is_homeroom ? <Chip label="ครูประจำชั้น" size="small" color="success" /> : <Chip label="ครูสอน" size="small" variant="outlined" />}</TableCell>
                <TableCell align="right"><IconButton size="small" color="error" onClick={() => handleRemoveTeacher(teacher.tc_id)}><DeleteIcon /></IconButton></TableCell></TableRow>
              ))}
          </TableBody></Table></TableContainer>
          <Typography variant="subtitle2" gutterBottom>เพิ่มครู</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}><FormControl fullWidth size="small"><InputLabel>เลือกครู</InputLabel><Select value={teacherForm.teacher_id} label="เลือกครู" onChange={(e) => setTeacherForm({ ...teacherForm, teacher_id: e.target.value })}>{teachers.filter(t => !classTeachers.some(ct => ct.teacher_id === t.teacher_id)).map((t) => <MenuItem key={t.teacher_id} value={t.teacher_id}>{t.academic_title}{t.personal_title}{t.first_name} {t.last_name}</MenuItem>)}</Select></FormControl></Grid>
            <Grid item xs={12}><FormControlLabel control={<Switch checked={teacherForm.is_homeroom} onChange={(e) => setTeacherForm({ ...teacherForm, is_homeroom: e.target.checked })} />} label="ตั้งเป็นครูประจำชั้น" /></Grid>
            <Grid item xs={12}><Button fullWidth variant="contained" onClick={handleAddTeacher} disabled={!teacherForm.teacher_id || loading}>{loading ? <CircularProgress size={24} /> : 'เพิ่มครู'}</Button></Grid>
          </Grid>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenTeacherDialog(false)}>ปิด</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default Classes;