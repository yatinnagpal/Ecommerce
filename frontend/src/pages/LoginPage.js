import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { login } from '../actions/userActions';

import { Box, Button, TextField, Typography, Paper, Alert, Stack } from '@mui/material';


function LoginPage({ history }) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const dispatch = useDispatch()

    // reducer
    const userLoginReducer = useSelector(state => state.userLoginReducer)
    const { error, userInfo } = userLoginReducer

    useEffect(() => {
        if (userInfo) {
            history.push('/') // homepage
        }
    }, [history, userInfo])

    const submitHandler = (e) => {
        e.preventDefault()
        dispatch(login(username, password))
    }

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <Paper elevation={6} sx={{ p: 4, width: 350 }}>
                <Stack spacing={2}>
                    <Typography variant="h4" align="center" fontWeight={700} gutterBottom>
                        Sign In
                    </Typography>
                    {error && <Alert severity="error">{error}</Alert>}
                    <form onSubmit={submitHandler}>
                        <Stack spacing={2}>
                            <TextField
                                label="Username"
                                variant="outlined"
                                fullWidth
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoFocus
                                required
                            />
                            <TextField
                                label="Password"
                                variant="outlined"
                                type="password"
                                fullWidth
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Button type="submit" variant="contained" color="primary" size="large" fullWidth>
                                Sign In
                            </Button>
                            <Typography align="right" sx={{ mt: 1 }}>
                                <Link to="/forgot-password" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}>
                                    Forgot Password?
                                </Link>
                            </Typography>
                        </Stack>
                    </form>
                    <Typography align="center" sx={{ mt: 2 }}>
                        Do not have an account?{' '}
                        <Link to="/register" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}>
                            Register
                        </Link>
                    </Typography>
                </Stack>
            </Paper>
        </Box>
    );
}

export default LoginPage