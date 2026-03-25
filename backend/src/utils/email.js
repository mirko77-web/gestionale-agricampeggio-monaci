const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const inviaEmailPrenotazione = async (emailCliente, dati) => {
  const mailOptions = {
    from: `"Agricampeggio Monaci" <${process.env.EMAIL_USER}>`,
    to: emailCliente,
    subject: `✅ Conferma prenotazione - Piazzola #${dati.numeroPiazzola}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1f2937; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">🏕️ Agricampeggio Monaci</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937;">✅ Prenotazione Confermata!</h2>
          <p>Gentile <strong>${dati.nomeCliente}</strong>,</p>
          <p>La tua prenotazione è stata confermata con successo.</p>
          
          <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
            <h3 style="margin: 0 0 12px; color: #1f2937;">📋 Dettagli prenotazione</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 8px 0; color: #6b7280;">Piazzola</td>
                <td style="padding: 8px 0; font-weight: bold;">#${dati.numeroPiazzola}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 8px 0; color: #6b7280;">Arrivo</td>
                <td style="padding: 8px 0; font-weight: bold;">${dati.dataArrivo}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 8px 0; color: #6b7280;">Partenza</td>
                <td style="padding: 8px 0; font-weight: bold;">${dati.dataPartenza}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 8px 0; color: #6b7280;">Importo</td>
                <td style="padding: 8px 0; font-weight: bold;">€${dati.importo || 0}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Stato pagamento</td>
                <td style="padding: 8px 0; font-weight: bold;">${dati.pagato ? '✅ Pagato' : '⏳ Da pagare'}</td>
              </tr>
            </table>
          </div>

          <p style="color: #6b7280; font-size: 14px;">Per qualsiasi informazione non esitare a contattarci.</p>
          <p style="color: #6b7280; font-size: 14px;">A presto! 🏕️</p>
          
          <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
            Agricampeggio Monaci
          </div>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { inviaEmailPrenotazione };