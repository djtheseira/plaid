import React from 'react';
import {render} from 'react-dom';
import {Router as BrowserRouter} from 'react-router-dom';
import { createBrowserHistory } from 'history';
import './index.css';
import "./custom.css";
import App from './App';
import reportWebVitals from './reportWebVitals';

const history = createBrowserHistory();
const root = document.getElementById("root");

render(
    <BrowserRouter history={history}>
        <App />
    </BrowserRouter>,
    root
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
