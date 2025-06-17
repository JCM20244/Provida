const express = require('express');
const autheticationSession = require('../milddware/authMilddware');
const router = express.Router();

// Routa protegida
router.get('/home', autheticationSession, (req, res) => {
    // Esta rota só pode ser acessada se o usuário estiver autenticado
    res.status(200).json({ message: 'This is a protected route', user: req.session.user });
});

module.exports = router;