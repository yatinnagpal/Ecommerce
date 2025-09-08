import React, { useEffect, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom'; // Import useLocation
import { useDispatch, useSelector } from 'react-redux';
import { getProductDetails } from '../actions/productActions';
import { fetchCart } from '../actions/cartActions'; // Import fetchCart
import CreateCardComponent from '../components/CreateCardComponent';
import ChargeCardComponent from '../components/ChargeCardComponent';
import { savedCardsList } from '../actions/cardActions';
import UserAddressComponent from '../components/UserAddressComponent';
import { checkTokenValidation, logout } from '../actions/userActions';
import { CHARGE_CARD_RESET } from '../constants/index';
import {
    Box, Typography, Paper, Grid, Card, CardContent, CardMedia, Alert, CircularProgress, Link as MuiLink,
    List, ListItem, ListItemText, Divider
} from '@mui/material';

const CheckoutPage = ({ match }) => {

    let history = useHistory();
    let location = useLocation(); // Use useLocation hook

    const dispatch = useDispatch();
    const [addressSelected, setAddressSelected] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(0);
    const [singleProductQty, setSingleProductQty] = useState(1); // State for single product quantity

    // set address id handler
    const handleAddressId = (id) => {
        if (id) {
            setAddressSelected(true);
        }
        setSelectedAddressId(id);
    };
      
    // check token validation reducer
    const checkTokenValidationReducer = useSelector(state => state.checkTokenValidationReducer);
    const { error: tokenError } = checkTokenValidationReducer;

    // product details reducer (for single product checkout)
    const productDetailsReducer = useSelector(state => state.productDetailsReducer);
    const { loading: productLoading, error: productError, product } = productDetailsReducer;

    // cart reducer (for cart checkout)
    const cartReducer = useSelector(state => state.cart);
    const { loading: cartLoading, error: cartError, items: cartItems, total_price: cartTotalPrice } = cartReducer;

    // create card reducer
    const createCardReducer = useSelector(state => state.createCardReducer);
    const { error: cardCreationError, success, loading: cardCreationLoading } = createCardReducer;

    // login reducer
    const userLoginReducer = useSelector(state => state.userLoginReducer);
    const { userInfo } = userLoginReducer;

    // saved cards list reducer
    const savedCardsListReducer = useSelector(state => state.savedCardsListReducer);
    const { stripeCards } = savedCardsListReducer;

    useEffect(() => {
        if (!userInfo) {
            history.push("/login");
        } else {
            dispatch(checkTokenValidation());
            dispatch(savedCardsList());
            dispatch({ type: CHARGE_CARD_RESET });

            // Check if it's a single product checkout or cart checkout
            if (match.params.id) {
                // Single product checkout
                dispatch(getProductDetails(match.params.id));
                const query = new URLSearchParams(location.search);
                const qty = query.get('qty');
                if (qty) {
                    setSingleProductQty(Number(qty));
                }
            } else {
                // Cart checkout
                dispatch(fetchCart());
            }
        }
    }, [dispatch, match, history, success, userInfo, location.search]);

    if (userInfo && tokenError === "Request failed with status code 401") {
        alert("Session expired, please login again.");
        dispatch(logout());
        history.push("/login");
        window.location.reload();
    }

    const isLoading = productLoading || cartLoading || cardCreationLoading;
    const hasError = productError || cartError || cardCreationError;

    const itemsToDisplay = match.params.id ? (product ? [{ product, quantity: singleProductQty }] : []) : cartItems;
    const totalPriceToDisplay = match.params.id ? (product ? product.price * singleProductQty : 0) : cartTotalPrice;

    return (
        <Box sx={{ p: { xs: 1, md: 4 } }}>
            {hasError && <Alert severity="error" sx={{ mb: 2 }}>{hasError}</Alert>}
            {isLoading && (
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Typography variant="h6">Getting Checkout Info</Typography>
                    <CircularProgress size={28} />
                </Box>
            )}
            {!isLoading && (
                <Paper elevation={3} sx={{ p: 3, maxWidth: 1100, mx: 'auto', mt: 2 }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h5" fontWeight={700} gutterBottom>Checkout Summary</Typography>
                            {itemsToDisplay.length === 0 && !isLoading ? (
                                <Alert severity="info">No items to checkout. <Link to="/">Go back to products</Link></Alert>
                            ) : (
                                <List>
                                    {itemsToDisplay.map((item, index) => (
                                        <React.Fragment key={item.product.id || index}>
                                            <ListItem disablePadding>
                                                <Card sx={{ display: 'flex', width: '100%', mb: 1 }}>
                                                    <CardMedia
                                                        component="img"
                                                        sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1, m: 1 }}
                                                        image={item.product.image}
                                                        alt={item.product.name}
                                                    />
                                                    <CardContent sx={{ flex: 1 }}>
                                                        <Typography variant="subtitle1" fontWeight={600} gutterBottom>{item.product.name}</Typography>
                                                        <Typography variant="body2">Qty: {item.quantity}</Typography>
                                                        <Typography variant="body1" color="success.main">₹ {item.product.price} each</Typography>
                                                    </CardContent>
                                                </Card>
                                            </ListItem>
                                            <Divider component="li" />
                                        </React.Fragment>
                                    ))}
                                </List>
                            )}
                            <Typography variant="h5" fontWeight={700} sx={{ mt: 2 }}>
                                Total: ₹{totalPriceToDisplay.toFixed(2)}
                            </Typography>
                            <Box display="flex" alignItems="center" mb={1} mt={3}>
                                <Typography variant="h6">Billing Address</Typography>
                                <MuiLink
                                    component={Link}
                                    to="/all-addresses/"
                                    sx={{ ml: 2, mt: 0.5, fontWeight: 500 }}
                                >
                                    Edit/Add Address
                                </MuiLink>
                            </Box>
                            <UserAddressComponent handleAddressId={handleAddressId} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h5" fontWeight={700} gutterBottom>Payments Section</Typography>
                            {success ? (
                                <ChargeCardComponent
                                    selectedAddressId={selectedAddressId}
                                    addressSelected={addressSelected}
                                    product={match.params.id ? product : null} // Pass product only for single item checkout
                                    cartItems={match.params.id ? null : itemsToDisplay} // Pass cart items for cart checkout
                                    totalPrice={totalPriceToDisplay}
                                />
                            ) : (
                                <CreateCardComponent
                                    addressSelected={addressSelected}
                                    stripeCards={stripeCards}
                                />
                            )}
                        </Grid>
                    </Grid>
                </Paper>
            )}
        </Box>
    );
};

export default CheckoutPage;
