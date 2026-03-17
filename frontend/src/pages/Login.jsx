import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  Fade,
  Fab,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Person as TeacherIcon,
  PersonOutline as StudentIcon,
  Visibility,
  VisibilityOff,
  School as SchoolIcon,
  ChevronRight as ChevronRightIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
} from '@mui/icons-material';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// สร้าง Theme Context
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('themeMode');
    return saved || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleMode = () => {
    setMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeContext);

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const shouldReduceMotion = useReducedMotion();
  const { mode, toggleMode } = useThemeMode();
  
  const [selectedRole, setSelectedRole] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error: authError } = useAuth();
  const navigate = useNavigate();

  // ธีมสี
  const themeColors = {
    dark: {
      background: 'radial-gradient(circle at 30% 30%, #1a1a2e, #0a0a0f)',
      cardBg: 'rgba(20,20,30,0.8)',
      text: 'white',
      textSecondary: 'rgba(255,255,255,0.7)',
      border: 'rgba(255,255,255,0.1)',
      dialogBg: 'rgba(10,10,15,0.98)',
    },
    light: {
      background: 'radial-gradient(circle at 30% 30%, #e0e7ff, #c7d2fe)',
      cardBg: 'rgba(255,255,255,0.9)',
      text: '#1e293b',
      textSecondary: '#475569',
      border: 'rgba(0,0,0,0.1)',
      dialogBg: 'rgba(255,255,255,0.98)',
    }
  };

  const colors = themeColors[mode];

  const roles = [
    {
      id: 'admin',
      title: 'ผู้อำนวยการ',
      icon: <AdminIcon />,
      color: mode === 'dark' ? '#ff3366' : '#dc2626',
      lightColor: mode === 'dark' ? 'rgba(255,51,102,0.15)' : 'rgba(220,38,38,0.1)',
      gradient: mode === 'dark' 
        ? 'linear-gradient(145deg, #ff3366, #ff6b6b)'
        : 'linear-gradient(145deg, #dc2626, #ef4444)',
      demoUser: 'admin',
      demoPass: '1234',
    },
    {
      id: 'teacher',
      title: 'ครู/อาจารย์',
      icon: <TeacherIcon />,
      color: mode === 'dark' ? '#33ccff' : '#2563eb',
      lightColor: mode === 'dark' ? 'rgba(51,204,255,0.15)' : 'rgba(37,99,235,0.1)',
      gradient: mode === 'dark'
        ? 'linear-gradient(145deg, #33ccff, #6b8cff)'
        : 'linear-gradient(145deg, #2563eb, #3b82f6)',
      demoUser: 'T001',
      demoPass: '1234',
    },
    {
      id: 'student',
      title: 'นักเรียน/นักศึกษา',
      icon: <StudentIcon />,
      color: mode === 'dark' ? '#33ff99' : '#16a34a',
      lightColor: mode === 'dark' ? 'rgba(51,255,153,0.15)' : 'rgba(22,163,74,0.1)',
      gradient: mode === 'dark'
        ? 'linear-gradient(145deg, #33ff99, #6bffb5)'
        : 'linear-gradient(145deg, #16a34a, #22c55e)',
      demoUser: 'S001',
      demoPass: '1234',
    },
  ];

  const handleRoleClick = (role) => {
    setSelectedRole(role);
    setUsername(role.demoUser);
    setPassword(role.demoPass);
    setLocalError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRole(null);
    setUsername('');
    setPassword('');
    setShowPassword(false);
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!username.trim() || !password.trim()) {
      setLocalError('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    setIsSubmitting(true);
    const result = await login(username, password);
    setIsSubmitting(false);

    if (result.success) {
      const userRole = result.user?.role_id;
      const expectedRole = 
        selectedRole.id === 'admin' ? 1 :
        selectedRole.id === 'teacher' ? 2 : 3;

      if (userRole !== expectedRole) {
        setLocalError(`บัญชีนี้ไม่ใช่${selectedRole.title}`);
        return;
      }

      handleCloseDialog();
      navigate(result.redirect);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const getRoleIcon = () => {
    switch(selectedRole?.id) {
      case 'admin': return <AdminIcon sx={{ fontSize: 40, color: selectedRole?.color }} />;
      case 'teacher': return <TeacherIcon sx={{ fontSize: 40, color: selectedRole?.color }} />;
      case 'student': return <StudentIcon sx={{ fontSize: 40, color: selectedRole?.color }} />;
      default: return null;
    }
  };

  // ขนาดที่เท่ากันทุกการ์ด
  const avatarSize = {
    xs: 90,
    sm: 110,
    md: 130,
  };

  const iconSize = {
    xs: 45,
    sm: 55,
    md: 65,
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.background,
        position: 'relative',
        overflow: 'hidden',
        transition: 'background 0.3s ease',
        py: { xs: 2, sm: 0 },
      }}
    >
      {/* ปุ่มสลับธีม */}
      <Fab
        onClick={toggleMode}
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1000,
          background: mode === 'dark' ? '#f5f5f5' : '#1e293b',
          color: mode === 'dark' ? '#1e293b' : '#f5f5f5',
          '&:hover': {
            background: mode === 'dark' ? '#e0e0e0' : '#0f172a',
          },
        }}
      >
        {mode === 'dark' ? <LightIcon /> : <DarkIcon />}
      </Fab>

      {/* Background grid */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: isMobile 
            ? 'none'
            : `
              linear-gradient(${mode === 'dark' ? 'rgba(51,204,255,0.03)' : 'rgba(37,99,235,0.03)'} 1px, transparent 1px),
              linear-gradient(90deg, ${mode === 'dark' ? 'rgba(51,204,255,0.03)' : 'rgba(37,99,235,0.03)'} 1px, transparent 1px)
            `,
          backgroundSize: '50px 50px',
          opacity: 0.5,
        }}
      />

      {/* Floating orbs */}
      {!isMobile && [...Array(3)].map((_, i) => (
        <Box
          key={i}
          component={shouldReduceMotion ? 'div' : motion.div}
          animate={shouldReduceMotion ? {} : {
            y: [0, -20, 0],
          }}
          transition={shouldReduceMotion ? {} : {
            duration: 8 + i * 2,
            repeat: Infinity,
          }}
          sx={{
            position: 'absolute',
            width: 200 + i * 50,
            height: 200 + i * 50,
            borderRadius: '50%',
            background: `radial-gradient(circle at 30% 30%, 
              ${roles[i % 3].color}08, 
              transparent 70%)`,
            filter: 'blur(40px)',
            top: `${20 + i * 10}%`,
            left: `${10 + i * 15}%`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      ))}

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <motion.div
          initial={shouldReduceMotion ? {} : { y: -30, opacity: 0 }}
          animate={shouldReduceMotion ? {} : { y: 0, opacity: 1 }}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
            <Box
              sx={{
                display: 'inline-flex',
                p: { xs: 1.5, sm: 2 },
                borderRadius: '50%',
                background: mode === 'dark' 
                  ? 'linear-gradient(145deg, #2563eb, #7c3aed)'
                  : 'linear-gradient(145deg, #1e40af, #5b21b6)',
                boxShadow: mode === 'dark' 
                  ? '0 0 30px #2563eb'
                  : '0 0 20px #1e40af',
                mb: 2,
              }}
            >
              <SchoolIcon sx={{ fontSize: isMobile ? 50 : 70, color: 'white' }} />
            </Box>

            <Typography 
              variant={isMobile ? "h4" : "h3"} 
              sx={{ 
                color: colors.text,
                fontWeight: 800, 
                textShadow: mode === 'dark' ? '0 0 10px #2563eb' : 'none',
                letterSpacing: { xs: '2px', md: '4px' },
              }}
            >
              ระบบเช็คชื่อ
            </Typography>
            <Typography 
              variant={isMobile ? "subtitle1" : "h5"} 
              sx={{ color: colors.textSecondary }}
            >
              วิทยาลัยเทคนิคเชียงใหม่
            </Typography>
          </Box>
        </motion.div>

        {/* Role Cards - ปรับขนาดให้เท่ากัน */}
        <Grid 
          container 
          spacing={{ xs: 2, md: 4 }} 
          justifyContent="center"
          alignItems="stretch"
        >
          {roles.map((role, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              key={role.id}
              sx={{
                display: 'flex',
              }}
            >
              <motion.div
                initial={shouldReduceMotion ? {} : { scale: 0.9, opacity: 0 }}
                animate={shouldReduceMotion ? {} : { scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                style={{
                  width: '100%',
                  display: 'flex',
                }}
              >
                <Card
                  onClick={() => handleRoleClick(role)}
                  sx={{
                    cursor: 'pointer',
                    background: colors.cardBg,
                    backdropFilter: 'blur(10px)',
                    border: `2px solid ${role.color}20`,
                    borderRadius: { xs: 3, md: 4 },
                    transition: 'all 0.3s',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 10px 40px -8px ${role.color}`,
                      borderColor: role.color,
                    },
                  }}
                >
                  <CardContent 
                    sx={{ 
                      textAlign: 'center', 
                      py: { xs: 3, md: 4 },
                      px: { xs: 2, md: 3 },
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Avatar
                        sx={{
                          width: avatarSize,
                          height: avatarSize,
                          background: role.gradient,
                          margin: '0 auto 16px',
                          border: `3px solid ${role.color}`,
                          boxShadow: `0 0 20px ${role.color}`,
                          '& svg': {
                            fontSize: iconSize,
                          },
                        }}
                      >
                        {role.icon}
                      </Avatar>
                      
                      <Typography 
                        variant={isMobile ? "h6" : "h5"} 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 700,
                          color: colors.text,
                          mb: 3,
                          minHeight: isMobile ? 'auto' : '64px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {role.title}
                      </Typography>
                    </Box>

                    <Button
                      variant="outlined"
                      size={isMobile ? "small" : "medium"}
                      endIcon={<ChevronRightIcon />}
                      sx={{
                        color: role.color,
                        borderColor: role.color,
                        borderWidth: 2,
                        mt: 'auto',
                        width: '100%',
                        maxWidth: '200px',
                        '&:hover': {
                          borderColor: role.color,
                          background: role.lightColor,
                        },
                      }}
                    >
                      เข้าสู่ระบบ
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Footer */}
        <Typography
          variant="body2"
          align="center"
          sx={{ 
            mt: { xs: 4, md: 6 }, 
            color: colors.textSecondary,
          }}
        >
          © {new Date().getFullYear()} วิทยาลัยเทคนิคเชียงใหม่
        </Typography>
      </Container>

      {/* Login Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: { xs: 3, md: 4 },
            background: colors.dialogBg,
            backdropFilter: 'blur(10px)',
            border: `2px solid ${selectedRole?.color}20`,
            mx: 2,
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1, pt: { xs: 3, md: 4 } }}>
          <Box
            sx={{
              display: 'inline-flex',
              p: { xs: 1.5, sm: 2 },
              borderRadius: '50%',
              background: selectedRole?.gradient,
              mb: 2,
              border: `2px solid ${selectedRole?.color}`,
              boxShadow: `0 0 20px ${selectedRole?.color}`,
            }}
          >
            {getRoleIcon()}
          </Box>
          
          <Typography variant={isMobile ? "h5" : "h4"} gutterBottom sx={{ color: colors.text, fontWeight: 700 }}>
            ยินดีต้อนรับ
          </Typography>
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            sx={{ color: selectedRole?.color, fontWeight: 600 }}
          >
            {selectedRole?.title}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          {(localError || authError) && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2, 
                background: mode === 'dark' ? 'rgba(255,51,51,0.1)' : 'rgba(220,38,38,0.1)',
                color: mode === 'dark' ? '#ff6b6b' : '#b91c1c',
              }}
            >
              {localError || authError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={selectedRole?.id === 'admin' ? 'รหัสผู้อำนวยการ' :
                     selectedRole?.id === 'teacher' ? 'รหัสครู' : 'รหัสนักศึกษา'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
              margin="normal"
              size={isMobile ? "small" : "medium"}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: colors.text,
                  '& fieldset': { borderColor: `${selectedRole?.color}40` },
                  '&:hover fieldset': { borderColor: selectedRole?.color },
                  '&.Mui-focused fieldset': { borderColor: selectedRole?.color },
                },
                '& .MuiInputLabel-root': {
                  color: colors.textSecondary,
                  '&.Mui-focused': { color: selectedRole?.color },
                },
              }}
            />

            <TextField
              fullWidth
              label="รหัสผ่าน"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              margin="normal"
              size={isMobile ? "small" : "medium"}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: colors.text,
                  '& fieldset': { borderColor: `${selectedRole?.color}40` },
                  '&:hover fieldset': { borderColor: selectedRole?.color },
                  '&.Mui-focused fieldset': { borderColor: selectedRole?.color },
                },
                '& .MuiInputLabel-root': {
                  color: colors.textSecondary,
                  '&.Mui-focused': { color: selectedRole?.color },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={handleClickShowPassword} 
                      edge="end"
                      sx={{ color: selectedRole?.color }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box 
              sx={{ 
                mt: 3, 
                p: 2, 
                background: selectedRole?.lightColor,
                borderRadius: 2,
                border: `1px solid ${selectedRole?.color}20`,
              }}
            >
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                💡 ทดสอบ: <strong style={{ color: selectedRole?.color }}>{selectedRole?.demoUser}</strong> / 
                <strong style={{ color: selectedRole?.color }}>{selectedRole?.demoPass}</strong>
              </Typography>
            </Box>
          </form>
        </DialogContent>

        <DialogActions sx={{ 
          p: { xs: 2, sm: 3, md: 4 }, 
          pt: { xs: 1, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1,
        }}>
          <Button 
            fullWidth 
            variant="outlined" 
            onClick={handleCloseDialog}
            sx={{ 
              borderRadius: 2,
              color: colors.text,
              borderColor: colors.border,
            }}
          >
            ยกเลิก
          </Button>
          <Button 
            fullWidth 
            variant="contained" 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            sx={{
              borderRadius: 2,
              background: selectedRole?.gradient,
              color: 'white',
              '&:hover': { 
                background: selectedRole?.gradient,
                filter: 'brightness(1.1)',
              },
            }}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'เข้าสู่ระบบ'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Wrapper component ที่ใช้ ThemeProvider
const LoginWithTheme = () => (
  <ThemeProvider>
    <Login />
  </ThemeProvider>
);

export default LoginWithTheme;