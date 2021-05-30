const config = require("./config");
const { Client } = require("pg");

const logQuery = (statement, parameters) => {
  let timeStamp = new Date();
  let formattedTimeStamp = timeStamp.toString().substring(4, 24);
  console.log(formattedTimeStamp, statement, parameters);
}

const isProduction = config.NODE_ENV === "production" ? {rejectUnauthorized: false} : false;

module.exports = async function(queryStatement, ...queryVariables) {
  try {
    const client = new Client({
      connectionString: config.DB_CONNECTIONSTRING,
      user: config.USER,
      password: config.POSTGRES_PASSWORD,
      ssl: isProduction,
    });
    
    await client.connect();
    logQuery(queryStatement, queryVariables);
  
    const queryResult = await client.query(queryStatement, queryVariables);
    
    await client.end();
  
    return queryResult;
  } catch (err) {
    console.log(err);
  }
}