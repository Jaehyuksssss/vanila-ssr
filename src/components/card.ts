interface CardProps {
    title: string;
    description: string;
    imageUrl: string;
    buttonText: string;
    onButtonClick: () => void;
}

export const createCard = ({
    title,
    description,
    imageUrl,
    buttonText,
    onButtonClick,
}: CardProps): HTMLElement => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
        <div class="card-image" style="background-image: url('${imageUrl}');"></div>
        <div class="card-content">
            <h3 class="card-title">${title}</h3>
            <p class="card-description">${description}</p>
            <button class="card-button">${buttonText}</button>
        </div>
    `;

    card.querySelector('.card-button')?.addEventListener('click', onButtonClick);

    return card;
};

export const showCard = (props: CardProps, containerId: string): void => {
    const card = createCard(props);
    const container = document.getElementById(containerId);

    if (container) {
        container.appendChild(card);
    } else {
        console.error('Container not found');
    }
};

export const showCards = (cards: CardProps[], containerId: string): void => {
    const container = document.getElementById(containerId);

    if (!container) {
        console.error('Container not found');
        return;
    }

    container.innerHTML = '';

    cards.forEach((cardData) => {
        const card = createCard({
            ...cardData,
            buttonText: 'Click Me', 
            onButtonClick: () => console.log(`${cardData.title} button clicked`), 
        });
        container.appendChild(card);
    });
};