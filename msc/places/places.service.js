const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const { Op } = require('sequelize');
const sendEmail = require('_helpers/send-email');
const db = require('_helpers/db');
const Role = require('_helpers/role');

module.exports = {
    authenticate,
    refreshToken,
    revokeToken,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function authenticate({ email, password, ipAddress }) {
    const account = await db.Account.scope('withHash').findOne({ where: { email } });

    if (!account || !account.isVerified || !(await bcrypt.compare(password, account.passwordHash))) {
        throw 'E-mail ou senha está incorreto';
    }

    // autenticação bem-sucedida, então gere jwt e atualize tokens
    const jwtToken = generateJwtToken(account);
    const refreshToken = generateRefreshToken(account, ipAddress);

    // salvar token de atualização
    await refreshToken.save();

    // retorna detalhes básicos e tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

async function refreshToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    const account = await refreshToken.getAccount();

    // substitua o token de atualização antigo por um novo e salve
    const newRefreshToken = generateRefreshToken(account, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    // gerar novo jwt
    const jwtToken = generateJwtToken(account);

    // retorna detalhes básicos e tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}

async function revokeToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);

    // revogar o token e salvar
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

async function getAll() {
    const places = await db.Places.findALL();
    return places.map(x => basicDetails(x));
}

async function getById(id) {
    const places = await getPlace(id);
    return basicDetails(places);
}

async function create(params) {
    // validar
    if (await db.Places.findOne({ where: { place: params.place } })) {
        throw 'Local "' + params.place + '" já está cadastrado';
    }

    const places = new db.Places(params);

    await places.save();
    return basicDetails(places);
}

async function update(id, params) {
    const places = await getPlace(id);

    // validar (se o endereco foi alterado)
    if (params.place && places.place !== params.place && await db.Places.findOne({ where: { place: params.place } })) {
        throw 'Local "' + params.place + '" já está cadastrado';
    }

    // copia os parâmetros para a conta e salva
    Object.assign(places, params);
    places.updated = Date.now();
    await places.save();

    return basicDetails(places);

}

async function _delete(id) {
    const places = await getPlace(id);
    await places.destroy();
}

// funções auxiliares

async function getPlace(id) {
    const places = await db.Places.findByPk(id);
    if (!places) throw 'local não encontrada';
    return places;
}

function basicDetails(places) {
    const { id, title, place, street, district, city, state, created, updated, verified } = places;
    return { id, title, place, street, district, city, state, created, updated, verified };
}
