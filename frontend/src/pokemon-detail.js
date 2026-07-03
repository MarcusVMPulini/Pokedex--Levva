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
let currentIdParam = urlParams.get('id') || '1';
let currentPokemonId = 1;

const getPokemonDetail = async () => {
    try {
        const url = `https://pokeapi.co/api/v2/pokemon/${currentIdParam.toString().toLowerCase()}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Pokémon não encontrado');
        }
        const data = await response.json();
        currentPokemonId = data.id;
        createPokemonDetail(data);
        updateCarousel();
    } catch (error) {
        console.error(error);
        const chatStatus = document.getElementById('chat-status');
        if (chatStatus) {
            chatStatus.textContent = 'Pokémon não encontrado. Tente outro nome ou ID.';
        }
    }
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

    initChat(pokemon);
}

const initChat = (pokemon) => {
    let widget = document.querySelector('.chatbot-widget');
    let panel;
    let button;
    let closeButton;
    let messages;
    let status;
    let input;
    let sendButton;

    if (!widget) {
        widget = document.createElement('div');
        widget.className = 'chatbot-widget';

        button = document.createElement('button');
        button.className = 'chatbot-button';
        button.type = 'button';
        button.textContent = 'IA';

        panel = document.createElement('div');
        panel.className = 'chatbot-panel';

        const header = document.createElement('div');
        header.className = 'chatbot-panel-header';
        header.innerHTML = `<span>Chat IA</span>`;

        closeButton = document.createElement('button');
        closeButton.className = 'chatbot-close';
        closeButton.type = 'button';
        closeButton.textContent = '×';
        header.appendChild(closeButton);

        messages = document.createElement('div');
        messages.className = 'chatbot-messages';
        const welcome = document.createElement('div');
        welcome.className = 'chatbot-message assistant';
        welcome.textContent = 'Clique no botão e pergunte algo sobre o Pokémon atual.';
        messages.appendChild(welcome);

        status = document.createElement('div');
        status.className = 'chatbot-status';

        const inputRow = document.createElement('div');
        inputRow.className = 'chatbot-input-row';

        input = document.createElement('input');
        input.id = 'chat-input';
        input.type = 'text';
        input.placeholder = 'Digite sua pergunta...';

        sendButton = document.createElement('button');
        sendButton.id = 'chat-send';
        sendButton.type = 'button';
        sendButton.textContent = 'Enviar';

        inputRow.append(input, sendButton);
        panel.append(header, messages, status, inputRow);
        widget.append(button, panel);
        document.body.appendChild(widget);
    } else {
        panel = widget.querySelector('.chatbot-panel');
        button = widget.querySelector('.chatbot-button');
        closeButton = widget.querySelector('.chatbot-close');
        messages = widget.querySelector('.chatbot-messages');
        status = widget.querySelector('.chatbot-status');
        input = widget.querySelector('#chat-input');
        sendButton = widget.querySelector('#chat-send');
    }

    if (!widget.classList.contains('chatbot-wired')) {
        widget.classList.add('chatbot-wired');

        const addMessage = (role, text) => {
            const messageElement = document.createElement('div');
            messageElement.className = `chatbot-message ${role}`;
            messageElement.textContent = text;
            messages.appendChild(messageElement);
            messages.scrollTop = messages.scrollHeight;
        };

        const setLoading = (isLoading) => {
            input.disabled = isLoading;
            sendButton.disabled = isLoading;
            status.textContent = isLoading ? 'Enviando para a IA...' : '';
        };

        const sendMessage = async () => {
            const question = input.value.trim();
            if (!question) {
                return;
            }

            addMessage('user', question);
            input.value = '';
            setLoading(true);

            try {
                const body = {
                    model: 'poolside/laguna-xs-2.1:free',
                    messages: [
                        {
                            role: 'system',
                            content: `Você é um assistente especialista em Pokémon. Responda estritamente usando apenas informações da PokeAPI. Foque no Pokémon atual (${pokemon.name}) quando possível, e evite inventar dados ou responder sobre outros assuntos. Se a pergunta não for sobre Pokémon, diga que você só responde dúvidas sobre Pokémon usando informações da PokeAPI.`
                        },
                        {
                            role: 'user',
                            content: question
                        }
                    ]
                };

                const response = await fetch('/api/ai', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });

                const data = await response.json();
                const answer = data?.choices?.[0]?.message?.content
                    || data?.output?.[0]?.content
                    || data?.reply
                    || 'Desculpe, não consegui obter uma resposta agora.';

                addMessage('assistant', answer);
            } catch (error) {
                console.error('Erro ao enviar pergunta:', error);
                addMessage('assistant', 'Não foi possível conectar à IA. Tente novamente mais tarde.');
            } finally {
                setLoading(false);
            }
        };

        const togglePanel = () => {
            panel.classList.toggle('open');
            if (panel.classList.contains('open')) {
                input.focus();
            }
        };

        button.addEventListener('click', togglePanel);
        closeButton.addEventListener('click', togglePanel);
        sendButton.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });
    }
};

const navigateToPokemon = (target) => {
    if (!target) {
        return;
    }
    window.location.href = `pokemon-detail.html?id=${target}`;
};

const updateCarousel = () => {
    const currentPage = document.getElementById('current-page');
    const prevPokemon = document.getElementById('prev-pokemon');
    const nextPokemon = document.getElementById('next-pokemon');

    if (currentPage) {
        currentPage.textContent = `#${currentPokemonId.toString().padStart(3, '0')}`;
    }
    if (prevPokemon) {
        prevPokemon.disabled = currentPokemonId <= 1;
    }
    if (nextPokemon) {
        nextPokemon.disabled = currentPokemonId >= 1025;
    }
};

const setupHeaderControls = () => {
    const prevPokemon = document.getElementById('prev-pokemon');
    const nextPokemon = document.getElementById('next-pokemon');
    const searchInput = document.getElementById('pokemon-search');

    const searchPokemon = async () => {
        const query = searchInput?.value.trim();
        if (!query) {
            return;
        }

        if (/^\d+$/.test(query)) {
            navigateToPokemon(Number(query));
            return;
        }

        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(query.toLowerCase())}`);
            if (!response.ok) {
                throw new Error('Pokémon não encontrado');
            }
            const data = await response.json();
            navigateToPokemon(data.id);
        } catch (error) {
            console.error(error);
            const status = document.getElementById('chat-status');
            if (status) {
                status.textContent = 'Pokémon não encontrado. Tente outro nome ou ID.';
            }
        }
    };

    if (prevPokemon) {
        prevPokemon.addEventListener('click', () => navigateToPokemon(currentPokemonId - 1));
    }
    if (nextPokemon) {
        nextPokemon.addEventListener('click', () => navigateToPokemon(currentPokemonId + 1));
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                searchPokemon();
            }
        });
    }
};

setupHeaderControls();

getPokemonDetail();
