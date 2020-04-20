var {dbconnection}=require('./dbconnection');

  addUser=(id, name, room)=>{
    return new Promise((resolve, reject)=>{
    dbconnection.query("select * from user where user_name='"+name+"'", function (err, result) {
        if (err) throw err;
        var users = JSON.parse(JSON.stringify(result));
        if(users.length>=1){
           dbconnection.query("update user set online_status='yes', socket_id='"+id+"'where user_name='"+name+"'", function (err, result) {
              if (err) throw err;
           });
          resolve(users[0].user_id);
          
        }
        else
       {
        var data={socket_id:id,user_name:name,room:room,online_status:'yes'};
       dbconnection.query(`insert into user set ?`,data, function (err, result) {
        if (err){ throw err;}else
        {
            dbconnection.query("select * from user where user_name='"+name+"'", function (err, result) {
               var users = JSON.parse(JSON.stringify(result));
               resolve(users[0].user_id);
            });
        }
        });
      }
     });
    })
  }
  checkregisterduser=(name)=>{
    return new Promise((resolve, reject)=>{
        dbconnection.query("select * from user where user_name='"+name+"'", function (err, result) {
        if (err) throw err;
        var users = JSON.parse(JSON.stringify(result));
        if(users.length>=1){
         resolve(true);
        }else
        {
          reject(false);
        }
    });
  });
}
getUser=(id)=> {
     return new Promise((resolve, reject) => {
     dbconnection.query("select * from user where user_id='"+id+"'", function (err, result) {
      if (err) throw err;
      var users = JSON.parse(JSON.stringify(result));
       resolve(users[0]);
    });
  });
  }
  getUserList=function(name) {
    return new Promise((resolve,reject)=>{
    dbconnection.query("select *,DATE_FORMAT(last_seen,'%d-%m-%Y') as last_seen from user where user_name!='"+name+"'", function (err, result) {
        if (err){
            reject(err);
        } 
        var users = JSON.parse(JSON.stringify(result));
         resolve(users);
    });
  })
}

  getAllUserList=function() {
    return new Promise((resolve,reject)=>{
    dbconnection.query("select * from user", function (err, result) {
        if (err){
            reject(err);
        } 
        var users = JSON.parse(JSON.stringify(result));
         resolve(users);
    });
  })
}

 getOnlineUser=function() {
    return new Promise((resolve,reject)=>{
    dbconnection.query("select * from user where online_status='yes'", function (err, result) {
        if (err){
            reject(err);
        } 
        var users = JSON.parse(JSON.stringify(result));
         resolve(users);
    });
  })
}

  getUserListById=function(id) {
    return new Promise((resolve,reject)=>{
    dbconnection.query("select *,DATE_FORMAT(last_seen,'%d-%m-%Y %h:%i %p') as last_seen from user where user_id !='"+id+"'", function (err, result) {
        if (err){
            reject('Unable to get result of user list');
        } 
        var users = JSON.parse(JSON.stringify(result));
         resolve(users);
    });
  })
};


 addMessage=(from_user,message,to_user,type_message)=>{
   return new Promise((resolve, reject) => {
        var data={from_user:from_user,message:message,to_user:to_user,type_message};
       dbconnection.query(`insert into message set ?`,data, function (err, result) {
        if (err){
          reject('Unable to insert the data');
        }
        resolve();
        });  
     });
  }

  messageListBychat=(from_user,to_user)=>{
    return new Promise((resolve, reject) => {
    dbconnection.query("select message.type_message, message.to_user,message.message,DATE_FORMAT(message.date_time, '%M %e %Y') as date_time,user.user_name as from_user from message join user on message.from_user=user.user_id where (message.from_user='"+from_user+"'and message.to_user='"+to_user+"' or message.from_user='"+to_user+"'and message.to_user='"+from_user+"') order by id", function (err, result) {
        if (err) {
          reject('Unable to fetch data');
        }
        else{
           var messages = JSON.parse(JSON.stringify(result));
           resolve(messages);
        }
      });
    });
  }

var logOutUser=(id)=>{
   return new Promise((resolve, reject) => {
      dbconnection.query("update user set online_status='no' where user_id='"+id+"'", function (err, result) {
              if (err) throw err;
      });
    })
}

module.exports = {getUser,addUser,getUserList,addMessage,messageListBychat,getAllUserList,logOutUser};

