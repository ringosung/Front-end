import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Navbar from './components/navbar'

function App() {
 return (
 <Router>
 <Navbar />
 <br/>
 <Route path='/' exact component= {ExercisesList}/>
 </Router>
);
}

export default App;
