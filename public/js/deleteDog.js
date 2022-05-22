/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const deleteDog = async (dogId) => {
  try {
    const res = await axios.delete(`http://127.0.0.1:3000/api/v1/dogs/${dogId}`);
      showAlert('success', 'Doggy deleted successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
