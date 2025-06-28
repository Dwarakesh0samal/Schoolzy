// Configuration for Schoolzy Frontend
// This file handles environment-specific API URLs

// Get the current hostname to determine environment
const hostname = window.location.hostname;
const protocol = window.location.protocol;

// Environment detection
const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1';
const isProduction = hostname === 'schoolzy-k8g7.onrender.com' || hostname.includes('render.com');

// API Base URL configuration
let API_BASE_URL;

if (isDevelopment) {
    // Development: Use localhost backend
    API_BASE_URL = 'http://localhost:5000/api';
} else if (isProduction) {
    // Production: Use deployed backend
    API_BASE_URL = 'https://schoolzy-k8g7.onrender.com/api';
} else {
    // Fallback: Try to use the same hostname for API
    API_BASE_URL = `${protocol}//${hostname}/api`;
}

// Export configuration
window.SCHOOLZY_CONFIG = {
    API_BASE_URL,
    isDevelopment,
    isProduction,
    hostname,
    protocol
};

// Log configuration for debugging
console.log('Schoolzy Frontend Configuration:', {
    API_BASE_URL,
    isDevelopment,
    isProduction,
    hostname,
    protocol
}); 