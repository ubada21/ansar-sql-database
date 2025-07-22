const express = require('express');
const cors = require('cors')
const usersRoute = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes')
const authRoutes = require('./routes/authRoutes')
const transactionRoutes = require('./routes/transactionRoutes')
const profileRoutes = require('./routes/profileRoutes')
const errorHandler = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const path = require('path')

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser())

app.use('/api', usersRoute);
app.use('/api', roleRoutes);
app.use('/api', profileRoutes);
app.use('/api', authRoutes);
app.use('/api', transactionRoutes);

// === Serve static React files ===
// Serve static files
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, '../frontend/build') });
});

// Serve Swagger documentation
app.get('/swagger.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'swagger.json'));
});


app.use(errorHandler);

module.exports = app;

