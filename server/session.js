var express = require('express')
var parseurl = require('parseurl')
var session = require('express-session')
var app = express();
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));
  
app.get('/', function (req, res, next) {
     if (!req.session.get) {
    req.session.get = 0;
  }
  req.session.get=req.session.get+1;

  res.send('you viewed this page ' + req.session.get + ' times')
})
 
app.get('/bar', function (req, res, next) {
     if (!req.session.views) {
    req.session.views = 0;
  }
  req.session.views=req.session.views+1;
  res.send('you viewed this page ' + req.session.views+ ' times')
})
app.listen(3000, () => {
    console.log(`Server is up on 3000`);
});