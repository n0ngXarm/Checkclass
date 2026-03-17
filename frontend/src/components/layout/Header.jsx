import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    window.location.href = '/login';
  };

  const getInitials = () => {
    if (!user) return '?';
    return (user.first_name?.charAt(0) || '') + (user.last_name?.charAt(0) || '');
  };

  const getUserTitle = () => {
    if (user?.role === 'teacher') return '👩‍🏫 ครู';
    if (user?.role === 'student') return '🧑 นักเรียน';
    if (user?.role === 'admin') return '👑 ผู้ดูแล';
    return '';
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          ระบบเช็คชื่อออนไลน์
        </Typography>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              {user.title}{user.first_name} {user.last_name}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {getUserTitle()}
            </Typography>
            <Avatar onClick={handleMenu} sx={{ cursor: 'pointer', bgcolor: '#1976d2' }}>
              {getInitials()}
            </Avatar>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleLogout}>ออกจากระบบ</MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;