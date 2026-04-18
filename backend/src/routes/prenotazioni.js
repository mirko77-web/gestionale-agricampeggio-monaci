const express = require('express');
const router = express.Router();
const db = require('../db/database.js');
const { inviaEmailPrenotazione } = require('../utils/email.js');

// GET tutte le prenotazioni
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.execute('SELECT * FROM prenotazioni ORDER BY data_arrivo DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel caricamento' });
  }
});
router.post('/', async (req, res) => {
  const { piazzola_id, nome_cliente, telefono, email, data_arrivo, data_partenza, pagato, importo, note } = req.body;
  try {
    const { rows } = await db.execute({
      sql: `SELECT * FROM prenotazioni WHERE piazzola_id = ? AND NOT (data_partenza < ? OR data_arrivo > ?)`,
      args: [piazzola_id, data_arrivo, data_partenza]
    });
    if (rows.length > 0) {
      return res.status(400).json({ error: 'La piazzola è già occupata in queste date' });
    }
    const result = await db.execute({
      sql: `INSERT INTO prenotazioni (piazzola_id, nome_cliente, telefono, email, data_arrivo, data_partenza, pagato, importo, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [piazzola_id, nome_cliente, telefono || '', email || '', data_arrivo, data_partenza, pagato ? 1 : 0, importo || 0, note || '']
    });

    // Invia email di conferma al cliente
    if (email) {
      inviaEmailPrenotazione(email, {
        nomeCliente: nome_cliente,
        numeroPiazzola: piazzola_id,
        dataArrivo: data_arrivo,
        dataPartenza: data_partenza,
        importo: importo,
        pagato: pagato
      }).catch(err => console.error('❌ Errore invio email:', err));
    }

    res.json({ id: Number(result.lastInsertRowid), success: true });
  } catch (err) {
    console.error('❌ Errore POST:', err);
    res.status(500).json({ error: 'Errore nel salvataggio' });
  }
});

// DELETE prenotazione
router.delete('/:id', async (req, res) => {
  try {
    await db.execute({ sql: 'DELETE FROM prenotazioni WHERE id = ?', args: [req.params.id] });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Errore nell'eliminazione" });
  }
});

// PUT modifica prenotazione
router.put('/:id', async (req, res) => {
  const { piazzola_id, nome_cliente, telefono, email, data_arrivo, data_partenza, pagato, importo, note } = req.body;
  try {
    const { rows } = await db.execute({
      sql: `SELECT * FROM prenotazioni WHERE piazzola_id = ? AND id != ? AND NOT (data_partenza < ? OR data_arrivo > ?)`,
      args: [piazzola_id, req.params.id, data_arrivo, data_partenza]
    });
    if (rows.length > 0) {
      return res.status(400).json({ error: 'La piazzola è già occupata in queste date' });
    }
    await db.execute({
      sql: `UPDATE prenotazioni SET nome_cliente=?, telefono=?, email=?, data_arrivo=?, data_partenza=?, pagato=?, importo=?, note=? WHERE id=?`,
      args: [nome_cliente, telefono, email, data_arrivo, data_partenza, pagato ? 1 : 0, importo || 0, note, req.params.id]
    });
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Errore UPDATE:', err);
    res.status(500).json({ error: "Errore nell'aggiornamento" });
  }
});

module.exports = router;