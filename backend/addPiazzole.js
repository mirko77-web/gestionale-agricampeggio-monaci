const db = require('./src/db/database');

const piazzole = [
  { numero: 1, posizione_x: 50, posizione_y: 50, tipo: 'standard' },
  { numero: 2, posizione_x: 150, posizione_y: 50, tipo: 'standard' },
  { numero: 3, posizione_x: 250, posizione_y: 50, tipo: 'standard' },
  { numero: 4, posizione_x: 350, posizione_y: 50, tipo: 'standard' },
  { numero: 5, posizione_x: 50, posizione_y: 150, tipo: 'standard' },
  { numero: 6, posizione_x: 150, posizione_y: 150, tipo: 'standard' }
];

piazzole.forEach((p, index) => {
  db.run(
    'INSERT INTO piazzole (numero, posizione_x, posizione_y, tipo) VALUES (?, ?, ?, ?)',
    [p.numero, p.posizione_x, p.posizione_y, p.tipo],
    (err) => {
      if (err) {
        console.error(`❌ Errore piazzola ${p.numero}:`, err);
      } else {
        console.log(`✅ Piazzola ${p.numero} aggiunta`);
      }
      
      if (index === piazzole.length - 1) {
        db.close();
        console.log('✅ Tutte le piazzole sono state aggiunte!');
      }
    }
  );
});