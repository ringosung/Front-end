/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51KxXkFDpSxXDL5wYuSOFEVD6nJ5Xwf8RhYKIZEhiI4SLKCBjqOGwxr88o8xYSwVcSySVhLuvBDTjsV6RFfEfygZV00dqgIFMmZ');

export const bookDog = async dogId => {
    try{
        // 1) Get checkout session from APIs
        const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${dogId}`);
        console.log(session);

    // 2) Create checkout form + charging credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        })
    } catch(err) {
        console.log(err);
        showAlert('error', err);
    }
    
};
