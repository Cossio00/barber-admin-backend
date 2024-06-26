const db = require('../dbConfig/db');
const crypto = require('crypto');
const Client = require('../Model/Client');

async function getClient(req, res){

    const rows = await db.query(`SELECT * FROM client`);
    return rows;
}

module.exports = {getClient}