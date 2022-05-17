import axios from 'axios';
import { showAlert } from './alerts';

export const newDog = async (name, breeds, price, summary, description, difficulty) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/tours',
      data: {
        name,
        breeds,
        price,
        summary,
        description,
        difficulty
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Doggy added successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
