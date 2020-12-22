﻿require('rootpath')();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('_middleware/error-handler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/', (req, res) => {
    request(
        { url: 'https://sigtei-api.herokuapp.com' },
        (error, response, body) => {
            if (error || response.statusCode !== 200) {
                return res.status(500).json({ type: 'error', message: err.message });
            }

            res.json(JSON.parse(body));
        }
    )
});

// permitir solicitações de cors de qualquer origem e com credenciais
// app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

// rotas api
app.use('/accounts', require('./mongo/accounts/account.controller'));
app.use('/places', require('./mongo/places/places.controller'));
app.use('/schedules', require('./mongo/schedules/schedules.controller'));
app.use('/student-list', require('./mongo/student-list/student-list.controller'));

// rotas docs swagger
app.use('/api-docs', require('_helpers/swagger'));

// manipulador de erro global
app.use(errorHandler);

// app.use(express.static("dist/sigtei"));
// app.get("/*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "dist", "sigtei", "index.html"));
// });

// app.use(express.static(`${__dirname}/dist/sigtei`));
// app.get('/*', (req, res) => {
//     res.sendFile(path.join(`${__dirname}/dist/sigtei/index.html`));
// });




// iniciar o servidor
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 5000;
app.listen(port, () => console.log('Servidor ouvindo na porta ' + port));
