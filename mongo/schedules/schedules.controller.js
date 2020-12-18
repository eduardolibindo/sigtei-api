const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../../_middleware/validate-request');
const authorize = require('../../_middleware/authorize');
const Role = require('../../_helpers/role');
const schedulesService = require('./schedules.service');

// rotas
router.get('/', authorize(Role.Admin), getscheduleAll);
router.get('/:id', authorize(), getscheduleById);
router.post('/', authorize(Role.Admin), createscheduleSchema, createSchedule);
router.put('/:id', authorize(), updatescheduleSchema, updateSchedule);
router.delete('/:id', authorize(), _deleteSchedule);

module.exports = router;

function getscheduleAll(req, res, next) {
    schedulesService.getscheduleAll()
        .then(schedules => res.json(schedules))
        .catch(next);
}

function getscheduleById(req, res, next) {
    // os usuários podem obter seus próprios enderecos e os administradores podem obter qualquer endereco
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Não autorizado' });
    }

    schedulesService.getscheduleById(req.params.id)
        .then(schedules => schedules ? res.json(schedules) : res.sendStatus(404))
        .catch(next);
}

function createscheduleSchema(req, res, next) {
    const schema = Joi.object({
        type: Joi.string().required(),
        title: Joi.string().required(),
        schedule: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function createSchedule(req, res, next) {
    schedulesService.createSchedule(req.body)
        .then(schedules => res.json(schedules))
        .catch(next);
}

function updatescheduleSchema(req, res, next) {
    const schemaRules = {
        type: Joi.string().empty(''),
        title: Joi.string().empty(''),
        schedule: Joi.string().empty(''),
    };

    // apenas administradores podem atualizar a função
    // if (req.user.role === Role.Admin) {
    //     schemaRules.role = Joi.string().valid(Role.Admin, Role.Estudante, Role.Motorista).empty('');
    // }

    const schema = Joi.object(schemaRules);
    validateRequest(req, next, schema);
}

function updateSchedule(req, res, next) {
    // os usuários podem atualizar suas próprias contas e os administradores podem atualizar qualquer conta
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Não autorizado' });
    }

    schedulesService.updateSchedule(req.params.id, req.body)
        .then(schedules => res.json(schedules))
        .catch(next);
}

function _deleteSchedule(req, res, next) {
    // os usuários podem excluir suas próprias contas e os administradores podem excluir qualquer conta
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Não autorizado' });
    }

    schedulesService._deleteSchedule(req.params.id)
        .then(() => res.json({ message: 'Horario excluído com sucesso' }))
        .catch(next);
}