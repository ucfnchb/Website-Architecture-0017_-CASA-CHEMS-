//###########################################################################################
//###########################################################################################
// This code is set up to serve the webpages from CASA-CHEMS Group Project
// It serves the main tree map and related insights page
// It is responsible for the communication with the database via the connection pool
// It performs validation on the requests and limits the number of requests from an IP
// The fields returned in the queries executed can be configured in the ./config file 
// Code written by M. Foster
//###########################################################################################
//###########################################################################################
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

//using environment variable __dirname - absolute path of dir of executing file
app.use(express.static(__dirname));

// Serve the mapjson directory as a static folder
app.use('/mapjson', express.static(path.join(__dirname, 'mapjson')));
app.use('/js', express.static(path.join(__dirname, 'js')));

const limiterLib = require('express-rate-limit');

//set request rate limits
const limiter = limiterLib.rateLimit({
	windowMs: 10 * 1000, // 10 secs
	limit: 10, // Limit each IP to 10 requests per `window` 
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
})

// Apply the rate limiting middleware to all requests.
app.use(limiter)

//start up create a connection pool with the database
const config = require('./config'); // Import config
const dbConfig = config.databasePool; //get the DB config
const port = config.server_port; // change port as needed
const host = 'casa0017.cetools.org';

const mysql = require('mysql');
const { log } = require('console');
//create pool of connections to manage load
const pool = mysql.createPool(dbConfig);
let sqlCols = "";

//this is used to provide a configurable set of data for the client ward data container
//the config file contains the available columns, aliases and formatting of data requested from the db
//the 'Use' attibute is used to switch on or off the retreival of that column
//get columns from config and iterate through to build the extra sql
try{
    Object.entries(config.wardQueryCols).forEach(([columnName, columnConfig]) => {
      if (columnConfig.Use) {
        sqlCols += ", " + columnConfig.Text;
      }
    });
}
catch(error){
  console.log("Error loading wardQueryCols");
  logIssue("Error loading wardQueryCols");
}


// root route that serves your HTML file to client
app.get('/', (req, res) => {
  try{
    ///console.log("__dirname: " + __dirname);
    logMsg("Received root request");
    res.sendFile(path.join(__dirname, 'Map page.html'));
  }
  catch(error){
    console.log(`Error loading root on get request: ${error}`);
    logIssue(`Error loading root on get request: ${error}`);
    return 0;
  }
  return 1;
});

// this char check code was sourced from https://javascript.plainenglish.io/check-if-string-is-alphanumeric-in-javascript-e325caa3ee
// no revisions were required for this string check, just try catch
function isAlphanumeric(str) {
  try{
    return /^[a-zA-Z0-9]+$/.test(str);
  }
  catch(error){
    console.log(`Error checking alphanumerics: ${error}`);
    logIssue(`Error checking alphanumerics: ${error}`);
  }
  return false;
}

//used for front end fetch request
app.get('/getWardData', (req, res) => {
  try{
    logMsg("Received getWardData request: " + req.query.wardCode);
    //console.log("Received getWardData request: " + req.query.wardCode);

    //use ward code
    const wardCode = req.query.wardCode;
    //console.log('Received wardCode:', wardCode);

    // restrict wardcode request to 9 chars and all must be alphanumeric
    // this is basic validation and helps prevent client SQL injection
    if (wardCode.length != 9 || ! isAlphanumeric(wardCode)){
        const errMsg = `Bad request in getWardData: ${wardCode}`;
        console.error(errMsg);
        logIssue(errMsg);
        res.status(400);
        return;
    }

    let sql = `select borough as Borough` + sqlCols + ` FROM warddata;`;
    //console.log(sql);

    pool.query(sql, (err, results) => {
      if (err) {
        console.error('Error connecting to the database:', err);
        logIssue('Error connecting to the database:', err);
        res.status(500);
        return;
      }
      //console.log('Connected to the MySQL database');
      //console.log("DB Conn Status: " + pool.status);
      
      res.status(200).json(results);
      
    });
  }
  catch(error){
    console.log(`Error checking alphanumerics: ${error}`);
    logIssue(`Error checking alphanumerics: ${error}`);
    res.status(500);
    return 0;
  }
  return 1;
});

//start listening
app.listen(port, () => {
  console.log(`Server running on http://${host}:${port}`);
  logMsg(`Server is running on http://${host}:${port}`);
  return 1;
});


// Write to daily issues file
function logIssue(issue) {
  const currentDate = new Date();
  //get the date and time
  const curDateTime = currentDate.toISOString();

  try{
    // Get date with no spaces or time for file name
    const curDate = currentDate.toISOString().split('T')[0].replace(/-/g, '');
    
    // Build the log file path
    const logFilePath = `logs/issue-log-${curDate}.txt`;

    // create or append to log file
    const logMessage = `[${curDateTime}] ${issue}\n`;
    fs.appendFileSync(logFilePath, logMessage);

    console.log(`Issue logged: ${logFilePath}`);
  }
  catch(error){
    console.log(`Error logging issue: [${curDateTime}] ${error}\n`);
    return 0;
  }
  return 1;
}

// Write to daily activity log file
function logMsg(msg) {
  const currentDate = new Date();
  //get the date and time
  const curDateTime = currentDate.toISOString();

  try{
    // Get date with no spaces or time for file name
    const curDate = currentDate.toISOString().split('T')[0].replace(/-/g, '');
    
    // Build the log file path
    const logFilePath = `logs/app-log-${curDate}.txt`;

    // create or append to log file
    const logMessage = `[${curDateTime}] ${msg}\n`;
    fs.appendFileSync(logFilePath, logMessage);

    //console.log(`Msg logged: ${logFilePath}`);
  }
  catch(error){
    console.log(`Error logging message: [${curDateTime}] ${error}\n`);
    return 0;
  }
  return 1;
}