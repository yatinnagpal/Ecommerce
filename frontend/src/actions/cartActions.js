import axios from 'axios';
import {
    CART_ADD_ITEM_REQUEST,
    CART_ADD_ITEM_SUCCESS,
    CART_ADD_ITEM_FAIL,
    CART_REMOVE_ITEM_REQUEST,
    CART_REMOVE_ITEM_SUCCESS,
    CART_REMOVE_ITEM_FAIL,
    CART_FETCH_REQUEST,
    CART_FETCH_SUCCESS,
    CART_FETCH_FAIL,
} from '../constants';

export const fetchCart = () => async (dispatch, getState) => {
    try {
        dispatch({ type: CART_FETCH_REQUEST });

        const {
            userLoginReducer: { userInfo },
        } = getState();

        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
            },
        };

        const { data } = await axios.get('/api/cart/', config);

        dispatch({ type: CART_FETCH_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: CART_FETCH_FAIL,
            payload:
                error.response && error.response.data.detail
                    ? error.response.data.detail
                    : error.message,
        });
    }
};

export const addToCart = (productId, quantity) => async (dispatch, getState) => {
    try {
        dispatch({ type: CART_ADD_ITEM_REQUEST });

        const {
            userLoginReducer: { userInfo },
        } = getState();

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${userInfo.token}`,
            },
        };

        const { data } = await axios.post(
            '/api/cart/add_item/',
            { product_id: productId, quantity },
            config
        );

        dispatch({ type: CART_ADD_ITEM_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: CART_ADD_ITEM_FAIL,
            payload:
                error.response && error.response.data.detail
                    ? error.response.data.detail
                    : error.message,
        });
    }
};

export const removeFromCart = (itemId) => async (dispatch, getState) => {
    try {
        dispatch({ type: CART_REMOVE_ITEM_REQUEST });

        const {
            userLoginReducer: { userInfo },
        } = getState();

        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
            },
        };

        const { data } = await axios.delete(`/api/cart/remove_item/${itemId}/`, config);

        dispatch({ type: CART_REMOVE_ITEM_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: CART_REMOVE_ITEM_FAIL,
            payload:
                error.response && error.response.data.detail
                    ? error.response.data.detail
                    : error.message,
        });
    }
};
