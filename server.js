﻿require('rootpath')();
require('dotenv').config();
const express = require('express');
const app = express();
const Pusher = require('pusher');
const webpush = require('web-push');
const bodyParser = require('body-parser');
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
app.use('/notification', require('./notification/notification.controller'));
// app.use('/file', require('./files/files.controller'));

// manipulador de erro global
app.use(errorHandler);


const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    cluster: process.env.PUSHER_APP_CLUSTER,
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

app.post('/notify', (req, res) => {
    const { title, body } = req.body;
    const notification = {
        title,
        body,
        icon
    };
  
    pusher.trigger('notification', 'notify', notification);
    res.json(notification);
});
  
app.get('/', (req, res) => {
    res.send('Bem-vindo na api-sigtei no Heroku !!');

    // Cookies que não foram assinados
    console.log('Cookies: ', req.cookies)

    // Cookies que foram assinados
    console.log('Signed Cookies: ', req.signedCookies)
});

// iniciar o servidor
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 5000;
app.listen(port, () => console.log('Servidor ouvindo na porta ' + port));
