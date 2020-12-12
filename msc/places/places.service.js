const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const { Op } = require('sequelize');
const sendEmail = require('_helpers/send-email');
const db = require('_helpers/db');
const Role = require('_helpers/role');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

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
    places.verified = Date.now();

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
