const config = require('config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = dbAccount = {};
module.exports = dbPlaces = {};
module.exports = dbRefreshToken = {};

initialize();

async function initialize() {
    // cria banco de dados se ainda não existir
    const { host, port, user, password, database } = config.database;
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    // conectar ao banco de dados
    const sequelize = new Sequelize(database, user, password, { host:'klbcedmmqp7w17ik.cbetxkdyhwsb.us-east-1.rds.amazonaws.com', dialect: 'mysql' });

    // modelos de inicialização e adicioná-los ao objeto db exportado
    dbPlaces.Places = require('../msc/accounts/places.model')(sequelize);
    dbAccount.Account = require('../msc/accounts/account.model')(sequelize);
    db.RefreshToken = require('../msc/accounts/refresh-token.model')(sequelize);
    

    // define relacionamentos
    dbAccount.Account.hasMany(dbRefreshToken.RefreshToken, { onDelete: 'CASCADE' });
    dbPlaces.Places.hasMany(dbRefreshToken.RefreshToken, { onDelete: 'CASCADE' });
    dbRefreshToken.RefreshToken.belongsTo(dbAccount.Account);
    dbRefreshToken.RefreshToken.belongsTo(dbPlaces.Places);

    
    // sincroniza todos os modelos com o banco de dados
    await sequelize.sync();
}