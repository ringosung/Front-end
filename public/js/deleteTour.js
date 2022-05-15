/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// type is either 'password' or 'data'
export const deleteTour = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/tours/'
        : 'http://127.0.0.1:3000/api/v1/tours/';

    const res = await axios({
      method: 'DELETE',
      url,
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} deleted successfully!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

