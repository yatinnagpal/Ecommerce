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
    CART_CLEAR_ITEMS,
} from '../constants';

const initialState = {
    loading: false,
    items: [],
    error: null,
    total_price: 0,
};

export const cartReducer = (state = initialState, action) => {
    switch (action.type) {
        case CART_FETCH_REQUEST:
        case CART_ADD_ITEM_REQUEST:
        case CART_REMOVE_ITEM_REQUEST:
            return { ...state, loading: true };

        case CART_FETCH_SUCCESS:
        case CART_ADD_ITEM_SUCCESS:
        case CART_REMOVE_ITEM_SUCCESS:
            return {
                ...state,
                loading: false,
                items: action.payload.items,
                total_price: action.payload.total_price,
                error: null,
            };

        case CART_FETCH_FAIL:
        case CART_ADD_ITEM_FAIL:
        case CART_REMOVE_ITEM_FAIL:
            return { ...state, loading: false, error: action.payload };

        case CART_CLEAR_ITEMS:
            return initialState;

        default:
            return state;
    }
};
