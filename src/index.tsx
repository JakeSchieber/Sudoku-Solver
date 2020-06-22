import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { SudokuUI } from './Components/Sudoku';
import { TicTacToe } from './TicTacToe/TicTacToe';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <SudokuUI />
    { /* <TicTacToe /> */ }
    { /* <Sudoku /> */ }
  </React.StrictMode>,
  document.getElementById('root')
);

// Change to .register if you want to enable Service Workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
