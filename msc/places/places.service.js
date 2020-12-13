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
    register,
    verifyEmail,
    forgotPassword,
    validateResetToken,
    resetPassword,

    getplaceAll,
    getplaceById,
    createPlace,
    updatePlace,
    deletePlace: _deletePlace
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

async function register(params, origin) {
    // validar
    if (await db.Account.findOne({ where: { email: params.email } })) {
        // enviar erro já registrado no e-mail para evitar enumeração de conta
        return await sendAlreadyRegisteredEmail(params.email, origin);
    }

    // criar objeto de conta
    const account = new db.Account(params);

    // a primeira conta registrada é um administrador
    const isFirstAccount = (await db.Account.count()) === 0;
    account.role = isFirstAccount ? Role.Admin : Role.Estudante;
    account.verificationToken = randomTokenString();

    // senha hash
    account.passwordHash = await hash(params.password);

    // salvar conta
    await account.save();

    // enviar email
    await sendVerificationEmail(account, origin);
}

async function verifyEmail({ token }) {
    const account = await db.Account.findOne({ where: { verificationToken: token } });

    if (!account) throw 'Falha na verificação';

    account.verified = Date.now();
    account.verificationToken = null;
    await account.save();
}

async function forgotPassword({ email }, origin) {
    const account = await db.Account.findOne({ where: { email } });

    // sempre retorna uma resposta ok para evitar a enumeração de e-mail
    if (!account) return;

    // cria token de redefinição que expira após 24 horas
    account.resetToken = randomTokenString();
    account.resetTokenExpires = new Date(Date.now() + 24*60*60*1000);
    await account.save();

    // enviar email
    await sendPasswordResetEmail(account, origin);
}

async function validateResetToken({ token }) {
    const account = await db.Account.findOne({
        where: {
            resetToken: token,
            resetTokenExpires: { [Op.gt]: Date.now() }
        }
    });

    if (!account) throw 'Token inválido';

    return account;
}

async function resetPassword({ token, password }) {
    const account = await validateResetToken({ token });

    // atualize a senha e remova o token de redefinição
    account.passwordHash = await hash(password);
    account.passwordReset = Date.now();
    account.resetToken = null;
    await account.save();
}

async function getplaceAll() {
    const places = await db.Places.findALL();
    return places.map(x => basicDetailsPlace(x));
}

async function getplaceById(id) {
    const places = await getPlace(id);
    return basicDetailsPlace(places);
}

async function createPlace(params) {
    // validar
    if (await db.Places.findOne({ where: { place: params.place } })) {
        throw 'Local "' + params.place + '" já está cadastrado';
    }

    const places = new db.Places(params);
    places.verified = Date.now();

    await places.save();
    return basicDetailsPlace(places);
}

async function updatePlace(id, params) {
    const places = await getPlace(id);

    // validar (se o endereco foi alterado)
    if (params.place && places.place !== params.place && await db.Places.findOne({ where: { place: params.place } })) {
        throw 'Local "' + params.place + '" já está cadastrado';
    }

    // copia os parâmetros para a conta e salva
    Object.assign(places, params);
    places.updated = Date.now();
    await places.save();

    return basicDetailsPlace(places);

}

async function _deletePlace(id) {
    const places = await getPlace(id);
    await places.destroy();
}

// funções auxiliares

async function getAccount(id) {
    const account = await db.Account.findByPk(id);
    if (!account) throw 'Conta não encontrada';
    return account;
}

async function getPlace(id) {
    const places = await db.Places.findByPk(id);
    if (!places) throw 'local não encontrada';
    return places;
}

async function getRefreshToken(token) {
    const refreshToken = await db.RefreshToken.findOne({ where: { token } });
    if (!refreshToken || !refreshToken.isActive) throw 'Token inválido';
    return refreshToken;
}

async function hash(password) {
    return await bcrypt.hash(password, 10);
}

function generateJwtToken(account) {
    // cria um token jwt contendo o ID da conta que expira em 15 minutos
    return jwt.sign({ sub: account.id, id: account.id }, config.secret, { expiresIn: '15m' });
}

function generateRefreshToken(account, ipAddress) {
    // cria um token de atualização que expira em 7 dias
    return new db.RefreshToken({
        accountId: account.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7*24*60*60*1000),
        createdByIp: ipAddress
    });
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function basicDetails(account) {
    const { id, title, firstName, lastName, email, rg, institution, course, phone, address, role, created, updated, isVerified } = account;
    return { id, title, firstName, lastName, email, rg, institution, course, phone, address, role, created, updated, isVerified };
}


function basicDetailsPlace(places) {
    const { id, title, place, street, district, city, state, created, updated, verified } = places;
    return { id, title, place, street, district, city, state, created, updated, verified };
}