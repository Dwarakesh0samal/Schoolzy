// Import the configured Express app
const app = require('./app');
const helmet = require('helmet');

// Get port from environment or use default
const PORT = process.env.PORT || 5000;

// Start the server
const server = app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  }
});

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://unpkg.com"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://www.gstatic.com"],
    fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
    imgSrc: ["'self'", "data:", "https://unpkg.com", "https://raw.githubusercontent.com", "https://*.tile.openstreetmap.org"],
    connectSrc: ["'self'", "https://nominatim.openstreetmap.org"]
  }
}));

// Export both app and server for testing
module.exports = { app, server }; 