const express = require('express');
const router = express.Router();

const { getChatList, addCompanion } = require('../controllers/chatlist');

router.get('/chatlist', getChatList);
router.post('/add-companion', addCompanion);
module.exports = router;