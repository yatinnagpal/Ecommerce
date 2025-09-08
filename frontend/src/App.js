/**
 * Main App component for the E-commerce application.
 * 
 * This component sets up the application structure including:
 * - Theme provider for Material-UI theming
 * - Stripe Elements provider for payment processing
 * - React Router for navigation
 * - Toast notifications
 * - Global state management
 */

import React, { useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// Import Stripe configuration
import { STRIPE_PUBLISHABLE_KEY } from './stripeConfig';

// Import page components
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProductListPage from './pages/ProductsListPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import Navbar from './components/Navbar';
import PaymentStatus from './components/PaymentStatus';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CardUpdatePage from './pages/CardUpdatePage';
import CardDetailsPage from './pages/CardDetailsPage';
import AccountPage from './pages/AccountPage';
import AccountUpdatePage from './pages/AccountUpdatePage';
import DeleteUserAccountPage from './pages/DeleteUserAccountPage';
import AllAddressesOfUserPage from './pages/AllAddressesOfUserPage';
import AddressUpdatePage from './pages/AddressUpdatePage';
import OrdersListPage from './pages/OrdersListPage';
import ProductCreatePage from './pages/ProductCreatePage';
import ProductUpdatePage from './pages/ProductUpdatePage';
import NotFound from './pages/NotFoundPage';
import CartPage from './pages/CartPage';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

/**
 * Main App component
 * 
 * @returns {JSX.Element} The main application component
 */
const App = () => {
  // Theme state management
  const [mode, setMode] = useState('light');
  
  // Create theme with current mode
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#1976d2' : '#90caf9',
      },
      secondary: {
        main: mode === 'light' ? '#dc004e' : '#f48fb1',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none', // Disable uppercase transformation
          },
        },
      },
    },
  }), [mode]);

  /**
   * Handle theme toggle between light and dark modes
   */
  const handleThemeToggle = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <div style={{ 
        minHeight: '100vh', 
        background: theme.palette.background.default,
        transition: 'background-color 0.3s ease-in-out'
      }}>
        {/* Toast notifications container */}
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar={false} 
          newestOnTop 
          closeOnClick 
          pauseOnFocusLoss 
          draggable 
          pauseOnHover 
          theme={mode}
        />
        
        {/* Stripe Elements provider for payment processing */}
        <Elements stripe={stripePromise}>
          <Router>
            {/* Navigation bar */}
            <Navbar onThemeToggle={handleThemeToggle} mode={mode} />
            
            {/* Main content area */}
            <div className="container mt-4">
              <Switch>
                {/* Public routes */}
                <Route path="/" component={ProductListPage} exact />
                <Route path="/products/:id/" component={ProductDetailsPage} exact />
                <Route path="/product/:id/checkout/" component={CheckoutPage} exact />
                <Route path="/payment-status" component={PaymentStatus} exact />
                <Route path="/login" component={LoginPage} exact />
                <Route path="/register" component={RegisterPage} exact />
                <Route path="/forgot-password" component={ForgotPasswordPage} exact />
                <Route path="/reset-password" component={ResetPasswordPage} exact />
                <Route path="/cart" component={CartPage} exact />
                <Route path="/checkout" component={CheckoutPage} exact />
                
                {/* Protected user routes */}
                <Route path="/account" component={AccountPage} exact />
                <Route path="/account/update/" component={AccountUpdatePage} exact />
                <Route path="/account/delete/" component={DeleteUserAccountPage} exact />
                <Route path="/stripe-card-details" component={CardDetailsPage} exact />
                <Route path="/stripe-card-update" component={CardUpdatePage} exact />
                <Route path="/all-addresses/" component={AllAddressesOfUserPage} exact />
                <Route path="/all-addresses/:id/" component={AddressUpdatePage} exact />
                <Route path="/all-orders/" component={OrdersListPage} exact />
                
                {/* Admin routes */}
                <Route path="/new-product/" component={ProductCreatePage} exact />
                <Route path="/product-update/:id/" component={ProductUpdatePage} exact />
                
                {/* 404 route - must be last */}
                <Route component={NotFound} />
              </Switch>
            </div>
          </Router>
        </Elements>
      </div>
    </ThemeProvider>
  );
};

export default App;
