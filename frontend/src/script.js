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
}

const mainTypes = Object.keys(colors)

const fetchPokemons = async () => {
    for (let i = 1; i <= pokemonCount; i++) {
        await getPokemon(i);
    }
}

const getPokemon = async (id) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
    const response = await fetch(url);
    const data = await response.json();
    createPokemonCard(data);
}




const createPokemonCard = (poke) => {
    const card = document.createElement('div');
    card.classList.add('pokemon');

    const name = poke.name[0].toUpperCase() + poke.name.slice(1);
    const id = poke.id.toString().padStart(3, '0');

    const pokeTypes = poke.types.map(type => type.type.name);
    const type = mainTypes.find(type => pokeTypes.indexOf(type) > -1);
    const color = colors[type];

    card.style.backgroundColor = color;

    const pokemonInnerHTML = `
        <div class="img-container">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png" alt="${name}">
        </div>
        <div class="pokemon-info">
            <span class="pokemon-id">#${id}</span>
            <h2 class="pokemon-name">${name}</h2>
            <small class="pokemon-type"> ${type}</small>
        </div>
    `;
    card.innerHTML = pokemonInnerHTML;
    
    card.addEventListener('click', () => {
        window.location.href = `pokemon-detail.html?id=${poke.id}`;
    });
    card.style.cursor = 'pointer';
    
    pokemonList.appendChild(card);
}

fetchPokemons();
