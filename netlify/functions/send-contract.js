exports.handler = async (event, context) => {
  // Csak POST kéréseket fogadunk el
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" })
    };
  }

  try {
    // A kliens elküldi a target_email-t a mezők között, ha nincs megadva, alapértelmezett gmail
    const isBase64 = event.isBase64Encoded;
    const bodyBuffer = Buffer.from(event.body, isBase64 ? 'base64' : 'utf8');

    // Cél e-mail cím kinyerése a query paraméterből vagy a meglévő headerből
    const targetEmail = event.queryStringParameters.target || "balogferencz.artist@gmail.com";

    // Szerver-szerver POST küldés a FormSubmit felé
    const response = await fetch(`https://formsubmit.co/${targetEmail}`, {
      method: 'POST',
      headers: {
        'Content-Type': event.headers['content-type'] || event.headers['Content-Type'],
        'Accept': 'application/json'
      },
      body: bodyBuffer
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ message: `FormSubmit szerver hiba: ${response.status}`, details: errText })
      };
    }

    const resData = await response.json().catch(() => ({ success: true }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, data: resData })
    };

  } catch (error) {
    console.error("Netlify Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Szerveroldali hiba történt.", error: error.message })
    };
  }
};