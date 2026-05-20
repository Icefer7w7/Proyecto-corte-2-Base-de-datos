const db = require('../services/mysql.service');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

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

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    const [result] = await db.query(
      'INSERT INTO student (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );
    const [result2] = await db.query(
      'INSERT INTO grades (nota_corte, semester_id, student_id) VALUES (4, 1, ?), (3, 1, ?), (2.5, 1, ?);',
      [result.insertId, result.insertId, result.insertId]
    );
    
    res.status(201).json({ id: result.insertId, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Bad Request" });
    }

    const [rows] = await db.query(
      'SELECT * FROM student WHERE email = ?',
      [email]
    );

    if (!rows[0]) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    // 🔐 Comparar contraseña ingresada con el hash guardado
    const match = await bcrypt.compare(password, rows[0].password);

    if (!match) {
      return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
    }

    // Login exitoso: devuelve solo datos seguros
    res.json({ id: rows[0].id, email: rows[0].email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, getById, create, login };