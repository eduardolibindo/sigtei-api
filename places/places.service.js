const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const sendEmail = require('../_helpers/send-email');
const db = require('../_helpers/db');
const Role = require('../_helpers/role');

module.exports = {
    getplaceAll,
    getplaceById,
    createPlace,
    updatePlace,
    deletePlace: _deletePlace
};

async function getplaceAll() {
    const places = await db.Places.find();
    return places.map(x => basicDetailsPlace(x));
}

async function getplaceById(id) {
    const places = await getPlace(id);
    return basicDetailsPlace(places);
}

async function createPlace(params) {
    // validar
    if (await db.Places.findOne({ place: params.place })) {
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
    if (params.place && places.place !== params.place && await db.Places.findOne({ place: params.place })) {
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
    await places.remove();
}

async function getPlace(id) {
    if (!db.isValidId(id)) throw 'Local não encontrado';
    const places = await db.Places.findById(id);
    if (!places) throw 'local não encontrado';
    return places;
}

function basicDetailsPlace(places) {
    const { id, type, title, place, street, district, city, state, created, updated, isVerified } = places;
    return { id, type, title, place, street, district, city, state, created, updated, isVerified };
}