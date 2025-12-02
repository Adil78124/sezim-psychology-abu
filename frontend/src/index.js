import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Подавляем ошибки WebSocket в консоли (связаны с React DevTools или hot reload)
const originalError = console.error;
console.error = (...args) => {
  if (
    args[0]?.includes?.('WebSocket') ||
    args[0]?.includes?.('ws://localhost:3000/ws') ||
    args[0]?.includes?.('WebSocket connection')
  ) {
    // Игнорируем ошибки WebSocket
    return;
  }
  originalError.apply(console, args);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

