const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const Session = require('express-session');
const multer=require('multer');
const fs = require('fs');

const { generateMessage } = require('./utils/message');
var { Users } = require('./utils/users');
const { isRealString } = require('./utils/validation');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

var storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, './public/uploads'); // set the destination
    },
    filename: function(req, file, callback){
        callback(null, Date.now() + '.jpg'); // set the file name and extension
    }
});
var upload = multer({storage: storage});

var  {  getUser,
        addUser,
        getAllUserList,
        removeUser,
        getUserList,
        addMessage,
        logOutUser,
        messageListBychat } = require('./utils/users');
        var current_user_id; //used for store current user id

app.use(express.static(publicPath));


var session= Session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
});
//this is a middleware when any request comes first come in this middleware
io.use(async(socket, next)=>{
        session(socket.request, socket.request.res, next);
});

app.use(session);


io.on('connection', async(socket) => {
    socket.on('createMessage', async(message, callback) => {
            //get user details of send message to_user
            let result=await getUser(message.to_userid);
        	let to_user=message.to_userid;
        	let from_user=socket.request.session.uid;
        	let textMessage=message.text;
        	let type_message=0;
            //get login user details
            let user_detail=await getUser(socket.request.session.uid);
             //send message to sender side
        	socket.emit('newMessage', generateMessage('You', message.text,'',''));
            //send message to receiver side
        	io.to(result.socket_id).emit('newMessage', generateMessage(`${user_detail.user_name}`, message.text,from_user,user_detail.user_name));
        	await addMessage(from_user,textMessage,to_user,type_message);
            callback();
    });

    socket.on('userjoin', async(param, callback) => {
        if (!isRealString(param.name) && !isRealString(param.room)) {
            return callback('Please enter user name and room name');
        }
        let current_user_id=await addUser(socket.id, param.name, param.room);
        try{
            socket.request.session.uid=current_user_id;
        }catch(e)
        {
            console.log('Unable to set session');
        }  
        let userList=await getUserList(param.name);
        socket.emit('loginMessage',{login_user_id:current_user_id});
        let NewList=await getAllUserList();
        NewList.forEach(async(element, index)=>{
        let ExcludingUsers=await getUserListById(element['user_id']);
        io.to(element['socket_id']).emit('updateUserList', ExcludingUsers);
        });

        callback();
        
    });
    socket.on('getUserList',async()=>{
        
    })
    socket.on('createLocationMessage',async(position) => {
        //get login user details
        let user_detail=await getUser(socket.request.session.uid);
        let result=await getUser(position.to_userid);
     	let message=`https://www.google.com/maps?q=${position.latitude},${position.longitude}`;
        let to_user=position.to_userid;
        let from_user=socket.request.session.uid;
        let type_message=1;
        //send message to sednder side
    	socket.emit('newLocationMessage', generateMessage(`You`, `https://www.google.com/maps?q=${position.latitude},${position.longitude}`,'',''));
        //send message to receiver side
        io.to(result.socket_id).emit('newLocationMessage', generateMessage(`${user_detail.user_name}`, `https://www.google.com/maps?q=${position.latitude},${position.longitude}`,from_user,user_detail.user_name));
        await addMessage(from_user,message,to_user,type_message);
 
    });

    socket.on('userTyping',async(info)=>{
        let from_user=socket.request.session.uid;
        let to_user=info.to_userid;
        let event=info.event;
        let result=await getUser(to_user);
        //show user typing message when user typing message to other user
        io.to(result.socket_id).emit('messageWriting',{from_user:from_user,event_name:event});

    });

	socket.on('myChatHistory', async(touserid) => {
            //get chat history of two users
            let messages=await messageListBychat(socket.request.session.uid,touserid.to_userid);
            socket.emit('userMessageList', messages);
     });
    //used for when user upload image then notify to server
    app.post('/chat-image', upload.single('chat_image'), async(req, res,next)=>{
            let image_name=req.file.filename;
            let to_user=req.body.send_message_userid;
            let from_user=req.body.login_userid;
            let type_message='2';
            await addMessage(from_user,image_name,to_user,type_message);
            let fromUserSocket=await getUser(to_user);
            //get login user details
            let user_detail=await getUser(from_user);
            //send message to to receiver user side
            io.to(fromUserSocket.socket_id).emit('createImage',generateMessage(`${user_detail.user_name}`,`/${image_name}`,from_user,user_detail.user_name));
            //send message to sender user
            io.to(user_detail.socket_id).emit('createImage',generateMessage('You',`/${image_name}`,'',''));

    });
    socket.on('disconnect', async() => {
        let NewList=await getAllUserList();
         NewList.forEach(async(element, index)=>{
        let ExcludingUsers=await getUserListById(element['user_id']);
        ExcludingUsers.forEach((element, index) => {
            if(element['user_id'] === socket.request.session.uid) {
                ExcludingUsers[index]['online_status'] = 'no';
            }
        });
        io.to(element['socket_id']).emit('updateUserList', ExcludingUsers);
        });
        await logOutUser(socket.request.session.uid);
       
    });

});
server.listen(port, async() => {
    console.log(`Server is up on ${port}`);
});

