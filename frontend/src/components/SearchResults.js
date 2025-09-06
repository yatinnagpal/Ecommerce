import React from 'react';
import { useSelector } from 'react-redux';
import { Grid, Typography, Box, Chip } from '@mui/material';
import Product from './Product';
import Message from './Message';
import CircularProgress from '@mui/material/CircularProgress';

function SearchResults() {
    const searchProductsReducer = useSelector(state => state.searchProductsReducer);
    const { loading, error, searchResults } = searchProductsReducer;

    if (loading) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" py={4}>
                <CircularProgress size={24} />
                <Typography variant="body1" sx={{ ml: 2 }}>
                    Searching products...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Message variant="danger">
                Search error: {error}
            </Message>
        );
    }

    if (searchResults.length === 0) {
        return (
            <Box textAlign="center" py={4}>
                <Message variant="info">
                    No products found matching your search criteria.
                </Message>
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h5" component="h2">
                    Search Results
                </Typography>
                <Chip 
                    label={`${searchResults.length} product${searchResults.length !== 1 ? 's' : ''} found`}
                    color="primary"
                    variant="outlined"
                />
            </Box>
            
            <Grid container spacing={3} justifyContent="center">
                {searchResults.map((product) => (
                    <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                        <Product product={product} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default SearchResults;
