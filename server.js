require('rootpath')();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
const expressHbs = require('express-handlebars');
const cors = require('cors');
const errorHandler = require('_middleware/error-handler');

app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname:'.hbs'}))

app.set('view engine', '.hbs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({secret: 'mysupersecret', resave: false, saveUninitialized: false}))
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// permitir solicitações de cors de qualquer origem e com credenciais
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

// rotas api
app.use('/accounts', require('./mongo/accounts/account.controller'));
app.use('/places', require('./mongo/places/places.controller'));

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

app.get('/', (req,res) => {
    res.send('Bem-vindo na api-sigtei no Heroku !!');
})


// iniciar o servidor
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 5000;
app.listen(port, () => console.log('Servidor ouvindo na porta ' + port));
