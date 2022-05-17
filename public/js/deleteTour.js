/* eslint-disable */
import axios from 'axios';

export const deleteTour = async tourId => {
    try {
        const res = await axios({
            method: 'delete',
            url: `http://127.0.0.1:3000/api/v1/tours/${tourId}`})
    }
 catch (err) {
    showAlert('error', err.response.data.message);
  } 
}