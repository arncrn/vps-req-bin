const dbQuery = require('./db-query');

const getBinContents = async (randomKey) => {
  const GET_CONTENTS = `SELECT requests.headers, requests.body, requests.date_created 
  FROM requests 
  JOIN identifier ON requests.random_key_id = identifier.id 
  WHERE identifier.random_key = $1 
  ORDER BY requests.date_created 
  DESC`;

  let result = await dbQuery(GET_CONTENTS, randomKey)

  return result.rows;
}

const getRandomKeyId = async (randomKey) => {
  const GET_KEY_ID = `SELECT id FROM identifier WHERE random_key = $1`;
  let result = await dbQuery(GET_KEY_ID, randomKey);
  return result.rows[0].id;
}

const saveHookData = async (randomKeyId, headers, body) => {
  const INSERT_DATA = `INSERT INTO requests (headers, random_key_id, body)
  VALUES ($1, $2, $3)
  RETURNING id`;
  let result = await dbQuery(INSERT_DATA, headers, randomKeyId, body)

  return result.rows[0].id;
}

const getHookData = async (reqId) => {
  const HOOK_DATA = `SELECT headers, body, date_created FROM requests WHERE id = $1`;
  let result = await dbQuery(HOOK_DATA, reqId);
  return result.rows[0];
}

const createBin = async (randomKey) => {
  const CREATE_BIN = `INSERT INTO identifier (random_key) VALUES ($1)`;
  let result = await dbQuery(CREATE_BIN, randomKey);

  return result.rowCount > 0;
}



module.exports = {
  getBinContents,
  getRandomKeyId,
  saveHookData,
  getHookData,
  createBin
};