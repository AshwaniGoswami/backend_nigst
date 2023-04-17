const { Pool } = require('pg');
const password = 'dalN9dbG7u0uS6MPMDqAJj5pjUX8Yqaq'

const pool = new Pool
(
  {
    connectionString: process.env.DATABASE_URL|| `postgres://kspl:${password}@dpg-cfebmcmn6mpu0uc7ngtg-a.singapore-postgres.render.com/ignst?ssl=true`
  }
);

module.exports = pool;

