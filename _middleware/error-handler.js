module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    switch (true) {
        case typeof err === 'string':
            // erro de aplicativo personalizado
            const is404 = err.toLowerCase().endsWith('não encontrado');
            const statusCode = is404 ? 404 : 400;
            return res.status(statusCode).json({ message: err });
        case err.name === 'UnauthorizedError':
            // erro de autenticação jwt
            return res.status(401).json({ message: 'Não autorizado' });
        default:
            return res.status(500).json({ message: err.message });
    }
}