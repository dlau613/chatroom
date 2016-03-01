//load modules
// var express = require("express");
// var app = express();
// var http = require("http").createServer(app);
// var port = 8001;

// app.get("/", function(req,res) {
// 	res.send("it works!");
// });

// app.listen(port);
// console.log("listening on port" + port);
var port = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  // res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + '/index.html');
});

// app.use(express.static(__dirname + '/index.html'));

var numUsers = 0;
var allUsers = [];
io.on('connection', function(socket){
	numUsers += 1;

	socket.userName = 'default';
	allUsers.push(socket);
	console.log('a user connected');

	socket.on('disconnect', function(){
		numUsers -= 1;
	    var i = allUsers.indexOf(socket);
	    var user = allUsers[i].userName;
	    console.log(user +' disconnected');
	    allUsers.splice(i,1);
	    io.emit('disconnect', {num_users : numUsers, user_name : user});
	});

	socket.on('chat message', function(msg){
    	console.log(msg.user_name + ': ' + msg.message);
    	socket.broadcast.emit('chat message', { m : msg.message, user_name : msg.user_name} );
 	});

	//once the user enters a user name send it and the new number of users to everyone
 	socket.on('new user',function(msg) {
 		console.log(msg + ' joined the chatroom');
 		var i = allUsers.indexOf(socket);
 		allUsers[i].userName = msg; 
 		io.emit('new user', {num_users : numUsers, user_name : msg });
 	});
});



http.listen(3000, function(){
  console.log('listening on *:3000');
});



