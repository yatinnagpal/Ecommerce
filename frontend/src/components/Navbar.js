/**
 * Navigation Bar component for the E-commerce application.
 * 
 * This component provides:
 * - Main navigation links
 * - User authentication status
 * - Theme toggle functionality
 * - Search functionality
 * - User dropdown menu with account options
 */

import React from 'react';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useDispatch, useSelector } from 'react-redux';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useHistory } from "react-router-dom";

// Import actions and components
import { logout } from '../actions/userActions';
import SearchBarForProducts from './SearchBarForProducts';

/**
 * Navigation Bar component
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onThemeToggle - Function to toggle theme mode
 * @param {string} props.mode - Current theme mode ('light' or 'dark')
 * @returns {JSX.Element} Navigation bar component
 */
function NavBar({ onThemeToggle, mode }) {
    const history = useHistory();
    const dispatch = useDispatch();

    // Get user information from Redux store
    const userLoginReducer = useSelector(state => state.userLoginReducer);
    const { userInfo } = userLoginReducer;

    /**
     * Handle user logout
     * Dispatches logout action, redirects to login page, and reloads the page
     */
    const logoutHandler = () => {
        dispatch(logout()); // Dispatch logout action
        history.push("/login");
        window.location.reload(); // Reload to clear any cached state
    };

    return (
        <header>
            <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
                <Container fluid style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between' 
                }}>
                    {/* Brand/Logo Section */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LinkContainer to="/">
                            <Navbar.Brand>
                                <i className="mb-2 fas fa-home"> Home</i>
                            </Navbar.Brand>
                        </LinkContainer>
                    </Box>

                    {/* Search Bar Section */}
                    <Box sx={{ 
                        flex: 1, 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        alignItems: 'center', 
                        pr: 2 
                    }}>
                        <Box sx={{ 
                            minWidth: { xs: 180, md: 320 }, 
                            mr: { xs: 1, md: 4 } 
                        }}>
                            <SearchBarForProducts />
                        </Box>
                    </Box>

                    {/* Mobile Menu Toggle */}
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    
                    {/* Navigation Menu */}
                    <Navbar.Collapse id="basic-navbar-nav" style={{ justifyContent: 'flex-end' }}>
                        <Nav className="mr-auto" style={{ marginRight: 'auto', marginLeft: 0 }}>
                            {/* Admin-only navigation items */}
                            {userInfo && userInfo.admin && (
                                <LinkContainer to="/new-product/">
                                    <Nav.Link>Add Product</Nav.Link>
                                </LinkContainer>
                            )}
                        </Nav>

                        {/* Theme Toggle Button */}
                        <IconButton 
                            sx={{ mr: 2 }} 
                            onClick={onThemeToggle} 
                            color="inherit"
                            aria-label="toggle theme"
                        >
                            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>

                        {/* User Authentication Section */}
                        {userInfo ? (
                            // Authenticated User Dropdown
                            <div>
                                <NavDropdown
                                    className="navbar-nav text-capitalize"
                                    title={userInfo.username}
                                    id='username'
                                    menuAlign="end"
                                    style={{ 
                                        left: 'auto', 
                                        right: 0, 
                                        minWidth: 180, 
                                        maxWidth: 220 
                                    }}
                                    popperConfig={{
                                        modifiers: [
                                            {
                                                name: 'preventOverflow',
                                                options: {
                                                    boundary: 'viewport',
                                                    padding: 8,
                                                },
                                            },
                                        ],
                                    }}
                                >
                                    <LinkContainer to="/account">
                                        <NavDropdown.Item>Account Settings</NavDropdown.Item>
                                    </LinkContainer>
                                    <LinkContainer to="/all-addresses/">
                                        <NavDropdown.Item>Address Settings</NavDropdown.Item>
                                    </LinkContainer>
                                    <LinkContainer to="/stripe-card-details/">
                                        <NavDropdown.Item>Card Settings</NavDropdown.Item>
                                    </LinkContainer>
                                    <LinkContainer to="/all-orders/">
                                        <NavDropdown.Item>All Orders</NavDropdown.Item>
                                    </LinkContainer>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={logoutHandler}>
                                        Logout
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </div>
                        ) : (
                            // Guest User Login Link
                            <LinkContainer to="/login">
                                <Nav.Link>
                                    <i className="fas fa-user"></i> Login
                                </Nav.Link>
                            </LinkContainer>
                        )}
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
}

export default NavBar
