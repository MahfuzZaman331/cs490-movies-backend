const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const indexRouter = require('./routes/index');
const filmRoutes = require('./routes/films');
const actorRoutes = require('./routes/actors');
const customerRoutes = require('./routes/customers');
const rentalRoutes = require('./routes/rentals');

app.use('/', indexRouter);
app.use('/api/films', filmRoutes);
app.use('/api/actors', actorRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/rentals', rentalRoutes);

module.exports = app;
