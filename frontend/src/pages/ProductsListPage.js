import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProductsList } from '../actions/productActions';
import Message from '../components/Message';
import Grid from '@mui/material/Grid';
import Product from '../components/Product';
import FeaturedCarousel from '../components/FeaturedCarousel';
import SearchResults from '../components/SearchResults';
import { useHistory } from "react-router-dom";
import { CREATE_PRODUCT_RESET } from '../constants';
import CircularProgress from '@mui/material/CircularProgress';

function ProductsListPage() {
    let history = useHistory();
    let searchTerm = history.location.search;
    const dispatch = useDispatch();

    // products list reducer
    const productsListReducer = useSelector(state => state.productsListReducer);
    const { loading, error, products } = productsListReducer;

    // search products reducer
    const searchProductsReducer = useSelector(state => state.searchProductsReducer);
    const { loading: searchLoading, error: searchError, searchResults } = searchProductsReducer;

    useEffect(() => {
        dispatch(getProductsList());
        dispatch({
            type: CREATE_PRODUCT_RESET
        });
        //dispatch(checkTokenValidation())
    }, [dispatch]);

    const showNothingMessage = () => (
        !loading && !searchLoading ? <Message variant='info'>Nothing to show</Message> : null
    );

    // Determine which products to display
    const displayProducts = searchResults.length > 0 ? searchResults : products;
    const isLoading = loading || searchLoading;
    const hasError = error || searchError;

    // Show up to 3 featured products with images for the carousel (only when not searching)
    const featuredProducts = searchResults.length === 0 ? products.slice(0, 3) : [];

    return (
        <div>
            {searchResults.length === 0 && <FeaturedCarousel products={featuredProducts} />}
            {hasError && <Message variant='danger'>{hasError}</Message>}
            {isLoading && !searchLoading && (
                <span style={{ display: "flex", alignItems: 'center' }}>
                    <h5>Getting Products</h5>
                    <span style={{ marginLeft: 8 }}>
                        <CircularProgress size={24} />
                    </span>
                </span>
            )}
            
            {searchResults.length > 0 ? (
                <SearchResults />
            ) : (
                <Grid container spacing={3} justifyContent="center">
                    {displayProducts.length === 0 ? showNothingMessage() : displayProducts.map((product, idx) => (
                        <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                            <Product product={product} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </div>
    );
}

export default ProductsListPage;
