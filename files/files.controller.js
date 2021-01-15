const uploadFile = require("../_middleware/upload");
const fs = require("fs");
const express = require('express');
const authorize = require('../_middleware/authorize')
const Role = require('../_helpers/role');
const router = express.Router();
const baseUrl = "https://sigtei-api.herokuapp.com";

//rotas
router.post("/upload", authorize(Role.Admin), upload());
router.get("/files", authorize(Role.Admin), getListFiles());
router.get("/files/:name", authorize(Role.Admin), download());

module.exports = router;

function upload(req, res) {
    try {
        await uploadFile(req, res);

        if (req.file == undefined) {
            return res.status(400).send({ message: "Faça upload de um arquivo!" });
        }

        res.status(200).send({
            message: "Carregado o arquivo com sucesso: " + req.file.originalname,
        });
    } catch (err) {
        console.log(err);

        if (err.code == "LIMIT_FILE_SIZE") {
            return res.status(500).send({
                message: "O tamanho do arquivo não pode ser maior que 5 MB!",
            });
        }

        res.status(500).send({
            message: `Não foi possível fazer upload do arquivo: ${req.file.originalname}. ${err}`,
        });
    }
};

function getListFiles(req, res) {
    const directoryPath = __basedir + "/resources/static/assets/uploads/";

    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            res.status(500).send({
                message: "Incapaz de verificar os arquivos!",
            });
        }

        let fileInfos = [];

        files.forEach((file) => {
            fileInfos.push({
                name: file,
                url: baseUrl + file,
            });
        });

        res.status(200).send(fileInfos);
    });
};

function download(req, res) {
    const fileName = req.params.name;
    const directoryPath = __basedir + "/resources/static/assets/uploads/";

    res.download(directoryPath + fileName, fileName, (err) => {
        if (err) {
            res.status(500).send({
                message: "Não foi possível baixar o arquivo. " + err,
            });
        }
    });
};