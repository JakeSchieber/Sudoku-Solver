import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './configureStore';
import './index.css';
import App from './Components/Layout/Layout';
import { SudokuUI } from './Components/Sudoku/SudokuUI';
import { TicTacToe } from './Components/TicTacToe/TicTacToe';
import * as serviceWorker from './serviceWorker';

// TODO: add preloaded state
//const store = configureStore();

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      { /* <SudokuUI /> */ }
      { /* <TicTacToe /> */ }
      { /* <Sudoku /> */ }
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// Change to .register if you want to enable Service Workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
