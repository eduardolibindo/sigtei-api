const config = require('config.json');
const { require } = require('joi');
const mongoose = require('mongoose');

const connectionOptions = { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };
mongoose.connect(process.env.MONGODB_URI || config.connectionString, connectionOptions);
mongoose.Promise = global.Promise;

module.exports = {
    Account: require('../mongo/accounts/account.model'),
    RefreshToken: require('../mongo/accounts/refresh-token.model'),
    Places: require('../mongo/places/places.model.js'),
    isValidId
};

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}