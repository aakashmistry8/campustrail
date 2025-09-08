const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());

// CORS for production
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files from the frontend build
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes - start the backend server on a different port and proxy requests
// For now, we'll serve the frontend and note that backend needs separate deployment
app.use('/api/*', (req, res) => {
  res.status(503).json({ 
    error: 'Backend service not available. Please deploy backend separately.',
    message: 'This deployment serves only the frontend. Backend needs to be deployed to a separate service.'
  });
});

// Serve the frontend for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`CampusTrail frontend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});