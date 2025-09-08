import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeFromCart } from '../actions/cartActions';
import {
    Box, Typography, Button, Paper, Grid, Alert, List, ListItem, ListItemText, IconButton, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function CartPage({ history }) {
    const dispatch = useDispatch();
    const cart = useSelector(state => state.cart);
    const { items, total_price } = cart;

    const userLoginReducer = useSelector(state => state.userLoginReducer);
    const { userInfo } = userLoginReducer;

    const removeFromCartHandler = (id) => {
        if (typeof id === 'number' && !isNaN(id)) {
            dispatch(removeFromCart(id));
        } else {
            console.error("Invalid item ID for removal:", id);
            // You might want to add a toast notification here for the user
        }
    };

    const checkoutHandler = () => {
        if (userInfo) {
            history.push('/checkout');
        } else {
            history.push('/login?redirect=checkout'); // Redirect to login with a checkout redirect
        }
    };

    return (
        <Box sx={{ p: { xs: 1, md: 4 } }}>
            <Typography variant="h4" gutterBottom>Shopping Cart</Typography>
            {items.length === 0 ? (
                <Alert severity="info">
                    Your cart is empty. <Link to='/'>Go Back</Link>
                </Alert>
            ) : (
                <Grid container spacing={4}>
                    <Grid item md={8}>
                        <Paper elevation={2} sx={{ p: 2 }}>
                            <List>
                                {items.map((item) => (
                                    <React.Fragment key={item.id}>
                                        <ListItem
                                            secondaryAction={
                                                <IconButton edge="end" aria-label="delete" onClick={() => removeFromCartHandler(item.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemText
                                                                                                                                                primary={<Link to={`/products/${item.product.id}`}>{item.product.name}</Link>}
                                                secondary={item.product ? `Qty: ${item.quantity} x ₹${item.product.price} = ₹${item.quantity * item.product.price}` : `Qty: ${item.quantity} x Price Not Available`}
                                            />
                                        </ListItem>
                                        <Divider />
                                    </React.Fragment>
                                ))}
                            </List>
                        </Paper>
                    </Grid>
                    <Grid item md={4}>
                        <Paper elevation={2} sx={{ p: 2 }}>
                            <Typography variant="h5" gutterBottom>
                                Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} items)
                            </Typography>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Total: ₹{total_price}
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                color="primary"
                                disabled={items.length === 0}
                                onClick={checkoutHandler}
                            >
                                Proceed to Checkout
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
}

export default CartPage;
