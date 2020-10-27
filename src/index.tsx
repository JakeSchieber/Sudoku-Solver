import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './Components/Layout/Layout';
import { SudokuUI } from './Components/Sudoku/SudokuUI';
import { TicTacToe } from './Components/TicTacToe/TicTacToe';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <App />
    { /* <SudokuUI /> */ }
    { /* <TicTacToe /> */ }
    { /* <Sudoku /> */ }
  </React.StrictMode>,
  document.getElementById('root')
);

// Change to .register if you want to enable Service Workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
