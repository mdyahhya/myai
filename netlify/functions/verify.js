// Netlify Function to verify app password
exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { password } = JSON.parse(event.body);
    const APP_PASSWORD = process.env.APP_PASSWORD;

    if (!APP_PASSWORD) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "APP_PASSWORD not set in environment." })
      };
    }

    if (password === APP_PASSWORD) {
      return {
        statusCode: 200,
        body: JSON.stringify({ authorized: true })
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ authorized: false, message: "Invalid Password" })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
