
const { Client, Pool, types } = require("pg");
types.setTypeParser(1700, val => parseFloat(val));

const {PGPORT, PGHOST, PGUSER, PGDATABASE, PGPASSWORD} = process.env;

const db = new Pool({
    host: PGHOST,
    port: PGPORT,
    user: PGUSER,
    database: PGDATABASE,
    password: PGPASSWORD,
    max: 5,
    min: 2,
    idleTimeoutMillis: 1000,
    connectionTimeoutMillis: 1000
});

module.exports = db;
