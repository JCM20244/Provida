const autheticationSession = (req, res, next) => {
    // Verifica se o usuário está autenticado
    // A sessão do usuário deve estar definida e o estado de login deve ser verdadeiro
    if (req.session.user && req.session.user.isLoggedIn) {
        // Usuário está autenticado, prosseguir para a próxima rota
        next(); // Chama o próximo middleware ou rota
    } else {
        // Usuário não está autenticado, retornar erro 401
       res.status(401).json({ message: 'Unauthorized' });
    }
}

module.exports = autheticationSession;
// Este middleware verifica se o usuário está autenticado antes de permitir o acesso a rotas protegidas.