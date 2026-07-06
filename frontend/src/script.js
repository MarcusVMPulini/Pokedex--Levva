const pokemonList = document.querySelector('.pokemon-list');
const pokemonCount = 1025;
const colors = {
  "normal": "#A8A77A",
  "fire": "#EE8130",
  "water": "#6390F0",
  "grass": "#7AC74C",
  "electric": "#F7D02C",
  "ice": "#96D9D6",
  "fighting": "#C22E28",
  "poison": "#A33EA1",
  "ground": "#E2BF65",
  "flying": "#A98FF3",
  "psychic": "#F95587",
  "bug": "#A6B91A",
  "rock": "#B6A136",
  "ghost": "#735797",
  "dragon": "#6F35FC",
  "dark": "#705746",
  "steel": "#B7B7CE",
  "fairy": "#D685AD"
};

const mainTypes = Object.keys(colors);

const getQuery = () => {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('search')?.trim();
  return q || '';
};

// Cache simples em memória para reduzir fetches repetidos.
const pokemonCache = new Map();

const capitalize = (s) => s?.[0]?.toUpperCase() + s?.slice(1);

const createPokemonCard = (poke) => {
  const card = document.createElement('div');
  card.classList.add('pokemon');

  const name = capitalize(poke.name);
  const id = poke.id.toString().padStart(3, '0');

  const pokeTypes = poke.types.map((t) => t.type.name);
  // cor de fundo: mantém a lógica de "primeiro tipo válido" para não quebrar o layout
  const typeForBg = mainTypes.find((t) => pokeTypes.includes(t)) || pokeTypes[0];
  const color = colors[typeForBg] || '#eee';

  card.style.backgroundColor = color;

  const typesBadges = poke.types
    .map((t) => {
      const typeName = t.type.name;
      const bg = colors[typeName] || 'rgba(0,0,0,0.2)';
      return `<span class="pokemon-type-badge" style="background-color:${bg}">${capitalize(typeName)}</span>`;
    })
    .join('');

  card.innerHTML = `
    <div class="img-container">
      <img loading="lazy" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png" alt="${name}">
    </div>
    <div class="pokemon-info">
      <span class="pokemon-id">#${id}</span>
      <h2 class="pokemon-name">${name}</h2>
      <div class="pokemon-types">${typesBadges}</div>
    </div>
  `;

  card.addEventListener('click', () => {
    window.location.href = `pokemon-detail.html?id=${poke.id}`;
  });
  card.style.cursor = 'pointer';

  return card;
};

const getPokemon = async (idOrName) => {
  const key = String(idOrName).toLowerCase();
  if (pokemonCache.has(key)) return pokemonCache.get(key);

  const url = `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(key)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Pokémon não encontrado');
  const data = await response.json();
  pokemonCache.set(key, data);
  return data;
};

const fetchPokemonList = async ({ limit, offset }) => {
  const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Falha ao carregar lista de pokémons');
  const data = await response.json();
  // Result: [{ name, url }]
  return data.results;
};

const extractIdFromUrl = (url) => {
  // https://pokeapi.co/api/v2/pokemon/{id}/
  const parts = url.split('/').filter(Boolean);
  return Number(parts[parts.length - 1]);
};

const createCardsBatch = async (idsOrNames) => {
  const fragment = document.createDocumentFragment();
  const cards = await Promise.all(
    idsOrNames.map(async (x) => {
      const data = await getPokemon(x);
      return createPokemonCard(data);
    })
  );

  for (const card of cards) fragment.appendChild(card);
  return fragment;
};

const runWithConcurrencyLimit = async ({ items, concurrency, mapper }) => {
  const results = new Array(items.length);
  let index = 0;

  const workers = new Array(concurrency).fill(null).map(async () => {
    while (true) {
      const current = index;
      index += 1;
      if (current >= items.length) return;
      results[current] = await mapper(items[current], current);
    }
  });

  await Promise.all(workers);
  return results;
};

const renderPokemonsOptimized = async () => {
  pokemonList.innerHTML = '';

  const batchSize = 80; // reduz número de chamadas/DOM updates
  const detailConcurrency = 8; // limita fetch simultâneo de detalhes

  for (let offset = 0; offset < pokemonCount; offset += batchSize) {
    const limit = Math.min(batchSize, pokemonCount - offset);
    const results = await fetchPokemonList({ limit, offset });

    // ids via url pra usar endpoint direto
    const ids = results.map((r) => extractIdFromUrl(r.url)).filter(Boolean);

    const fragments = await runWithConcurrencyLimit({
      items: ids,
      concurrency: detailConcurrency,
      mapper: async (id) => {
        const data = await getPokemon(id);
        return createPokemonCard(data);
      }
    });

    const fragment = document.createDocumentFragment();
    for (const card of fragments) fragment.appendChild(card);
    pokemonList.appendChild(fragment);
  }
};

const fetchPokemons = async () => {
  // Mantém a função para não quebrar chamadas do init.
  await renderPokemonsOptimized();
};

const setupIndexSearch = () => {
  const searchInput = document.getElementById('pokemon-search');
  if (!searchInput) return;

  const goToDetail = (query) => {
    const value = query.trim();
    if (!value) return;
    window.location.href = `pokemon-detail.html?id=${encodeURIComponent(value)}`;
  };

  searchInput.addEventListener('keydown', async (event) => {
    if (event.key !== 'Enter') return;

    const query = searchInput.value.trim();
    if (!query) return;

    try {
      // valida se o Pokémon existe antes de redirecionar
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(query.toLowerCase())}`);
      if (!res.ok) throw new Error('not found');
      goToDetail(query);
    } catch (e) {
      window.location.href = `index.html?search=${encodeURIComponent(query)}`;
    }
  });
};

const init = async () => {
  setupIndexSearch();

  const q = getQuery();

  // Se veio do index via busca, mostra só o pokemon encontrado (fallback)
  if (q) {
    try {
      pokemonList.innerHTML = '';
      const data = await getPokemon(q);
      pokemonList.appendChild(createPokemonCard(data));
      return;
    } catch (e) {
      console.error(e);
    }
  }

  await fetchPokemons();
};

init();




