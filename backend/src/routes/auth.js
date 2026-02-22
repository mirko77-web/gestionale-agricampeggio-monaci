const express = require('express');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const db = require('../db/database');

const router = express.Router();

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  console.log('🔐 Tentativo login:', username);

  db.get('SELECT * FROM utenti WHERE username = ?', [username], (err, user) => {
    if (err) {
      console.error('❌ Errore DB:', err);
      return res.status(500).json({ error: 'Errore server' });
    }

    if (!user) {
      console.log('❌ Utente non trovato:', username);
      return res.status(401).json({ error: 'Credenziali invalide' });
    }

    bcryptjs.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('❌ Errore compare:', err);
        return res.status(500).json({ error: 'Errore server' });
      }

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
    });
  });
});

module.exports = router;