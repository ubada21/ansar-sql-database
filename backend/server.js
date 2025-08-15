const express = require('express');
const cors = require('cors')
const cookieParser = require('cookie-parser');
const path = require('path')
require('dotenv').config()

const app = express();

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

app.options('*', cors());

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

app.use((req, res, next) => {
  next();
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    directory: __dirname,
    nodeVersion: process.version
  });
});

app.get('/', (req, res) => {
  try {
    const indexPath = path.join(__dirname, './public/index.html');
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('React app not found. Make sure ./public/index.html exists.');
    }
  } catch (error) {
    res.status(500).send('Error loading page: ' + error.message);
  }
});

try {
  const usersRoute = require('./routes/userRoutes');
  app.use('/api', usersRoute);
} catch (error) {
  console.error('✗ Error importing userRoutes:', error.message);
}

try {
  const roleRoutes = require('./routes/roleRoutes');
  app.use('/api', roleRoutes);
} catch (error) {
  console.error('✗ Error importing roleRoutes:', error.message);
}

try {
  const profileRoutes = require('./routes/profileRoutes');
  app.use('/api', profileRoutes);
} catch (error) {
  console.error('✗ Error importing profileRoutes:', error.message);
}

try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api', authRoutes);
} catch (error) {
  console.error('✗ Error importing authRoutes:', error.message);
}

try {
  const courseRoutes = require('./routes/courseRoutes');
  app.use('/api', courseRoutes);
} catch (error) {
  console.error('✗ Error importing courseRoutes:', error.message);
}

try {
  const transactionRoutes = require('./routes/transactionRoutes');
  app.use('/api', transactionRoutes);
} catch (error) {
  console.error('✗ Error importing transactionRoutes:', error.message);
}

try {
  const errorHandler = require('./middlewares/errorHandler');
  
  app.use(errorHandler);
} catch (error) {
  console.error('✗ Error importing errorHandler:', error.message);
  
  app.use((err, req, res, next) => {
    console.error('Fallback error handler:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  });
}

const staticPath = path.join(__dirname, './public');

const fs = require('fs');
if (fs.existsSync(staticPath)) {
  const indexPath = path.join(staticPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('✗ index.html not found');
  }
} else {
  console.error('✗ Build directory not found');
}

app.use(express.static(staticPath));

app.get('/swagger.json', (req, res) => {
  try {
    const swaggerPath = path.join(__dirname, './swagger.json');
    res.sendFile(swaggerPath);
  } catch (error) {
    res.status(404).json({ error: 'Swagger file not found' });
  }
});

app.get('*', (req, res) => {
  try {
    const indexPath = path.join(__dirname, './public/index.html');
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('React app not found. Make sure ./public/index.html exists.');
    }
  } catch (error) {
    res.status(500).send('Error loading page: ' + error.message);
  }
});

app.use((err, req, res, next) => {
  console.error('Uncaught server error:', err.stack || err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});
module.exports = app;
