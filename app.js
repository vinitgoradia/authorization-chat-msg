/**
* Module dependencies.
*/
var socketCounter = 0;
var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');
//var methodOverride = require('method-override');

var bodyParser = require('body-parser');

var session = require('express-session');
var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var server = http.Server(app);
var io = require('socket.io')(server);
// console.log(server,io);
app.use(express.static('public'));
var mysql = require('mysql');
var connection = mysql.createConnection({
              host     : 'localhost',
              user     : 'root',
              password : '',
              database : 'test'
            });
 
connection.connect();
 
global.db = connection;
 
// all environments
app.set('port', 9000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
              secret: 'keyboard cat',
              resave: false,
              saveUninitialized: true,
              cookie: { maxAge: 60000000 }
            }));
 
// development only
app.post('/home/getData', user.ajaxHandler);//call for message module 
app.post('/home/message', user.pollModule);//call for main index page
app.get('/signup', user.signup);//call for signup page
app.post('/signup', user.signup);//call for signup post 
app.get('/', routes.index);//call for login page
app.post('/login', user.login);//call for login post
app.get('/home/dashboard', user.dashboard);//call for dashboard page after login
app.get('/home/chat', user.chat);//call for dashboard page after login
app.get('/home/logout', user.logout);//call for logout
app.get('/home/profile',user.profile);//to render users profile
app.get('/home/sendchatmsg', user.chathandler);//call for chathandler post 
app.get('/home/message', user.messageModule);//call for message module 
app.post('/home/getData', user.ajaxHandler);//call for message module 
app.post('/home/updateChat', user.updateUserMessages);//call for message module 

var clients = [];

io.sockets.on('connect', function(client) {
    clients.push(client.id);
    console.log(clients);
    console.log("CLIENT LIST ^^^"); 


    client.on('disconnect', function() {
        clients.splice(clients.indexOf(client.id), 1);
        console.log(clients);
        console.log("CLIENT LIST ^^^");
    });
});
//Middleware
io.on('connection', function(socket){
  console.log("Connectedddddddddd");
  socketCounter++;
  console.log("SOCKET COUNTER: " + socketCounter);
  io.emit('chat message','congrats. you are connected.');
  socket.on('disconnect', function () {
    socketCounter--;
    socket.emit('disconnected');
    console.log("DISCONNECTEDD");
    console.log("SOCKET COUNTER: " + socketCounter);
  });
  socket.on('chat message', function(msg){
    console.log("CHAAAT");
    io.emit('chat message', msg);
  });
});
// app.listen(9000);
server.listen(9000);

