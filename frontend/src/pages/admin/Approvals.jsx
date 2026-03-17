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
  Avatar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Description as DescriptionIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const Approvals = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [requests, setRequests] = useState({
    teacher: [],
    registration: [],
    profile: [],
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestType, setRequestType] = useState('');
  const [action, setAction] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/approvals.php');
      setRequests(response.data);
    } catch (error) {
      showMessage('error', 'ไม่สามารถโหลดข้อมูลคำขอได้');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  if (loading && Object.values(requests).every(arr => arr.length === 0)) return <Loading message="กำลังโหลดข้อมูลคำขอ..." />;
  if (message.type === 'error' && Object.values(requests).every(arr => arr.length === 0)) return <Error message={message.text} onRetry={fetchAllRequests} />;

  const handleOpenDialog = (type, request, actionType) => {
    setRequestType(type);
    setSelectedRequest(request);
    setAction(actionType);
    setReason('');
    setOpenDialog(true);
  };

  const handleApproveReject = async () => {
    try {
      setLoading(true);
      
      await api.post('/admin/approvals.php', {
        type: requestType,
        request_id: selectedRequest.id,
        action: action,
        reason: reason,
      });
      
      showMessage('success', `${action === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'}คำขอเรียบร้อย`);
      fetchAllRequests();
      setOpenDialog(false);
    } catch (error) {
      showMessage('error', error.response?.data?.error || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    const colors = {
      pending: { bg: '#fff3cd', color: '#856404', label: 'รออนุมัติ' },
      approved: { bg: '#d4edda', color: '#155724', label: 'อนุมัติแล้ว' },
      rejected: { bg: '#f8d7da', color: '#721c24', label: 'ปฏิเสธ' },
    };
    const { bg, color, label } = colors[status] || colors.pending;
    return <Chip label={label} size="small" sx={{ bgcolor: bg, color }} />;
  };

  const getRequestIcon = (type) => {
    switch(type) {
      case 'teacher':
        return <PersonIcon sx={{ color: '#3b82f6' }} />;
      case 'registration':
        return <SchoolIcon sx={{ color: '#10b981' }} />;
      case 'profile':
        return <DescriptionIcon sx={{ color: '#8b5cf6' }} />;
      default:
        return <DescriptionIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {loading && Object.values(requests).some(arr => arr.length > 0) && (
        <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }} />
      )}
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          👑 อนุมัติคำขอ
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchAllRequests}
        >
          รีเฟรช
        </Button>
      </Box>

      {/* Messages */}
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: '4px solid #3b82f6' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    ครูรออนุมัติ
                  </Typography>
                  <Typography variant="h3">
                    {requests.teacher?.filter(r => r.status === 'pending').length || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#3b82f6', width: 56, height: 56 }}>
                  <PersonIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: '4px solid #10b981' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    ลงทะเบียนรออนุมัติ
                  </Typography>
                  <Typography variant="h3">
                    {requests.registration?.filter(r => r.status === 'pending').length || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#10b981', width: 56, height: 56 }}>
                  <SchoolIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderLeft: '4px solid #8b5cf6' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    แก้ไขโปรไฟล์รออนุมัติ
                  </Typography>
                  <Typography variant="h3">
                    {requests.profile?.filter(r => r.status === 'pending').length || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#8b5cf6', width: 56, height: 56 }}>
                  <DescriptionIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab 
            label={
              <Badge badgeContent={requests.teacher?.filter(r => r.status === 'pending').length} color="warning">
                ครู
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={requests.registration?.filter(r => r.status === 'pending').length} color="warning">
                ลงทะเบียน
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={requests.profile?.filter(r => r.status === 'pending').length} color="warning">
                แก้ไขโปรไฟล์
              </Badge>
            } 
          />
        </Tabs>
      </Paper>

      {/* Requests Content */}
      <Box>
          {/* Teacher Approvals */}
          <TabPanel value={tabValue} index={0}>
            <Paper sx={{ p: 2 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>วันที่สมัคร</TableCell>
                      <TableCell>รูป</TableCell>
                      <TableCell>รหัสครู</TableCell>
                      <TableCell>ชื่อ-นามสกุล</TableCell>
                      <TableCell>อีเมล</TableCell>
                      <TableCell>เบอร์โทร</TableCell>
                      <TableCell>แผนก</TableCell>
                      <TableCell>สถานะ</TableCell>
                      <TableCell>จัดการ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.teacher?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          ไม่มีคำขอ
                        </TableCell>
                      </TableRow>
                    ) : (
                      requests.teacher?.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell>
                            {new Date(req.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </TableCell>
                          <TableCell>
                            <Avatar src={req.avatar}>
                              {req.first_name?.charAt(0)}
                            </Avatar>
                          </TableCell>
                          <TableCell>
                            <Chip label={req.teacher_code} size="small" color="primary" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {req.title}{req.first_name} {req.last_name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmailIcon fontSize="small" color="action" />
                              {req.email}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PhoneIcon fontSize="small" color="action" />
                              {req.phone || '-'}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {req.dept_name || '-'}
                          </TableCell>
                          <TableCell>
                            {getStatusChip(req.status)}
                          </TableCell>
                          <TableCell>
                            {req.status === 'pending' && (
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="อนุมัติ">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleOpenDialog('teacher', req, 'approve')}
                                  >
                                    <ApproveIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="ปฏิเสธ">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleOpenDialog('teacher', req, 'reject')}
                                  >
                                    <RejectIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </TabPanel>

          {/* Registration Approvals */}
          <TabPanel value={tabValue} index={1}>
            <Paper sx={{ p: 2 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>วันที่ขอ</TableCell>
                      <TableCell>รหัสนักศึกษา</TableCell>
                      <TableCell>ชื่อ-นามสกุล</TableCell>
                      <TableCell>ห้องที่ขอ</TableCell>
                      <TableCell>ภาคเรียน</TableCell>
                      <TableCell>เหตุผล</TableCell>
                      <TableCell>สถานะ</TableCell>
                      <TableCell>จัดการ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.registration?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          ไม่มีคำขอ
                        </TableCell>
                      </TableRow>
                    ) : (
                      requests.registration?.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell>
                            {format(new Date(req.requested_at), 'dd MMM yyyy', { locale: th })}
                          </TableCell>
                          <TableCell>
                            <Chip label={req.student_code} size="small" color="primary" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            {req.student_name}
                          </TableCell>
                          <TableCell>
                            {req.dept_name} - {req.class_name}
                          </TableCell>
                          <TableCell>
                            {req.semester_name}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 200 }}>
                              {req.reason || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {getStatusChip(req.status)}
                          </TableCell>
                          <TableCell>
                            {req.status === 'pending' && (
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="อนุมัติ">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleOpenDialog('registration', req, 'approve')}
                                  >
                                    <ApproveIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="ปฏิเสธ">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleOpenDialog('registration', req, 'reject')}
                                  >
                                    <RejectIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </TabPanel>

          {/* Profile Update Approvals */}
          <TabPanel value={tabValue} index={2}>
            <Paper sx={{ p: 2 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>วันที่ขอ</TableCell>
                      <TableCell>ผู้ขอ</TableCell>
                      <TableCell>ประเภท</TableCell>
                      <TableCell>ข้อมูลเดิม</TableCell>
                      <TableCell>ข้อมูลใหม่</TableCell>
                      <TableCell>เหตุผล</TableCell>
                      <TableCell>สถานะ</TableCell>
                      <TableCell>จัดการ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.profile?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          ไม่มีคำขอ
                        </TableCell>
                      </TableRow>
                    ) : (
                      requests.profile?.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell>
                            {format(new Date(req.requested_at), 'dd MMM yyyy', { locale: th })}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {req.user_name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {req.user_type}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getRequestIcon(req.field_type)}
                              label={req.field_name === 'phone' ? 'เบอร์โทร' : 'ที่อยู่'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              {req.old_value}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#2563eb' }}>
                              {req.new_value}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 200 }}>
                              {req.reason || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {getStatusChip(req.status)}
                          </TableCell>
                          <TableCell>
                            {req.status === 'pending' && (
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Tooltip title="อนุมัติ">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleOpenDialog('profile', req, 'approve')}
                                  >
                                    <ApproveIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="ปฏิเสธ">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleOpenDialog('profile', req, 'reject')}
                                  >
                                    <RejectIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </TabPanel>
        </Box>

      {/* Approve/Reject Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {action === 'approve' ? '✅ อนุมัติคำขอ' : '❌ ปฏิเสธคำขอ'}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                รายละเอียดคำขอ
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#f8fafc' }}>
                {requestType === 'teacher' && (
                  <>
                    <Typography><strong>รหัสครู:</strong> {selectedRequest.teacher_code}</Typography>
                    <Typography><strong>ชื่อ:</strong> {selectedRequest.title}{selectedRequest.first_name} {selectedRequest.last_name}</Typography>
                    <Typography><strong>อีเมล:</strong> {selectedRequest.email}</Typography>
                  </>
                )}
                {requestType === 'registration' && (
                  <>
                    <Typography><strong>รหัสนักศึกษา:</strong> {selectedRequest.student_code}</Typography>
                    <Typography><strong>ชื่อ:</strong> {selectedRequest.student_name}</Typography>
                    <Typography><strong>ห้องที่ขอ:</strong> {selectedRequest.dept_name} - {selectedRequest.class_name}</Typography>
                  </>
                )}
                {requestType === 'profile' && (
                  <>
                    <Typography><strong>ผู้ขอ:</strong> {selectedRequest.user_name}</Typography>
                    <Typography><strong>ประเภท:</strong> {selectedRequest.field_name === 'phone' ? 'เบอร์โทร' : 'ที่อยู่'}</Typography>
                    <Typography><strong>จาก:</strong> {selectedRequest.old_value}</Typography>
                    <Typography><strong>เป็น:</strong> {selectedRequest.new_value}</Typography>
                  </>
                )}
              </Paper>

              {action === 'reject' && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="เหตุผลที่ปฏิเสธ"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  size="small"
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>ยกเลิก</Button>
          <Button
            onClick={handleApproveReject}
            variant="contained"
            color={action === 'approve' ? 'success' : 'error'}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (action === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Approvals;