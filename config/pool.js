const { Pool } = require('pg');



const host = 'ec2-65-2-125-229.ap-south-1.compute.amazonaws.com'
const database = 'nigst'
const username = 'kspl'
const password = 'KSPL@PG123#'
const port = 5432; 
const pool = new Pool({
  host,
  database,
  user: username,
  password,
  port,
})

module.exports = pool;

