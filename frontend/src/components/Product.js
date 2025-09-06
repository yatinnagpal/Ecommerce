
import React from 'react';
import { toast } from 'react-toastify';
import { Card, CardMedia, CardContent, Typography, CardActions, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';



// Reusable ProductCard component with fixed width/height
function Product({ product, cardWidth = 300, cardHeight = 400 }) {
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
            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
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
                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.name}
                    </Typography>
                </Link>
                <Typography variant="h6" color="primary">
                    ₹ {product.price}
                </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center', mb: 1 }}>
                <Button
                    size="small"
                    color="primary"
                    variant="contained"
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => toast.success(`Proceeding to buy ${product.name}`)}
                    component={Link}
                    to={`/product/${product.id}/checkout/`}
                >
                    Buy Now
                </Button>
            </CardActions>
        </Card>
    );
}

export default Product
