﻿require('rootpath')();
require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Pusher = require("pusher");
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('_middleware/error-handler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// permitir solicitações de cors de qualquer origem e com credenciais
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

// rotas api
app.use('/accounts', require('./accounts/account.controller'));
app.use('/places', require('./places/places.controller'));
app.use('/schedules', require('./schedules/schedules.controller'));
app.use('/student-list', require('./student-list/student-list.controller'));

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

app.get('/', (req, res) => {
    res.send('Bem-vindo na api-sigtei no Heroku !!');

    // Cookies that have not been signed
    console.log('Cookies: ', req.cookies)

    // Cookies that have been signed
    console.log('Signed Cookies: ', req.signedCookies)
})

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID="1128798",
    key: process.env.PUSHER_KEY="a9dff7ecba6e6bf75832",
    secret: process.env.PUSHER_SECRET="a8d967945f7270824972",
    cluster: 'us2',
  });

app.post('/ping', (req, res) => {
    const { lat, lng } = req.body;
    const data = {
        lat,
        lng,
    };
    pusher.trigger('location', 'ping', data);
    res.json(data);
});


// iniciar o servidor
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 5000;
app.listen(port, () => console.log('Servidor ouvindo na porta ' + port));

