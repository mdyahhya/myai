// Netlify Function using built-in fetch (Node 18+)
exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { model, messages, max_tokens, temperature } = JSON.parse(event.body);
    const API_KEY = process.env.MY_API_KEY;

    if (!API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: { message: "MY_API_KEY environment variable is not set in Netlify." } })
      };
    }

    const systemMessage = {
      role: "system",
      content: "You are Nemo AI. Greet with 'Salam' if appropriate, never 'Namaste'. Your responses must be 1 sentence maximum unless asked for detail. You are extremely concise and efficient. Language: Support English, Pure Hindi, and Hinglish. You have access to user data like tasks and schedule."
    };

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model || "llama-3.1-8b-instant",
        messages: [systemMessage, ...messages],
        max_tokens: max_tokens || 250,
        temperature: 0.7
      })
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: error.message } })
    };
  }
};
