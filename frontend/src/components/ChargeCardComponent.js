import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSelector as useReduxSelector } from 'react-redux'
import { Spinner, Form, Button, Card } from 'react-bootstrap'
import { chargeCustomer } from '../actions/cardActions'
import { Link, useHistory } from "react-router-dom";
import { getSingleAddress } from '../actions/userActions'
import Message from './Message'


const ChargeCardComponent = ({ product, cartItems, totalPrice, selectedAddressId, addressSelected }) => {

    let history = useHistory()
    const dispatch = useDispatch()

    // create card reducer
    const createCardReducer = useSelector(state => state.createCardReducer)
    const { cardData } = createCardReducer

    // user login reducer (for fallback email)
    const userLoginReducer = useReduxSelector(state => state.userLoginReducer)
    const { userInfo } = userLoginReducer

    // charge card reducer
    const chargeCardReducer = useSelector(state => state.chargeCardReducer)
    const { success: chargeSuccessfull, error: chargeError, loading: chargingStatus } = chargeCardReducer

    // get single address reducer    
    const getSingleAddressReducer = useSelector(state => state.getSingleAddressReducer)
    const { address } = getSingleAddressReducer

    // Determine the item(s) being charged
    const isSingleProductCheckout = product && product.id;
    const itemsToCharge = isSingleProductCheckout ? [product] : cartItems;
    const amountToCharge = isSingleProductCheckout ? product.price : totalPrice;

    useEffect(() => {
        dispatch(getSingleAddress(selectedAddressId))
    }, [dispatch, selectedAddressId])

    // charge card handler
    const onSubmit = (e) => {
        e.preventDefault()
        
        if (!addressSelected) {
            alert("Please select an address first.");
            return;
        }

        const address_detail = `${address.house_no}, near ${address.landmark}, ${address.city}, 
        ${address.state}, ${address.pin_code}`;
        const paymentMethodId = cardData && cardData.id ? cardData.id : (cardData && cardData.payment_method_id ? cardData.payment_method_id : undefined);
        
        if (!paymentMethodId) {
            alert('No payment method found. Please try again.');
            return;
        }

        const data = {
            "email": (cardData && cardData.email) ? cardData.email : (userInfo ? userInfo.email : ""),
            "payment_method": paymentMethodId,
            "amount": amountToCharge,
            "name": address.name,
            "card_number": cardData && cardData.card_data ? cardData.card_data.last4 : "",
            "address": address_detail,
            "ordered_item": isSingleProductCheckout ? product.name : "Multiple Items", // Adjust for multiple items
            "paid_status": true,
            "total_price": amountToCharge,
            "is_delivered": false,
            "delivered_at": "Not Delivered",
        };
        dispatch(chargeCustomer(data));
    };

    if (chargeSuccessfull) {
        history.push({
            pathname: '/payment-status/',
            state: { detail: isSingleProductCheckout ? product : { name: "Multiple Items", price: totalPrice } } // Adjust detail for multiple items
        });
        window.location.reload();
    }

    return (
        <div>
            {chargeError ? <Message variant="danger">{chargeError}</Message> : ""}
            <span className="text-info">
                <h5>Confirm payment</h5>
            </span>
            <div className="mb-2">
                Using Card: XXXX XXXX XXXX {cardData && cardData.card_data ? cardData.card_data.last4 : ""}
            </div>
            <Form onSubmit={onSubmit}>

                {chargingStatus ?
                    <Button variant="primary" disabled style={{ width: "100%" }}>
                        <Spinner
                            as="span"
                            animation="grow"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />
                        {" "}Processing Payment...
                    </Button>
                    :
                    <Button variant="primary" type="submit" style={{ width: "100%" }}>
                        Pay ₹{amountToCharge ? amountToCharge.toFixed(2) : '0.00'}
                    </Button>
                }
            </Form>

            <Card
                className="p-2 mt-2 mb-2"
                style={{ border: "1px solid", borderColor: "#C6ACE7" }}
            >
                {address ?
                    <div>
                        <span className="text-info">
                            <b><em>Will be delievered at this address</em></b>
                        </span>
                        <p></p>
                        <p><b>Name: </b>{address ? address.name : ""}</p>
                        <p><b>Phone Number: </b>{address ? address.phone_number : ""}</p>
                        <p><b>House Number: </b>{address ? address.house_no : ""}</p>
                        <p><b>Landmark: </b>{address ? address.landmark : ""}</p>
                        <p><b>City: </b>{address ? address.city : ""}</p>
                        <p><b>State: </b>{address ? address.state : ""}</p>
                        <p><b>Pin Code/Zip Code: </b>{address ? address.pin_code : ""}</p>
                    </div>
                    :
                    ""
                }
            </Card>
            <Link to="#" onClick={() => window.location.reload()}>Select a different card to pay</Link>

        </div >
    )
}

export default ChargeCardComponent