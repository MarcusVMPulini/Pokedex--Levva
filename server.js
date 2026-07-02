import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.static('.'));
const port = process.env.PORT || 3000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.warn('Warning: OPENROUTER_API_KEY is not set. Please add it to a .env file.');
}

app.use(express.json());

app.post('/api/ai', async (req, res) => {
  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'Openrouter API key is not configured.' });
  }

  const { model = 'gpt-4o-mini', messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Request must include a non-empty messages array.' });
  }

  try {
    const response = await fetch('https://api.openrouter.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages
      })
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Openrouter proxy error:', error);
    return res.status(500).json({ error: 'Unable to reach Openrouter API.' });
  }
});

app.listen(port, () => {
  console.log(`Backend proxy running on http://localhost:${port}`);
});
