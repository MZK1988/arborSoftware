const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const moment = require('moment');
const connectDB = require('./config/db');
const sql = require('mssql');

//Connect to MongoDB
connectDB();
//Init Middleware
app.use(express.json({ extended: false }));

app.use(express.urlencoded({ extended: true }));

//Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/copiaDb', require('./routes/api/copiaDb'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
