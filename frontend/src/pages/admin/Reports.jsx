import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Assessment as ReportIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { th } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const COLORS = ['#4caf50', '#ffc107', '#f44336', '#2196f3', '#9c27b0', '#ff9800'];

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    year: 2026,
    semester: '1',
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    deptId: '',
    classId: '',
    reportType: 'daily',
  });
  const [reportData, setReportData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchDepartments();
    fetchClasses();
  }, [filters.year, filters.semester]);

  useEffect(() => {
    fetchReport();
  }, [filters]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments.php');
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get(`/classes.php?year=${filters.year}&semester=${filters.semester}`);
      setClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        year: filters.year,
        semester: filters.semester,
        type: filters.reportType,
        start_date: filters.startDate,
        end_date: filters.endDate,
      });
      if (filters.deptId) params.append('dept_id', filters.deptId);
      if (filters.classId) params.append('class_id', filters.classId);
      
      const response = await api.get(`/admin/reports.php?${params.toString()}`);
      setReportData(response.data);
    } catch (error) {
      showMessage('error', 'ไม่สามารถโหลดข้อมูลรายงานได้');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  if (loading && !reportData) return <Loading message="กำลังเตรียมข้อมูลรายงาน..." />;
  if (message.type === 'error' && !reportData) return <Error message={message.text} onRetry={fetchReport} />;

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExportExcel = () => {
    if (!reportData?.details) return;
    
    const ws = XLSX.utils.json_to_sheet(reportData.details);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'รายงาน');
    XLSX.writeFile(wb, `รายงาน_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
  };

  const handleExportPDF = () => {
    if (!reportData?.details) return;
    
    const doc = new jsPDF();
    
    doc.text('รายงานสถิติการเข้าเรียน', 14, 15);
    doc.text(`ปีการศึกษา ${filters.year} เทอม ${filters.semester}`, 14, 25);
    doc.text(`วันที่: ${filters.startDate} ถึง ${filters.endDate}`, 14, 35);
    
    const tableColumn = ["วันที่", "เวลา", "รหัสนักศึกษา", "ชื่อ-นามสกุล", "ห้อง", "สถานะ", "ครูผู้บันทึก"];
    const tableRows = reportData.details.map(item => [
      item.check_in_date,
      item.check_in_time,
      item.student_code,
      item.student_name,
      item.class_name,
      item.status,
      item.teacher_name,
    ]);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
    });
    
    doc.save(`รายงาน_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
  };

  const getStatusChip = (status) => {
    const colors = {
      'มา': { bg: '#d4edda', color: '#155724' },
      'สาย': { bg: '#fff3cd', color: '#856404' },
      'ขาด': { bg: '#f8d7da', color: '#721c24' },
      'ลา': { bg: '#d1ecf1', color: '#0c5460' },
    };
    const { bg, color } = colors[status] || colors['มา'];
    return <Chip label={status} size="small" sx={{ bgcolor: bg, color }} />;
  };

  return (
    <Box sx={{ p: 3 }}>
      {loading && reportData && (
        <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }} />
      )}
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          📊 รายงานและสถิติ
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="ส่งออก Excel">
            <IconButton onClick={handleExportExcel} color="primary">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="พิมพ์ PDF">
            <IconButton onClick={handleExportPDF} color="primary">
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="รีเฟรช">
            <IconButton onClick={fetchReport} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Messages */}
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>ปีการศึกษา</InputLabel>
              <Select
                value={filters.year}
                label="ปีการศึกษา"
                onChange={(e) => handleFilterChange('year', e.target.value)}
              >
                <MenuItem value={2026}>2569</MenuItem>
                <MenuItem value={2025}>2568</MenuItem>
                <MenuItem value={2024}>2567</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>ภาคเรียน</InputLabel>
              <Select
                value={filters.semester}
                label="ภาคเรียน"
                onChange={(e) => handleFilterChange('semester', e.target.value)}
              >
                <MenuItem value="1">เทอม 1</MenuItem>
                <MenuItem value="2">เทอม 2</MenuItem>
                <MenuItem value="summer">ฤดูร้อน</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>แผนก</InputLabel>
              <Select
                value={filters.deptId}
                label="แผนก"
                onChange={(e) => handleFilterChange('deptId', e.target.value)}
              >
                <MenuItem value="">ทั้งหมด</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.dept_id} value={dept.dept_id}>
                    {dept.dept_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>ห้องเรียน</InputLabel>
              <Select
                value={filters.classId}
                label="ห้องเรียน"
                onChange={(e) => handleFilterChange('classId', e.target.value)}
              >
                <MenuItem value="">ทั้งหมด</MenuItem>
                {classes
                  .filter(cls => !filters.deptId || cls.dept_id === parseInt(filters.deptId))
                  .map((cls) => (
                    <MenuItem key={cls.class_id} value={cls.class_id}>
                      {cls.class_name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="วันที่เริ่มต้น"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="วันที่สิ้นสุด"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Report Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab icon={<PieChartIcon />} label="ภาพรวม" />
          <Tab icon={<BarChartIcon />} label="รายวัน" />
          <Tab icon={<TrendingUpIcon />} label="รายเดือน" />
          <Tab icon={<PeopleIcon />} label="รายบุคคล" />
        </Tabs>
      </Paper>

      <Box>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    เข้าเรียนทั้งหมด
                  </Typography>
                  <Typography variant="h4">
                    {reportData?.summary?.total || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    มา
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#4caf50' }}>
                    {reportData?.summary?.present || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    สาย
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#ffc107' }}>
                    {reportData?.summary?.late || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    ขาด/ลา
                  </Typography>
                  <Typography variant="h4" sx={{ color: '#f44336' }}>
                    {(reportData?.summary?.absent || 0) + (reportData?.summary?.leave || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* Pie Chart */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    สัดส่วนการเข้าเรียน
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'มา', value: reportData?.summary?.present || 0 },
                          { name: 'สาย', value: reportData?.summary?.late || 0 },
                          { name: 'ขาด', value: reportData?.summary?.absent || 0 },
                          { name: 'ลา', value: reportData?.summary?.leave || 0 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[0,1,2,3].map((index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Department Stats */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    สถิติแยกตามแผนก
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>แผนก</TableCell>
                          <TableCell align="right">นักเรียน</TableCell>
                          <TableCell align="right">เข้าเรียน</TableCell>
                          <TableCell align="right">%</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData?.byDepartment?.map((dept) => (
                          <TableRow key={dept.dept_name}>
                            <TableCell>{dept.dept_name}</TableCell>
                            <TableCell align="right">{dept.total_students}</TableCell>
                            <TableCell align="right">{dept.attended}</TableCell>
                            <TableCell align="right">
                              {((dept.attended / dept.total_students) * 100).toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                สถิติรายวัน
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={reportData?.daily || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Bar dataKey="present" name="มา" fill="#4caf50" />
                  <Bar dataKey="late" name="สาย" fill="#ffc107" />
                  <Bar dataKey="absent" name="ขาด" fill="#f44336" />
                  <Bar dataKey="leave" name="ลา" fill="#2196f3" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                สถิติรายเดือน
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={reportData?.monthly || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="present" name="มา" stroke="#4caf50" />
                  <Line type="monotone" dataKey="late" name="สาย" stroke="#ffc107" />
                  <Line type="monotone" dataKey="absent" name="ขาด" stroke="#f44336" />
                  <Line type="monotone" dataKey="leave" name="ลา" stroke="#2196f3" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                รายละเอียดรายบุคคล
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>วันที่</TableCell>
                      <TableCell>เวลา</TableCell>
                      <TableCell>รหัสนักศึกษา</TableCell>
                      <TableCell>ชื่อ-นามสกุล</TableCell>
                      <TableCell>ห้อง</TableCell>
                      <TableCell>สถานะ</TableCell>
                      <TableCell>หมายเหตุ</TableCell>
                      <TableCell>ครูผู้บันทึก</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData?.details?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          ไม่พบข้อมูล
                        </TableCell>
                      </TableRow>
                    ) : (
                      reportData?.details?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.check_in_date}</TableCell>
                          <TableCell>{item.check_in_time}</TableCell>
                          <TableCell>{item.student_code}</TableCell>
                          <TableCell>{item.student_name}</TableCell>
                          <TableCell>{item.class_name}</TableCell>
                          <TableCell>{getStatusChip(item.status)}</TableCell>
                          <TableCell>{item.note || '-'}</TableCell>
                          <TableCell>{item.teacher_name}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </TabPanel>
      </Box>
    </Box>
  );
};

export default Reports;