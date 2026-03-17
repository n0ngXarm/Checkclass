import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, Avatar, TextField, InputAdornment, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel, Select, MenuItem, Alert, Tooltip, Switch, FormControlLabel,
  Tabs, Tab, Badge, LinearProgress, CircularProgress
} from '@mui/material';
import {
  Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon,
  CheckCircle as ApproveIcon, Cancel as RejectIcon, School as SchoolIcon, Person as PersonIcon,
  Email as EmailIcon, Phone as PhoneIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}</div>
);

const Teachers = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    teacher_code: '', academic_title: '', personal_title: 'นาย', first_name: '', last_name: '',
    email: '', phone: '', dept_id: '', password: '',
  });
  const [openClassDialog, setOpenClassDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { fetchTeachers(); fetchDepartments(); fetchClasses(); }, []);

  const fetchTeachers = async () => {
    try { setLoading(true); const res = await api.get('/teachers.php'); setTeachers(res.data || []); } 
    catch (error) { showMessage('error', 'ไม่สามารถโหลดข้อมูลครูได้'); } 
    finally { setLoading(false); }
  };
  const fetchDepartments = async () => { try { const res = await api.get('/departments.php'); setDepartments(res.data || []); } catch (error) {} };
  const fetchClasses = async () => { try { const res = await api.get('/classes.php?year=2026&semester=1'); setAvailableClasses(res.data || []); } catch (error) {} };
  const fetchTeacherClasses = async (teacherId) => { try { const res = await api.get(`/teacher_class.php?teacher_id=${teacherId}`); setSelectedClasses(res.data.map(item => item.class_id)); } catch (error) {} };
  const showMessage = (type, text) => { setMessage({ type, text }); setTimeout(() => setMessage({ type: '', text: '' }), 3000); };

  const handleOpenDialog = (teacher = null) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({
        teacher_code: teacher.teacher_code, academic_title: teacher.academic_title || '', personal_title: teacher.personal_title,
        first_name: teacher.first_name, last_name: teacher.last_name, email: teacher.email || '', phone: teacher.phone || '',
        dept_id: teacher.dept_id || '', password: '',
      });
    } else {
      setEditingTeacher(null);
      setFormData({ teacher_code: '', academic_title: '', personal_title: 'นาย', first_name: '', last_name: '', email: '', phone: '', dept_id: '', password: '' });
    }
    setOpenDialog(true);
  };
  const handleOpenClassDialog = async (teacher) => { setSelectedTeacher(teacher); await fetchTeacherClasses(teacher.teacher_id); setOpenClassDialog(true); };

  const handleSave = async () => {
    try { setLoading(true);
      if (editingTeacher) { await api.put(`/teachers.php?id=${editingTeacher.teacher_id}`, formData); showMessage('success', 'อัปเดตข้อมูลครูเรียบร้อย'); }
      else { await api.post('/teachers.php', formData); showMessage('success', 'เพิ่มครูเรียบร้อย'); }
      fetchTeachers(); setOpenDialog(false);
    } catch (error) { showMessage('error', error.response?.data?.error || 'เกิดข้อผิดพลาด'); } finally { setLoading(false); }
  };

  const handleApprove = async (userId) => {
    try { await api.post('/admin/approve_teachers.php', { user_id: userId, action: 'approve' }); showMessage('success', 'อนุมัติครูเรียบร้อย'); fetchTeachers(); } 
    catch (error) { showMessage('error', 'ไม่สามารถอนุมัติได้'); }
  };
  const handleReject = async (userId) => {
    if (!window.confirm('แน่ใจว่าต้องการปฏิเสธ?')) return;
    try { await api.post('/admin/approve_teachers.php', { user_id: userId, action: 'reject' }); showMessage('success', 'ปฏิเสธครูเรียบร้อย'); fetchTeachers(); } 
    catch (error) { showMessage('error', 'ไม่สามารถปฏิเสธได้'); }
  };
  const handleDelete = async (teacherId) => {
    if (!window.confirm('แน่ใจว่าต้องการลบครูคนนี้?\nการลบจะส่งผลต่อประวัติการเช็คชื่อทั้งหมด')) return;
    try { await api.delete(`/teachers.php?id=${teacherId}`); showMessage('success', 'ลบข้อมูลครูเรียบร้อย'); fetchTeachers(); } 
    catch (error) { showMessage('error', error.response?.data?.error || 'ไม่สามารถลบข้อมูลได้'); }
  };
  const handleSaveClassAssignments = async () => {
    try { setLoading(true);
      await api.delete(`/teacher_class.php?teacher_id=${selectedTeacher.teacher_id}`);
      for (const classId of selectedClasses) {
        await api.post('/teacher_class.php', { teacher_id: selectedTeacher.teacher_id, class_id: classId, academic_year: 2026, semester: '1', is_homeroom: false });
      }
      showMessage('success', 'บันทึกการกำหนดห้องเรียนเรียบร้อย'); setOpenClassDialog(false);
    } catch (error) { showMessage('error', 'ไม่สามารถบันทึกการกำหนดห้องเรียนได้'); } finally { setLoading(false); }
  };
  const handleToggleClass = (classId) => { setSelectedClasses(prev => prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]); };

  const filteredTeachers = teachers.filter(t =>
    (tabValue === 1 ? !t.is_approved : true) &&
    (t.teacher_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.last_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const pendingCount = teachers.filter(t => !t.is_approved).length;

  if (loading && !teachers.length) return <Loading message="กำลังโหลดข้อมูลครู..." />;
  if (message.type === 'error' && !teachers.length) return <Error message={message.text} onRetry={fetchTeachers} />;

  return (
    <Box sx={{ p: 3 }}>
      {loading && teachers.length > 0 && (
        <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }} />
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">👩‍🏫 จัดการครู</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>เพิ่มครูใหม่</Button>
      </Box>
      {message.text && <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>{message.text}</Alert>}
      <Paper sx={{ mb: 3 }}><Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
        <Tab label={`ครูทั้งหมด (${teachers.length})`} icon={<PersonIcon />} iconPosition="start" />
        <Tab label={<Badge badgeContent={pendingCount} color="warning">รออนุมัติ</Badge>} icon={<ApproveIcon />} iconPosition="start" />
      </Tabs></Paper>

      <TabPanel value={tabValue} index={0}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField fullWidth variant="outlined" placeholder="ค้นหารหัสครู, ชื่อ, นามสกุล..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} size="small" />
            </Grid>
            <Grid item xs={12} sm={4} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchTeachers}>รีเฟรช</Button>
            </Grid>
          </Grid>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <TableContainer>
            <Table>
              <TableHead><TableRow>
                <TableCell>รหัสครู</TableCell><TableCell>รูป</TableCell><TableCell>ชื่อ-นามสกุล</TableCell><TableCell>อีเมล</TableCell>
                <TableCell>เบอร์โทร</TableCell><TableCell>แผนก</TableCell><TableCell>สถานะ</TableCell><TableCell>ห้องที่สอน</TableCell><TableCell>จัดการ</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {filteredTeachers.length === 0 ? (
                  <TableRow><TableCell colSpan={9} align="center" sx={{ py: 3 }}>ไม่พบข้อมูลครู</TableCell></TableRow>
                ) : filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.teacher_id}>
                    <TableCell><Chip label={teacher.teacher_code} size="small" color="primary" variant="outlined" /></TableCell>
                    <TableCell><Avatar src={teacher.avatar}>{teacher.first_name?.charAt(0)}</Avatar></TableCell>
                    <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{teacher.academic_title}{teacher.personal_title}{teacher.first_name} {teacher.last_name}</Typography></TableCell>
                    <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><EmailIcon fontSize="small" color="action" /><Typography variant="body2">{teacher.email || '-'}</Typography></Box></TableCell>
                    <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PhoneIcon fontSize="small" color="action" /><Typography variant="body2">{teacher.phone || '-'}</Typography></Box></TableCell>
                    <TableCell><Chip label={teacher.dept_name || 'ไม่ระบุ'} size="small" variant="outlined" /></TableCell>
                    <TableCell><Chip label={teacher.is_approved ? 'อนุมัติแล้ว' : 'รออนุมัติ'} size="small" color={teacher.is_approved ? 'success' : 'warning'} /></TableCell>
                    <TableCell><Tooltip title="ดูห้องที่สอน"><IconButton size="small" color="info" onClick={() => handleOpenClassDialog(teacher)}><SchoolIcon /></IconButton></Tooltip></TableCell>
                    <TableCell><Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="แก้ไข"><IconButton size="small" color="primary" onClick={() => handleOpenDialog(teacher)}><EditIcon /></IconButton></Tooltip>
                      {!teacher.is_approved && (
                        <>
                          <Tooltip title="อนุมัติ"><IconButton size="small" color="success" onClick={() => handleApprove(teacher.user_id)}><ApproveIcon /></IconButton></Tooltip>
                          <Tooltip title="ปฏิเสธ"><IconButton size="small" color="error" onClick={() => handleReject(teacher.user_id)}><RejectIcon /></IconButton></Tooltip>
                        </>
                      )}
                      <Tooltip title="ลบ"><IconButton size="small" color="error" onClick={() => handleDelete(teacher.teacher_id)}><DeleteIcon /></IconButton></Tooltip>
                    </Box></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>ครูที่รออนุมัติ ({pendingCount} คน)</Typography>
          <TableContainer><Table><TableHead><TableRow><TableCell>รหัสครู</TableCell><TableCell>ชื่อ-นามสกุล</TableCell><TableCell>อีเมล</TableCell><TableCell>เบอร์โทร</TableCell><TableCell>แผนก</TableCell><TableCell>วันที่สมัคร</TableCell><TableCell>จัดการ</TableCell></TableRow></TableHead>
            <TableBody>{teachers.filter(t => !t.is_approved).length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center">ไม่มีครูรออนุมัติ</TableCell></TableRow>
            ) : teachers.filter(t => !t.is_approved).map((teacher) => (
              <TableRow key={teacher.teacher_id}>
                <TableCell><Chip label={teacher.teacher_code} size="small" /></TableCell>
                <TableCell>{teacher.academic_title}{teacher.personal_title}{teacher.first_name} {teacher.last_name}</TableCell>
                <TableCell>{teacher.email}</TableCell><TableCell>{teacher.phone || '-'}</TableCell><TableCell>{teacher.dept_name || '-'}</TableCell>
                <TableCell>{new Date(teacher.created_at).toLocaleDateString('th-TH')}</TableCell>
                <TableCell><Button size="small" variant="contained" color="success" startIcon={<ApproveIcon />} onClick={() => handleApprove(teacher.user_id)} sx={{ mr: 1 }}>อนุมัติ</Button>
                  <Button size="small" variant="outlined" color="error" startIcon={<RejectIcon />} onClick={() => handleReject(teacher.user_id)}>ปฏิเสธ</Button></TableCell>
              </TableRow>
            ))}</TableBody></Table></TableContainer>
        </Paper>
      </TabPanel>

      {/* Add/Edit Teacher Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTeacher ? '✏️ แก้ไขข้อมูลครู' : '➕ เพิ่มครูใหม่'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="รหัสครู"
                value={formData.teacher_code}
                onChange={(e) => setFormData({ ...formData, teacher_code: e.target.value })}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="รหัสผ่าน"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingTeacher ? 'ไม่ต้องกรอกถ้าไม่เปลี่ยน' : 'required'}
                required={!editingTeacher}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>คำนำหน้าวิชาการ</InputLabel>
                <Select
                  value={formData.academic_title}
                  label="คำนำหน้าวิชาการ"
                  onChange={(e) => setFormData({ ...formData, academic_title: e.target.value })}
                >
                  <MenuItem value="">ไม่มี</MenuItem>
                  <MenuItem value="ดร.">ดร.</MenuItem>
                  <MenuItem value="ผศ.">ผศ.</MenuItem>
                  <MenuItem value="รศ.">รศ.</MenuItem>
                  <MenuItem value="ศ.">ศ.</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>คำนำหน้าบุคคล *</InputLabel>
                <Select
                  value={formData.personal_title}
                  label="คำนำหน้าบุคคล *"
                  onChange={(e) => setFormData({ ...formData, personal_title: e.target.value })}
                  required
                >
                  <MenuItem value="นาย">นาย</MenuItem>
                  <MenuItem value="นาง">นาง</MenuItem>
                  <MenuItem value="นางสาว">นางสาว</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ชื่อ"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="นามสกุล"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="อีเมล"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="เบอร์โทรศัพท์"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>แผนก</InputLabel>
                <Select
                  value={formData.dept_id}
                  label="แผนก"
                  onChange={(e) => setFormData({ ...formData, dept_id: e.target.value })}
                >
                  <MenuItem value="">ไม่มี</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.dept_id} value={dept.dept_id}>
                      {dept.dept_name}
                    </MenuItem>
                  ))}
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

      {/* Class Assignment Dialog */}
      <Dialog open={openClassDialog} onClose={() => setOpenClassDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          กำหนดห้องเรียนสำหรับ: {selectedTeacher?.academic_title}{selectedTeacher?.personal_title}
          {selectedTeacher?.first_name} {selectedTeacher?.last_name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 2 }}>
            เลือกห้องเรียนที่ครูคนนี้สอน (ปีการศึกษา 2569 เทอม 1)
          </Typography>
          <Grid container spacing={1} sx={{ maxHeight: 400, overflow: 'auto', p: 1 }}>
            {availableClasses.map((cls) => (
              <Grid item xs={12} sm={6} key={cls.class_id}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedClasses.includes(cls.class_id)}
                      onChange={() => handleToggleClass(cls.class_id)}
                      color="primary"
                    />
                  }
                  label={`${cls.dept_name} - ${cls.class_name}`}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClassDialog(false)}>ยกเลิก</Button>
          <Button onClick={handleSaveClassAssignments} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Teachers;