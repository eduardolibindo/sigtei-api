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
    const sequelize = new Sequelize(database, user, password, { host:'l6slz5o3eduzatkw.cbetxkdyhwsb.us-east-1.rds.amazonaws.com', dialect: 'mysql' });

    // modelos de inicialização e adicioná-los ao objeto db exportado
    db.Account = require('../msc/accounts/account.model')(sequelize);
    db.RefreshToken = require('../msc/accounts/refresh-token.model')(sequelize);
    db.Places = require('../msc/places/places.model')(sequelize);

    // define relacionamentos
    db.Account.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.Account);
    // db.Places.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    // db.RefreshToken.belongsTo(db.Places);
    db.Places.belongsTo(db.Account);
    
    // sincroniza todos os modelos com o banco de dados
    await sequelize.sync();
}