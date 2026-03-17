import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Loading from '../../components/common/Loading';
import Error from '../../components/common/Error';
import { useState } from 'react';

const TeacherClasses = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={() => setError(null)} />;

  return (
    <Box>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4">🏫 ห้องเรียนที่สอน</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          หน้านี้กำลังพัฒนา...
        </Typography>
      </Paper>
    </Box>
  );
};

export default TeacherClasses;