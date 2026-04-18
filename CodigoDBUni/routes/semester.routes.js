const express = require("express");
const router = express.Router();
const semesterDao = require("../dao/semester.dao")

router.get('/', semesterDao.getAll);
router.get('/:id', semesterDao.getById);
router.post('/', semesterDao.create);

module.exports = router;