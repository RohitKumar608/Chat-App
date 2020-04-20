var socket = io();


function scrollToBottom ()
 {
    // Selectors
    var messages = jQuery('#message');
    var newMessage = messages.children('li:last-child')
    // Heights
    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) 
    {
      messages.scrollTop(scrollHeight);
    }
 }

socket.on('disconnect', function () {
 // alert($('#login_userid').val());
  console.log('Disconnected from server');
});

socket.on('loginMessage',function(login_userid){
    $('#login_userid').val(login_userid.login_user_id);
});

socket.on('newMessage', function (message) {
	scrollToBottom();
  let to_userid=$('#send_message_userid').val();
  if(to_userid==message.to_user || message.to_user==''){
	var timeFormat=moment(message.createdAt).format('h:mm a');
  	var template=jQuery('#message-template').html();
  	var html=Mustache.render(template,{
  		from:message.from,
  		text:message.text,
  		createdAt:timeFormat
  	});
  	jQuery('#message').append(html);
  }else
  {
    //console.log();
    $.notify(`New message received from ${message.from_user_name}.`, "success");
  }
});

socket.on('newLocationMessage', function (message) {
	scrollToBottom();

  let to_userid=$('#send_message_userid').val();
  if(to_userid==message.to_user || message.to_user==''){
	var timeFormat=moment(message.createdAt).format('h:mm a');
  	var template=jQuery('#location-template').html();
  	var html=Mustache.render(template,{
  		from:message.from,
  		text:message.text,
  		createdAt:timeFormat
  	});
  	jQuery('#message').append(html);
  }else
  {
    console.log(`New message received from ${message.to_user}.`);
  }
});


socket.on('createImage', function (message) {

  scrollToBottom();
let to_userid=$('#send_message_userid').val();
  if(to_userid==message.to_user || message.to_user==''){
  var timeFormat=moment(message.createdAt).format('h:mm a');
    var template=jQuery('#image-template').html();
    var html=Mustache.render(template,{
      from:message.from,
      text:message.text,
      createdAt:timeFormat
    });
    jQuery('#message').append(html);
  }else
  {
     console.log(message);
    console.log(`New message received from ${message.to_user}.`);
  }
});


  var messageTextBox=jQuery('[name=message]');
  jQuery('#send-message').on('submit',function (e) {
    let from_userid=$('#login_userid').val();
    let to_userid=$('#send_message_userid').val();
  	e.preventDefault();
  	socket.emit('createMessage', 
    {
     	 from_userid:from_userid,
       to_userid: to_userid,
       socket_id:socket.id,
     	 text:messageTextBox.val()
  },function() {
  	messageTextBox.val('')
  });
  });

	var share_location=jQuery('#send-location');
	share_location.on('click',function () {
		share_location.attr('disabled','disabled').text('Sending location....');
    let to_userid=$('#send_message_userid').val();
    let from_userid=$('#login_userid').val();
		if(navigator.geolocation)
    {
  		navigator.geolocation.getCurrentPosition(function(position) 
      {
    		share_location.removeAttr('disabled').text('Send location');
    		socket.emit('createLocationMessage',{
    		  latitude:position.coords.latitude, 
    		  longitude:position.coords.longitude,
          from_userid:from_userid,
          to_userid: to_userid
    		});
  		},function (err) {
  			alert('Unable tp fetch location');
  		});
	}else{
		share_location.removeAttr('disabled').text('Send location');
		alert('Your browser does not support geolocation');
	}
	});
  socket.on('connect',function(){
      var param=jQuery.deparam(window.location.search);
      socket.emit('userjoin',param,function(err){
         socket.emit('getUserList');
          if(err){
            alert(err);
            window.location.href='/';
          }
      });
    });

