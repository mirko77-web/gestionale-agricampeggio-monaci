const express = require('express');
const router = express.Router();
const db = require('../db/database.js');

// PUT modifica prenotazione
router.put('/:id', async (req, res) => {
  const { piazzola_id, nome_cliente, telefono, email, data_arrivo, data_partenza, pagato, importo, note } = req.body;

  try {
    // Controlla sovrapposizioni
    const { rows } = await db.execute({
      sql: `SELECT * FROM prenotazioni
            WHERE piazzola_id = ?
            AND id != ?
            AND NOT (data_partenza < ? OR data_arrivo > ?)`,
      args: [piazzola_id, req.params.id, data_arrivo, data_partenza]
    });

    if (rows.length > 0) {
      return res.status(400).json({ error: 'La piazzola è già occupata in queste date' });
    }

    await db.execute({
      sql: `UPDATE prenotazioni 
            SET nome_cliente=?, telefono=?, email=?, data_arrivo=?, data_partenza=?, 
                pagato=?, importo=?, note=? 
            WHERE id=?`,
      args: [nome_cliente, telefono, email, data_arrivo, data_partenza, pagato ? 1 : 0, importo || 0, note, req.params.id]
    });

    res.json({ success: true });

  } catch (err) {
    console.error('❌ Errore UPDATE:', err);
    res.status(500).json({ error: "Errore nell'aggiornamento" });
  }
});

module.exports = router;