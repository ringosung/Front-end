/* eslint-disable */
import axios from 'axios';

export const deleteDog = async (dogId) => {
        const res = await axios.delete(`http://127.0.0.1:3000/api/v1/dogs/${dogId}`);
    }