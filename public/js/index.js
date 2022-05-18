/* eslint-disable*/
// import js files
import '@babel/polyfill'
import { displayMap } from './mapbox';
import { login, logout } from './login'
import { updateSettings } from './updateSettings'
import { signup } from './signup';
import { deleteTour } from './deleteTour';
import { newDog } from './newDog';
import { bookTour } from './stripe'

// DOM element
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')
const signupForm = document.querySelector('.form--signup');
const deleteBtn = document.getElementById('delete-dog');
const newDogForm = document.querySelector('.form--newDog');
const bookBtn = document.getElementById('book-tour')


// Delegation
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
  }


if (loginForm) 
loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email= document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
});

if (logOutBtn) logOutBtn.addEventListener('click', logout)

if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);

    updateSettings(form, 'data');
  });


    if (userPasswordForm)
    userPasswordForm.addEventListener('submit', async e => {
      e.preventDefault();
      document.querySelector('.btn--save-password').textContent = 'Updating...';
  
      const passwordCurrent = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;
      await updateSettings(
        { passwordCurrent, password, passwordConfirm },
        'password'
      );
  
      document.querySelector('.btn--save-password').textContent = 'Save password';
      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
    });
  
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = document.getElementById('name').value;
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          const confirmPassword = document.getElementById('password-confirm').value;
          signup(name, email, password, confirmPassword);
        });
      }
      

if (deleteBtn)
    deleteBtn.addEventListener('click', e => {
        // const tourId = e.target.dataset.tourId;
        e.target.textContent = 'Processing...'
        const {tourId} = e.target.dataset;
        deleteTour(tourId);
    })

if (newDogForm) {
        newDogForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = document.getElementById('name').value;
          const breeds = document.getElementById('breeds').value;
          const price = document.getElementById('price').value;
          const summary = document.getElementById('summary').value;
          const description = document.getElementById('description').value;
          const difficulty = document.getElementById('difficulty').value;
          newDog(name, breeds, price, summary, description, difficulty);
        });
      }

if(bookBtn)
      bookBtn.addEventListener('click', e => {
          // const tourId = e.target.dataset.tourId;
          e.target.textContent = 'Processing...'
          const {tourId} = e.target.dataset;
          bookTour(tourId);
      })