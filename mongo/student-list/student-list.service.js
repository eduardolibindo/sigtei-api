const config = require('../../config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const { Op } = require('sequelize');
const sendEmail = require('../../_helpers/send-email');
const mongodb = require('../../_helpers/mongodb');
const Role = require('../../_helpers/role');

module.exports = {
    getstudentListAll,
    getstudentListById,
    createStudentList,
    updateStudentList,
    deleteStudentList: _deleteStudentList
};

async function getstudentListAll() {
    const studentLists = await mongodb.StudentList.find();
    return studentLists.map(x => basicDetailsStudentList(x));
}

async function getstudentListById(id) {
    const studentLists = await getStudentList(id);
    return basicDetailsStudentList(studentLists);
}

async function createStudentList(params) {
    // validar
    if (await mongodb.StudentList.findOne({ id: params.idStudent })) {
        throw 'id "' + params.idStudent + '" já está cadastrado';
    }

    const studentLists = new mongodb.StudentList(params);
    studentLists.verified = Date.now();

    await studentLists.save();
    return basicDetailsStudentList(studentLists);
}

async function updateStudentList(id, params) {
    const studentLists = await getStudentList(id);

    // validar (se o endereco foi alterado)
    if (params.idStudent && studentLists.idStudent !== params.idStudent && await mongodb.StudentList.findOne({ idStudent: params.idStudent })) {
        throw 'id "' + params.idStudent + '" já está cadastrado';
    }

    // copia os parâmetros para a conta e salva
    Object.assign(studentLists, params);
    studentLists.updated = Date.now();
    await studentLists.save();

    return basicDetailsStudentList(studentLists);

}

async function _deleteStudentList(id) {
    const studentLists = await getStudentList(id);
    await studentLists.remove();
}

async function getStudentList(id) {
    if (!mongodb.isValidId(id)) throw 'id não encontrado';
    const studentLists = await mongodb.StudentList.findById(id);
    if (!studentLists) throw 'id não encontrado';
    return studentLists;
}

function basicDetailsStudentList(studentLists) {
    const { id, title, firstName, lastName, rg, institution, course, phone, address, created, updated, isVerified } = studentLists;
    return { id, title, firstName, lastName,rg, institution, course, phone, address, created, updated, isVerified };
}