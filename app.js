var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var filmRoutes = require('./routes/films');

var app = express();

const cors = require('cors');
app.use(cors());

const actorsRouter = require('./routes/actors');
app.use('/api/actors', actorsRouter);


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/films', filmRoutes); // 👈 This line connects your top-rented route

module.exports = app;
