const { Pool } = require('pg');
const password = 'dalN9dbG7u0uS6MPMDqAJj5pjUX8Yqaq'

const pool = new Pool
(
  {
    connectionString: process.env.DATABASE_URL|| `postgres://kspl:${password}@dpg-cfebmcmn6mpu0uc7ngtg-a.singapore-postgres.render.com/ignst?ssl=true`
  }
)


// const host = 'ec2-65-2-125-229.ap-south-1.compute.amazonaws.com'
// const database = 'nigst'
// const username = 'kspl'
// const password = 'KSPL@PG123#'
// const port = 5432; 
// const pool = new Pool({
//   host,
//   database,
//   user: username,
//   password,
//   port,
// })

module.exports = pool;

