const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const Role = require('_helpers/role');
const placesService = require('./places.service');

// rotas
router.get('/', authorize(Role.Admin), getplaceAll);
router.get('/:id', authorize(), getplaceById);
router.post('/', authorize(Role.Admin), createplaceSchema, createPlace);
router.put('/:id', authorize(), updateplaceSchema, updatePlace);
router.delete('/:id', authorize(), _deletePlace);

module.exports = router;

// function authenticateSchema(req, res, next) {
//     const schema = Joi.object({
//         email: Joi.string().required(),
//         password: Joi.string().required()
//     });
//     validateRequest(req, next, schema);
// }

// function authenticate(req, res, next) {
//     const { email, password } = req.body;
//     const ipAddress = req.ip;
//     placesService.authenticate({ email, password, ipAddress })
//         .then(({ refreshToken, ...account }) => {
//             setTokenCookie(res, refreshToken);
//             res.json(account);
//         })
//         .catch(next);
// }

// function refreshToken(req, res, next) {
//     const token = req.cookies.refreshToken;
//     const ipAddress = req.ip;
//     placesService.refreshToken({ token, ipAddress })
//         .then(({ refreshToken, ...account }) => {
//             setTokenCookie(res, refreshToken);
//             res.json(account);
//         })
//         .catch(next);
// }

// function revokeTokenSchema(req, res, next) {
//     const schema = Joi.object({
//         token: Joi.string().empty('')
//     });
//     validateRequest(req, next, schema);
// }

// function revokeToken(req, res, next) {
//     // aceita token do corpo da solicitação ou cookie
//     const token = req.body.token || req.cookies.refreshToken;
//     const ipAddress = req.ip;

//     if (!token) return res.status(400).json({ message: 'Token é necessário' });

//     // os usuários podem revogar seus próprios tokens e os administradores podem revogar quaisquer tokens
//     if (!req.user.ownsToken(token) && req.user.role !== Role.Admin) {
//         return res.status(401).json({ message: 'Não autorizado' });
//     }

//     placesService.revokeToken({ token, ipAddress })
//         .then(() => res.json({ message: 'Token revogado' }))
//         .catch(next);
// }

function getplaceAll(req, res, next) {
    placesService.getAll()
        .then(places => res.json(places))
        .catch(next);
}

function getplaceById(req, res, next) {
    // os usuários podem obter seus próprios enderecos e os administradores podem obter qualquer endereco
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin && req.user.role !== Role.Motorista) {
        return res.status(401).json({ message: 'Não autorizado' });
    }

    placesService.getById(req.params.id)
        .then(places => places ? res.json(places) : res.sendStatus(404))
        .catch(next);
}

function createplaceSchema(req, res, next) {
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

function createPlace(req, res, next) {
    placesService.create(req.body)
        .then(places => res.json(places))
        .catch(next);
}

function updateplaceSchema(req, res, next) {
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

function updatePlace(req, res, next) {
    // os usuários podem atualizar suas próprias contas e os administradores podem atualizar qualquer conta
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin  && req.user.role !== Role.Motorista) {
        return res.status(401).json({ message: 'Não autorizado' });
    }

    placesService.update(req.params.id, req.body)
        .then(places => res.json(places))
        .catch(next);
}

function _deletePlace(req, res, next) {
    // os usuários podem excluir suas próprias contas e os administradores podem excluir qualquer conta
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin && req.user.role !== Role.Motorista) {
        return res.status(401).json({ message: 'Não autorizado' });
    }

    placesService.delete(req.params.id)
        .then(() => res.json({ message: 'Local excluído com sucesso' }))
        .catch(next);
}