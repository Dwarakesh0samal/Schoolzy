// Import the configured Express app
const app = require('./app');

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

// Export both app and server for testing
module.exports = { app, server }; 