const express = require('express');
const cors = require('cors')
const usersRoute = require('./routes/userRoutes');
const coursesRoutes = require('./routes/courseRoutes');
const roleRoutes = require('./routes/roleRoutes')
const authRoutes = require('./routes/authRoutes')
const profileRoutes = require('./routes/profileRoutes')
const errorHandler = require('./middlewares/errorHandler');
const cookieParser = require('cookie-parser');
const path = require('path')

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser())



app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use('/api', usersRoute);
app.use('/api', coursesRoutes);
app.use('/api', roleRoutes);
app.use('/api', profileRoutes);
app.use('/api', authRoutes);

app.use(errorHandler);

module.exports = app;

