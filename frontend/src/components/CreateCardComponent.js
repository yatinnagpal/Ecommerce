import React, { useState, useEffect } from 'react'
import { useHistory } from "react-router-dom";
import { Form, Button, Card } from 'react-bootstrap'
import { createCard } from '../actions/cardActions'
import { useDispatch, useSelector } from 'react-redux'
import { Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Message from './Message';
import DeleteCardComponent from './DeleteCardComponent';

import {
    CardElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";

// to manage our exp month and exp year




const CreateCardComponent = ({ stripeCards, addressSelected }) => {

    let history = useHistory()
    const dispatch = useDispatch()

    const [userId] = useState(0)
    const [runCardDeleteHandler, setRunCardDeleteHandler] = useState(false)
    const [differentCard, setDifferentCard] = useState(false)
    const [cardDetails, setCardDetails] = useState(false)
    const [cardDetailsId, setCardDetailsId] = useState(0)
    const [showStripeCard, setShowStripeCard] = useState(false)
    const [deleteCardNumber] = useState("")
    const [email, setEmail] = useState("")
    // Removed manual card input state (using CardElement instead)
    const [saveCard, setSaveCard] = useState(false)

    // login reducer
    const userLoginReducer = useSelector(state => state.userLoginReducer)
    const { userInfo } = userLoginReducer
    const stripe = useStripe();
    const elements = useElements();

    // card delete reducer
    const deleteSavedCardReducer = useSelector(state => state.deleteSavedCardReducer)
    const { loading, success, error } = deleteSavedCardReducer

    useEffect(() => {
        if (!userInfo) {
            history.push("/login")
        }
    }, [history, userInfo, success])

    // stripe card form submission handler
    const handleCardSubmittion = async (e) => {
        e.preventDefault();
        console.log('handleCardSubmittion called');
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            console.log('CardElement not found');
            alert('Card details are not entered correctly.');
            return;
        }
        const { paymentMethod, error } = await stripe.createPaymentMethod({
            type: "card",
            card: cardElement,
            billing_details: {
                email: "admin@gmail.com",
            }
        });
        if (error) {
            console.log('Stripe error:', error);
            alert(error.message);
            return;
        }
        console.log('paymentMethod:', paymentMethod);
        if (addressSelected) {
            const data = {
                "email": email === "" ? userInfo.email : email,
                "payment_method_id": paymentMethod.id,
                "save_card": saveCard
            };
            console.log('Dispatching createCard with data:', data);
            dispatch(createCard(data));
        } else {
            alert("Please select or add your Address to continue");
        }
    }

    // pay with already existing (saved) stripe card handler
    const payWithSavedCard = (cardData) => {
        if (addressSelected) {
            const data = {
                "email": cardData.email,
                "cardNumber": cardData.card_number,
                "expMonth": Number(cardData.exp_month),
                "expYear": Number(cardData.exp_year),
                "cvc": Number(cardData.cvc),
                "saveCard": false
            }
            dispatch(createCard(data))
        } else {
            alert("Please select or add your Address to continue")
        }
    }

    // show card details
    const showCardDetails = (cardData) => {
        if (cardDetails) {
            if (cardData.id === cardDetailsId) {
                return (
                    <div>
                        <button
                            onClick={() => setCardDetails(false)}
                            className="btn btn-outline-danger btn-sm button-focus-css"
                            style={{ float: "right", position: "relative", "top": "-40px" }}>
                            close
                        </button>
                        <p><b>Exp Month:</b> {cardData.exp_month}</p>
                        <p><b>Exp Year:</b> {cardData.exp_year}</p>                       
                    </div>
                )
            }
        }
    }

    const toggleRunCardDeleteHandler = () => {
        setRunCardDeleteHandler(!runCardDeleteHandler)
    }

    // reload the webpage after new card deletion
    if (success) {
        alert("Card successfully deleted.")
        window.location.reload()

    }

    return (
        <div>

            {/* Working on Modal Start*/}
            <div>
                <>
                    <DeleteCardComponent
                        userId={userId}
                        deleteCardNumber={deleteCardNumber}
                        runCardDeleteHandler={runCardDeleteHandler}
                        toggleRunCardDeleteHandler={toggleRunCardDeleteHandler}
                    />
                </>
            </div>

            {/* Working on Modal End */}

            {loading
                &&
                <span style={{ display: "flex" }}>
                    <h5>Deleting card</h5>
                    <span className="ml-2">
                        <Spinner animation="border" />
                    </span>
                </span>}
            {error && <Message variant='danger'>{error}</Message>}
            <div className="card px-4 py-4">
                <button className={showStripeCard
                    ? "btn btn-sm btn-danger mb-3 button-focus-css"
                    : "btn btn-sm btn-primary mb-3 button-focus-css"}
                    onClick={() =>
                        setShowStripeCard(!showStripeCard)
                    }>
                    {showStripeCard
                        ? "close"
                        : "Enter stripe card"}
                </button>

                {showStripeCard ?
                    <Form onSubmit={handleCardSubmittion}>

                        {differentCard ?
                            <Form.Group>
                                <Form.Label><b>Card Holder Email Address</b></Form.Label>
                                <Form.Control
                                    autoFocus={true}
                                    type="email"
                                    pattern=".+@gmail\.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email address linked with the Card" />
                            </Form.Group>
                            :
                            <span><b>Default Customer Email: </b>{userInfo.email}</span>
                        }
                        <p>
                            <Link to="#" onClick={() => {
                                setDifferentCard(!differentCard)
                                setEmail("")
                            }}>
                                {differentCard ? "Use Your default Email" : "Use a different Card"}
                            </Link>
                        </p>


                        <Form.Group className="mb-3">
                            <Form.Label><b>Card Details</b></Form.Label>
                            <div style={{ border: '1px solid #ced4da', borderRadius: '4px', padding: '10px' }}>
                                <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
                            </div>
                        </Form.Group>

                        <Form.Text className="text-muted pb-2">
                            <span style={{ display: "flex" }}>
                                <input
                                    hidden={differentCard}
                                    type="checkbox"
                                    className="mt-1"
                                    value={differentCard ? false : saveCard}
                                    onChange={() => setSaveCard(!saveCard)}
                                />
                                <span hidden={differentCard} className="ml-1">Save my card for future payments</span>
                            </span>
                        </Form.Text>

                        <Button className="btn-sm button-focus-css" variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                    : ""}

            </div>

            <div className="my-4 card px-4 py-4">
                <h5>Saved card</h5>
                {stripeCards.length > 0 ?
                    stripeCards.map(cardData => (
                        <div key={cardData.id}>
                            <Card
                                style={{ border: "1px solid", borderColor: "#C6ACE7" }}
                                className="p-2">
                                <p><b>Card Number:</b> XXXX XXXX XXXX {cardData.card_number.slice(12,18)}</p>
                                <div>
                                    {showCardDetails(cardData)}
                                    <button onClick={() => {
                                        setCardDetails(true)
                                        setCardDetailsId(cardData.id)
                                    }} className="btn btn-sm btn-outline-primary button-focus-css"
                                    >
                                        Show Card Details
                                    </button>
                                    <button onClick={() => payWithSavedCard(cardData)}
                                        className="ml-2 btn btn-sm btn-outline-primary button-focus-css">
                                        Pay with this Card
                                    </button>
                                </div>
                            </Card>

                            {/* Edit Card Buttton */}

                            <span
                                onClick={() => history.push("/stripe-card-details/")}>
                                <i
                                    title="edit card"
                                    className="fas fa-edit fa-lg edit-button-css mr-2"
                                ></i>
                            </span>
                        </div>
                    )) : "No saved card."}
            </div>
    </div>
    )
}

export default CreateCardComponent
