import { combineReducers } from "redux";
import {
    productsListReducer,
    productDetailsReducer,
    createProductReducer,
    updateProductReducer,
    deleteProductReducer,
    changeDeliveryStatusReducer,
    searchProductsReducer,
} from "./productReducers";

import {
    createCardReducer,
    chargeCardReducer,
    savedCardsListReducer,
    deleteSavedCardReducer,
    updateStripeCardtReducer
} from "./cardReducers";

import {
    userLoginReducer,
    userRegisterReducer,
    userDetailsReducer,
    userDetailsUpdateReducer,
    deleteUserAccountReducer,
    checkTokenValidationReducer,
    getSingleAddressReducer,
    getAllAddressesOfUserReducer,
    createUserAddressReducer,
    updateUserAddressReducer,
    deleteUserAddressReducer,
    getAllOrdersReducer,
} from "./userReducers";

import { cartReducer } from './cartReducers';

const allReducers = combineReducers({
    productsListReducer,
    productDetailsReducer,
    createProductReducer,
    updateProductReducer,
    deleteProductReducer,
    createCardReducer,
    chargeCardReducer,
    savedCardsListReducer,
    updateStripeCardtReducer,
    deleteSavedCardReducer,
    userLoginReducer,
    userRegisterReducer,    
    getSingleAddressReducer,
    getAllAddressesOfUserReducer,
    createUserAddressReducer,
    updateUserAddressReducer,
    deleteUserAddressReducer,
    getAllOrdersReducer,
    changeDeliveryStatusReducer,
    checkTokenValidationReducer,
    userDetailsReducer,
    userDetailsUpdateReducer,
    deleteUserAccountReducer,
    searchProductsReducer,
    cart: cartReducer,
})


export default allReducers