require('rootpath')();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('_middleware/error-handler');

// rotas api
app.use('/accounts', require('./accounts/accounts.controller'));
app.use('/places', require('./places/places.controller'));

// rotas docs swagger
app.use('/api-docs', require('_helpers/swagger'));

// permitir solicitações de cors de qualquer origem e com credenciais
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

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

app.get('/', (req,res) => {
    res.send('Bem-vindo na api-sigtei no Heroku !!');
})


// iniciar o servidor
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 5000;
app.listen(port, () => console.log('Servidor ouvindo na porta ' + port));
