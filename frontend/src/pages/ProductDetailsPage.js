import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteProduct, getProductDetails } from '../actions/productActions';
import { addToCart } from '../actions/cartActions';
import { Link } from 'react-router-dom';
import { CREATE_PRODUCT_RESET, DELETE_PRODUCT_RESET, UPDATE_PRODUCT_RESET, CARD_CREATE_RESET } from '../constants';
import {
    Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    Paper, Grid, Alert, CircularProgress, Divider, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

function ProductDetailsPage({ history, match }) {

    const [qty, setQty] = useState(1);
    const dispatch = useDispatch();

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const productDetailsReducer = useSelector(state => state.productDetailsReducer);
    const { loading, error, product } = productDetailsReducer;

    const userLoginReducer = useSelector(state => state.userLoginReducer);
    const { userInfo } = userLoginReducer;

    const deleteProductReducer = useSelector(state => state.deleteProductReducer);
    const { success: productDeletionSuccess } = deleteProductReducer;

    useEffect(() => {
        dispatch(getProductDetails(match.params.id));
        dispatch({ type: UPDATE_PRODUCT_RESET });
        dispatch({ type: CREATE_PRODUCT_RESET });
        dispatch({ type: CARD_CREATE_RESET });
    }, [dispatch, match]);

    const confirmDelete = () => {
        dispatch(deleteProduct(match.params.id));
        handleClose();
    };

    if (productDeletionSuccess) {
        alert("Product successfully deleted.");
        history.push("/");
        dispatch({ type: DELETE_PRODUCT_RESET });
    }

    const addToCartHandler = () => {
        if (userInfo) {
            dispatch(addToCart(match.params.id, qty));
            history.push('/cart');
        } else {
            history.push('/login');
        }
    };

    const buyNowHandler = () => {
        if (userInfo) {
            history.push(`/product/${product.id}/checkout/?qty=${qty}`);
        } else {
            history.push('/login');
        }
    };

    return (
        <Box sx={{ p: { xs: 1, md: 4 } }}>
            <Dialog open={show} onClose={handleClose}>
                <DialogTitle>
                    <Typography color="warning.main" component="span" sx={{ mr: 1 }}>
                        <span role="img" aria-label="warning">⚠️</span>
                    </Typography>
                    Delete Confirmation
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this product <em>"{product.name}"</em>?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="error" variant="contained" onClick={confirmDelete}>
                        Confirm Delete
                    </Button>
                    <Button color="primary" variant="outlined" onClick={handleClose}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

            {loading ? (
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h6">Getting Product Details</Typography>
                    <CircularProgress size={28} />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
            ) : (
                <Paper elevation={3} sx={{ p: 3, maxWidth: 1100, mx: 'auto', mt: 2 }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={5}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Box
                                    component="img"
                                    src={product.image}
                                    alt={product.name}
                                    sx={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 2, mb: 2 }}
                                />
                                {userInfo && userInfo.admin && (
                                    <Box display="flex" gap={2} width="100%">
                                        <Button variant="contained" color="error" fullWidth onClick={handleShow}>
                                            Delete Product
                                        </Button>
                                        <Button variant="contained" color="primary" fullWidth onClick={() => history.push(`/product-update/${product.id}/`)}>
                                            Edit Product
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="h5" fontWeight={700} gutterBottom>
                                {product.name}
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                                {product.description}
                            </Typography>
                            <Box display="flex" alignItems="center" border={1} borderColor="#C6ACE7" borderRadius={1} p={1} width="fit-content" mb={2}>
                                <Typography variant="subtitle1" fontWeight={500} mr={1}>Price:</Typography>
                                <Typography variant="h6" color="success.main">₹ {product.price}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Typography variant="h6" fontWeight={700} gutterBottom>Action</Typography>
                            <Divider sx={{ mb: 2 }} />
                            {product.stock > 0 ? (
                                <Box>
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel>Qty</InputLabel>
                                        <Select
                                            value={qty}
                                            label="Qty"
                                            onChange={(e) => setQty(e.target.value)}
                                        >
                                            {[...Array(Math.min(product.stock, 10)).keys()].map((x) => (
                                                <MenuItem key={x + 1} value={x + 1}>
                                                    {x + 1}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <Button
                                        onClick={addToCartHandler}
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        fullWidth
                                        sx={{ mb: 1 }}
                                    >
                                        Add to Cart
                                    </Button>
                                    <Button
                                        onClick={buyNowHandler}
                                        variant="outlined"
                                        color="secondary"
                                        size="large"
                                        fullWidth
                                    >
                                        Buy Now
                                    </Button>
                                </Box>
                            ) : (
                                <Alert severity="error">Out Of Stock!</Alert>
                            )}
                        </Grid>
                    </Grid>
                </Paper>
            )}
        </Box>
    );
}

export default ProductDetailsPage;
