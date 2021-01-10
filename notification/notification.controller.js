const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');
const authorize = require('../_middleware/authorize')
const Role = require('../_helpers/role');
const notificationService = require('./notification.service');

//rotas
router.get('/', getnotificationAll);
router.get('/:id', getnotificationById);
router.post('/', authorize([Role.Admin, Role.Motorista]), createNotificationSchema, createNotification);
router.put('/:id', authorize([Role.Admin, Role.Motorista]), updateNotificationSchema, updateNotification);
router.delete('/:id', authorize([Role.Admin, Role.Motorista]), _deleteNotification);
router.delete('/', authorize([Role.Admin, Role.Motorista]), _deleteNotificationAll);

module.exports = router;

function getnotificationAll(req, res, next) {
    notificationService.getnotificationAll()
        .then(notifications => res.json(notifications))
        .catch(next);
}

function getnotificationById(req, res, next) {
    // os usuários podem obter seus próprios enderecos e os administradores podem obter qualquer endereco
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Não autorizado' });
    }

    notificationService.getnotificationById(req.params.id)
        .then(notifications => notifications ? res.json(notifications) : res.sendStatus(404))
        .catch(next);
}

function createNotificationSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string().required(),
        body: Joi.string().required(),
        icon: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function createNotification(req, res, next) {
    notificationService.createNotification(req.body)
        .then(notifications => res.json(notifications))
        .catch(next);
}

function updateNotificationSchema(req, res, next) {
    const schemaRules = {
        title: Joi.string().empty(''),
        body: Joi.string().empty(''),
        icon: Joi.string().empty(''),
    };

    // apenas administradores podem atualizar a função
    // if (req.user.role === Role.Admin) {
    //     schemaRules.role = Joi.string().valid(Role.Admin, Role.Estudante, Role.Motorista).empty('');
    // }

    const schema = Joi.object(schemaRules);
    validateRequest(req, next, schema);
}

function updateNotification(req, res, next) {
    // // os usuários podem atualizar suas próprias contas e os administradores podem atualizar qualquer conta
    // if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
    //     return res.status(401).json({ message: 'Não autorizado' });
    // }

    notificationService.updateNotification(req.params.id, req.body)
        .then(notifications => res.json(notifications))
        .catch(next);
}

function _deleteNotification(req, res, next) {
    // os usuários podem excluir suas próprias contas e os administradores podem excluir qualquer conta
    // if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
    //     return res.status(401).json({ message: 'Não autorizado' });
    // }

    notificationService.deleteNotification(req.params.id)
        .then(() => res.json({ message: 'id excluído com sucesso' }))
        .catch(next);
}

function _deleteNotificationAll(req, res, next) {
    notificationService.deleteNotificationAll()
        .then(() => res.json({ message: 'Notificação excluída com sucesso' }))
        .catch(next);
}