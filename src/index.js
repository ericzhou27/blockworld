import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyD8rhlUKMh9wP3uVuTD6UjHxJsADGDWAX8",
    authDomain: "metaverse-a531c.firebaseapp.com",
    projectId: "metaverse-a531c",
    storageBucket: "metaverse-a531c.appspot.com",
    messagingSenderId: "308442262072",
    appId: "1:308442262072:web:3f783e0d9a3b7bf98614cd",
});






ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
