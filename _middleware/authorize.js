const jwt = require('express-jwt');
const { secret } = require('config.json');
const mongodb = require('_helpers/db');

module.exports = authorize;

function authorize(roles = []) {
    // parâmetros de funções podem ser uma única sequência de funções (por exemplo, Role.Estudante ou 'Estudante')
    // ou uma matriz de funções (por exemplo, [Role.Admin, Role.Estudante, Role.Motorista] ou ['Admin', 'Estudante', 'Motorista'])
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // autentica o token JWT e anexa o usuário ao objeto da solicitação (req.user)
        jwt({ secret, algorithms: ['HS256'] }),

        // autorizar com base na função do usuário
        async (req, res, next) => {
            const account = await mongodb.Account.findOne({ _id: req.user.id });
            const refreshTokens = await mongodb.RefreshToken.findOne({ account: account._id });

            // const account = await mongodb.Account.findById({ _id: req.user.id });
            // const refreshTokens = await mongodb.RefreshToken.find({ account: account._id });

            if (!account || (roles.length && !roles.includes(account.role))) {
                // conta não existe mais ou função não autorizada
                return res.status(401).json({ message: 'Não autorizado' });
            }

            // autenticação e autorização bem-sucedidas
            req.user.role = account.role;
            req.user.ownsToken = token => !!refreshTokens.find(x => x.token === token);
            next();
        }
    ];
}