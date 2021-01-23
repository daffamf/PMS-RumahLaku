var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var logger = require('morgan');
var FormData = require('form-data');
const fileUpload = require('express-fileupload');

const { Pool } = require('pg')

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'postgres',
  database: 'rumah-laku',
  port: 5432,
})
// pool.query('SELECT * FROM iklan',(err,rows)=>{
// console.log(rows.rows)
// })

var indexRouter = require('./routes/index.js')(pool);
var usersRouter = require('./routes/user')(pool);
var apiRouter = require('./routes/api')(pool);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views/pages'));
app.set('view engine', 'ejs');

app.locals.moment = require('moment');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  user:[],
  secret:"It's a secret",
  cookie: { maxAge: 60000 },
  resave: false,    // forces the session to be saved back to the store
  saveUninitialized: false 
}))

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/api/index', apiRouter);

app.use(fileUpload());

app.use(function(req, res, next) {
  res.locals.user = req.session.user;
  next();
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
