﻿﻿require('rootpath')();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('_middleware/error-handler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// permitir solicitações de cors de qualquer origem e com credenciais
var corsOptions = {
    origin: function (origin, callback) {
      // db.loadOrigins is an example call to load
      // a list of origins from a backing database
      db.loadOrigins(function (error, origins) {
        callback(error, origins)
      })
    }
  }
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

app.get('/', cors(corsOptions), function (req, res, next) {
    res.send('Bem-vindo na api-sigtei no Heroku !!');

    // Cookies that have not been signed
    console.log('Cookies: ', req.cookies)

    // Cookies that have been signed
    console.log('Signed Cookies: ', req.signedCookies)
})


// iniciar o servidor
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 5000;
app.listen(port, () => console.log('Servidor ouvindo na porta ' + port));
