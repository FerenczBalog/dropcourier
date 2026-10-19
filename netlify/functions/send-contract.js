const { Resend } = require('resend');

exports.handler = async (event, context) => {
  // 1. CORS Preflight (OPTIONS) kérések kezelése
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

  // 2. Csak POST kéréseket fogadunk el
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    // 3. Ellenőrizzük a Netlify környezeti változót
    if (!process.env.RESEND_API_KEY) {
      console.error("Hiányzik a RESEND_API_KEY a Netlify-ban!");
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ message: 'Hiányzó RESEND_API_KEY környezeti változó a szerveren.' })
      };
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const targetEmail = event.queryStringParameters.target || 'balogferencz.artist@gmail.com';

    // 4. E-mail küldése a Resend használatával
    // Fontos: Tesztelés alatt a 'from' cím mindig 'onboarding@resend.dev' legyen,
    // kivéve ha már igazoltad a saját domainedet a Resend felületén.
    const response = await resend.emails.send({
      from: 'DROP Fleet <onboarding@resend.dev>',
      to: [targetEmail],
      subject: 'Contract nou Tasku',
      html: '<p>A csatolmányban találhatók a szerződés dokumentumai.</p>'
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, response })
    };
  } catch (error) {
    console.error('Resend API küldési hiba:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: error.message || 'Szerveroldali hiba történt az e-mail küldésekor.' })
    };
  }
};