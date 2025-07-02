var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
require("dotenv").config();

var indexRouter = require('./routes/indexRouter');
var usersRouter = require('./routes/userRouter');
var authRouter = require('./routes/authRouter');
var matchRouter = require('./routes/matchRouter');
var likeRouter = require('./routes/likeRouter');
var blockRouter = require('./routes/blockRouter');
var cors = require('cors')
const nodemailer = require('nodemailer');

// Create a transporter (for testing, you can use a test account)
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'your_email@example.com',
    pass: 'your_password'
  }
});


var app = express();
app.use(cors())
app.use(express.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/match', matchRouter);
app.use('/like', likeRouter);
app.use('/block', blockRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', socketConnections: io.engine.clientsCount });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;