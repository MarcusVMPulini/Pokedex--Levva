import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '../frontend');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3001;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.use(express.json());
app.use(express.static(frontendDir));

app.post('/api/ai', async (req, res) => {
  const { model, messages } = req.body;

  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'Openrouter API key não configurada.' });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'A solicitação deve incluir uma mensagem' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({ model, messages })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText || 'Erro ao chamar a API da Openrouter.' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Não foi possível conectar à API do OpenRouter.' });
  }
});


app.listen(port, () => {
  console.log(`Backend rodando no http://localhost:${port}`);
});
