import { Router } from 'express';
import * as authController from '../controllers/authController.js';

const router = Router();

router.get('/login', authController.getLoginPage);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/signup', authController.signup);

export default router;