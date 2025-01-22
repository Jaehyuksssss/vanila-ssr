interface CardProps {
    title: string;
    description: string;
    imgUrl: string;
    buttonText: string;
    onButtonClick: () => void;
}

export const createCard = ({
    title,
    description,
    imgUrl,
    buttonText,
    onButtonClick,
}: CardProps): HTMLElement => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
        <div class="card-image" style="background-image: url('${imgUrl}');"></div>
        <div class="card-content">
            <h3 class="card-title">${title}</h3>
            <p class="card-description">${description}</p>
            <button class="card-button">${buttonText}</button>
        </div>
    `;

    card.querySelector('.card-button')?.addEventListener('click', onButtonClick);

    return card;
};

export const addClickMeEvent = (
    containerId: string,
    onClick: (title: string) => void
  ): void => {
    const container = document.getElementById(containerId);
  
    if (!container) {
      console.error("Container not found");
      return;
    }
  
    const buttons = container.querySelectorAll(".card-button");
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const card = button.closest(".card");
        const title = card?.querySelector(".card-title")?.textContent || "Unknown";
        onClick(title);
      });
    });
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
      console.error("Container not found");
      return;
    }
  
    container.innerHTML = "";
  
    cards.forEach((cardData) => {
      const card = createCard({
        ...cardData,
        buttonText: "Click Me",
        onButtonClick: () => {}, 
      });
      container.appendChild(card);
    });
  
    addClickMeEvent(containerId, (title) =>
      console.log(`"${title}" 카드의 버튼이 클릭되었습니다.`)
    );
  };
  