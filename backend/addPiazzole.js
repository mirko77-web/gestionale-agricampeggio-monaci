const db = require('./src/db/database');

db.run('DELETE FROM piazzole', (err) => {
  if (err) { console.error('Errore eliminazione:', err); return; }
  console.log('✅ Piazzole vecchie eliminate');

  const piazzole = [];
  for (let i = 1; i <= 20; i++) {
    const col = (i - 1) % 5;
    const row = Math.floor((i - 1) / 5);
    piazzole.push({ numero: i, posizione_x: 50 + col * 100, posizione_y: 50 + row * 100, tipo: 'standard' });
  }

  let count = 0;
  piazzole.forEach((p) => {
    db.run(
      'INSERT INTO piazzole (numero, posizione_x, posizione_y, tipo) VALUES (?, ?, ?, ?)',
      [p.numero, p.posizione_x, p.posizione_y, p.tipo],
      (err) => {
        if (err) console.error(`❌ Errore piazzola ${p.numero}:`, err);
        else console.log(`✅ Piazzola ${p.numero} aggiunta`);
        count++;
        if (count === piazzole.length) { db.close(); console.log('✅ 20 piazzole aggiunte!'); }
      }
    );
  });
});