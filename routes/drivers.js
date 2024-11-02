const express = require('express');
const router = express.Router();
const masterController = require('./controllers/masterController.js');


router
    .post('/login', masterController.loginUser)
    .post('/createUser', masterController.createUser)
    .post('/createAdmin', masterController.createAdmin)
    .post('/regCode', masterController.newCode)
    .get('/getPartip', masterController.getAllParticip)
    .get('/mostCode', masterController.getCodes);

    module.exports = router;