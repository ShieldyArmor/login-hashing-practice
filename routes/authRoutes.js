const { Router } = require('express');
const authController = require('../controllers/authController')
const {requireAuth} = require('../middleware/authMiddleware') 

const router = Router();

router.get('/', authController.home_get);
router.get('/forgot', authController.forgot_get);
router.get('/logged', requireAuth, authController.logged_get);
router.get('/create', authController.create_get);
router.get('/logout', authController.logout_get);
router.get('/reset', authController.reset_get);

// router.post('/hashing', authController.hashing_post);
// router.post('/login', authController.login_post);

module.exports = router;