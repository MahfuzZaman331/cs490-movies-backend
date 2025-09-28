const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const indexRouter = require('./routes/index');
const filmsRouter = require('./routes/films');
const actorsRouter = require('./routes/actors');
const rentalsRouter = require('./routes/rentals');
const customersRouter = require('./routes/customers');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/films', filmsRouter);
app.use('/api/actors', actorsRouter);
app.use('/api/rentals', rentalsRouter);
app.use('/api/customers', customersRouter);

module.exports = app;
