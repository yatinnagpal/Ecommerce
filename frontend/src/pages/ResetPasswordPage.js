import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, Stack } from '@mui/material';
import axios from 'axios';
import { useLocation, useHistory } from 'react-router-dom';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function ResetPasswordPage() {
  const query = useQuery();
  const history = useHistory();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const uid = query.get('uid');
  const token = query.get('token');

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post('/api/account/password-reset-confirm/', {
        uid,
        token,
        new_password: newPassword,
      });
      setSuccess(data.detail);
      setTimeout(() => history.push('/login'), 2000);
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.detail
          ? err.response.data.detail
          : 'Something went wrong.'
      );
    }
    setLoading(false);
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper elevation={6} sx={{ p: 4, width: 350 }}>
        <Stack spacing={2}>
          <Typography variant="h5" align="center" fontWeight={700} gutterBottom>
            Reset Password
          </Typography>
          {success && <Alert severity="success">{success}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <form onSubmit={submitHandler}>
            <Stack spacing={2}>
              <TextField
                label="New Password"
                variant="outlined"
                type="password"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <TextField
                label="Confirm Password"
                variant="outlined"
                type="password"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button type="submit" variant="contained" color="primary" size="large" fullWidth disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Box>
  );
}

export default ResetPasswordPage;
