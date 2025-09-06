import React, { useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from './stripeConfig';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'


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



const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const App = () => {
  const [mode, setMode] = useState('light');
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
    },
  }), [mode]);

  // Pass toggle function to NavBar
  const handleThemeToggle = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeProvider theme={theme}>
      <div style={{ minHeight: '100vh', background: theme.palette.background.default }}>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
        <Elements stripe={stripePromise}>
          <Router>
            <Navbar onThemeToggle={handleThemeToggle} mode={mode} />
            <div className="container mt-4">
              <Switch>
              <Route path="/" component={ProductListPage} exact />
              <Route path="/new-product/" component={ProductCreatePage} exact />
              <Route path="/product/:id/" component={ProductDetailsPage} exact />
              <Route path="/product-update/:id/" component={ProductUpdatePage} exact />
              <Route path="/product/:id/checkout/" component={CheckoutPage} exact />
              <Route path="/payment-status" component={PaymentStatus} exact />
              <Route path="/login" component={LoginPage} exact />
              <Route path="/register" component={RegisterPage} exact />
              <Route path="/forgot-password" component={ForgotPasswordPage} exact />
              <Route path="/reset-password" component={ResetPasswordPage} exact />
              <Route path="/account" component={AccountPage} exact />
              <Route path="/account/update/" component={AccountUpdatePage} exact />
              <Route path="/account/delete/" component={DeleteUserAccountPage} exact />
              <Route path="/stripe-card-details" component={CardDetailsPage} exact />
              <Route path="/stripe-card-update" component={CardUpdatePage} exact />
              <Route path="/all-addresses/" component={AllAddressesOfUserPage} exact />
              <Route path="/all-addresses/:id/" component={AddressUpdatePage} exact />
              <Route path="/all-orders/" component={OrdersListPage} exact />
              <Route component={NotFound} />
            </Switch>
          </div>
        </Router>
      </Elements>
      </div>
    </ThemeProvider>
  );
}

export default App
