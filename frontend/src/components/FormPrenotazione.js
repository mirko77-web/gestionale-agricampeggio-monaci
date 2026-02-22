import React, { useState } from 'react';
import axios from 'axios';

const FormPrenotazione = ({ piazzola, onSave }) => {
  const [form, setForm] = useState({
    nome_cliente: '',
    telefono: '',
    data_arrivo: '',
    data_partenza: '',
    pagato: 0,
    importo: '',
    note: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/prenotazioni`, {
        piazzola_id: piazzola.id,
        ...form,
        pagato: form.pagato === '1' ? 1 : 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onSave();
      alert('Prenotazione salvata!');
    } catch (err) {
      alert('Errore nel salvataggio');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
      <h3>Piazzola #{piazzola.numero}</h3>
      
      <input
        type="text"
        name="nome_cliente"
        placeholder="Nome cliente"
        value={form.nome_cliente}
        onChange={handleChange}
        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        required
      />

      <input
        type="tel"
        name="telefono"
        placeholder="Telefono"
        value={form.telefono}
        onChange={handleChange}
        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        required
      />

      <input
        type="date"
        name="data_arrivo"
        value={form.data_arrivo}
        onChange={handleChange}
        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        required
      />

      <input
        type="date"
        name="data_partenza"
        value={form.data_partenza}
        onChange={handleChange}
        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        required
      />

      <input
        type="number"
        name="importo"
        placeholder="Importo (€)"
        value={form.importo}
        onChange={handleChange}
        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
      />

      <label style={{ marginRight: '10px' }}>
        <input
          type="checkbox"
          name="pagato"
          value="1"
          checked={form.pagato === '1'}
          onChange={(e) => setForm({ ...form, pagato: e.target.checked ? '1' : '0' })}
        />
        Pagato
      </label>

      <textarea
        name="note"
        placeholder="Note"
        value={form.note}
        onChange={handleChange}
        style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '60px' }}
      />

      <button
        type="submit"
        style={{
          background: '#3b82f6',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Salva Prenotazione
      </button>
    </form>
  );
};

export default FormPrenotazione;