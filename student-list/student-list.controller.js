const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');
const authorize = require('../_middleware/authorize')
const Role = require('../_helpers/role');
const studentListService = require('./student-list.service');

//rotas
router.get('/', authorize([Role.Admin, Role.Motorista]), getstudentListAll);
router.get('/address', authorize([Role.Admin, Role.Motorista]), getaddressAll);
router.get('/label', authorize([Role.Admin, Role.Motorista]), getlabelAll);
router.get('/:id', authorize(), getstudentListById);
router.post('/', authorize([Role.Admin, Role.Motorista]), createStudentListSchema, createStudentList);
router.put('/:id', authorize(), updateStudentListSchema, updateStudentList);
router.delete('/:id', authorize([Role.Admin, Role.Motorista]), _deleteStudentList);
router.delete('/', authorize([Role.Admin, Role.Motorista]), _deleteListAll);

module.exports = router;

function getstudentListAll(req, res, next) {
    studentListService.getstudentListAll()
        .then(studentLists => res.json(studentLists))
        .catch(next);
}

function getaddressAll(req, res, next) {
    studentListService.getaddressAll()
    .then(studentLists => res.json(studentLists))
    .catch(next);
}

function getlabelAll(req, res, next) {
    studentListService.getlabelAll()
    .then(studentLists => res.json(studentLists))
    .catch(next);
}

function getstudentListById(req, res, next) {
    // os usuários podem obter seus próprios enderecos e os administradores podem obter qualquer endereco
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Não autorizado' });
    }

    studentListService.getstudentListById(req.params.id)
        .then(studentLists => studentLists ? res.json(studentLists) : res.sendStatus(404))
        .catch(next);
}

function createStudentListSchema(req, res, next) {
    const schema = Joi.object({
        idStudent: Joi.string().required(),
        title: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        rg: Joi.string().required(),
        institution: Joi.string().required(),
        course: Joi.string().required(),
        phone: Joi.string().required(),
        location: Joi.string().required(),
        label: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function createStudentList(req, res, next) {
    studentListService.createStudentList(req.body)
        .then(studentLists => res.json(studentLists))
        .catch(next);
}

function updateStudentListSchema(req, res, next) {
    const schemaRules = {
        idStudent: Joi.string().empty(''),
        title: Joi.string().empty(''),
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        rg: Joi.string().empty(''),
        institution: Joi.string().empty(''),
        course: Joi.string().empty(''),
        phone: Joi.string().empty(''),
        location: Joi.string().empty(''),
        label: Joi.string().empty(''),
    };

    // apenas administradores podem atualizar a função
    // if (req.user.role === Role.Admin) {
    //     schemaRules.role = Joi.string().valid(Role.Admin, Role.Estudante, Role.Motorista).empty('');
    // }

    const schema = Joi.object(schemaRules);
    validateRequest(req, next, schema);
}

function updateStudentList(req, res, next) {
    // os usuários podem atualizar suas próprias contas e os administradores podem atualizar qualquer conta
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Não autorizado' });
    }

    studentListService.updateStudentList(req.params.id, req.body)
        .then(studentLists => res.json(studentLists))
        .catch(next);
}

function _deleteStudentList(req, res, next) {
    // os usuários podem excluir suas próprias contas e os administradores podem excluir qualquer conta
    // if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
    //     return res.status(401).json({ message: 'Não autorizado' });
    // }

    studentListService.deleteStudentList(req.params.id)
        .then(() => res.json({ message: 'id excluído com sucesso' }))
        .catch(next);
}

function _deleteListAll(req, res, next) {
    studentListService.deleteListAll()
        .then(() => res.json({ message: 'Lista excluída com sucesso' }))
        .catch(next);
}