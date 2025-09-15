const express = require('express');

const Router = express.Router();

const { registerUser,ActivateAccount,loginUser,logoutUser,resetPassword,confirmResetPassword } = require('../controllers/user');

Router.post('/register', registerUser);
Router.post('/login', loginUser);
Router.get('/activate/:userId',ActivateAccount);
Router.get('/logout', logoutUser);
Router.post('/reset-password', resetPassword);
Router.get('/confirm-reset-password/:id', confirmResetPassword);

module.exports = Router;