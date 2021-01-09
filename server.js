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
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header(
//       'Access-Control-Allow-Headers',
//       'Origin, X-Requested-With, Content-Type, Accept'
//     );
//     next();
// });

// rotas api
app.use('/accounts', require('./accounts/account.controller'));
app.use('/places', require('./places/places.controller'));
app.use('/schedules', require('./schedules/schedules.controller'));
app.use('/student-list', require('./student-list/student-list.controller'));
app.use('/notification', require('./notification/notification.controller'));

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

// const vapidKeys = {
// 	"publicKey":"BKqOvOXQusxAXzOiRd9_v9aBuQln1CwnnpShklyLvf4BvWIAniKwIC-0M8T2R2XKxc3_QZiDC2OnF1I_NHIPIro",
// 	"privateKey":"iCRH3mXwK59ZDb13FqJzrW4cJpkP8NpKIC6nen9sBho"
// };

// webpush.setVapidDetails(
//     'mailto:example@yourdomain.org',
//     vapidKeys.publicKey,
//     vapidKeys.privateKey
// );

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

    // Cookies that have not been signed
    console.log('Cookies: ', req.cookies)

    // Cookies that have been signed
    console.log('Signed Cookies: ', req.signedCookies)
});

// iniciar o servidor
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 5000;
app.listen(port, () => console.log('Servidor ouvindo na porta ' + port));
