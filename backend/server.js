const express = require('express');
const cors = require('cors')
const usersRoute = require('./routes/userRoutes');
const coursesRoutes = require('./routes/courseRoutes');
const roleRoutes = require('./routes/roleRoutes')
const profileRoutes = require('./routes/profileRoutes')
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('<h1>Hello, Express.js Server!</h1>');
});

app.use('/api', usersRoute);
app.use('/api', coursesRoutes);
app.use('/api', roleRoutes);
app.use('/api', profileRoutes);

app.use(errorHandler);

module.exports = app;

