const config = require('config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    // cria banco de dados se ainda não existir
    const { host, port, user, password, database } = config.database;
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    // conectar ao banco de dados
    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });

    // modelos de inicialização e adicioná-los ao objeto db exportado
    db.Account = require('../accounts/account.model')(sequelize);
    db.RefreshToken = require('../accounts/refresh-token.model')(sequelize);

    // define relacionamentos
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);
    
    // sincroniza todos os modelos com o banco de dados
    await sequelize.sync();
}