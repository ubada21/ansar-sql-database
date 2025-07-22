const express = require('express');
const cors = require('cors')
const cookieParser = require('cookie-parser');
const path = require('path')

console.log('=== SERVER STARTUP DEBUG ===');
console.log('Current directory:', __dirname);
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV);

const app = express();

// CORS setup
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser())

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (add this first)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    directory: __dirname,
    nodeVersion: process.version
  });
});

// Try to import routes with error handling
console.log('=== IMPORTING ROUTES ===');

try {
  console.log('Importing userRoutes...');
  const usersRoute = require('./routes/userRoutes');
  app.use('/api', usersRoute);
  console.log('✓ userRoutes imported successfully');
} catch (error) {
  console.error('✗ Error importing userRoutes:', error.message);
}

try {
  console.log('Importing roleRoutes...');
  const roleRoutes = require('./routes/roleRoutes');
  app.use('/api', roleRoutes);
  console.log('✓ roleRoutes imported successfully');
} catch (error) {
  console.error('✗ Error importing roleRoutes:', error.message);
}

try {
  console.log('Importing profileRoutes...');
  const profileRoutes = require('./routes/profileRoutes');
  app.use('/api', profileRoutes);
  console.log('✓ profileRoutes imported successfully');
} catch (error) {
  console.error('✗ Error importing profileRoutes:', error.message);
}

try {
  console.log('Importing authRoutes...');
  const authRoutes = require('./routes/authRoutes');
  app.use('/api', authRoutes);
  console.log('✓ authRoutes imported successfully');
} catch (error) {
  console.error('✗ Error importing authRoutes:', error.message);
}

try {
  console.log('Importing transactionRoutes...');
  const transactionRoutes = require('./routes/transactionRoutes');
  app.use('/api', transactionRoutes);
  console.log('✓ transactionRoutes imported successfully');
} catch (error) {
  console.error('✗ Error importing transactionRoutes:', error.message);
}

try {
  console.log('Importing errorHandler...');
  const errorHandler = require('./middlewares/errorHandler');
  console.log('✓ errorHandler imported successfully');
  
  // Use error handler at the end
  app.use(errorHandler);
} catch (error) {
  console.error('✗ Error importing errorHandler:', error.message);
  
  // Fallback error handler
  app.use((err, req, res, next) => {
    console.error('Fallback error handler:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  });
}

// === Serve static React files ===
console.log('=== STATIC FILES SETUP ===');
const staticPath = path.join(__dirname, '../frontend/build');
console.log('Static files path:', staticPath);

// Check if build directory exists
const fs = require('fs');
if (fs.existsSync(staticPath)) {
  console.log('✓ Build directory exists');
  const indexPath = path.join(staticPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('✓ index.html exists');
  } else {
    console.error('✗ index.html not found');
  }
} else {
  console.error('✗ Build directory not found');
}

app.use(express.static(staticPath));

// Swagger route
app.get('/swagger.json', (req, res) => {
  try {
    const swaggerPath = path.join(__dirname, './swagger.json');
    console.log('Serving swagger from:', swaggerPath);
    res.sendFile(swaggerPath);
  } catch (error) {
    console.error('Error serving swagger:', error);
    res.status(404).json({ error: 'Swagger file not found' });
  }
});

// Handle React routing - this should be LAST
app.get('*', (req, res) => {
  try {
    const indexPath = path.join(__dirname, '../frontend/build/index.html');
    console.log('Serving React app from:', indexPath);
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.error('index.html not found at:', indexPath);
      res.status(404).send('React app not found. Make sure frontend/build/index.html exists.');
    }
  } catch (error) {
    console.error('Error serving React app:', error);
    res.status(500).send('Error loading page: ' + error.message);
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log('=== SERVER STARTED ===');
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log('========================');
});

module.exports = app;
