import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { register } from '../actions/userActions';
import { Box, Button, TextField, Typography, Paper, Alert, Stack } from '@mui/material';

function RegisterPage({ history, variant }) {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [message, setMessage] = useState("")

    const dispatch = useDispatch()

    // reducer
    const userRegisterReducer = useSelector(state => state.userRegisterReducer)
    const { error, userInfo } = userRegisterReducer

    useEffect(() => {
        if (userInfo) {
            history.push('/') // homepage
        }
    }, [history, userInfo])

    const submitHandler = (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setMessage('Passwords do not match!')
        } else {
            dispatch(register(username, email, password))
        }
    }

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <Paper elevation={6} sx={{ p: 4, width: 350 }}>
                <Stack spacing={2}>
                    <Typography variant="h4" align="center" fontWeight={700} gutterBottom>
                        Sign Up
                    </Typography>
                    {message && <Alert severity="error">{message}</Alert>}
                    {error && <Alert severity="error">{error}</Alert>}
                    <form onSubmit={submitHandler}>
                        <Stack spacing={2}>
                            <TextField
                                label="Username"
                                variant="outlined"
                                fullWidth
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            <TextField
                                label="Email Address"
                                variant="outlined"
                                type="email"
                                fullWidth
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                            <TextField
                                label="Confirm Password"
                                variant="outlined"
                                type="password"
                                fullWidth
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <Button type="submit" variant="contained" color="primary" size="large" fullWidth>
                                Sign Up
                            </Button>
                        </Stack>
                    </form>
                    <Typography align="center" sx={{ mt: 2 }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}>
                            Login
                        </Link>
                    </Typography>
                </Stack>
            </Paper>
        </Box>
    );
}

export default RegisterPage