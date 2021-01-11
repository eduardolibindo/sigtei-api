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

async function updateNotification(id, params, origin) {
    const notifications = await getNotification(id);
    const account = await 'eduardolibindo@gmail.com, eduardolibindo@hotmail.com';

    // validar (se o endereco foi alterado)
    if (params.title && notifications.title !== params.title && await db.Notification.findOne({ title: params.title })) {
        throw 'titulo "' + params.title + '" já está cadastrado';
    }

    // copia os parâmetros para a conta e salva
    Object.assign(notifications, params);
    notifications.updated = Date.now();
    await notifications.save();

    await sendNotificationEmail(notifications, account, origin);

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

async function sendNotificationEmail(notifications, account) {
    let message;

    message =  `<div style="text-align: center;">
                    <p><span>${notifications.title}</span></p>
                    <p><span>${notifications.body}</span></p>
                </div>
                <p>Atenciosamente Suporte Sigtei!</p>
                <p><code>Codigo da Mensagem: ${notifications.id}</code></p>`;


    await sendEmail({
        to: account,
        subject: 'Sigtei - Notificação ✔' + Date.now(),
        html: `<h4>Notificação:</h4>
               ${message}`,
        amp: `<!doctype html>
               <html ⚡4email>
                 <head>
                   <meta charset="utf-8">
                   <style amp4email-boilerplate>body{visibility:hidden}</style>
                   <script async src="https://cdn.ampproject.org/v0.js"></script>
                   <script async custom-element="amp-anim" src="https://cdn.ampproject.org/v0/amp-anim-0.1.js"></script>
                 </head>
                 <body>
                   <p><b>Hello</b> to myself <amp-img src="https://cldup.com/P0b1bUmEet.png" width="16" height="16"/></p>
                   <p>No embedded image attachments in AMP, so here's a linked nyan cat instead:<br/>
                     <amp-anim src="https://cldup.com/D72zpdwI-i.gif" width="500" height="350"/></p>
                 </body>
               </html>`,
    });
}

async function getemailAll() {
    const accounts = await db.Account.find();
    return accounts.map(x => basicDetailsEmails(x));
}

function basicDetailsEmails(account) {
    const { email } = account;
    return { email };
}
