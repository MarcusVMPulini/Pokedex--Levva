import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '../frontend');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 3000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.use(express.json());
app.use(express.static(frontendDir));

app.post('/api/ai', async (req, res) => {
  const { model: requestedModel, messages } = req.body;

  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'Openrouter API key não configurada.' });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'A solicitação deve incluir uma mensagem' });
  }

  const fallbackFreeModels = [
    'google/gemini-2.0-flash-lite:free',
    'mistral-tiny:free',
    'mistral-small:free'
  ];

  const modelsToTry = [];
  if (requestedModel) modelsToTry.push(requestedModel);
  for (const m of fallbackFreeModels) {
    if (!modelsToTry.includes(m)) modelsToTry.push(m);
  }

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const body = { model, messages };
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');

        // Considera erros de modelo (ex: indisponível) como falha recuperável.
        if ([400, 404, 429, 500, 503].includes(response.status)) {
          lastError = { status: response.status, text: text || 'Erro ao chamar a API da Openrouter.' };
          continue;
        }

        return res.status(response.status).json({
          error: text || 'Erro ao chamar a API da Openrouter.'
        });
      }

      const data = await response.json();
      return res.status(200).json(data);
    } catch (err) {
      lastError = { status: 500, text: err?.message || String(err) };
      continue;
    }
  }

  return res.status(lastError?.status || 500).json({
    error: lastError?.text || 'Nenhum modelo disponível.'
  });
});


app.listen(port, () => {
  console.log(`Backend rodando no http://localhost:${port}`);
});
