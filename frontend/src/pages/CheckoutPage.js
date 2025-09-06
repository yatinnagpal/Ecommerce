import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductDetails } from '../actions/productActions';
import CreateCardComponent from '../components/CreateCardComponent';
import ChargeCardComponent from '../components/ChargeCardComponent';
import { savedCardsList } from '../actions/cardActions';
import UserAddressComponent from '../components/UserAddressComponent';
import { checkTokenValidation, logout } from '../actions/userActions';
import { CHARGE_CARD_RESET } from '../constants/index';
import {
    Box, Typography, Paper, Grid, Card, CardContent, CardMedia, Alert, CircularProgress, Link as MuiLink
} from '@mui/material';

const CheckoutPage = ({ match }) => {

    let history = useHistory()

    const dispatch = useDispatch()
    const [addressSelected, setAddressSelected] = useState(false)
    const [selectedAddressId, setSelectedAddressId] = useState(0)

    // set address id handler
    const handleAddressId = (id) => {
        if (id) {
            setAddressSelected(true)
        }
        setSelectedAddressId(id)
    }
      
    // check token validation reducer
    const checkTokenValidationReducer = useSelector(state => state.checkTokenValidationReducer)
    const { error: tokenError } = checkTokenValidationReducer

    // product details reducer
    const productDetailsReducer = useSelector(state => state.productDetailsReducer)
    const { loading, error, product } = productDetailsReducer

    // create card reducer
    const createCardReducer = useSelector(state => state.createCardReducer)
    const { error: cardCreationError, success, loading: cardCreationLoading } = createCardReducer

    // login reducer
    const userLoginReducer = useSelector(state => state.userLoginReducer)
    const { userInfo } = userLoginReducer

    // saved cards list reducer
    const savedCardsListReducer = useSelector(state => state.savedCardsListReducer)
    const { stripeCards } = savedCardsListReducer

    useEffect(() => {
        if (!userInfo) {
            history.push("/login")
        } else {
            dispatch(checkTokenValidation())
            dispatch(getProductDetails(match.params.id))
            dispatch(savedCardsList())
            dispatch({
                type: CHARGE_CARD_RESET
            })
        }
    }, [dispatch, match, history, success, userInfo])

    if (userInfo && tokenError === "Request failed with status code 401") {
        alert("Session expired, please login again.")
        dispatch(logout())
        history.push("/login")
        window.location.reload()
      }

    return (
        <Box sx={{ p: { xs: 1, md: 4 } }}>
            {cardCreationError && <Alert severity="error" sx={{ mb: 2 }}>{cardCreationError}</Alert>}
            {loading && (
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Typography variant="h6">Getting Checkout Info</Typography>
                    <CircularProgress size={28} />
                </Box>
            )}
            {!loading && cardCreationLoading && (
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Typography variant="h6">Checking your card</Typography>
                    <CircularProgress size={28} />
                </Box>
            )}
            {error ? (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            ) : (
                <Paper elevation={3} sx={{ p: 3, maxWidth: 1100, mx: 'auto', mt: 2 }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="h5" fontWeight={700} gutterBottom>Checkout Summary</Typography>
                            <Card sx={{ display: 'flex', mb: 3 }}>
                                <CardMedia
                                    component="img"
                                    sx={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 2, m: 2 }}
                                    image={product.image}
                                    alt={product.name}
                                />
                                <CardContent sx={{ flex: 1 }}>
                                    <Typography variant="h6" fontWeight={600} gutterBottom>{product.name}</Typography>
                                    <Typography variant="h6" color="success.main">₹ {product.price}</Typography>
                                </CardContent>
                            </Card>
                            <Box display="flex" alignItems="center" mb={1}>
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
                                    product={product}
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
}

export default CheckoutPage