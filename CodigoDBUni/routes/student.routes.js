const express = require("express");
const router = express.Router();
const studentDao = require("../dao/student.dao")

router.get('/', studentDao.getAll);
router.get('/:id', studentDao.getById);
router.post('/', studentDao.create);

module.exports = router;