const express = require('express');
const cors = require('cors')
const cookieParser = require('cookie-parser');
const path = require('path')
require('dotenv').config()

console.log('=== SERVER STARTUP DEBUG ===');
console.log('Current directory:', __dirname);
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV);
const app = express();

// CORS setup
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://alansaar-portal-ajgjdwewgec9c9gy.canadacentral-01.azurewebsites.net'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors()); // Enable preflight across-the-board

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(200);
  }
  next();
});

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

app.get('/', (req, res) => {
  res.send('Server is running!');
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
  console.log('Importing courseRoutes...');
  const courseRoutes = require('./routes/courseRoutes');
  app.use('/api', courseRoutes);
  console.log('✓ courseRoutes imported successfully');
} catch (error) {
  console.error('✗ Error importing courseRoutes:', error.message);
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
const staticPath = path.join(__dirname, './public');
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
    const indexPath = path.join(__dirname, './public/index.html');
    console.log('Serving React app from:', indexPath);
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.error('index.html not found at:', indexPath);
      res.status(404).send('React app not found. Make sure ./public/index.html exists.');
    }
  } catch (error) {
    console.error('Error serving React app:', error);
    res.status(500).send('Error loading page: ' + error.message);
  }
});

app.use((err, req, res, next) => {
  console.error('🔥 Uncaught server error:', err.stack || err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});
module.exports = app;