socket.on('updateUserList', function (users) {
  console.log(users);
  var ol = jQuery('<ol></ol>');
  users.forEach(function (user) {
    var online_status;
     if(user.online_status=='yes'){
       online_status=`<button class="button_online button_circle" disabled ></button>`;
      }else
      {
       online_status= `<button class="button_offline button_circle" disabled ></button>`;
      }
    ol.append(jQuery(`<li >
      <button data-online="${user.online_status}" data-last_seen="${user.last_seen}" class="userlist" data-username="${user.user_name}" data-id=${user.user_id}>${user.user_name}</button>
      ${online_status}<span id="userlist${user.user_id}"  style="color:green;display:none;">typing....</span>
      </li>`));
  });

  jQuery('#users').html(ol);
});
  $(document).on('click','.userlist',function(){
        $('.chat__footer').show();
        $('.userNameDiv').show();
        $('.welcome_div').hide();
        var element = $(this);
        var id=element.attr('data-id');
        var userName=element.attr('data-username');
        var last_seen=element.attr('data-last_seen');
        var online=element.attr('data-online');
        $('.userName').html(userName);
        if(online=='yes')
        {
          $('.last_seen').html('Online');
          $('.last_seen_text').hide();
        }else
        {
          $('.last_seen_text').show();
          $('.last_seen').html(last_seen);
        }
        let from_userid=$('#login_userid').val();
        $('#send_message_userid').val(id);
  socket.emit('myChatHistory',{to_userid:id,from_user:from_userid});
});

socket.on('userMessageList', function (messages) {
  jQuery('#message').html('');
  var user_id=$('#send_message_userid').val();
  if(messages.length>=1){
  messages.forEach(function (messages) {
   var flot_user;
   
   if(user_id==messages.to_user)
   {
      flot_user='width: 50%;background-color:#a0e9ec;height: 62px;margin-bottom: 13px;border-radius: 28px;';
   }else{
    flot_user='width: 50%;';
   }
   if(messages.type_message==0){
    var template=jQuery('#message-template').html();
    var html=Mustache.render(template,{
      from:messages.from_user,
      text:messages.message,
      createdAt:messages.date_time,
      float:flot_user
    });
     jQuery('#message').append(html);
  }else if(messages.type_message==1)
  {
    var template=jQuery('#location-template').html();
      var html=Mustache.render(template,{
      from:messages.from_user,
      text:messages.message,
      createdAt:messages.date_time,
      float:flot_user
    });
     jQuery('#message').append(html);
  }else
  {
    var template=jQuery('#image-template').html();
      var html=Mustache.render(template,{
      from:messages.from_user,
      text:messages.message,
      createdAt:messages.date_time,
      float:flot_user
    });
     jQuery('#message').append(html);
  }
  });
}else{
jQuery('#message').html('');
}
});

jQuery('#image_upload').on('submit',function (e) {
   e.preventDefault();
    let from_userid=$('#login_userid').val();
    let to_userid=$('#send_message_userid').val();
   // Get the files from input, create new FormData.
    var form = $('#image_upload')[0];
    var data = new FormData(form);
    var files = $('#chat_image').get(0).files;
     if (files.length === 0) {
        alert('Select atleast 1 file to upload.');
        return false;
    }
      var data = new FormData(form);
     $('#chat_image').val('');
    $.ajax({
         type: "POST",
        enctype: 'multipart/form-data',
        url: "/chat-image",
        data: data,
        processData: false, //prevent jQuery from automatically transforming the data into a query string
        contentType: false,
        cache: false,
       success: function(response){
         $('#chat_image').val('');    
       }
    });
  });
  
  $('#write_message').keypress(function() {
    let from_userid=$('#login_userid').val();
    let to_userid=$('#send_message_userid').val();
    socket.emit('userTyping',{from_userid,to_userid,event:'keypress'});
});
  $('#write_message').keyup(function() {
    console.log('calling write message event');
    let from_userid=$('#login_userid').val();
    let to_userid=$('#send_message_userid').val();
    socket.emit('userTyping',{from_userid,to_userid,event:'keydown'});
});

  socket.on('messageWriting',(response)=>{
    let to_userid=$('#send_message_userid').val();
      if(response.event_name=='keypress')
      {
        $('#userlist'+response.from_user).show();
        
      }else{
        $('#userlist'+response.from_user).hide();
      }
  });