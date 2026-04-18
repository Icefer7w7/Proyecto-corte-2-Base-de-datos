const db = require('../services/mysql.service');

const getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM student');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM student WHERE id = ?',
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
    const { email, password } = req.body;
    if(!email || !password){
        res.status(400).json({ error: "Bad Request" });
    }
    const [result] = await db.query(
      'INSERT INTO student (email, password) VALUES (?, ?)',
      [email, password]
    );
    const [result2] = await db.query(
      'INSERT INTO grades (nota_corte, semester_id, student_id) VALUES (4, 1, ?), (3, 1, ?), (2.5, 1, ?);',
      [result.insertId, result.insertId, result.insertId]
    );
    
    res.status(201).json({ id: result.insertId, email, password });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getById, create };