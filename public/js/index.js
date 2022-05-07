/* eslint-disable*/
import '@babel/polyfill'
import { displayMap } from './mapbox';
import { login } from './login'

// DOM element
const mapbox = document.getElementById('map');


// Delegation
const locations = JSON.parse(document.getElementById('map').dataset.locations);

displayMap(locations);

document.querySelector('.form').addEventListener('submit', e => {
    e.preventDefault();
    const email= document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
});

