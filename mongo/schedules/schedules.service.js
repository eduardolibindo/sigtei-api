const config = require('../../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const { Op } = require('sequelize');
const sendEmail = require('../../_helpers/send-email');
const mongodb = require('../../_helpers/mongodb');
const Role = require('../../_helpers/role');

module.exports = {
    getscheduleAll,
    getscheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule: _deleteSchedule
};

async function getscheduleAll() {
    const schedules = await mongodb.Schedules.find();
    return schedules.map(x => basicDetailsSchedule(x));
}

async function getscheduleById(id) {
    const schedules = await getSchedule(id);
    return basicDetailsSchedule(schedules);
}

async function createSchedule(params) {
    // validar
    if (await mongodb.Schedules.findOne({ schedule: params.schedule })) {
        throw 'Local "' + params.schedule + '" já está cadastrado';
    }

    const schedules = new mongodb.Schedules(params);
    schedules.verified = Date.now();

    await schedules.save();
    return basicDetailsSchedule(schedules);
}

async function updateSchedule(id, params) {
    const schedules = await getSchedule(id);

    // validar (se o endereco foi alterado)
    if (params.schedule && schedules.schedule !== params.schedule && await mongodb.Schedules.findOne({ schedule: params.schedule })) {
        throw 'Horario "' + params.schedule + '" já está cadastrado';
    }

    // copia os parâmetros para a conta e salva
    Object.assign(schedules, params);
    schedules.updated = Date.now();
    await schedules.save();

    return basicDetailsSchedule(schedules);
}

async function _deleteSchedule(id) {
    const schedules = await getSchedule(id);
    await schedules.remove();
}

async function getSchedule(id) {
    if (!mongodb.isValidId(id)) throw 'Horario não encontrado';
    const schedules = await mongodb.Schedules.findById(id);
    if (!schedules) throw 'Horario não encontrado';
    return schedules;
}

function basicDetailsSchedule(schedules) {
    const { id, type, title, schedule, created, updated, isVerified } = schedules;
    return { id, type, title, schedule, created, updated, isVerified };
}