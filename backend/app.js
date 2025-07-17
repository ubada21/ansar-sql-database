const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');

//  Serve frontend static files - Notes by Rehan to remeber
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', userRoutes);

//  Optional: Send index.html on root access - Notes by Rehan to remeber
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
