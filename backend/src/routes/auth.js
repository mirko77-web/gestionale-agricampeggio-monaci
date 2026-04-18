const express = require('express');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const db = require('../db/database.js');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('🔐 Tentativo login:', username);

  try {
    const { rows } = await db.execute({
      sql: 'SELECT * FROM utenti WHERE username = ?',
      args: [username]
    });

    const user = rows[0];
    if (!user) {
      console.log('❌ Utente non trovato:', username);
      return res.status(401).json({ error: 'Credenziali invalide' });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Password errata');
      return res.status(401).json({ error: 'Credenziali invalide' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login riuscito:', username);
    res.json({ token, nome: user.nome });

  } catch (err) {
    console.error('❌ Errore DB:', err);
    res.status(500).json({ error: 'Errore server' });
  }
});

module.exports = router;