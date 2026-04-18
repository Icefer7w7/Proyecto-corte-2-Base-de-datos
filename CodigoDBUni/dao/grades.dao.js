const db = require('../services/mysql.service');

const getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM grades');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM grades WHERE id = ?',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  
};

const create = async (req, res) => {
  try {
    const {nota_corte} = req.body;
    if(!nota_corte){
        res.status(400).json({ error: "Bad Request" });
    }
    const [result] = await db.query(
      'INSERT INTO grades (nota_corte) VALUES (?)',
      [nota_corte]
    );
    

    res.status(201).json({ id: result.insertId, nota_corte });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getBySemester = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT semester.name AS semester_name, grades.id AS grade_id, grades.nota_corte
       FROM grades
       INNER JOIN semester ON grades.semester_id = semester.id
       WHERE grades.semester_id = ?`,
      [req.params.semesterId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
module.exports = { getAll, getById, create, getBySemester };