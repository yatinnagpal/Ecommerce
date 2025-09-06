import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProductsList } from '../actions/productActions';
import Message from '../components/Message';
import Grid from '@mui/material/Grid';
import Product from '../components/Product';
import FeaturedCarousel from '../components/FeaturedCarousel';
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

    useEffect(() => {
        dispatch(getProductsList());
        dispatch({
            type: CREATE_PRODUCT_RESET
        });
        //dispatch(checkTokenValidation())
    }, [dispatch]);

    const showNothingMessage = () => (
        !loading ? <Message variant='info'>Nothing to show</Message> : null
    );

    // Show up to 3 featured products with images for the carousel
    const featuredProducts = products.slice(0, 3);

    return (
        <div>
            <FeaturedCarousel products={featuredProducts} />
            {error && <Message variant='danger'>{error}</Message>}
            {loading && (
                <span style={{ display: "flex", alignItems: 'center' }}>
                    <h5>Getting Products</h5>
                    <span style={{ marginLeft: 8 }}>
                        <CircularProgress size={24} />
                    </span>
                </span>
            )}
            <Grid container spacing={3} justifyContent="center">
                {(products.filter((item) =>
                    item.name.toLowerCase().includes(searchTerm !== "" ? searchTerm.split("=")[1] : "")
                )).length === 0 ? showNothingMessage() : (products.filter((item) =>
                    item.name.toLowerCase().includes(searchTerm !== "" ? searchTerm.split("=")[1] : "")
                )).map((product, idx) => (
                    <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                        <Product product={product} />
                    </Grid>
                ))}
            </Grid>
        </div>
    );
}

export default ProductsListPage;
