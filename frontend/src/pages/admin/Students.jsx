import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, Avatar, TextField, InputAdornment, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress, Tooltip,
  Tabs, Tab, Badge, LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon,
  School as SchoolIcon, Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon,
  Download as DownloadIcon, Upload as UploadIcon, FilterList as FilterIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import * as XLSX from 'xlsx';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}</div>
);

const Students = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEnrollDialog, setOpenEnrollDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    student_code: '', title: 'นาย', first_name: '', last_name: '',
    email: '', phone: '', parent_phone: '', address: '', class_id: '', semester_id: '',
  });
  const [enrollData, setEnrollData] = useState({ class_id: '', semester_id: '', status: 'กำลังศึกษา' });
  const [bulkData, setBulkData] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filters, setFilters] = useState({ dept_id: '', class_id: '', level: '', year: 2026 });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchStudents(); fetchClasses(); fetchDepartments(); fetchSemesters(); }, [filters]);

  const fetchStudents = async () => {
    try { setLoading(true);
      let url = '/students.php';
      const params = new URLSearchParams();
      if (filters.dept_id) params.append('dept_id', filters.dept_id);
      if (filters.class_id) params.append('class_id', filters.class_id);
      if (filters.level) params.append('level', filters.level);
      if (filters.year) params.append('year', filters.year);
      if (params.toString()) url += `?${params.toString()}`;
      const res = await api.get(url); setStudents(res.data || []);
    } catch (error) { showMessage('error', 'ไม่สามารถโหลดข้อมูลนักเรียนได้'); } finally { setLoading(false); }
  };
  const fetchClasses = async () => { try { const res = await api.get(`/classes.php?year=${filters.year}&semester=1`); setClasses(res.data || []); } catch (error) {} };
  const fetchDepartments = async () => { try { const res = await api.get('/departments.php'); setDepartments(res.data || []); } catch (error) {} };
  const fetchSemesters = async () => { try { const res = await api.get('/semesters.php'); setSemesters(res.data || []); } catch (error) {} };
  const showMessage = (type, text) => { setMessage({ type, text }); setTimeout(() => setMessage({ type: '', text: '' }), 3000); };

  const handleOpenDialog = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        student_code: student.student_code, title: student.title, first_name: student.first_name, last_name: student.last_name,
        email: student.email || '', phone: student.phone || '', parent_phone: student.parent_phone || '',
        address: student.address || '', class_id: student.class_id || '', semester_id: '',
      });
    } else {
      setEditingStudent(null);
      setFormData({ student_code: '', title: 'นาย', first_name: '', last_name: '', email: '', phone: '', parent_phone: '', address: '', class_id: '', semester_id: '' });
    }
    setOpenDialog(true);
  };
  const handleOpenEnrollDialog = (student) => { setSelectedStudent(student); setEnrollData({ class_id: '', semester_id: '', status: 'กำลังศึกษา' }); setOpenEnrollDialog(true); };

  const handleSave = async () => {
    try { setLoading(true);
      if (editingStudent) { await api.put(`/students.php?id=${editingStudent.student_id}`, formData); showMessage('success', 'อัปเดตข้อมูลนักเรียนเรียบร้อย'); }
      else { await api.post('/students.php', formData); showMessage('success', 'เพิ่มนักเรียนเรียบร้อย'); }
      fetchStudents(); setOpenDialog(false);
    } catch (error) { showMessage('error', error.response?.data?.error || 'เกิดข้อผิดพลาด'); } finally { setLoading(false); }
  };
  const handleEnroll = async () => {
    try { setLoading(true); await api.post('/enrollments.php', { student_id: selectedStudent.student_id, ...enrollData }); showMessage('success', 'ลงทะเบียนเรียนเรียบร้อย'); fetchStudents(); setOpenEnrollDialog(false); } 
    catch (error) { showMessage('error', error.response?.data?.error || 'เกิดข้อผิดพลาด'); } finally { setLoading(false); }
  };
  const handleDelete = async (studentId) => {
    if (!window.confirm('แน่ใจว่าต้องการลบนักเรียนคนนี้?\nการลบจะส่งผลต่อประวัติการเช็คชื่อทั้งหมด')) return;
    try { await api.delete(`/students.php?id=${studentId}`); showMessage('success', 'ลบข้อมูลนักเรียนเรียบร้อย'); fetchStudents(); } 
    catch (error) { showMessage('error', error.response?.data?.error || 'ไม่สามารถลบข้อมูลได้'); }
  };

  const handleBulkImport = async () => {
    try { setLoading(true);
      const lines = bulkData.split('\n').filter(line => line.trim());
      let success = 0; let failed = 0;
      for (const line of lines) {
        try {
          const [code, title, fname, lname, classId] = line.split(',').map(s => s.trim());
          await api.post('/students.php', { student_code: code, title, first_name: fname, last_name: lname, class_id: classId });
          success++;
        } catch (e) { failed++; }
      }
      showMessage('success', `นำเข้าสำเร็จ ${success} รายการ, ล้มเหลว ${failed} รายการ`); fetchStudents(); setOpenBulkDialog(false);
    } catch (error) { showMessage('error', 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล'); } finally { setLoading(false); }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(students.map(s => ({
      'รหัสนักศึกษา': s.student_code, 'คำนำหน้า': s.title, 'ชื่อ': s.first_name, 'นามสกุล': s.last_name,
      'อีเมล': s.email, 'เบอร์โทร': s.phone, 'เบอร์ผู้ปกครอง': s.parent_phone, 'แผนก': s.dept_name,
      'ห้อง': s.class_name, 'สถานะ': s.enrollment_status,
    })));
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'นักเรียน');
    XLSX.writeFile(wb, `นักเรียน_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`);
  };

  const filteredStudents = students.filter(s =>
    s.student_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusChip = (status) => {
    const colors = { 'กำลังศึกษา': { bg: '#d4edda', color: '#155724' }, 'สำเร็จการศึกษา': { bg: '#cce5ff', color: '#004085' }, 'ลาออก': { bg: '#f8d7da', color: '#721c24' }, 'พักการเรียน': { bg: '#fff3cd', color: '#856404' } };
    const { bg, color } = colors[status] || colors['กำลังศึกษา'];
    return <Chip label={status} size="small" sx={{ bgcolor: bg, color }} />;
  };

  if (loading && !students.length) return <Loading message="กำลังโหลดข้อมูลนักเรียน..." />;
  if (message.type === 'error' && !students.length) return <Error message={message.text} onRetry={fetchStudents} />;

  return (
    <Box sx={{ p: 3 }}>
      {loading && students.length > 0 && <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }} />}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">👨‍🎓 จัดการนักเรียน</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchStudents}>รีเฟรช</Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport}>Export Excel</Button>
          <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => setOpenBulkDialog(true)}>นำเข้า</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>เพิ่มนักเรียน</Button>
        </Box>
      </Box>

      {message.text && <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>{message.text}</Alert>}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: showFilters ? 2 : 0 }}>
          <Button startIcon={<FilterIcon />} onClick={() => setShowFilters(!showFilters)} color={showFilters ? 'primary' : 'inherit'}>ตัวกรองขั้นสูง</Button>
          <Box sx={{ flex: 1 }} />
          <TextField placeholder="ค้นหารหัส, ชื่อ, นามสกุล..." size="small" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} sx={{ width: 300 }} />
        </Box>
        {showFilters && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>แผนก</InputLabel>
                <Select value={filters.dept_id} label="แผนก" onChange={(e) => setFilters({ ...filters, dept_id: e.target.value, class_id: '' })}>
                  <MenuItem value="">ทั้งหมด</MenuItem>
                  {departments.map((dept) => <MenuItem key={dept.dept_id} value={dept.dept_id}>{dept.dept_name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>ห้องเรียน</InputLabel>
                <Select value={filters.class_id} label="ห้องเรียน" onChange={(e) => setFilters({ ...filters, class_id: e.target.value })}>
                  <MenuItem value="">ทั้งหมด</MenuItem>
                  {classes.filter(cls => !filters.dept_id || cls.dept_id === parseInt(filters.dept_id)).map((cls) => <MenuItem key={cls.class_id} value={cls.class_id}>{cls.class_name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>ระดับชั้น</InputLabel>
                <Select value={filters.level} label="ระดับชั้น" onChange={(e) => setFilters({ ...filters, level: e.target.value })}>
                  <MenuItem value="">ทั้งหมด</MenuItem>
                  {['ปวช.1', 'ปวช.2', 'ปวช.3', 'ปวส.1', 'ปวส.2'].map(lv => <MenuItem key={lv} value={lv}>{lv}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}><Button fullWidth variant="outlined" startIcon={<RefreshIcon />} onClick={() => { setFilters({ dept_id: '', class_id: '', level: '', year: 2026 }); setSearchTerm(''); }}>ล้างตัวกรอง</Button></Grid>
          </Grid>
        )}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead><TableRow>
              <TableCell>รหัสนักศึกษา</TableCell><TableCell>รูป</TableCell><TableCell>ชื่อ-นามสกุล</TableCell><TableCell>อีเมล</TableCell>
              <TableCell>เบอร์โทร</TableCell><TableCell>ผู้ปกครอง</TableCell><TableCell>แผนก/ห้อง</TableCell><TableCell>สถานะ</TableCell><TableCell>จัดการ</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {filteredStudents.length === 0 ? <TableRow><TableCell colSpan={9} align="center" sx={{ py: 3 }}>ไม่พบข้อมูลนักเรียน</TableCell></TableRow> : 
                filteredStudents.map((student) => (
                  <TableRow key={student.student_id}>
                    <TableCell><Chip label={student.student_code} size="small" color="primary" variant="outlined" /></TableCell>
                    <TableCell><Avatar src={student.avatar}>{student.first_name?.charAt(0)}</Avatar></TableCell>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{student.title}{student.first_name} {student.last_name}</Typography></TableCell>
                    <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><EmailIcon fontSize="small" color="action" /><Typography variant="body2">{student.email || '-'}</Typography></Box></TableCell>
                    <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PhoneIcon fontSize="small" color="action" /><Typography variant="body2">{student.phone || '-'}</Typography></Box></TableCell>
                    <TableCell><Typography variant="body2">{student.parent_phone || '-'}</Typography></TableCell>
                    <TableCell>{student.class_name ? <Chip label={`${student.dept_name} - ${student.class_name}`} size="small" variant="outlined" /> : <Chip label="ไม่ได้ลงทะเบียน" size="small" variant="outlined" />}</TableCell>
                    <TableCell>{getStatusChip(student.enrollment_status)}</TableCell>
                    <TableCell><Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="แก้ไข"><IconButton size="small" color="primary" onClick={() => handleOpenDialog(student)}><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="ลงทะเบียนเรียน"><IconButton size="small" color="info" onClick={() => handleOpenEnrollDialog(student)}><SchoolIcon /></IconButton></Tooltip>
                      <Tooltip title="ลบ"><IconButton size="small" color="error" onClick={() => handleDelete(student.student_id)}><DeleteIcon /></IconButton></Tooltip>
                    </Box></TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialogs */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingStudent ? '✏️ แก้ไขข้อมูลนักเรียน' : '➕ เพิ่มนักเรียนใหม่'}</DialogTitle>
        <DialogContent><Grid container spacing={2} sx={{ pt: 2 }}>
          <Grid item xs={12} sm={6}><TextField fullWidth label="รหัสนักศึกษา" value={formData.student_code} onChange={(e) => setFormData({ ...formData, student_code: e.target.value })} required size="small" /></Grid>
          <Grid item xs={12} sm={6}><FormControl fullWidth size="small"><InputLabel>คำนำหน้า</InputLabel><Select value={formData.title} label="คำนำหน้า" onChange={(e) => setFormData({ ...formData, title: e.target.value })}>{['นาย', 'นางสาว', 'นาง', 'เด็กชาย', 'เด็กหญิง'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</Select></FormControl></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="ชื่อ" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required size="small" /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="นามสกุล" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required size="small" /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="อีเมล" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} size="small" /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="เบอร์โทรศัพท์" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} size="small" /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="เบอร์ผู้ปกครอง" value={formData.parent_phone} onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })} size="small" /></Grid>
          <Grid item xs={12}><TextField fullWidth label="ที่อยู่" multiline rows={2} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} size="small" /></Grid>
          <Grid item xs={12} sm={6}><FormControl fullWidth size="small"><InputLabel>ห้องเรียน (ลงทะเบียนทันที)</InputLabel><Select value={formData.class_id} label="ห้องเรียน (ลงทะเบียนทันที)" onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}><MenuItem value="">ไม่ต้องลงทะเบียน</MenuItem>{classes.map((cls) => <MenuItem key={cls.class_id} value={cls.class_id}>{cls.dept_name} - {cls.class_name}</MenuItem>)}</Select></FormControl></Grid>
          {formData.class_id && <Grid item xs={12} sm={6}><FormControl fullWidth size="small"><InputLabel>ภาคเรียน</InputLabel><Select value={formData.semester_id} label="ภาคเรียน" onChange={(e) => setFormData({ ...formData, semester_id: e.target.value })} required>{semesters.map((sem) => <MenuItem key={sem.semester_id} value={sem.semester_id}>{sem.semester_name}</MenuItem>)}</Select></FormControl></Grid>}
        </Grid></DialogContent>
        <DialogActions><Button onClick={() => setOpenDialog(false)}>ยกเลิก</Button><Button onClick={handleSave} variant="contained" disabled={loading}>{loading ? <CircularProgress size={24} /> : 'บันทึก'}</Button></DialogActions>
      </Dialog>

      <Dialog open={openEnrollDialog} onClose={() => setOpenEnrollDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>ลงทะเบียนเรียน: {selectedStudent?.title}{selectedStudent?.first_name} {selectedStudent?.last_name}</DialogTitle>
        <DialogContent><Grid container spacing={2} sx={{ pt: 2 }}>
          <Grid item xs={12}><FormControl fullWidth size="small"><InputLabel>ห้องเรียน</InputLabel><Select value={enrollData.class_id} label="ห้องเรียน" onChange={(e) => setEnrollData({ ...enrollData, class_id: e.target.value })} required>{classes.map((cls) => <MenuItem key={cls.class_id} value={cls.class_id}>{cls.dept_name} - {cls.class_name}</MenuItem>)}</Select></FormControl></Grid>
          <Grid item xs={12}><FormControl fullWidth size="small"><InputLabel>ภาคเรียน</InputLabel><Select value={enrollData.semester_id} label="ภาคเรียน" onChange={(e) => setEnrollData({ ...enrollData, semester_id: e.target.value })} required>{semesters.map((sem) => <MenuItem key={sem.semester_id} value={sem.semester_id}>{sem.semester_name}</MenuItem>)}</Select></FormControl></Grid>
          <Grid item xs={12}><FormControl fullWidth size="small"><InputLabel>สถานะ</InputLabel><Select value={enrollData.status} label="สถานะ" onChange={(e) => setEnrollData({ ...enrollData, status: e.target.value })}>{['กำลังศึกษา', 'สำเร็จการศึกษา', 'ลาออก', 'พักการเรียน'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select></FormControl></Grid>
        </Grid></DialogContent>
        <DialogActions><Button onClick={() => setOpenEnrollDialog(false)}>ยกเลิก</Button><Button onClick={handleEnroll} variant="contained" disabled={loading}>{loading ? <CircularProgress size={24} /> : 'ลงทะเบียน'}</Button></DialogActions>
      </Dialog>

      <Dialog open={openBulkDialog} onClose={() => setOpenBulkDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>นำเข้าข้อมูลนักเรียน (CSV)</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>รูปแบบ: รหัสนักศึกษา,คำนำหน้า,ชื่อ,นามสกุล,รหัสห้อง (ไม่ต้องเว้นวรรค)</Typography>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>ตัวอย่าง: 6831901001,นาย,สมชาย,ใจดี,43</Typography>
          <TextField fullWidth multiline rows={10} placeholder="วางข้อมูลที่นี่..." value={bulkData} onChange={(e) => setBulkData(e.target.value)} variant="outlined" />
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenBulkDialog(false)}>ยกเลิก</Button><Button onClick={handleBulkImport} variant="contained" startIcon={<CloudUploadIcon />} disabled={loading}>{loading ? <CircularProgress size={24} /> : 'นำเข้า'}</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default Students;