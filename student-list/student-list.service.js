const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const sendEmail = require('../_helpers/send-email');
const db = require('../_helpers/db');
const Role = require('../_helpers/role');

module.exports = {
    getstudentListAll,
    getaddressAll,
    getstudentListById,
    createStudentList,
    updateStudentList,
    deleteStudentList: _deleteStudentList
};

async function getstudentListAll() {
    const studentLists = await db.StudentList.find();
    return studentLists.map(x => basicDetailsStudentList(x));
}

async function getaddressAll() {
    const studentLists = await db.StudentList.find({address});
    return studentLists.map(studentLists => studentLists.address).sort();
}

async function getstudentListById(id) {
    const studentLists = await getStudentList(id);
    return basicDetailsStudentList(studentLists);
}

async function createStudentList(params) {
    // validar
    if (await db.StudentList.findOne({ idStudent: params.idStudent })) {
        throw 'Estudante já está cadastrado';
    }

    const studentLists = new db.StudentList(params);
    studentLists.verified = Date.now();

    await studentLists.save();
    return basicDetailsStudentList(studentLists);
}

async function updateStudentList(id, params) {
    const studentLists = await getStudentList(id);

    // validar (se o endereco foi alterado)
    if (params.idStudent && studentLists.idStudent !== params.idStudent && await db.StudentList.findOne({ idStudent: params.idStudent })) {
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
    if (!db.isValidId(id)) throw 'id não encontrado';
    const studentLists = await db.StudentList.findById(id);
    if (!studentLists) throw 'id não encontrado';
    return studentLists;
}

function basicDetailsStudentList(studentLists) {
    const { id, idStudent, title, firstName, lastName, rg, institution, course, phone, address, created, updated, isVerified } = studentLists;
    return { id, idStudent, title, firstName, lastName,rg, institution, course, phone, address, created, updated, isVerified };
}