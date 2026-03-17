import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  HowToReg as AttendanceIcon,
  History as HistoryIcon,
  Assessment as ReportIcon,
  People as StudentsIcon,
  Person as TeachersIcon,
  School as ClassesIcon,
  Category as DepartmentsIcon,
  CheckCircle as ApprovalsIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 260;

const Sidebar = ({ mobileOpen, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin, isTeacher, isStudent } = useAuth();

  const adminMenu = [
    { text: 'แดชบอร์ด', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'จัดการครู', icon: <TeachersIcon />, path: '/admin/teachers' },
    { text: 'จัดการนักเรียน', icon: <StudentsIcon />, path: '/admin/students' },
    { text: 'จัดการห้องเรียน', icon: <ClassesIcon />, path: '/admin/classes' },
    { text: 'จัดการแผนก', icon: <DepartmentsIcon />, path: '/admin/departments' },
    { text: 'รายงาน', icon: <ReportIcon />, path: '/admin/reports' },
    { text: 'อนุมัติคำขอ', icon: <ApprovalsIcon />, path: '/admin/approvals' },
    { text: 'ตั้งค่าระบบ', icon: <SettingsIcon />, path: '/admin/settings' },
  ];

  const teacherMenu = [
    { text: 'แดชบอร์ด', icon: <DashboardIcon />, path: '/teacher/dashboard' },
    { text: 'เช็คชื่อ', icon: <AttendanceIcon />, path: '/teacher/attendance' },
    { text: 'ประวัติเช็คชื่อ', icon: <HistoryIcon />, path: '/teacher/history' },
    { text: 'ห้องเรียนที่สอน', icon: <ClassesIcon />, path: '/teacher/classes' },
    { text: 'รายชื่อนักเรียน', icon: <StudentsIcon />, path: '/teacher/students' },
  ];

  const studentMenu = [
    { text: 'แดชบอร์ด', icon: <DashboardIcon />, path: '/student/dashboard' },
    { text: 'ประวัติการเข้าเรียน', icon: <HistoryIcon />, path: '/student/history' },
    { text: 'โปรไฟล์ของฉัน', icon: <SettingsIcon />, path: '/student/profile' },
    { text: 'ขอลงทะเบียน', icon: <ApprovalsIcon />, path: '/student/registration' },
  ];

  const menuItems = isAdmin ? adminMenu : isTeacher ? teacherMenu : studentMenu;

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#1e293b', color: 'white' }}>
      {/* Logo Area */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fff', mb: 1 }}>
          ระบบเช็คชื่อ
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8' }}>
          {user?.title}{user?.first_name} {user?.last_name}
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748b' }}>
          {isAdmin ? '👑 ผู้อำนวยการ' : isTeacher ? '👩‍🏫 ครู' : '🧑 นักเรียน'}
        </Typography>
      </Box>

      <Divider sx={{ bgcolor: '#334155' }} />

      {/* Menu Items */}
      <List sx={{ flex: 1, px: 2, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            component="div"
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              borderRadius: 2,
              mb: 1,
              color: '#fff',
              '&.Mui-selected': {
                bgcolor: '#2563eb',
                '&:hover': { bgcolor: '#2563eb' },
                '& .MuiListItemIcon-root': { color: '#fff' },
              },
              '&:hover': { bgcolor: '#334155' },
            }}
          >
            <ListItemIcon sx={{ color: '#94a3b8', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                fontSize: '0.95rem',
              }}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ bgcolor: '#334155' }} />

      {/* Logout Button */}
      <List sx={{ p: 2 }}>
        <ListItem
          component="div"
          onClick={logout}
          sx={{
            borderRadius: 2,
            color: '#ef4444',
            '&:hover': { bgcolor: '#334155' },
          }}
        >
          <ListItemIcon sx={{ color: '#ef4444', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="ออกจากระบบ" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: '#1e293b',
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;