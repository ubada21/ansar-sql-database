const express = require('express');
const cors = require('cors')
const usersRoute = require('./routes/userRoutes');
const coursesRoutes = require('./routes/courseRoutes');
const errorHandler = require('./middlewares/errorHandler');
const errorLogger = require('./middlewares/errorLogger');
require('dotenv').config()

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('<h1>Hello, Express.js Server!</h1>');
});

app.use('/api', usersRoute);
app.use('/api', coursesRoutes);

app.use(errorLogger);
app.use(errorHandler);

const port = process.env.PORT || 3000; // You can use environment variables for port configuration
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
