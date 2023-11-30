const mysql = require('mysql2');
const fs = require("fs");
const path = require("path");

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Bankekind930602',
  database: 'sql_elevators'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ', err);
    return;
  }
  console.log('Connected to the database');

  const sqlScriptPath = path.join(__dirname, 'createDatabase.sql');

  function readAndProcessSQLScript(){
    try {
      
      const sqlScript = fs.readFileSync(sqlScriptPath, 'utf8');
      const sqlStatements = sqlScript.split(";").filter((sql) => sql.trim() !== "");
      console.log(sqlStatements);
      

      sqlStatements.forEach(statement => {
        connection.query(statement, (error, results) => {
          if (error) {
            console.error('Error running SQL script:', error);
          } else {
            console.log('SQL script executed successfully:', results);
          }
        });
      });
      connection.end();
    }
    catch (error){
      console.error("error reading sql script file: ", error);
      connection.end();
    }
  }
  readAndProcessSQLScript();
  
});
    
  
    
  
   