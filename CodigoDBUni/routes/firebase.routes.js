const express = require('express');
const router = express.Router();
const firebaseDao = require('../dao/firebase.dao');

router.post('/register', firebaseDao.registerToFirebase);
router.post('/sync', firebaseDao.syncFromFirebase);

module.exports = router;
