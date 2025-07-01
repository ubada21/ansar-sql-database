const express = require('express');
const app = express();
const usersRoute = require('./routes/userRoutes');
const coursesRoutes = require('./routes/courseRoutes');
const cors = require('cors')

require('dotenv').config()

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('<h1>Hello, Express.js Server!</h1>');
});

app.use('/api', usersRoute);
app.use('/api', coursesRoutes);

const port = process.env.PORT || 3000; // You can use environment variables for port configuration
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
