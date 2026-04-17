const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const API_KEY = process.env.MY_API_KEY;
    if (!API_KEY) throw new Error("MY_API_KEY not set");

    // The body will be base64 encoded audio from the frontend
    const audioData = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : Buffer.from(event.body);

    // We need to send this to Groq Whisper
    // Groq expects multipart/form-data. Since we are in a simple function, 
    // we'll use a boundary to construct the form manually
    const boundary = "----NemoBoundary" + Math.random().toString(16).slice(2);
    
    const payload = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="audio.webm"\r\nContent-Type: audio/webm\r\n\r\n`),
      audioData,
      Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nwhisper-large-v3\r\n`),
      Buffer.from(`--${boundary}--\r\n`)
    ]);

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`
      },
      body: payload
    });

    const data = await response.json();
    return {
      statusCode: response.status,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
