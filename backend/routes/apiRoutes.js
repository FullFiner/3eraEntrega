const express = require('express');
const router = express.Router();


const authController = require('../controllers/authController');
const gameController = require('../controllers/gameController');
const transactionController = require('../controllers/transactionController');


const { verificarSesion } = require('../middleware/authMiddleware');


router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);


router.get('/me', verificarSesion, authController.getProfile);


router.post('/game/spin', verificarSesion, gameController.spinRoulette);

router.post('/deposito', verificarSesion, transactionController.depositar);
router.post('/retiro', verificarSesion, transactionController.retirar);

module.exports = router;