const db = require('../services/firebase.service');
const mysqlPool = require('../services/mysql.service');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const registerToFirebase = async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Firebase no está inicializado. Añade env/serviceAccountKey.json.' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
  }

  try {
    await db.collection('students').add({ email, password, createdAt: new Date() });
    res.status(201).json({ message: 'Contacto registrado en Firebase.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const syncFromFirebase = async (req, res) => {
  if (!db) {
    return res.status(500).json({ error: 'Firebase no está inicializado. Añade env/serviceAccountKey.json.' });
  }

  try {
    const snapshot = await db.collection('students').get();
    const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const connection = await mysqlPool.getConnection();
    try {
      await connection.beginTransaction();
      let synced = 0;

      for (const student of students) {
        if (!student.email || !student.password) {
          continue;
        }

        const [existing] = await connection.query('SELECT id FROM student WHERE email = ?', [student.email]);
        if (existing.length > 0) {
          continue;
        }

        const hashedPassword = await bcrypt.hash(student.password, SALT_ROUNDS);
        await connection.query('INSERT INTO student (email, password) VALUES (?, ?)', [student.email, hashedPassword]);
        synced += 1;
      }

      await connection.commit();
      res.json({ synced, total: students.length });
    } catch (innerError) {
      await connection.rollback();
      throw innerError;
    } finally {
      connection.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registerToFirebase, syncFromFirebase };
