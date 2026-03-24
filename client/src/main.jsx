import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios';
import './index.css'
import App from './App.jsx'

// Configure global Axios defaults for easy deployment
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

// Automatically add the auth token to all requests if it exists in localStorage
axios.interceptors.request.use((config) => {
    // Only add token if it's hitting our backend (not external APIs like Overpass)
    if (config.url && config.url.startsWith('/')) {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
    }
    return config;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
