const express = require('express');
const cors = require('cors')
const usersRoute = require('./routes/userRoutes');
const coursesRoutes = require('./routes/courseRoutes');
const roleRoutes = require('./routes/roleRoutes')
const authRoutes = require('./routes/authRoutes')
const transactionRoutes = require('./routes/transactionRoutes')
const profileRoutes = require('./routes/profileRoutes')
const errorHandler = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const path = require('path')

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser())


// react
// app.use(express.static(path.join(__dirname, '../frontend-react/dist/')));

//app.use(express.static(path.join(__dirname, 'public')));


app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api', usersRoute);
app.use('/api', coursesRoutes);
app.use('/api', roleRoutes);
app.use('/api', profileRoutes);
app.use('/api', authRoutes);
app.use('/api', transactionRoutes);

app.use(errorHandler);

module.exports = app;

