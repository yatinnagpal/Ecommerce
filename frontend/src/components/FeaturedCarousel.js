import React from 'react';
import Slider from 'react-slick';
import { Box, Typography, Card, CardMedia, CardContent } from '@mui/material';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Example featured products data (replace with real data or props)
const featuredProducts = [
  {
    id: 1,
    name: 'Featured Product 1',
    image: '/static/images/featured1.jpg',
    description: 'Amazing product for your needs.',
  },
  {
    id: 2,
    name: 'Featured Product 2',
    image: '/static/images/featured2.jpg',
    description: 'Top-rated and best-selling.',
  },
  {
    id: 3,
    name: 'Featured Product 3',
    image: '/static/images/featured3.jpg',
    description: 'Limited time offer!',
  },
];

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


const FeaturedCarousel = ({ products = featuredProducts }) => (
  <Box sx={{ width: '100%', maxWidth: '100vw', mx: 'auto', mb: 4 }}>
    <Slider {...settings}>
      {products.map((product) => (
        <Box key={product.id} sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: { xs: 220, md: 400 }, background: '#f5f5f5' }}>
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
      ))}
    </Slider>
  </Box>
);

export default FeaturedCarousel;
