const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const sendEmail = require('../_helpers/send-email');
const db = require('../_helpers/db');
const Role = require('../_helpers/role');

module.exports = {
    getnotificationAll,
    getnotificationById,
    createNotification,
    updateNotification,
    deleteNotification: _deleteNotification,
    deleteNotificationAll: _deleteNotificationAll
};

async function getnotificationAll() {
    const notifications = await db.Notification.find();
    return notifications.map(x => basicDetailsNotification(x));
}

async function getnotificationById(id) {
    const notifications = await getNotification(id);
    return basicDetailsNotification(notifications);
}

async function createNotification(params) {
    // validar
    if (await db.Notification.findOne({ title: params.title })) {
        throw 'Estudante já está cadastrado';
    }

    const notifications = new db.Notification(params);
    notifications.verified = Date.now();

    await notifications.save();
    return basicDetailsNotification(notifications);
}

async function updateNotification(id, params) {
    const notifications = await getNotification(id);

    // validar (se o endereco foi alterado)
    if (params.title && notifications.title !== params.title && await db.Notification.findOne({ title: params.title })) {
        throw 'titulo "' + params.title + '" já está cadastrado';
    }

    // copia os parâmetros para a conta e salva
    Object.assign(notifications, params);
    notifications.updated = Date.now();
    await notifications.save();

    return basicDetailsNotification(notifications);

}

async function _deleteNotification(id) {
    const notifications = await getNotification(id);
    await notifications.remove();
}

async function _deleteNotificationAll() {
    const notifications = await db.Notification.deleteMany({})
    return notifications;
}

async function getNotification(id) {
    if (!db.isValidId(id)) throw 'id não encontrado';
    const notifications = await db.Notification.findById(id);
    if (!notifications) throw 'id não encontrado';
    return notifications;
}

function basicDetailsNotification(notifications) {
    const { id, title, body, icon, created, updated, isVerified } = notifications;
    return { id, title, body, icon, created, updated, isVerified };
}