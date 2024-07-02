// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Landing from './pages/Landing';
import GameMode from './pages/GameMode';
import reportWebVitals from './reportWebVitals';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import store from './app/store';
import { Provider } from 'react-redux';
import { SocketProvider } from './contexts/SocketContext';
import Game from './pages/Game';
import SoloGame from './pages/SoloGame';
import ProtectedRoute from './components/ProtectedRoute';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/start" element={<GameMode />} />
            <Route exact path='/' element={<ProtectedRoute />}>
              <Route path="/solo" element={<SoloGame />} />
              <Route path="/game" element={<Game />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
