const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const sql = fs.readFileSync(path.join(__dirname, 'init_schema.sql'), 'utf8');
const pool = new Pool({ connectionString: process.env.POSTGRES_URI });

pool.query(sql)
  .then(() => {
    console.log('Database initialized!');
    pool.end();
  })
  .catch(err => {
    console.error('Error initializing database:', err);
    pool.end();
    process.exit(1);
  });
