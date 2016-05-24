

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var pg = require('pg')
//var connectionString = "postgres://maartje:hartje123@192.168.99.100:32772/bulletinboard"

var connectionString = 'postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/bulletinboard';
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.get('/', function(req, res) {
  res.render('index', { title: 'BulletinBoard' });
});






app.get('/bulletin', function(req, res) {
  res.render('bulletin', { title: 'Shoot Bullets' });
});



app.get('/bullets', function(req, res) {
  pg.connect(connectionString, function(err, client, done){
    client.query("SELECT * FROM messages", function(err, result){
      console.log(result)
      res.render("bullets",{
       messages:result.rows
      }) 
    }) 
  }) 
})



app.post('/bulletin', function(req, res) {
  var results = []

  var data = {
    title: req.body.title,
    body: req.body.bullet
  }

  pg.connect(connectionString, function(err, client, done) {
    if (err) {
      done()
      console.log(err)
      return res.status(500).json({succes: false, data:err})
    }

    client.query("INSERT INTO messages(title, body) values($1, $2)", [data.title, data.body])

    var query = client.query("SELECT * FROM messages");

    res.redirect('/bullets')

    query.on('row', function(row) {
      results.push(row);
    })

    query.on('end', function() {
      done();
      
      

    })
  }) 
})







// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});







module.exports = app;
