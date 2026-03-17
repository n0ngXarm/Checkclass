import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

const Error = ({ message = 'เกิดข้อผิดพลาด', onRetry }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
      }}
    >
      <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
        <ErrorIcon sx={{ fontSize: 80, color: '#ef4444', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {message}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ
        </Typography>
        {onRetry && (
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={onRetry}>
            ลองใหม่
          </Button>
        )}
      </Paper>
    </Box>
  );
};

export default Error;