import React from 'react'
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useDispatch, useSelector } from 'react-redux'
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { logout } from '../actions/userActions'
import { useHistory } from "react-router-dom";
import SearchBarForProducts from './SearchBarForProducts'



function NavBar({ onThemeToggle, mode }) {

    let history = useHistory()
    const dispatch = useDispatch()

    // login reducer
    const userLoginReducer = useSelector(state => state.userLoginReducer)
    const { userInfo } = userLoginReducer

    // logout
    const logoutHandler = () => {
        dispatch(logout()) // action
        history.push("/login")
        window.location.reload()
    }

    return (
        <header>
            <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
                <Container fluid style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LinkContainer to="/">
                            <Navbar.Brand><i className="mb-2 fas fa-home"> Home</i></Navbar.Brand>
                        </LinkContainer>
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', pr: 2 }}>
                        <Box sx={{ minWidth: { xs: 180, md: 320 }, mr: { xs: 1, md: 4 } }}>
                            <SearchBarForProducts />
                        </Box>
                    </Box>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav" style={{ justifyContent: 'flex-end' }}>
                        <Nav className="mr-auto" style={{ marginRight: 'auto', marginLeft: 0 }}>


                            {/* New Product (Admins Only) */}

                            {userInfo && userInfo.admin ?
                                <LinkContainer to="/new-product/">
                                    <Nav.Link >Add Product</Nav.Link>
                                </LinkContainer>
                                : ""
                            }


                        </Nav>

                        {/* login-logout condition here */}

                        <IconButton sx={{ mr: 2 }} onClick={onThemeToggle} color="inherit">
                            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>
                        {userInfo ?
                            <div>
                                <NavDropdown
                                    className="navbar-nav text-capitalize"
                                    title={userInfo.username}
                                    id='username'
                                    menuAlign="end"
                                    style={{ left: 'auto', right: 0, minWidth: 180, maxWidth: 220 }}
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
                                    <NavDropdown.Item onClick={logoutHandler}>
                                        Logout
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </div>
                            :

                            <LinkContainer to="/login">
                                <Nav.Link><i className="fas fa-user"></i> Login</Nav.Link>
                            </LinkContainer>
                        }
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    )
}

export default NavBar
