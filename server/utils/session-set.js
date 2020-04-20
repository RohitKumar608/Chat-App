var express = require('express');
//var cookieParser = require('cookie-parser');
var session = require('express-session');

var app = express();

//app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!",resave: true,saveUninitialized: true}));

var sess;
app.get('/', function(req, res){
   if(req.session.page_views){
      req.session.page_views++;
     
      res.send("You visited this page " + req.session.page_views+' '+req.session.user_name + " times");
   } else {
      req.session.page_views = 1;
      req.session.user_name='rohit';
      res.send("Welcome to this page for the first time!");
   }
});
app.get('/session', function(req, res){
      res.send("You visited this page " + req.session.page_views+' hiii '+req.session.user_name + " times");
  
});
app.listen(3000);