import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  Tab,
  Tabs,
  Slider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  ColorLens as ThemeIcon,
  Storage as StorageIcon,
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  School as SchoolIcon,
  Lock as LockIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import { useThemeMode } from '../../pages/Login';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const Settings = () => {
  const { user } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    schoolName: 'วิทยาลัยเทคนิคเชียงใหม่',
    schoolCode: 'CMTC',
    academicYear: 2026,
    currentSemester: '1',
    allowStudentRegistration: true,
    allowTeacherSignup: true,
    requireApproval: true,
    maxStudentsPerClass: 40,
    autoGenerateStudentCode: true,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 6,
    requireSpecialChar: true,
    requireNumber: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    twoFactorAuth: false,
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    lineNotifications: false,
    notifyOnNewTeacher: true,
    notifyOnNewStudent: true,
    notifyOnAttendance: false,
    notifyOnAbsence: true,
  });

  // Academic Years
  const [academicYears, setAcademicYears] = useState([
    { id: 1, year: 2026, name: '2569', isActive: true },
    { id: 2, year: 2025, name: '2568', isActive: false },
    { id: 3, year: 2024, name: '2567', isActive: false },
  ]);

  // Backup History
  const [backupHistory, setBackupHistory] = useState([
    { id: 1, date: '2024-03-17 23:30', size: '156 MB', type: 'full' },
    { id: 2, date: '2024-03-16 23:30', size: '152 MB', type: 'full' },
    { id: 3, date: '2024-03-15 23:30', size: '148 MB', type: 'full' },
  ]);

  // Dialogs
  const [openYearDialog, setOpenYearDialog] = useState(false);
  const [openBackupDialog, setOpenBackupDialog] = useState(false);
  const [openRestoreDialog, setOpenRestoreDialog] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [yearForm, setYearForm] = useState({ year: 2027, name: '', isActive: false });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleSaveSystem = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showMessage('success', 'บันทึกการตั้งค่าระบบเรียบร้อย');
    } catch (error) {
      showMessage('error', 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      showMessage('success', 'บันทึกการตั้งค่าความปลอดภัยเรียบร้อย');
    } catch (error) {
      showMessage('error', 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      showMessage('success', 'บันทึกการแจ้งเตือนเรียบร้อย');
    } catch (error) {
      showMessage('error', 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenYearDialog = (year = null) => {
    if (year) {
      setEditingYear(year);
      setYearForm({ year: year.year, name: year.name, isActive: year.isActive });
    } else {
      setEditingYear(null);
      setYearForm({ year: 2027, name: '', isActive: false });
    }
    setOpenYearDialog(true);
  };

  const handleSaveYear = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      showMessage('success', editingYear ? 'อัปเดตปีการศึกษาเรียบร้อย' : 'เพิ่มปีการศึกษาเรียบร้อย');
      setOpenYearDialog(false);
    } catch (error) {
      showMessage('error', 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      showMessage('success', 'สำรองข้อมูลเรียบร้อย');
      setOpenBackupDialog(false);
    } catch (error) {
      showMessage('error', 'เกิดข้อผิดพลาดในการสำรองข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      showMessage('success', 'กู้คืนข้อมูลเรียบร้อย');
      setOpenRestoreDialog(false);
    } catch (error) {
      showMessage('error', 'เกิดข้อผิดพลาดในการกู้คืนข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        ⚙️ ตั้งค่าระบบ
      </Typography>

      {/* Messages */}
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {/* Settings Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab icon={<SchoolIcon />} label="ระบบ" />
          <Tab icon={<SecurityIcon />} label="ความปลอดภัย" />
          <Tab icon={<NotificationsIcon />} label="การแจ้งเตือน" />
          <Tab icon={<ThemeIcon />} label="ลักษณะ" />
          <Tab icon={<StorageIcon />} label="ข้อมูล" />
        </Tabs>
      </Paper>

      {/* System Settings */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ข้อมูลทั่วไป
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <TextField
                  fullWidth
                  label="ชื่อสถานศึกษา"
                  value={systemSettings.schoolName}
                  onChange={(e) => setSystemSettings({ ...systemSettings, schoolName: e.target.value })}
                  margin="normal"
                  size="small"
                />
                
                <TextField
                  fullWidth
                  label="รหัสสถานศึกษา"
                  value={systemSettings.schoolCode}
                  onChange={(e) => setSystemSettings({ ...systemSettings, schoolCode: e.target.value })}
                  margin="normal"
                  size="small"
                />

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>ปีการศึกษาปัจจุบัน</InputLabel>
                      <Select
                        value={systemSettings.academicYear}
                        label="ปีการศึกษาปัจจุบัน"
                        onChange={(e) => setSystemSettings({ ...systemSettings, academicYear: e.target.value })}
                      >
                        {academicYears.map((y) => (
                          <MenuItem key={y.id} value={y.year}>{y.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>ภาคเรียนปัจจุบัน</InputLabel>
                      <Select
                        value={systemSettings.currentSemester}
                        label="ภาคเรียนปัจจุบัน"
                        onChange={(e) => setSystemSettings({ ...systemSettings, currentSemester: e.target.value })}
                      >
                        <MenuItem value="1">เทอม 1</MenuItem>
                        <MenuItem value="2">เทอม 2</MenuItem>
                        <MenuItem value="summer">ฤดูร้อน</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ข้อกำหนดการใช้งาน
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.allowStudentRegistration}
                      onChange={(e) => setSystemSettings({ ...systemSettings, allowStudentRegistration: e.target.checked })}
                    />
                  }
                  label="อนุญาตให้นักเรียนลงทะเบียนด้วยตัวเอง"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.allowTeacherSignup}
                      onChange={(e) => setSystemSettings({ ...systemSettings, allowTeacherSignup: e.target.checked })}
                    />
                  }
                  label="อนุญาตให้ครูสมัครด้วยตัวเอง"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.requireApproval}
                      onChange={(e) => setSystemSettings({ ...systemSettings, requireApproval: e.target.checked })}
                    />
                  }
                  label="ต้องได้รับการอนุมัติก่อนใช้งาน"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.autoGenerateStudentCode}
                      onChange={(e) => setSystemSettings({ ...systemSettings, autoGenerateStudentCode: e.target.checked })}
                    />
                  }
                  label="สร้างรหัสนักศึกษาอัตโนมัติ"
                />

                <Box sx={{ mt: 2 }}>
                  <Typography gutterBottom>
                    จำนวนนักเรียนสูงสุดต่อห้อง: {systemSettings.maxStudentsPerClass}
                  </Typography>
                  <Slider
                    value={systemSettings.maxStudentsPerClass}
                    onChange={(e, val) => setSystemSettings({ ...systemSettings, maxStudentsPerClass: val })}
                    min={10}
                    max={100}
                    step={5}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" startIcon={<RefreshIcon />}>
                รีเซ็ต
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveSystem}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'บันทึกการตั้งค่า'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Security Settings */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ข้อกำหนดรหัสผ่าน
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <TextField
                  fullWidth
                  label="ความยาวรหัสผ่านขั้นต่ำ"
                  type="number"
                  value={securitySettings.passwordMinLength}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) })}
                  margin="normal"
                  size="small"
                  InputProps={{ inputProps: { min: 4, max: 20 } }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.requireSpecialChar}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, requireSpecialChar: e.target.checked })}
                    />
                  }
                  label="ต้องมีอักขระพิเศษ (!@#$%)"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.requireNumber}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, requireNumber: e.target.checked })}
                    />
                  }
                  label="ต้องมีตัวเลข"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.twoFactorAuth}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })}
                    />
                  }
                  label="เปิดใช้งาน Two-Factor Authentication"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ความปลอดภัยของเซสชัน
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <TextField
                  fullWidth
                  label="ระยะเวลาเซสชัน (นาที)"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                  margin="normal"
                  size="small"
                />

                <TextField
                  fullWidth
                  label="จำนวนครั้งที่ลองผิดพลาดสูงสุด"
                  type="number"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })}
                  margin="normal"
                  size="small"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" startIcon={<RefreshIcon />}>
                รีเซ็ต
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveSecurity}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'บันทึกการตั้งค่า'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Notification Settings */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ช่องทางการแจ้งเตือน
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                    />
                  }
                  label="อีเมล"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.smsNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
                    />
                  }
                  label="SMS"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.lineNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, lineNotifications: e.target.checked })}
                    />
                  }
                  label="LINE"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  แจ้งเตือนเมื่อมี...
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.notifyOnNewTeacher}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, notifyOnNewTeacher: e.target.checked })}
                    />
                  }
                  label="ครูสมัครใหม่"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.notifyOnNewStudent}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, notifyOnNewStudent: e.target.checked })}
                    />
                  }
                  label="นักเรียนสมัครใหม่"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.notifyOnAttendance}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, notifyOnAttendance: e.target.checked })}
                    />
                  }
                  label="มีการเช็คชื่อ"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.notifyOnAbsence}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, notifyOnAbsence: e.target.checked })}
                    />
                  }
                  label="นักเรียนขาดเรียน"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" startIcon={<RefreshIcon />}>
                รีเซ็ต
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveNotifications}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'บันทึกการตั้งค่า'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Theme Settings */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  รูปแบบการแสดงผล
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <FormControlLabel
                  control={
                    <Switch
                      checked={mode === 'dark'}
                      onChange={toggleMode}
                    />
                  }
                  label={mode === 'dark' ? 'โหมดมืด' : 'โหมดสว่าง'}
                />

                <Box sx={{ mt: 3 }}>
                  <Typography gutterBottom>
                    สีหลัก
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {['#2563eb', '#7c3aed', '#dc2626', '#16a34a', '#f59e0b'].map((color) => (
                      <Avatar
                        key={color}
                        sx={{ 
                          bgcolor: color, 
                          width: 40, 
                          height: 40, 
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: 'transparent',
                          '&:hover': { transform: 'scale(1.1)' },
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography gutterBottom>
                    ขนาดตัวอักษร
                  </Typography>
                  <Slider
                    defaultValue={14}
                    min={12}
                    max={20}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" startIcon={<RefreshIcon />}>
                รีเซ็ต
              </Button>
              <Button variant="contained" startIcon={<SaveIcon />}>
                บันทึกการตั้งค่า
              </Button>
            </Box>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Data Management */}
      <TabPanel value={tabValue} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  จัดการปีการศึกษา
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <List>
                  {academicYears.map((year) => (
                    <ListItem key={year.id}>
                      <ListItemText
                        primary={`ปีการศึกษา ${year.name}`}
                        secondary={year.isActive ? 'กำลังใช้งาน' : ''}
                      />
                      <ListItemSecondaryAction>
                        {year.isActive && (
                          <Chip label="ปัจจุบัน" size="small" color="success" sx={{ mr: 1 }} />
                        )}
                        <IconButton edge="end" onClick={() => handleOpenYearDialog(year)}>
                          <EditIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenYearDialog()}
                  sx={{ mt: 2 }}
                >
                  เพิ่มปีการศึกษา
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  สำรองและกู้คืนข้อมูล
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<BackupIcon />}
                  onClick={() => setOpenBackupDialog(true)}
                  sx={{ mb: 2 }}
                >
                  สำรองข้อมูลตอนนี้
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RestoreIcon />}
                  onClick={() => setOpenRestoreDialog(true)}
                >
                  กู้คืนข้อมูล
                </Button>

                <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                  ประวัติการสำรองล่าสุด
                </Typography>
                <List dense>
                  {backupHistory.map((backup) => (
                    <ListItem key={backup.id}>
                      <ListItemText
                        primary={backup.date}
                        secondary={`ขนาด ${backup.size} - ${backup.type === 'full' ? 'เต็มระบบ' : 'บางส่วน'}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" size="small">
                          <RestoreIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ bgcolor: '#fee2e2' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error">
                  โซนอันตราย
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                >
                  ล้างข้อมูลทั้งหมด
                </Button>
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                  * การล้างข้อมูลไม่สามารถกู้คืนได้
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Year Dialog */}
      <Dialog open={openYearDialog} onClose={() => setOpenYearDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingYear ? 'แก้ไขปีการศึกษา' : 'เพิ่มปีการศึกษาใหม่'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ปี ค.ศ."
                type="number"
                value={yearForm.year}
                onChange={(e) => setYearForm({ ...yearForm, year: parseInt(e.target.value) })}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ชื่อปีการศึกษา (พ.ศ.)"
                value={yearForm.name}
                onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
                size="small"
                placeholder="เช่น 2569"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={yearForm.isActive}
                    onChange={(e) => setYearForm({ ...yearForm, isActive: e.target.checked })}
                  />
                }
                label="ตั้งเป็นปีการศึกษาปัจจุบัน"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenYearDialog(false)}>ยกเลิก</Button>
          <Button onClick={handleSaveYear} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Backup Dialog */}
      <Dialog open={openBackupDialog} onClose={() => setOpenBackupDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>สำรองข้อมูลระบบ</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 2 }}>
            ระบบจะทำการสำรองข้อมูลทั้งหมด ได้แก่:
          </Typography>
          <List dense>
            <ListItem>• ข้อมูลผู้ใช้ (ครู, นักเรียน)</ListItem>
            <ListItem>• ข้อมูลแผนกและห้องเรียน</ListItem>
            <ListItem>• ประวัติการเช็คชื่อทั้งหมด</ListItem>
            <ListItem>• การตั้งค่าระบบ</ListItem>
          </List>
          <Alert severity="info" sx={{ mt: 2 }}>
            การสำรองข้อมูลอาจใช้เวลา 1-2 นาที
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBackupDialog(false)}>ยกเลิก</Button>
          <Button onClick={handleBackup} variant="contained" startIcon={<BackupIcon />} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'เริ่มสำรองข้อมูล'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Dialog */}
      <Dialog open={openRestoreDialog} onClose={() => setOpenRestoreDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>กู้คืนข้อมูล</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
            เลือกไฟล์สำรองข้อมูลที่ต้องการกู้คืน
          </Typography>
          <Button variant="outlined" component="label" fullWidth>
            อัปโหลดไฟล์
            <input type="file" hidden accept=".sql,.zip,.bak" />
          </Button>
          <Alert severity="warning" sx={{ mt: 2 }}>
            การกู้คืนข้อมูลจะเขียนทับข้อมูลปัจจุบันทั้งหมด
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRestoreDialog(false)}>ยกเลิก</Button>
          <Button onClick={handleRestore} variant="contained" color="warning" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'กู้คืนข้อมูล'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;