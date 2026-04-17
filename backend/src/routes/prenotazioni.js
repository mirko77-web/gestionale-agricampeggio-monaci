// fix router definition

const express = require('express');
const router = express.Router();
const db = require('../db/database.js');

// PUT modifica prenotazione
router.put('/:id', (req, res) => {
  const { piazzola_id, nome_cliente, telefono, email, data_arrivo, data_partenza, pagato, importo, note } = req.body;

  const queryOverlap = `
    SELECT * FROM prenotazioni
    WHERE piazzola_id = ?
    AND id != ?
    AND NOT (data_partenza < ? OR data_arrivo > ?)
  `;

  db.get(queryOverlap, [piazzola_id, req.params.id, data_arrivo, data_partenza], (err, overlap) => {
    if (err) {
      console.error("❌ Errore controllo sovrapposizioni:", err);
      return res.status(500).json({ error: "Errore nel controllo disponibilità" });
    }

    if (overlap) {
      return res.status(400).json({ error: "La piazzola è già occupata in queste date" });
    }

    db.run(
      `UPDATE prenotazioni SET nome_cliente=?, telefono=?, email=?, data_arrivo=?, data_partenza=?, pagato=?, importo=?, note=? WHERE id=?`,
      [nome_cliente, telefono, email, data_arrivo, data_partenza, pagato ? 1 : 0, importo || 0, note, req.params.id],
      function (err) {
        if (err) {
          console.error('❌ Errore UPDATE:', err);
          return res.status(500).json({ error: "Errore nell'aggiornamento" });
        }

        res.json({ success: true });
      }
    );
  });
});

module.exports = router;
