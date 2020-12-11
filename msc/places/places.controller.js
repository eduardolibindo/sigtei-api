const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const Role = require('_helpers/role');
const placesService = require('./places.service');

// rotas
router.get('/', authorize(Role.Admin), getAll);
router.get('/:id', authorize(), getById);
router.post('/', authorize(Role.Admin), createSchema, create);
router.put('/:id', authorize(), updateSchema, update);
router.delete('/:id', authorize(), _delete);

module.exports = router;

function getAll(req, res, next) {
    placesService.getAll()
        .then(places => res.json(places))
        .catch(next);
}

function getById(req, res, next) {
    // os usuários podem obter seus próprios enderecos e os administradores podem obter qualquer endereco
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin && req.user.role !== Role.Motorista) {
        return res.status(401).json({ message: 'Não autorizado' });
    }

    placesService.getById(req.params.id)
        .then(places => places ? res.json(places) : res.sendStatus(404))
        .catch(next);
}

function createSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string().required(),
        place: Joi.string().required(),
        street: Joi.string().required(),
        district: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    placesService.create(req.body)
        .then(places => res.json(places))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schemaRules = {
        title: Joi.string().empty(''),
        place: Joi.string().empty(''),
        street: Joi.string().empty(''),
        district: Joi.string().empty(''),
        city: Joi.string().empty(''),
        state: Joi.string().empty(''),
    };

    // apenas administradores podem atualizar a função
    // if (req.user.role === Role.Admin) {
    //     schemaRules.role = Joi.string().valid(Role.Admin, Role.Estudante, Role.Motorista).empty('');
    // }

    const schema = Joi.object(schemaRules);
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    // os usuários podem atualizar suas próprias contas e os administradores podem atualizar qualquer conta
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin  && req.user.role !== Role.Motorista) {
        return res.status(401).json({ message: 'Não autorizado' });
    }

    placesService.update(req.params.id, req.body)
        .then(places => res.json(places))
        .catch(next);
}

function _delete(req, res, next) {
    // os usuários podem excluir suas próprias contas e os administradores podem excluir qualquer conta
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin && req.user.role !== Role.Motorista) {
        return res.status(401).json({ message: 'Não autorizado' });
    }

    placesService.delete(req.params.id)
        .then(() => res.json({ message: 'Local excluído com sucesso' }))
        .catch(next);
}