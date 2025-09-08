import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Card, CardMedia, CardContent, Typography, CardActions, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Link, useHistory } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../actions/cartActions';


// Reusable ProductCard component with fixed width/height
function Product({ product, cardWidth = 300, cardHeight = 400 }) {
    const [qty, setQty] = useState(1);
    const dispatch = useDispatch();
    const history = useHistory();

    const userLoginReducer = useSelector(state => state.userLoginReducer);
    const { userInfo } = userLoginReducer;

    const addToCartHandler = () => {
        if (userInfo) {
            dispatch(addToCart(product.id, qty));
            history.push('/cart');
        } else {
            history.push('/login');
        }
    };

    return (
        <Card
            sx={{
                width: cardWidth,
                height: cardHeight,
                m: 1,
                borderRadius: 3,
                boxShadow: 3,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: '0.3s',
                '&:hover': { boxShadow: 8, transform: 'scale(1.03)' },
            }}
        >
            <Link to={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                <CardMedia
                    component="img"
                    sx={{
                        width: '100%',
                        height: 180,
                        objectFit: 'cover',
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                    }}
                    image={product.image}
                    alt={product.name}
                />
            </Link>
            <CardContent sx={{ flexGrow: 1 }}>
                <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.name}
                    </Typography>
                </Link>
                <Typography variant="h6" color="primary">
                    ₹ {product.price}
                </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', mb: 1, flexDirection: 'column', width: '100%' }}>
                {product.stock > 0 ? (
                    <>
                        <FormControl fullWidth sx={{ mb: 1 }}>
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
                            size="small"
                            color="primary"
                            variant="contained"
                            startIcon={<ShoppingCartIcon />}
                            onClick={addToCartHandler}
                            fullWidth
                        >
                            Add to Cart
                        </Button>
                    </>
                ) : (
                    <Button
                        size="small"
                        color="error"
                        variant="contained"
                        fullWidth
                        disabled
                    >
                        Out Of Stock
                    </Button>
                )}
            </CardActions>
        </Card>
    );
}

export default Product