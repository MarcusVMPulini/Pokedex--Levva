# Pokedex-Levve

Aplicação web tipo **Pokedex** que consulta a **PokeAPI** para listar e exibir detalhes dos pokémons, e usa uma API de IA (OpenRouter) para responder perguntas sobre o **Pokémon exibido no detalhe**.

---

## Requisitos
- Node.js 18+ (recomendado)
- Conta/Chave na **OpenRouter**

---

## Como executar

### 1) Backend
1. Entre na pasta `backend`.
2. Instale dependências:
   ```bash
   npm install
   ```
3. Crie o arquivo `.env` dentro de `backend/`:
   ```env
   PORT=3000
   OPENROUTER_API_KEY=sua_chave_aqui
   ```
4. Inicie o servidor:
   ```bash
   npm start
   ```

O backend:
- serve o diretório `frontend/` como arquivos estáticos
- expõe o endpoint da IA em: `POST http://localhost:3000/api/ai`

### 2) Frontend
O frontend já fica em `frontend/` e é servido pelo backend.

Abra:
- `http://localhost:3000/index.html`
- Detalhe: `http://localhost:3000/pokemon-detail.html?id=1`

---

## Endpoints

### IA
**POST** `/api/ai`

**Body (JSON)** (exemplo):
```json
{
  "model": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ]
}
```

**Retorno:** resposta repassada do provider (OpenRouter). Caso o modelo falhe (indisponível/limite), o servidor tenta modelos gratuitos em fallback.
 
---

## Melhorias de performance (implementadas)
- **Index (lista de pokémons)**
  - lista via `https://pokeapi.co/api/v2/pokemon?limit&offset`
  - renderização em **lotes (batchSize)** para reduzir trabalho do navegador
  - fetch de detalhes com **concorrência limitada** (evita “explodir” requisições simultâneas)
  - **cache em memória** para reduzir chamadas repetidas
  - imagens com `loading="lazy"`
- **Detalhe (pokemon-detail)**
  - antes de renderizar, limpa containers (`types`, `stats`, `abilities`) para evitar duplicação em re-render
  - chat IA injetado no DOM apenas 1 vez e reutilizado nas próximas interações

---

## Stack
- Backend: **Express** (Node.js, ESM)
- Frontend: HTML/CSS/JavaScript (fetch direto na PokeAPI + call para `/api/ai`)

---

## Estrutura de pastas
- `backend/`
  - `server.js` (API `/api/ai` + static do frontend)
  - `.env` (não versionar)
- `frontend/`
  - `index.html`, `pokemon-detail.html`
  - `src/script.js` (lista/search do index)
  - `src/pokemon-detail.js` (detalhe + chat)
  - `css/*.css`


