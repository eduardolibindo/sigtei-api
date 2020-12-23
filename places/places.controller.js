const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');
const authorize = require('../_middleware/authorize')
const Role = require('../_helpers/role');
const placesService = require('./places.service');

//rotas
router.get('/', authorize(), getplaceAll);
router.get('/:id', authorize(), getplaceById);
router.post('/', authorize(Role.Admin), createplaceSchema, createPlace);
router.put('/:id', authorize(), updateplaceSchema, updatePlace);
router.delete('/:id', authorize(), _deletePlace);

module.exports = router;

function getplaceAll(req, res, next) {
    placesService.getplaceAll()
        .then(places => res.json(places))
        .catch(next);
}

function getplaceById(req, res, next) {
    // os usuários podem obter seus próprios enderecos e os administradores podem obter qualquer endereco
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Não autorizado' });
    }

    placesService.getplaceById(req.params.id)
        .then(places => places ? res.json(places) : res.sendStatus(404))
        .catch(next);
}

function createplaceSchema(req, res, next) {
    const schema = Joi.object({
        type: Joi.string().required(),
        title: Joi.string().required(),
        place: Joi.string().required(),
        street: Joi.string().required(),
        district: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function createPlace(req, res, next) {
    placesService.createPlace(req.body)
        .then(places => res.json(places))
        .catch(next);
}

function updateplaceSchema(req, res, next) {
    const schemaRules = {
        type: Joi.string().empty(''),
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

function updatePlace(req, res, next) {
    // os usuários podem atualizar suas próprias contas e os administradores podem atualizar qualquer conta
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Não autorizado' });
    }

    placesService.updatePlace(req.params.id, req.body)
        .then(places => res.json(places))
        .catch(next);
}

function _deletePlace(req, res, next) {
    // os usuários podem excluir suas próprias contas e os administradores podem excluir qualquer conta
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Não autorizado' });
    }

    placesService.deletePlace(req.params.id)
        .then(() => res.json({ message: 'Local excluído com sucesso' }))
        .catch(next);
}