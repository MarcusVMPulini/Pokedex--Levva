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

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

const getPokemonDetail = async () => {
    const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
    const response = await fetch(url);
    const data = await response.json();
    createPokemonDetail(data);
}

const createPokemonDetail = (pokemon) => {
    const name = pokemon.name[0].toUpperCase() + pokemon.name.slice(1);
    const id = pokemon.id.toString().padStart(3, '0');
    
    document.getElementById('pokemon-name').textContent = name;
    document.getElementById('pokemon-id').textContent = `#${id}`;
    document.getElementById('pokemon-image').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
    
    const typesContainer = document.getElementById('types-container');
    pokemon.types.forEach(type => {
        const typeElement = document.createElement('span');
        typeElement.className = 'type-badge';
        typeElement.textContent = type.type.name[0].toUpperCase() + type.type.name.slice(1);
        typeElement.style.backgroundColor = colors[type.type.name];
        typesContainer.appendChild(typeElement);
    });
    
    document.getElementById('height').textContent = `${(pokemon.height / 10).toFixed(1)} m`;
    document.getElementById('weight').textContent = `${(pokemon.weight / 10).toFixed(1)} kg`;
    
    
    const statsContainer = document.getElementById('stats-container');
    pokemon.stats.forEach(stat => {
        const statName = stat.stat.name.replace(/-/g, ' ').toUpperCase();
        const value = stat.base_stat;
        const statElement = document.createElement('div');
        statElement.className = 'stat-item';
        statElement.innerHTML = `
            <span class="stat-name">${statName}</span>
            <div class="stat-bar">
                <div class="stat-fill" style="width: ${(value / 255) * 100}%"></div>
            </div>
            <span class="stat-value">${value}</span>
        `;
        statsContainer.appendChild(statElement);
    });

    const abilitiesContainer = document.getElementById('abilities-container');
    pokemon.abilities.forEach(ability => {
        const abilityName = ability.ability.name[0].toUpperCase() + ability.ability.name.slice(1);
        const abilityCard = document.createElement('div');
        abilityCard.className = 'ability-item';

        const abilityLabel = document.createElement('span');
        abilityLabel.className = 'ability-badge';
        abilityLabel.textContent = abilityName;

        const abilityDescription = document.createElement('div');
        abilityDescription.className = 'ability-description';
        abilityDescription.textContent = '';

        abilityCard.append(abilityLabel, abilityDescription);
        abilitiesContainer.appendChild(abilityCard);

        abilityCard.addEventListener('click', async () => {
            if (abilityDescription.textContent) {
                abilityDescription.classList.toggle('visible');
                return;
            }
            const response = await fetch(ability.ability.url);
            const data = await response.json();
            const effect = data.effect_entries.find(entry => entry.language.name === 'pt')
                || data.effect_entries.find(entry => entry.language.name === 'en');
            abilityDescription.textContent = effect?.short_effect || effect?.effect || 'Descrição não disponível.';
            abilityDescription.classList.add('visible');
        });
    });


    
}

getPokemonDetail();
