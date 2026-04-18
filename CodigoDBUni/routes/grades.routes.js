const express = require("express");
const router = express.Router();
const gradesDao = require("../dao/grades.dao")

router.get('/', gradesDao.getAll);
router.get('/semester/:semesterId', gradesDao.getBySemester);
router.get('/:id', gradesDao.getById);
router.post('/', gradesDao.create);


module.exports = router;