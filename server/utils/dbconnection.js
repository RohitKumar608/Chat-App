const mysql = require('mysql');
const dbconnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'chat_app'
});
dbconnection.connect((err) => {
  if (err) throw err;
  console.log('Connected!');
});
module.exports={dbconnection};