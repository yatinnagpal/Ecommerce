import React, { useEffect } from 'react';
import Slider from 'react-slick';
import { Box, Typography, Card, CardMedia, CardContent, CircularProgress, Alert } from '@mui/material';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useDispatch, useSelector } from 'react-redux';
import { getProductsList } from '../actions/productActions';
import { Link } from 'react-router-dom';

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3500,
  arrows: false,
};

const FeaturedCarousel = () => {
  const dispatch = useDispatch();

  const productListReducer = useSelector(state => state.productsListReducer);
  const { loading, error, products } = productListReducer;

  useEffect(() => {
    dispatch(getProductsList());
  }, [dispatch]);

  // Take a subset of products for the carousel, e.g., first 3 or 5
  const carouselProducts = products ? products.slice(0, 5) : [];

  return (
    <Box sx={{ width: '100%', maxWidth: '100vw', mx: 'auto', mb: 4 }}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Slider {...settings}>
          {carouselProducts.map((product) => (
            <Link to={`/products/${product.id}`} key={product.id} style={{ textDecoration: 'none' }}>
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: { xs: 220, md: 400 }, background: '#f5f5f5' }}>
                <Card sx={{ width: '90vw', maxWidth: 1400, height: { xs: 260, md: 400 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', boxShadow: 6, borderRadius: 4, overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    image={product.image}
                    alt={product.name}
                    sx={{ width: { xs: '100%', md: '60%' }, height: { xs: 200, md: 400 }, objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
                    <Typography variant="h4" fontWeight={700} gutterBottom>{product.name}</Typography>
                    <Typography variant="h6">{product.description}</Typography>
                  </CardContent>
                </Card>
              </Box>
            </Link>
          ))}
        </Slider>
      )}
    </Box>
  );
};

export default FeaturedCarousel;