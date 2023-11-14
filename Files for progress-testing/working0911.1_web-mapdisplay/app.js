const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001; // change port as needed
const host = 'casa0017.cetools.org';
//app.use(express.json());
//using environment variable __dirname - absolute path of dir of executing file
app.use(express.static(__dirname));

// Serve the mapjson directory as a static folder
app.use('/mapjson', express.static(path.join(__dirname, 'mapjson')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// Define a root route that serves your HTML file
app.get('/', (req, res) => {
  console.log("__dirname: " + __dirname);
  res.sendFile(path.join(__dirname, 'Map.html'));
  //res.sendFile(__dirname + '/index.html');
  //res.sendFile(__dirname + '/map.html');
});

app.get('/getData', (req, res) => {
    const data = []; // array to store the returned data

    fs.createReadStream('./data/treeData.csv')

    //event handler for each record
    .on('data', (row) => {
      //console.log(row);  
      data.push(row); //appends the row
    })
    //return the data
    .on('end', () => {
      res.json(data);
    });
});

app.get('/getSQLData', (req, res) => {
  console.log("in getSQLData");
  const config = require('./config'); // Import the configuration file
  const dbConfig = config.databasePool; //set this to the db connection config in the config file

  const mysql = require('mysql');
  //create pool of connections to manage load
  const pool = mysql.createPool(dbConfig);
  
  //use ward code
  const wardCode = req.query.wardCode;
  console.log('Received wardCode:', wardCode);

  let sql = `select borough from ldn_wards where ward_code = '` + wardCode + `';`;
  console.log(sql);
  pool.query(sql, (err, results) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return;
    }
    console.log('Connected to the MySQL database');
    console.log("DB Conn Status: " + pool.status);



    for (const row of results) {
      console.log(row.borough);
    }
    //console.log("res[0]: " + row[0]);
    res.status(200).json(results);
  });

  //pool.end(); 
  /*
  // Respond with a JSON object (or perform other operations)
  res.json({ wardCode });


  let sql = `SELECT * FROM ARCCanopyData WHERE la_cd = "` + wardCode + `";`;
  connection.query(sql, (error, results, fields) => {
    res.status(200).json(results);
  });
*/


});

app.listen(port, () => {
  console.log(`Server is running on http://${host}:${port}`);
});