const mysql = require('mysql2');

function createDBConnection(){
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Bankekind930602',
    database: 'sql_elevators'
  })
  
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to the database: ', err);
      return;
    }
    console.log('Connected to the database as ID ' + connection.threadId);
  });
  
  

  return connection;

}


module.exports = createDBConnection;