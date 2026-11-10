const { Resend } = require('resend');
const multipart = require('lambda-multipart-parser');

exports.handler = async (event, context) => {
  // CORS Preflight kezelés
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('Hiányzó RESEND_API_KEY környezeti változó.');
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // 1. Cél e-mail cím kinyerése az URL paraméterből (pl. ?target=cluj@dropcourier.ro)
    const targetEmail = event.queryStringParameters.target || 'balogferencz.artist@gmail.com';

    // 2. FormData adatok kinyerése
    const result = await multipart.parse(event);

    // Központi gyűjtőfiók a másolatokhoz (Gmail)
    const ccEmail = result._cc || 'balogferencz.artist@gmail.com;

    // 3. HTML törzs összeállítása
    let fieldsHtml = '<h3>Formular nou trimis:</h3><ul>';
    Object.keys(result).forEach(key => {
      if (key !== 'files' && !key.startsWith('_')) {
        fieldsHtml += `<li><strong>${key}:</strong> ${result[key]}</li>`;
      }
    });
    fieldsHtml += '</ul>';

    // 4. Csatolmányok feldolgozása
    const attachments = (result.files || []).map(file => ({
      filename: file.filename,
      content: file.content
    }));

    const subject = result._subject || 'Contract nou Drop Courier';

    // 5. E-mail küldése a Resend API-val
    const emailData = await resend.emails.send({
      from: 'DROP Courier <noreply@dropcourier.ro>', // Verifikált domain!
      to: [targetEmail],
      cc: [ccEmail],
      replyTo: result._replyto || undefined,
      subject: subject,
      html: fieldsHtml,
      attachments: attachments
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, data: emailData })
    };

  } catch (error) {
    console.error('Szerveroldali hiba (send-contract):', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: error.message || 'Hiba történt a szerveren.' })
    };
  }
};