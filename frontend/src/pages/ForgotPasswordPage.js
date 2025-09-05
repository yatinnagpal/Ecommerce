import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, Stack, Link } from '@mui/material';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

function ForgotPasswordPage() {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetData, setResetData] = useState(null);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setResetData(null);
    try {
      const { data } = await axios.post('/api/account/password-reset/', { email });
      setSuccess(data.detail);
      setResetData({ uid: data.uid, token: data.token });
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.detail
          ? err.response.data.detail
          : 'Something went wrong.'
      );
    }
    setLoading(false);
  };

  const handleResetPassword = () => {
    if (resetData) {
      history.push(`/reset-password?uid=${resetData.uid}&token=${resetData.token}`);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper elevation={6} sx={{ p: 4, width: 350 }}>
        <Stack spacing={2}>
          <Typography variant="h5" align="center" fontWeight={700} gutterBottom>
            Forgot Password
          </Typography>
          {success && <Alert severity="success">{success}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          {resetData && (
            <Alert severity="info">
              <Typography variant="body2" gutterBottom>
                Reset token generated successfully! Click the button below to reset your password.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                size="small" 
                onClick={handleResetPassword}
                sx={{ mt: 1 }}
              >
                Reset Password
              </Button>
            </Alert>
          )}
          <form onSubmit={submitHandler}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
              />
              <Button type="submit" variant="contained" color="primary" size="large" fullWidth disabled={loading}>
                {loading ? 'Generating...' : 'Generate Reset Token'}
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Box>
  );
}

export default ForgotPasswordPage;
